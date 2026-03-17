export interface WalletData {
  addresses: string[]
  initialCapitalUSD?: number
  savedAt?: string
}

export interface WalletBalance {
  address: string
  balanceSOL: number
  error?: string
}

export interface CapitalSummary {
  totalSOL: number
  totalUSD: number
  totalEUR: number
  profitUSD: number
  profitEUR: number
  profitPercent: number
}

export interface PriceData {
  solUSD: number
  usdEUR: number
  lastUpdated: Date
}

export interface PriceHistoryPoint {
  timestamp: number
  price: number
}
