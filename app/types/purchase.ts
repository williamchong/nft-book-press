export interface PurchaseItem {
  id: string
  email: string
  phone?: string
  wallet?: string
  classId: string
  price: number
  priceName?: string
  status: string
  timestamp: number
  message?: string
  from?: string
  quantity?: number
  txHash?: string
  coupon?: string
  giftInfo?: { toEmail?: string }
  formattedDate?: string
}
