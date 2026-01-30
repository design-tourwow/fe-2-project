import { DiscountSalesData, DiscountSalesParams, ApiResponse } from '../types/discountSales';

const API_BASE_URL = 'https://be-2-report.vercel.app';

class DiscountSalesApiService {
  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
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

  async getDiscountSalesReport(params: DiscountSalesParams): Promise<DiscountSalesData[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('year', params.year.toString());
      
      if (params.quarter) {
        queryParams.append('quarter', params.quarter.toString());
      }
      
      if (params.month) {
        queryParams.append('month', params.month.toString());
      }
      
      if (params.country_id && params.country_id > 0) {
        queryParams.append('country_id', params.country_id.toString());
      }

      const url = `/api/reports/sales-discount?${queryParams.toString()}`;
      console.log('Discount Sales API URL:', `${API_BASE_URL}${url}`);

      const response = await this.request<DiscountSalesData[] | ApiResponse<DiscountSalesData[]>>(url);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response as DiscountSalesData[];
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected API response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching discount sales report:', error);
      return [];
    }
  }
}

export const discountSalesApiService = new DiscountSalesApiService();
export default discountSalesApiService;