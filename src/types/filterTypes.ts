// Types สำหรับ Filter APIs ใหม่
export interface Team {
  team_number: number;
}

export interface JobPosition {
  job_position: string;
}

export interface User {
  ID: number;
  user_id: string;
  first_name: string;
  last_name: string;
  nickname: string;
  job_position: string;
  team_number: number;
}

// Extended Filter Parameters สำหรับทุก Report APIs
export interface ExtendedFilterParams {
  // Parameters เดิม
  year?: number;
  quarter?: number;
  month?: number;
  country_id?: number;
  
  // Parameters ใหม่
  job_position?: string;
  team_number?: number;
  user_id?: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Error response
export interface ApiError {
  error: string;
  status: number;
}