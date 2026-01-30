import { SupplierReportData, Country, ApiResponse, FilterParams } from '../types/supplier';

const API_BASE_URL = 'https://be-2-report.vercel.app';

class SupplierApiService {
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

  async getCountries(): Promise<Country[]> {
    try {
      const response = await this.request<ApiResponse<Country[]> | Country[]>('/api/countries');
      
      // Check if response has the expected structure
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        // Handle case where API returns array directly
        return response as Country[];
      } else {
        console.warn('Unexpected countries API response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  async getSupplierReport(params: FilterParams): Promise<SupplierReportData[]> {
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

      const url = `/api/reports/supplier-performance?${queryParams.toString()}`;
      console.log('API URL:', `${API_BASE_URL}${url}`); // Debug log

      const response = await this.request<ApiResponse<SupplierReportData[]>>(url);
      
      // Check if response has the expected structure
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        // Handle case where API returns array directly
        return response as SupplierReportData[];
      } else {
        console.warn('Unexpected API response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching supplier report:', error);
      // Return empty array instead of throwing
      return [];
    }
  }
}

export const supplierApiService = new SupplierApiService();
export default supplierApiService;