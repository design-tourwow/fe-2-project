import { OrderDiscountData, ApiResponse } from '../types/orderDiscount';
import { ExtendedFilterParams } from '../types/filterTypes';
import { getAuthHeaders, handleAuthError } from '../utils/auth';

const API_BASE_URL = 'https://be-2-report.vercel.app';

class OrderDiscountApiService {
  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        handleAuthError();
        throw new Error('Unauthorized access');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getOrderDiscountReport(params: ExtendedFilterParams = {}): Promise<OrderDiscountData[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.year) {
        queryParams.append('year', params.year.toString());
      }
      
      if (params.quarter) {
        queryParams.append('quarter', params.quarter.toString());
      }
      
      if (params.month) {
        queryParams.append('month', params.month.toString());
      }
      
      if (params.country_id && params.country_id > 0) {
        queryParams.append('country_id', params.country_id.toString());
      }

      // เพิ่ม Parameters ใหม่
      if (params.job_position) {
        queryParams.append('job_position', params.job_position);
      }
      
      if (params.team_number) {
        queryParams.append('team_number', params.team_number.toString());
      }
      
      if (params.user_id) {
        queryParams.append('user_id', params.user_id.toString());
      }

      const url = `/api/reports/order-has-discount${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('Order Discount API URL:', `${API_BASE_URL}${url}`);

      const response = await this.request<OrderDiscountData[] | ApiResponse<OrderDiscountData[]>>(url);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response as OrderDiscountData[];
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected API response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching order discount report:', error);
      return [];
    }
  }
}

export const orderDiscountApiService = new OrderDiscountApiService();
export default orderDiscountApiService;