import React, { useState, useEffect } from 'react'
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { OrderDiscountData, SalesSummary } from '../types/orderDiscount'
import { Country, FilterMode } from '../types/supplier'
import { orderDiscountApiService } from '../services/orderDiscountApi'
import { supplierApiService } from '../services/supplierApi'
import { 
  formatCurrency, 
  getQuarterOptions, 
  getYearOptions, 
  getMonthOptions,
  getCurrentYear,
  getCurrentQuarter,
  sortCountriesByThai
} from '../utils/dateUtils'

// Import new types and services
import { ExtendedFilterParams, Team, JobPosition, User } from '../types/filterTypes'
import { filterApiService } from '../services/filterService'

const RequestDiscount: React.FC = () => {
  const [data, setData] = useState<OrderDiscountData[]>([])
  const [allOrdersData, setAllOrdersData] = useState<OrderDiscountData[]>([]) // เก็บข้อมูลทั้งหมด
  const [countries, setCountries] = useState<Country[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDiscountOnly, setShowDiscountOnly] = useState(true) // Default เป็น true
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false) // Filter สำหรับ Order ที่ยังไม่ชำระเงิน
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50
  
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

      if (filterMode === 'quarterly' && selectedQuarter) {
        params.quarter = selectedQuarter
      } else if (filterMode === 'monthly' && selectedMonth) {
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

      console.log('Order Discount API Params:', params)

      const reportData = await orderDiscountApiService.getOrderDiscountReport(params)
      
      if (reportData && Array.isArray(reportData)) {
        // Sort by created_at descending
        const sortedData = reportData.sort((a, b) => 
          new Date(b.order_info.created_at).getTime() - new Date(a.order_info.created_at).getTime()
        )
        
        // เก็บข้อมูลทั้งหมด
        setAllOrdersData(sortedData)
        
        // กรองข้อมูลตาม checkbox
        const filteredData = showDiscountOnly 
          ? sortedData.filter(order => order.financial_metrics.discount >= 1)
          : sortedData
        
        setData(filteredData)
      } else {
        setAllOrdersData([])
        setData([])
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง')
      setAllOrdersData([])
      setData([])
      console.error('Failed to load order discount data:', err)
    } finally {
      setLoading(false)
    }
  }

  // เมื่อ checkbox เปลี่ยน
  useEffect(() => {
    if (allOrdersData.length > 0) {
      let filteredData = allOrdersData

      // กรองตาม discount
      if (showDiscountOnly) {
        filteredData = filteredData.filter(order => order.financial_metrics.discount >= 1)
      }

      // กรองตาม payment status
      if (showUnpaidOnly) {
        filteredData = filteredData.filter(order => !order.payment_details.status_list.includes('paid'))
      }

      setData(filteredData)
      setCurrentPage(1) // Reset to first page when filter changes
    }
  }, [showDiscountOnly, showUnpaidOnly, allOrdersData])

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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

  // Calculate sales summary - ใช้ข้อมูลทั้งหมดในการคำนวณ
  const salesSummary = React.useMemo(() => {
    const salesMap = new Map<string, {
      orders_with_discount: number;
      total_orders: number;
      total_discount: number;
      total_discount_percent: number;
      total_net_amount: number;
      // เพิ่มการนับตามช่วงเปอร์เซ็นต์
      no_discount: number;
      discount_1_15: number;
      discount_15_20: number;
      discount_over_20: number;
    }>()

    // นับ Order ทั้งหมดของแต่ละเซลล์
    allOrdersData.forEach(order => {
      const sellerName = order.sales_crm.seller_name
      const existing = salesMap.get(sellerName) || {
        orders_with_discount: 0,
        total_orders: 0,
        total_discount: 0,
        total_discount_percent: 0,
        total_net_amount: 0,
        no_discount: 0,
        discount_1_15: 0,
        discount_15_20: 0,
        discount_over_20: 0
      }

      const hasDiscount = order.financial_metrics.discount >= 1
      const discountPercent = order.financial_metrics.discount_percent

      // จัดกลุ่มตามช่วงเปอร์เซ็นต์
      let categoryUpdate = { ...existing }
      if (discountPercent === 0) {
        categoryUpdate.no_discount += 1
      } else if (discountPercent > 0 && discountPercent <= 15) {
        categoryUpdate.discount_1_15 += 1
      } else if (discountPercent > 15 && discountPercent <= 20) {
        categoryUpdate.discount_15_20 += 1
      } else if (discountPercent > 20) {
        categoryUpdate.discount_over_20 += 1
      }

      salesMap.set(sellerName, {
        orders_with_discount: existing.orders_with_discount + (hasDiscount ? 1 : 0),
        total_orders: existing.total_orders + 1,
        total_discount: existing.total_discount + order.financial_metrics.discount,
        total_discount_percent: existing.total_discount_percent + order.financial_metrics.discount_percent,
        total_net_amount: existing.total_net_amount + order.financial_metrics.net_amount,
        no_discount: categoryUpdate.no_discount,
        discount_1_15: categoryUpdate.discount_1_15,
        discount_15_20: categoryUpdate.discount_15_20,
        discount_over_20: categoryUpdate.discount_over_20
      })
    })

    return Array.from(salesMap.entries()).map(([seller_name, stats]) => ({
      seller_name,
      order_count: stats.orders_with_discount, // จำนวน Order ที่มีส่วนลด
      total_orders: stats.total_orders, // จำนวน Order ทั้งหมด
      total_discount: stats.total_discount,
      avg_discount_percent: stats.orders_with_discount > 0 ? stats.total_discount_percent / stats.orders_with_discount : 0,
      total_net_amount: stats.total_net_amount,
      // เพิ่มข้อมูลสัดส่วน
      discount_breakdown: {
        no_discount: stats.no_discount,
        discount_1_15: stats.discount_1_15,
        discount_15_20: stats.discount_15_20,
        discount_over_20: stats.discount_over_20
      }
    } as SalesSummary & { total_orders: number; discount_breakdown: any })).sort((a, b) => b.total_discount - a.total_discount) // เรียงตามส่วนลดรวมมากที่สุด
  }, [allOrdersData])

  // Calculate overall metrics
  const overallMetrics = React.useMemo(() => {
    return data.reduce((acc, order) => ({
      totalOrders: acc.totalOrders + 1,
      totalDiscount: acc.totalDiscount + order.financial_metrics.discount,
      totalNetAmount: acc.totalNetAmount + order.financial_metrics.net_amount,
      totalCommission: acc.totalCommission + order.financial_metrics.supplier_commission
    }), { totalOrders: 0, totalDiscount: 0, totalNetAmount: 0, totalCommission: 0 })
  }, [data])

  const avgDiscountPercent = data.length > 0 
    ? data.reduce((acc, order) => acc + order.financial_metrics.discount_percent, 0) / data.length 
    : 0

  // Export to CSV function
  const exportToCSV = () => {
    // Create CSV headers with Thai support
    const headers = [
      'Order Code',
      'วันที่สร้าง',
      'ลูกค้า',
      'เซลล์',
      'CRM',
      'ยอดสุทธิ (฿)',
      'คอมมิชชั่น (฿)',
      'ส่วนลด (฿)',
      'เปอร์เซ็นต์ส่วนลด (%)',
      'การชำระเงิน (งวด)',
      'สถานะการชำระ'
    ]

    // Create CSV rows
    const csvRows = [
      headers.join(','),
      ...data.map(order => [
        `"${order.order_info.order_code}"`,
        `"${formatDate(order.order_info.created_at)}"`,
        `"${order.customer_info.customer_name}"`,
        `"${order.sales_crm.seller_name}"`,
        `"${order.sales_crm.crm_name}"`,
        formatCurrency(order.financial_metrics.net_amount),
        formatCurrency(order.financial_metrics.supplier_commission),
        formatCurrency(order.financial_metrics.discount),
        Math.round(order.financial_metrics.discount_percent),
        `"${order.payment_details.paid_installments}/${order.payment_details.total_installments}"`,
        `"${order.payment_details.status_list}"`
      ].join(','))
    ]

    // Add summary row
    csvRows.push('')
    csvRows.push('สรุปรวม')
    csvRows.push([
      'รวมทั้งหมด',
      '',
      '',
      '',
      '',
      formatCurrency(overallMetrics.totalNetAmount),
      formatCurrency(overallMetrics.totalCommission),
      formatCurrency(overallMetrics.totalDiscount),
      Math.round(avgDiscountPercent),
      `"${overallMetrics.totalOrders} Orders"`,
      ''
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
      link.setAttribute('download', `order-discount-report-${dateStr}-${timeStr}.csv`)
      
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Chart data - prepare data similar to DiscountSales page
  const discountChartData = [...salesSummary]
    .sort((a, b) => b.total_discount - a.total_discount)
    .slice(0, 8)
    .map(item => ({
      name: item.seller_name.length > 15 ? item.seller_name.substring(0, 15) + '...' : item.seller_name,
      value: item.total_discount,
      fullData: item
    }))

  const percentageChartData = [...salesSummary]
    .sort((a, b) => b.avg_discount_percent - a.avg_discount_percent)
    .slice(0, 10)
    .map(item => ({
      name: item.seller_name.length > 15 ? item.seller_name.substring(0, 15) + '...' : item.seller_name,
      percentage: item.avg_discount_percent,
      discount: item.total_discount,
      orders: item.order_count
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.fullData?.seller_name || data.name}</p>
          {data.value !== undefined ? (
            // Left chart (discount amount)
            <>
              <p className="text-red-600">
                ส่วนลด: ฿{formatCurrency(data.value)}
              </p>
              {data.fullData && (
                <>
                  <p className="text-blue-600">
                    Orders: {data.fullData.order_count}
                  </p>
                  <p className="text-gray-600">
                    เฉลี่ย: {Math.round(data.fullData.avg_discount_percent)}%
                  </p>
                </>
              )}
            </>
          ) : data.percentage !== undefined ? (
            // Right chart (percentage)
            <>
              <p className="text-orange-600">
                ส่วนลด: {Math.round(data.percentage)}%
              </p>
              <p className="text-red-600">
                จำนวนเงิน: ฿{formatCurrency(data.discount)}
              </p>
              <p className="text-blue-600">
                Orders: {data.orders}
              </p>
            </>
          ) : (
            // Original charts
            <>
              {data.orders && <p className="text-blue-600">Orders: {data.orders}</p>}
              {data.discount && <p className="text-red-600">ส่วนลด: ฿{formatCurrency(data.discount)}</p>}
              {data.avgPercent && <p className="text-orange-600">เฉลี่ย: {Math.round(data.avgPercent)}%</p>}
            </>
          )}
        </div>
      )
    }
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPaymentStatusColor = (statusList: string) => {
    if (statusList.includes('pending')) {
      return 'bg-yellow-100 text-yellow-800'
    } else if (statusList.includes('paid')) {
      return 'bg-green-100 text-green-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Discount Report
        </h1>
        <p className="text-gray-600">
          รายงาน Order ที่มีส่วนลดพร้อมสรุปข้อมูลเซลล์
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
                <p className="mt-1 text-sm text-gray-500">ไม่พบ Order ที่มีส่วนลดตามเงื่อนไขที่เลือก</p>
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
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-semibold text-gray-900">{overallMetrics.totalOrders.toLocaleString()}</p>
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
                      <p className="text-2xl font-semibold text-gray-900">฿{formatCurrency(overallMetrics.totalDiscount)}</p>
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
                      <p className="text-sm font-medium text-gray-600">ยอดสุทธิ</p>
                      <p className="text-2xl font-semibold text-gray-900">฿{formatCurrency(overallMetrics.totalNetAmount)}</p>
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
                      <p className="text-2xl font-semibold text-gray-900">{Math.round(avgDiscountPercent)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Summary Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Top Sales ที่ให้ส่วนลดมากที่สุด</h2>
                  <p className="text-sm text-gray-600 mt-1">เรียงตามจำนวนเงินส่วนลดรวมสูงสุด</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          อันดับ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          เซลล์
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สัดส่วน % ส่วนลด
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order มีส่วนลด / ทั้งหมด
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % เฉลี่ยส่วนลด
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ส่วนลดรวม
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesSummary.map((sales, index) => {
                        // กำหนดสีพื้นหลังสำหรับ 3 อันดับแรก
                        let rowBgClass = 'hover:bg-gray-50'
                        if (index === 0) {
                          rowBgClass = 'bg-red-100 hover:bg-red-200 border-l-4 border-red-600'
                        } else if (index === 1) {
                          rowBgClass = 'bg-red-50 hover:bg-red-100 border-l-4 border-red-400'
                        } else if (index === 2) {
                          rowBgClass = 'bg-pink-50 hover:bg-red-50 border-l-4 border-red-300'
                        }

                        return (
                        <tr key={sales.seller_name} className={rowBgClass}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                index < 3 ? 'bg-yellow-500' : 'bg-gray-400'
                              }`}>
                                {index + 1}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {sales.seller_name}
                                {index === 0 && (
                                  <span className="ml-2 text-red-600 text-lg animate-pulse" title="🔥 อันดับ 1 ส่วนลดสูงสุด! 🔥">
                                    😠💢
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">ไม่ขอส่วนลดเลย:</span>
                                <span className="font-medium">{sales.discount_breakdown?.no_discount || 0} Order</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-600">1-15%:</span>
                                <span className="font-medium text-blue-600">{sales.discount_breakdown?.discount_1_15 || 0} Orders</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-orange-600">15-20%:</span>
                                <span className="font-medium text-orange-600">{sales.discount_breakdown?.discount_15_20 || 0} Orders</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-red-600">20% ขึ้นไป:</span>
                                <span className="font-medium text-red-600">{sales.discount_breakdown?.discount_over_20 || 0} Orders</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-sm">
                              <span className="font-medium text-blue-600">{sales.order_count}</span>
                              <span className="text-gray-500"> / </span>
                              <span className="text-gray-900">{sales.total_orders}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              ({sales.total_orders > 0 ? Math.round((sales.order_count / sales.total_orders) * 100) : 0}% มีส่วนลด)
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-orange-600 font-medium">
                            {Math.round(sales.avg_discount_percent)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 font-medium">
                            ฿{formatCurrency(sales.total_discount)}
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
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
                      <BarChart data={percentageChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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

              {/* Order Details Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">รายละเอียด Orders</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {showDiscountOnly && showUnpaidOnly ? 'แสดงเฉพาะ Order ที่มีส่วนลด ≥ ฿1 และยังไม่ชำระเงิน' :
                       showDiscountOnly ? 'แสดงเฉพาะ Order ที่มีส่วนลด ≥ ฿1' :
                       showUnpaidOnly ? 'แสดงเฉพาะ Order ที่ยังไม่ชำระเงิน' :
                       'แสดง Order ทั้งหมด'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={exportToCSV}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export CSV
                    </button>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showDiscountOnly}
                        onChange={(e) => setShowDiscountOnly(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        แสดงเฉพาะ Order ที่มีส่วนลด
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showUnpaidOnly}
                        onChange={(e) => setShowUnpaidOnly(e.target.checked)}
                        className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        แสดงเฉพาะ Order ที่ยังไม่ชำระเงิน
                      </span>
                    </label>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่สร้าง
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ลูกค้า
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          เซลล์
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CRM
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ยอดสุทธิ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          คอมมิชชั่น
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ส่วนลด
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % ส่วนลด
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          การชำระเงิน
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานะ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentData.map((order) => (
                        <tr key={order.order_info.order_code} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-600">
                              {order.order_info.order_code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.order_info.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.customer_info.customer_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {order.sales_crm.seller_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {order.sales_crm.crm_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            ฿{formatCurrency(order.financial_metrics.net_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-blue-600">
                            ฿{formatCurrency(order.financial_metrics.supplier_commission)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600">
                            ฿{formatCurrency(order.financial_metrics.discount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-orange-600">
                            {Math.round(order.financial_metrics.discount_percent)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_details.status_list)}`}>
                                {order.payment_details.paid_installments}/{order.payment_details.total_installments}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                งวด
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-xs text-gray-600 max-w-32">
                              {order.payment_details.status_list}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Table Summary */}
                <div className="bg-gray-50 px-6 py-3 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      แสดง {startIndex + 1}-{Math.min(endIndex, data.length)} จาก {data.length} รายการ
                    </span>
                    <div className="flex space-x-6 text-gray-600">
                      <span>
                        ยอดสุทธิรวม: <span className="font-medium text-gray-900">฿{formatCurrency(overallMetrics.totalNetAmount)}</span>
                      </span>
                      <span>
                        ส่วนลดรวม: <span className="font-medium text-red-600">฿{formatCurrency(overallMetrics.totalDiscount)}</span>
                      </span>
                      <span>
                        คอมมิชชั่นรวม: <span className="font-medium text-blue-600">฿{formatCurrency(overallMetrics.totalCommission)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-700">
                        <span>หน้า {currentPage} จาก {totalPages}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ก่อนหน้า
                        </button>
                        
                        {/* Page numbers */}
                        <div className="flex space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm border rounded-md ${
                                  currentPage === pageNum
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ถัดไป
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default RequestDiscount