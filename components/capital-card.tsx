'use client'

import type { CapitalSummary, PriceData } from '@/lib/types'

interface CapitalCardProps {
  summary: CapitalSummary | null
  priceData: PriceData | null
  isLoading: boolean
}

function formatCurrency(value: number, currency: 'USD' | 'EUR' | 'SOL' = 'USD'): string {
  if (currency === 'SOL') {
    return `${value.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} SOL`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export function CapitalCard({ summary, priceData, isLoading }: CapitalCardProps) {
  return (
    <div className="glass-card flex h-full flex-col rounded-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Total Portfolio Value</h2>
      </div>

      {isLoading ? (
        <div className="flex-1 space-y-4">
          <div className="h-12 animate-pulse rounded-lg bg-muted/50" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
            ))}
          </div>
        </div>
      ) : summary ? (
        <div className="flex flex-1 flex-col">
          <div className="mb-6">
            <span className="text-4xl font-bold text-foreground">
              {formatCurrency(summary.totalUSD)}
            </span>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="mb-1 text-xs text-muted-foreground">SOL Balance</p>
              <p className="text-lg font-semibold text-foreground">
                {summary.totalSOL.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="mb-1 text-xs text-muted-foreground">EUR Value</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(summary.totalEUR, 'EUR')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          No wallet data available
        </div>
      )}
    </div>
  )
}
