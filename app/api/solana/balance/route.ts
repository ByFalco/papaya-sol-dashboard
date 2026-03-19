import { NextResponse } from 'next/server'

const SOLANA_RPC_URLS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-mainnet.g.alchemy.com/v2/demo',
  'https://rpc.ankr.com/solana',
]

const LAMPORTS_PER_SOL = 1_000_000_000

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

export async function POST(request: Request) {
  try {
    const { addresses } = await request.json()

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: 'Invalid addresses array' },
        { status: 400 }
      )
    }

    const data = await fetchWithFallback(addresses)

    if (!data) {
      return NextResponse.json(
        { error: 'All RPC endpoints failed' },
        { status: 503 }
      )
    }

    const accounts = data.result?.value || []

    const balances = addresses.map((address: string, index: number) => {
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

    return NextResponse.json({ balances })
  } catch (error) {
    console.error('Solana balance API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}