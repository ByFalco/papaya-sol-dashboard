import type { PriceData } from './types'

const BINANCE_SOL_URL = 'https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT'
const EXCHANGE_RATE_URL = 'https://api.exchangerate-api.com/v4/latest/USD'

// Fallback exchange rate if API fails
const DEFAULT_USD_EUR_RATE = 0.92

export async function fetchSOLPrice(): Promise<number> {
  try {
    const response = await fetch(BINANCE_SOL_URL)
    if (!response.ok) throw new Error('Failed to fetch SOL price')
    const data = await response.json()
    return parseFloat(data.price)
  } catch (error) {
    console.error('Error fetching SOL price:', error)
    throw error
  }
}

export async function fetchUSDtoEURRate(): Promise<number> {
  try {
    const response = await fetch(EXCHANGE_RATE_URL)
    if (!response.ok) throw new Error('Failed to fetch exchange rate')
    const data = await response.json()
    return data.rates?.EUR || DEFAULT_USD_EUR_RATE
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    return DEFAULT_USD_EUR_RATE
  }
}

export async function fetchPriceData(): Promise<PriceData> {
  const [solUSD, usdEUR] = await Promise.all([
    fetchSOLPrice(),
    fetchUSDtoEURRate()
  ])

  return {
    solUSD,
    usdEUR,
    lastUpdated: new Date()
  }
}
