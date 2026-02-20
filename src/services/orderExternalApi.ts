import { OrderExternalData } from '../types/orderExternal'
import { ExtendedFilterParams } from '../types/filterTypes'
import { getAuthHeaders, handleAuthError } from '../utils/auth'

const API_BASE_URL = 'https://be-2-report.vercel.app'

class OrderExternalApiService {
  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        handleAuthError()
        throw new Error('Unauthorized access')
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async getOrderExternalSummary(params: ExtendedFilterParams): Promise<OrderExternalData[]> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.year) queryParams.append('year', params.year.toString())
      if (params.quarter) queryParams.append('quarter', params.quarter.toString())
      if (params.month) queryParams.append('month', params.month.toString())
      if (params.country_id && params.country_id > 0) queryParams.append('country_id', params.country_id.toString())
      if (params.job_position) queryParams.append('job_position', params.job_position)
      if (params.team_number) queryParams.append('team_number', params.team_number.toString())
      if (params.user_id) queryParams.append('user_id', params.user_id.toString())

      const url = `/api/reports/order-external-summary?${queryParams.toString()}`
      console.log('Order External API URL:', `${API_BASE_URL}${url}`)
      
      const response = await this.request<OrderExternalData[]>(url)
      
      if (Array.isArray(response)) {
        return response
      } else {
        console.warn('Unexpected API response format:', response)
        return []
      }
    } catch (error) {
      console.error('Error fetching order external summary:', error)
      return []
    }
  }
}

export const orderExternalApiService = new OrderExternalApiService()
export default orderExternalApiService
