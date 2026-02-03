import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { SupplierReportData, Country, FilterMode } from '../types/supplier'
import { ExtendedFilterParams, Team, JobPosition, User } from '../types/filterTypes'
import { supplierApiService } from '../services/supplierApi'
import { filterApiService } from '../services/filterService'
import { 
  formatCurrency, 
  getQuarterOptions, 
  getYearOptions, 
  getMonthOptions,
  getCurrentYear,
  getCurrentQuarter,
  sortCountriesByThai,
  filterAndDisplayJobPositions
} from '../utils/dateUtils'

type SortField = 'total_commission' | 'total_net_commission' | 'total_pax' | 'avg_commission_per_pax' | 'avg_net_commission_per_pax'
type SortDirection = 'asc' | 'desc'

const SupplierCommission: React.FC = () => {
  const [data, setData] = useState<SupplierReportData[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [filterMode, setFilterMode] = useState<FilterMode>('quarterly')
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedCountry, setSelectedCountry] = useState<number | undefined>(undefined)
  
  // New filter states
  const [selectedJobPosition, setSelectedJobPosition] = useState<string | undefined>(undefined)
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>(undefined)
  const [selectedUser, setSelectedUser] = useState<number | undefined>(undefined)
  
  // Sorting states
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Load countries and filter options on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [countriesData, teamsData, jobPositionsData, usersData] = await Promise.all([
          supplierApiService.getCountries(),
          filterApiService.getTeams(),
          filterApiService.getJobPositions(),
          filterApiService.getUsers()
        ])
        
        setCountries(countriesData)
        setTeams(teamsData)
        setJobPositions(jobPositionsData)
        setUsers(usersData)
        setFilteredUsers(usersData)
      } catch (err) {
        console.error('Failed to load initial data:', err)
      }
    }
    loadInitialData()
  }, [])

  // Update filtered users when team or job position changes
  useEffect(() => {
    let filtered = users

    if (selectedTeam) {
      filtered = filtered.filter(user => user.team_number === selectedTeam)
    }

    if (selectedJobPosition) {
      filtered = filtered.filter(user => 
        user.job_position.toLowerCase() === selectedJobPosition.toLowerCase()
      )
    }

    setFilteredUsers(filtered)
    
    // Clear user selection if current user is not in filtered list
    if (selectedUser && !filtered.find(user => user.ID === selectedUser)) {
      setSelectedUser(undefined)
    }
  }, [selectedTeam, selectedJobPosition, users, selectedUser])

  // Load data when filters change
  useEffect(() => {
    loadReportData()
  }, [filterMode, selectedYear, selectedQuarter, selectedMonth, selectedCountry, selectedJobPosition, selectedTeam, selectedUser])

  const loadReportData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params: ExtendedFilterParams = {}

      // เพิ่ม year เฉพาะเมื่อไม่ใช่ 'all' mode
      if (filterMode !== 'all' && selectedYear) {
        params.year = selectedYear
      }

      // Only add country_id if it's actually selected (not undefined)
      if (selectedCountry && selectedCountry > 0) {
        params.country_id = selectedCountry
      }

      if (filterMode === 'quarterly') {
        params.quarter = selectedQuarter
      } else if (filterMode === 'monthly') {
        params.month = selectedMonth
      }

      // Add new filter parameters
      if (selectedJobPosition) {
        params.job_position = selectedJobPosition
      }
      
      if (selectedTeam) {
        params.team_number = selectedTeam
      }
      
      if (selectedUser) {
        params.user_id = selectedUser
      }

      console.log('Supplier API Params:', params) // Debug log

      // Call API with extended filter parameters
      const reportData = await supplierApiService.getSupplierReport(params)
      
      // Check if reportData exists and is an array
      if (reportData && Array.isArray(reportData)) {
        // Sort by total_commission descending by default
        const sortedData = reportData.sort((a, b) => 
          b.metrics.total_commission - a.metrics.total_commission
        )
        setData(sortedData)
        // Reset sorting when new data is loaded
        setSortField(null)
        setSortDirection('desc')
      } else {
        // If no data or invalid format, set empty array
        setData([])
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง')
      setData([]) // Set empty array on error
      console.error('Failed to load report data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterModeChange = (mode: FilterMode) => {
    setFilterMode(mode)
    // Reset to current values when changing mode
    if (mode === 'quarterly') {
      setSelectedQuarter(getCurrentQuarter())
    } else if (mode === 'monthly') {
      setSelectedMonth(new Date().getMonth() + 1)
    }
  }

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'desc'
    
    if (sortField === field) {
      // If clicking the same field, toggle direction
      newDirection = sortDirection === 'desc' ? 'asc' : 'desc'
    }
    
    setSortField(field)
    setSortDirection(newDirection)
    
    // Sort the data
    const sortedData = [...data].sort((a, b) => {
      const aValue = a.metrics[field]
      const bValue = b.metrics[field]
      
      if (newDirection === 'desc') {
        return bValue - aValue
      } else {
        return aValue - bValue
      }
    })
    
    setData(sortedData)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    
    if (sortDirection === 'desc') {
      return (
        <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      )
    } else {
      return (
        <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      )
    }
  }

  const quarterOptions = getQuarterOptions()
  const yearOptions = getYearOptions()
  const monthOptions = getMonthOptions()

  // Prepare chart data
  const chartData = data.slice(0, 10).map(item => ({
    name: item.supplier_name_th.length > 15 ? item.supplier_name_th.substring(0, 15) + '...' : item.supplier_name_th,
    totalCommission: item.metrics.total_commission,
    netCommission: item.metrics.total_net_commission,
    fullName: `${item.supplier_name_th} (${item.supplier_name_en})`
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.fullName}</p>
          <p className="text-blue-600">
            Total Comm: ฿{formatCurrency(data.totalCommission)}
          </p>
          <p className="text-green-600">
            Net Comm: ฿{formatCurrency(data.netCommission)}
          </p>
        </div>
      )
    }
    return null
  }

  const exportToCSV = () => {
    const headers = [
      'Supplier Name (TH)',
      'Supplier Name (EN)', 
      'Total Commission',
      'Net Commission',
      'Total PAX',
      'Avg Commission Per PAX',
      'Avg Net Commission Per PAX'
    ]
    
    const csvData = data.map(item => [
      `"${item.supplier_name_th}"`,
      `"${item.supplier_name_en}"`,
      item.metrics.total_commission,
      item.metrics.total_net_commission,
      item.metrics.total_pax,
      item.metrics.avg_commission_per_pax,
      item.metrics.avg_net_commission_per_pax
    ])
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')
    
    // Add UTF-8 BOM for proper Thai character display in Excel
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `supplier-commission-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Supplier Performance Report
        </h1>
        <p className="text-gray-600">
          รายงานประสิทธิภาพและยอดขายของ Supplier
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ตัวกรอง</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-4">
          {/* Filter Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รูปแบบรายงาน
            </label>
            <select 
              value={filterMode}
              onChange={(e) => handleFilterModeChange(e.target.value as FilterMode)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทั้งหมด</option>
              <option value="quarterly">รายไตรมาส</option>
              <option value="monthly">รายเดือน</option>
              <option value="yearly">รายปี</option>
            </select>
          </div>

          {/* Dynamic Period Filter */}
          {filterMode === 'quarterly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ไตรมาส
              </label>
              <select 
                value={`${selectedYear}-${selectedQuarter}`}
                onChange={(e) => {
                  const [year, quarter] = e.target.value.split('-')
                  setSelectedYear(parseInt(year))
                  setSelectedQuarter(parseInt(quarter))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {quarterOptions.map(option => (
                  <option key={`${option.year}-${option.quarter}`} value={`${option.year}-${option.quarter}`}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filterMode === 'monthly' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เดือน
                </label>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ปี
                </label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {filterMode === 'yearly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ปี
              </label>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filterMode === 'all' && (
            <div className="col-span-1">
              {/* Placeholder div เพื่อให้ layout สวย */}
            </div>
          )}

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเทศ
            </label>
            <select 
              value={selectedCountry || ''}
              onChange={(e) => setSelectedCountry(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกประเทศ</option>
              {sortCountriesByThai(countries).map(country => (
                <option key={country.id} value={country.id}>
                  {country.name_th}
                </option>
              ))}
            </select>
          </div>

          {/* Job Position Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👥 ตำแหน่งงาน
            </label>
            <select 
              value={selectedJobPosition || ''}
              onChange={(e) => {
                setSelectedJobPosition(e.target.value || undefined)
                setSelectedUser(undefined) // Clear user selection
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกตำแหน่ง</option>
              {filterAndDisplayJobPositions(jobPositions).map(position => (
                <option key={position.job_position} value={position.job_position}>
                  {position.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏢 ทีม
            </label>
            <select 
              value={selectedTeam || ''}
              onChange={(e) => {
                setSelectedTeam(e.target.value ? parseInt(e.target.value) : undefined)
                setSelectedUser(undefined) // Clear user selection
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกทีม</option>
              {teams.map(team => (
                <option key={team.team_number} value={team.team_number}>
                  Team {team.team_number}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 ผู้ใช้
            </label>
            <select 
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกคน</option>
              {filteredUsers.map(user => (
                <option key={user.ID} value={user.ID}>
                  {user.nickname || `${user.first_name} ${user.last_name}`.trim()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Empty State */}
          {data.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบข้อมูล</h3>
                <p className="mt-1 text-sm text-gray-500">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Supplier Commission</h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="totalCommission" fill="#3B82F6" name="Total Commission" />
                      <Bar dataKey="netCommission" fill="#10B981" name="Net Commission" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">รายละเอียด Supplier</h2>
                  <button
                    onClick={exportToCSV}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier Name
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('total_commission')}
                            className="flex items-center justify-end w-full hover:text-gray-700 focus:outline-none"
                          >
                            Total Comm.
                            {getSortIcon('total_commission')}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('total_net_commission')}
                            className="flex items-center justify-end w-full hover:text-gray-700 focus:outline-none"
                          >
                            Net Comm.
                            {getSortIcon('total_net_commission')}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('total_pax')}
                            className="flex items-center justify-center w-full hover:text-gray-700 focus:outline-none"
                          >
                            จำนวนผู้เดินทาง
                            {getSortIcon('total_pax')}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('avg_commission_per_pax')}
                            className="flex items-center justify-end w-full hover:text-gray-700 focus:outline-none"
                          >
                            Avg Comm.(ต่อคน)
                            {getSortIcon('avg_commission_per_pax')}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('avg_net_commission_per_pax')}
                            className="flex items-center justify-end w-full hover:text-gray-700 focus:outline-none"
                          >
                            Avg Net(สุทธิต่อคน)
                            {getSortIcon('avg_net_commission_per_pax')}
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.map((supplier) => (
                        <tr key={supplier.supplier_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {supplier.supplier_name_th}
                              </div>
                              <div className="text-sm text-gray-500">
                                {supplier.supplier_name_en}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            ฿{formatCurrency(supplier.metrics.total_commission)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                            ฿{formatCurrency(supplier.metrics.total_net_commission)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {supplier.metrics.total_pax.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500">
                            ฿{formatCurrency(supplier.metrics.avg_commission_per_pax)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            ฿{formatCurrency(supplier.metrics.avg_net_commission_per_pax)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default SupplierCommission