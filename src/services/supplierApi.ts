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
      const response = await this.request<ApiResponse<Country[]>>('/api/countries');
      return response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
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
      
      if (params.country_id) {
        queryParams.append('country_id', params.country_id.toString());
      }

      const response = await this.request<ApiResponse<SupplierReportData[]>>(
        `/api/reports/supplier-performance?${queryParams.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier report:', error);
      throw error;
    }
  }
}

export const supplierApiService = new SupplierApiService();
export default supplierApiService;