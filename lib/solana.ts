import type { WalletBalance } from './types'

const SOLANA_RPC_URLS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-mainnet.g.alchemy.com/v2/demo',
  'https://rpc.ankr.com/solana',
]

const LAMPORTS_PER_SOL = 1_000_000_000

export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return base58Regex.test(address)
}

async function fetchWithFallback(addresses: string[]) {
  for (const rpcUrl of SOLANA_RPC_URLS) {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getMultipleAccounts',
          params: [addresses, { encoding: 'base64' }],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (!data.error) {
          return data
        }
      }
    } catch {
      continue
    }
  }
  return null
}

export async function getWalletBalances(addresses: string[]): Promise<WalletBalance[]> {
  if (addresses.length === 0) return []

  try {
    const data = await fetchWithFallback(addresses)

    if (!data) {
      throw new Error('All RPC endpoints failed')
    }

    const accounts = data.result?.value || []

    return addresses.map((address: string, index: number) => {
      const account = accounts[index]
      if (account === null) {
        return {
          address,
          balanceSOL: 0,
          error: 'Account not found or empty',
        }
      }
      return {
        address,
        balanceSOL: (account.lamports || 0) / LAMPORTS_PER_SOL,
      }
    })
  } catch (error) {
    console.error('Error fetching balances:', error)
    return addresses.map(address => ({
      address,
      balanceSOL: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }))
  }
}
