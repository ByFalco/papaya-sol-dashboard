import type { WalletBalance } from './types'

export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return base58Regex.test(address)
}

export async function getWalletBalances(addresses: string[]): Promise<WalletBalance[]> {
  if (addresses.length === 0) return []

  try {
    const response = await fetch('/api/solana/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addresses }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to fetch wallet balances')
    }

    const data = await response.json()
    return data.balances || []
  } catch (error) {
    console.error('Error fetching balances:', error)
    return addresses.map(address => ({
      address,
      balanceSOL: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }))
  }
}
