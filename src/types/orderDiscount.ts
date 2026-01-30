export interface OrderDiscountData {
  order_info: {
    order_code: string;
    created_at: string;
  };
  customer_info: {
    customer_name: string;
  };
  payment_details: {
    total_installments: number;
    paid_installments: number;
    status_list: string;
  };
  sales_crm: {
    seller_name: string;
    crm_name: string;
  };
  financial_metrics: {
    net_amount: number;
    supplier_commission: number;
    discount: number;
    discount_percent: number;
  };
}

export interface OrderDiscountParams {
  year?: number;
  quarter?: number;
  month?: number;
  country_id?: number;
}

export interface SalesSummary {
  seller_name: string;
  order_count: number; // จำนวน Order ที่มีส่วนลด
  total_orders: number; // จำนวน Order ทั้งหมด
  total_discount: number;
  avg_discount_percent: number;
  total_net_amount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}