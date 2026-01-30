export interface DiscountSalesData {
  sales_id: number;
  sales_name: string;
  metrics: {
    total_commission: number;
    total_discount: number;
    discount_percentage: number;
    order_count: number;
    net_commission: number;
  };
}

export interface DiscountSalesParams {
  year: number;
  quarter?: number;
  month?: number;
  country_id?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}