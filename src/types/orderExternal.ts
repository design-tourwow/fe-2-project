export interface OrderExternalData {
  order_code: string
  created_at: string
  customer_name: string
  net_amount: number
  supplier_commission: number
  discount: number
  first_installment_paid: boolean
  paid_at: string
}
