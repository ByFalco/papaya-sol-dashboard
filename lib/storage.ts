import type { WalletData } from './types'

const STORAGE_KEY = 'solana-portfolio-wallets'

export function loadWalletData(): WalletData | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function saveWalletData(data: WalletData): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...data,
    savedAt: new Date().toISOString()
  }))
}

export function clearWalletData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function exportWalletData(data: WalletData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `solana-wallets-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function parseImportedFile(content: string): WalletData {
  try {
    const parsed = JSON.parse(content)
    if (!Array.isArray(parsed.addresses)) {
      throw new Error('Invalid file format: missing addresses array')
    }
    return {
      addresses: parsed.addresses.filter((a: unknown) => typeof a === 'string'),
      initialCapitalUSD: typeof parsed.initialCapitalUSD === 'number' ? parsed.initialCapitalUSD : undefined,
      savedAt: parsed.savedAt
    }
  } catch (error) {
    throw new Error('Failed to parse wallet file')
  }
}
