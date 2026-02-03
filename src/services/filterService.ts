import { Team, JobPosition, User, ApiResponse } from '../types/filterTypes';
import { getAuthHeaders, handleAuthError } from '../utils/auth';

const API_BASE_URL = 'https://be-2-report.vercel.app';

class FilterApiService {
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
      console.error('Filter API request failed:', error);
      throw error;
    }
  }

  /**
   * ดึงรายการหมายเลขทีมที่ไม่ซ้ำกัน
   */
  async getTeams(): Promise<Team[]> {
    try {
      const response = await this.request<Team[] | ApiResponse<Team[]>>('/api/teams');
      
      if (Array.isArray(response)) {
        return response as Team[];
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected teams API response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  }

  /**
   * ดึงรายการตำแหน่งงานที่ไม่ซ้ำกัน
   */
  async getJobPositions(): Promise<JobPosition[]> {
    try {
      const response = await this.request<JobPosition[] | ApiResponse<JobPosition[]>>('/api/job-positions');
      
      if (Array.isArray(response)) {
        return response as JobPosition[];
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected job positions API response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching job positions:', error);
      return [];
    }
  }

  /**
   * ดึงรายการผู้ใช้ทั้งหมดที่มีตำแหน่งงาน
   */
  async getUsers(): Promise<User[]> {
    try {
      const response = await this.request<User[] | ApiResponse<User[]>>('/api/users');
      
      if (Array.isArray(response)) {
        return response as User[];
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected users API response format:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * ดึงผู้ใช้ที่ filter ตาม team หรือ job position
   */
  async getUsersFiltered(teamNumber?: number, jobPosition?: string): Promise<User[]> {
    try {
      const allUsers = await this.getUsers();
      
      return allUsers.filter(user => {
        const matchesTeam = teamNumber ? user.team_number === teamNumber : true;
        const matchesPosition = jobPosition ? 
          user.job_position.toLowerCase() === jobPosition.toLowerCase() : true;
        
        return matchesTeam && matchesPosition;
      });
    } catch (error) {
      console.error('Error filtering users:', error);
      return [];
    }
  }
}

export const filterApiService = new FilterApiService();
export default filterApiService;