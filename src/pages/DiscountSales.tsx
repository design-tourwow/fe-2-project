import React, { useState, useEffect } from 'react'
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { DiscountSalesData } from '../types/discountSales'
import { Country, FilterMode } from '../types/supplier'
import { ExtendedFilterParams, Team, JobPosition, User } from '../types/filterTypes'
import { discountSalesApiService } from '../services/discountSalesApi'
import { supplierApiService } from '../services/supplierApi'
import { filterApiService } from '../services/filterService'
import { 
  formatCurrency, 
  getQuarterOptions, 
  getYearOptions, 
  getMonthOptions,
  getCurrentYear,
  getCurrentQuarter
} from '../utils/dateUtils'


const DiscountSales: React.FC = () => {
  const [data, setData] = useState<DiscountSalesData[]>([])
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

      console.log('Discount Sales API Params:', params)

      const reportData = await discountSalesApiService.getDiscountSalesReport(params)
      
      if (reportData && Array.isArray(reportData)) {
        // Sort by total_commission descending
        const sortedData = reportData.sort((a, b) => 
          b.metrics.total_commission - a.metrics.total_commission
        )
        setData(sortedData)
      } else {
        setData([])
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง')
      setData([])
      console.error('Failed to load discount sales data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterModeChange = (mode: FilterMode) => {
    setFilterMode(mode)
    if (mode === 'quarterly') {
      setSelectedQuarter(getCurrentQuarter())
    } else if (mode === 'monthly') {
      setSelectedMonth(new Date().getMonth() + 1)
    }
  }

  const quarterOptions = getQuarterOptions()
  const yearOptions = getYearOptions()
  const monthOptions = getMonthOptions()

  // Calculate summary metrics
  const summaryMetrics = data.reduce((acc, item) => ({
    totalSales: acc.totalSales + item.metrics.total_commission,
    totalDiscount: acc.totalDiscount + item.metrics.total_discount,
    totalNet: acc.totalNet + item.metrics.net_commission,
    totalOrders: acc.totalOrders + item.metrics.order_count
  }), { totalSales: 0, totalDiscount: 0, totalNet: 0, totalOrders: 0 })

  const avgDiscountPercentage = data.length > 0 
    ? data.reduce((acc, item) => acc + item.metrics.discount_percentage, 0) / data.length 
    : 0

  // Export to CSV function
  const exportToCSV = () => {
    // Create CSV headers with Thai support
    const headers = [
      'ชื่อเล่น',
      'ค่าคอมรวม (฿)',
      'ส่วนลดรวม (฿)',
      'เปอร์เซ็นต์ส่วนลด (%)',
      'จำนวน Orders',
      'ยอดสุทธิ (฿)'
    ]

    // Create CSV rows
    const csvRows = [
      headers.join(','),
      ...data.map(item => [
        `"${item.nickname || item.sales_name}"`,
        formatCurrency(item.metrics.total_commission),
        formatCurrency(item.metrics.total_discount),
        Math.round(item.metrics.discount_percentage),
        item.metrics.order_count,
        formatCurrency(item.metrics.net_commission)
      ].join(','))
    ]

    // Add summary row
    csvRows.push('')
    csvRows.push('สรุปรวม')
    csvRows.push([
      'รวมทั้งหมด',
      formatCurrency(summaryMetrics.totalSales),
      formatCurrency(summaryMetrics.totalDiscount),
      Math.round(avgDiscountPercentage),
      summaryMetrics.totalOrders,
      formatCurrency(summaryMetrics.totalNet)
    ].join(','))

    // Create and download CSV file with UTF-8 BOM for Thai support
    const csvContent = '\uFEFF' + csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      
      // Generate filename with current date
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
      link.setAttribute('download', `discount-sales-report-${dateStr}-${timeStr}.csv`)
      
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Prepare chart data - Left chart: sorted by discount amount (highest first)
  const discountChartData = [...data]
    .sort((a, b) => b.metrics.total_discount - a.metrics.total_discount)
    .slice(0, 8)
    .map(item => ({
      name: (item.nickname || item.sales_name).length > 15 ? (item.nickname || item.sales_name).substring(0, 15) + '...' : (item.nickname || item.sales_name),
      value: item.metrics.total_discount,
      fullData: item
    }))

  // Right chart: sorted by discount percentage (highest first)
  const barChartData = [...data]
    .sort((a, b) => b.metrics.discount_percentage - a.metrics.discount_percentage)
    .slice(0, 10)
    .map(item => ({
      name: (item.nickname || item.sales_name).length > 15 ? (item.nickname || item.sales_name).substring(0, 15) + '...' : (item.nickname || item.sales_name),
      discount: item.metrics.total_discount,
      commission: item.metrics.total_commission,
      percentage: item.metrics.discount_percentage
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.fullData?.nickname || data.fullData?.sales_name || data.name}</p>
          {data.value !== undefined ? (
            // Left chart (discount amount)
            <>
              <p className="text-red-600">
                ส่วนลด: ฿{formatCurrency(data.value)}
              </p>
              {data.fullData && (
                <>
                  <p className="text-blue-600">
                    คอมมิชชั่น: ฿{formatCurrency(data.fullData.metrics.total_commission)}
                  </p>
                  <p className="text-gray-600">
                    เปอร์เซ็นต์: {Math.round(data.fullData.metrics.discount_percentage)}%
                  </p>
                </>
              )}
            </>
          ) : (
            // Right chart (percentage)
            <>
              <p className="text-orange-600">
                ส่วนลด: {Math.round(data.percentage)}%
              </p>
              <p className="text-red-600">
                จำนวนเงิน: ฿{formatCurrency(data.discount)}
              </p>
              <p className="text-blue-600">
                คอมมิชชั่น: ฿{formatCurrency(data.commission)}
              </p>
            </>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Discount Sales Report
        </h1>
        <p className="text-gray-600">
          รายงานยอดขายและส่วนลดของสินค้า
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ตัวกรอง</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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
              {countries.map(country => (
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
              {jobPositions.map(position => (
                <option key={position.job_position} value={position.job_position}>
                  {position.job_position}
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
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">ค่าคอมรวม</p>
                      <p className="text-2xl font-semibold text-gray-900">฿{formatCurrency(summaryMetrics.totalSales)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">ส่วนลดรวม</p>
                      <p className="text-2xl font-semibold text-gray-900">฿{formatCurrency(summaryMetrics.totalDiscount)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">ยอดสุทธิ</p>
                      <p className="text-2xl font-semibold text-gray-900">฿{formatCurrency(summaryMetrics.totalNet)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">% ส่วนลดเฉลี่ย</p>
                      <p className="text-2xl font-semibold text-gray-900">{Math.round(avgDiscountPercentage)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Bar Chart - Top 8 ส่วนลด (by amount) */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 8 ส่วนลด (จำนวนเงิน)</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={discountChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                        <Bar dataKey="value" fill="#EF4444" name="ส่วนลด (฿)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right Bar Chart - Top 10 ส่วนลด (by percentage) */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 ส่วนลด (เปอร์เซ็นต์)</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                        <Bar dataKey="percentage" fill="#FF8042" name="ส่วนลด (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">รายละเอียดส่วนลด</h2>
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
                          ชื่อเล่น
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Commission
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Discount
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Discount %
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Commission
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.map((item) => (
                        <tr key={item.sales_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.nickname || item.sales_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            ฿{formatCurrency(item.metrics.total_commission)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                            ฿{formatCurrency(item.metrics.total_discount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-orange-600">
                            {Math.round(item.metrics.discount_percentage)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {item.metrics.order_count.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                            ฿{formatCurrency(item.metrics.net_commission)}
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

export default DiscountSales