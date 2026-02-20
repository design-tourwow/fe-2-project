import { OrderExternalData } from '../types/orderExternal'
import { ExtendedFilterParams } from '../types/filterTypes'

const API_BASE_URL = 'https://be-2-report.vercel.app/api'

class OrderExternalApiService {
  private getAuthToken(): string {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw new Error('No authentication token found')
    }
    return token
  }

  async getOrderExternalSummary(params: ExtendedFilterParams): Promise<OrderExternalData[]> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.year) queryParams.append('year', params.year.toString())
      if (params.quarter) queryParams.append('quarter', params.quarter.toString())
      if (params.month) queryParams.append('month', params.month.toString())
      if (params.country_id) queryParams.append('country_id', params.country_id.toString())
      if (params.job_position) queryParams.append('job_position', params.job_position)
      if (params.team_number) queryParams.append('team_number', params.team_number.toString())
      if (params.user_id) queryParams.append('user_id', params.user_id.toString())

      const url = `${API_BASE_URL}/reports/order-external-summary?${queryParams.toString()}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch order external summary:', error)
      throw error
    }
  }
}

export const orderExternalApiService = new OrderExternalApiService()
