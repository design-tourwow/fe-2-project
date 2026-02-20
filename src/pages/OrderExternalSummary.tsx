import React, { useState, useEffect } from 'react'
import { OrderExternalData } from '../types/orderExternal'
import { Country } from '../types/supplier'
import { ExtendedFilterParams, Team, JobPosition, User } from '../types/filterTypes'
import { orderExternalApiService } from '../services/orderExternalApi'
import { supplierApiService } from '../services/supplierApi'
import { filterApiService } from '../services/filterService'
import { usePageLoading } from '../hooks/usePageLoading'
import { 
  formatCurrency, 
  getYearOptions, 
  getMonthOptions,
  getCurrentYear,
  sortCountriesByThai,
  filterAndDisplayJobPositions
} from '../utils/dateUtils'

const OrderExternalSummary: React.FC = () => {
  const [data, setData] = useState<OrderExternalData[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  usePageLoading(loading, {
    loadingMessage: "กำลังโหลดข้อมูล Order แก้ย้อนหลัง..."
  })
  
  // Filter states - Default to monthly with current month
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedCountry, setSelectedCountry] = useState<number | undefined>(undefined)
  const [selectedJobPosition, setSelectedJobPosition] = useState<string | undefined>(undefined)
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>(undefined)
  const [selectedUser, setSelectedUser] = useState<number | undefined>(undefined)

  // Load initial data
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
    
    if (selectedUser && !filtered.find(user => user.ID === selectedUser)) {
      setSelectedUser(undefined)
    }
  }, [selectedTeam, selectedJobPosition, users, selectedUser])

  // Load data when filters change
  useEffect(() => {
    loadReportData()
  }, [selectedYear, selectedMonth, selectedCountry, selectedJobPosition, selectedTeam, selectedUser])

  const loadReportData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params: ExtendedFilterParams = {
        year: selectedYear,
        month: selectedMonth
      }

      if (selectedCountry && selectedCountry > 0) {
        params.country_id = selectedCountry
      }

      if (selectedJobPosition) {
        params.job_position = selectedJobPosition
      }
      
      if (selectedTeam) {
        params.team_number = selectedTeam
      }
      
      if (selectedUser) {
        params.user_id = selectedUser
      }

      console.log('Order External API Params:', params)
      console.log('Calling API:', `https://be-2-report.vercel.app/api/reports/order-external-summary`)

      const reportData = await orderExternalApiService.getOrderExternalSummary(params)
      
      console.log('Order External API Response:', reportData)
      
      if (reportData && Array.isArray(reportData)) {
        setData(reportData)
      } else {
        setData([])
      }
    } catch (err) {
      console.error('Order External API Error:', err)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง')
      setData([])
      console.error('Failed to load order external data:', err)
    } finally {
      setLoading(false)
    }
  }

  const yearOptions = getYearOptions()
  const monthOptions = getMonthOptions()

  // Calculate summary metrics
  const summaryMetrics = data.reduce((acc, item) => ({
    totalOrders: acc.totalOrders + 1,
    totalNetAmount: acc.totalNetAmount + item.net_amount,
    totalCommission: acc.totalCommission + item.supplier_commission,
    totalDiscount: acc.totalDiscount + item.discount
  }), { totalOrders: 0, totalNetAmount: 0, totalCommission: 0, totalDiscount: 0 })

  // Export to CSV function
  const exportToCSV = () => {
    const headers = [
      'รหัส Order',
      'วันที่สร้าง Order',
      'ชื่อลูกค้า',
      'ยอดสุทธิ (฿)',
      'ค่าคอมมิชชั่น (฿)',
      'ส่วนลด (฿)',
      'วันที่ชำระเงิน'
    ]

    const csvRows = [
      headers.join(','),
      ...data.map(item => [
        `"${item.order_code}"`,
        new Date(item.created_at).toLocaleDateString('th-TH'),
        `"${item.customer_name}"`,
        formatCurrency(item.net_amount),
        formatCurrency(item.supplier_commission),
        formatCurrency(item.discount),
        new Date(item.paid_at).toLocaleDateString('th-TH')
      ].join(','))
    ]

    csvRows.push('')
    csvRows.push('สรุปรวม')
    csvRows.push([
      `จำนวน ${summaryMetrics.totalOrders} Orders`,
      '',
      '',
      formatCurrency(summaryMetrics.totalNetAmount),
      formatCurrency(summaryMetrics.totalCommission),
      formatCurrency(summaryMetrics.totalDiscount),
      ''
    ].join(','))

    const csvContent = '\uFEFF' + csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
      link.setAttribute('download', `order-external-summary-${dateStr}-${timeStr}.csv`)
      
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order แก้ย้อนหลัง
        </h1>
        <p className="text-gray-600">
          รายงาน Orders ที่มีการชำระเงินงวดแรกสำเร็จ และวันที่ชำระเงินไม่อยู่ในเดือนเดียวกันกับวันที่สร้าง Order
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ตัวกรอง</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Month Filter */}
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

          {/* Year Filter */}
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
                setSelectedUser(undefined)
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
                setSelectedUser(undefined)
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">จำนวน Orders</p>
                      <p className="text-2xl font-semibold text-gray-900">{summaryMetrics.totalOrders.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">ยอดสุทธิรวม</p>
                      <p className="text-2xl font-semibold text-gray-900">฿{formatCurrency(summaryMetrics.totalNetAmount)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">ค่าคอมมิชชั่นรวม</p>
                      <p className="text-2xl font-semibold text-gray-900">฿{formatCurrency(summaryMetrics.totalCommission)}</p>
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
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">รายละเอียด Orders</h2>
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
                          รหัส Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่สร้าง Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ชื่อลูกค้า
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ยอดสุทธิ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ค่าคอมมิชชั่น
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ส่วนลด
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่ชำระเงิน
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.map((item, index) => (
                        <tr key={`${item.order_code}-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-600">
                              {item.order_code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(item.created_at).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.customer_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            ฿{formatCurrency(item.net_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-purple-600">
                            ฿{formatCurrency(item.supplier_commission)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600">
                            ฿{formatCurrency(item.discount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(item.paid_at).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
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

export default OrderExternalSummary
