export interface SupplierReportData {
  supplier_id: number;
  supplier_name_th: string;
  supplier_name_en: string;
  metrics: {
    total_commission: number;           // ยอดคอมรวม
    total_net_commission: number;       // ยอดคอมสุทธิ (หักส่วนลด)
    total_pax: number;                  // จำนวนหัว
    avg_commission_per_pax: number;     // เฉลี่ยคอม/หัว
    avg_net_commission_per_pax: number; // เฉลี่ยคอมสุทธิ/หัว
  };
}

export interface Country {
  id: number;
  name_th: string;
  name_en: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FilterParams {
  year: number;
  quarter?: number;
  month?: number;
  country_id?: number;
}

export type FilterMode = 'quarterly' | 'monthly' | 'yearly' | 'all';

export interface QuarterOption {
  label: string;
  year: number;
  quarter: number;
}