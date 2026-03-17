'use client'

import type { CapitalSummary } from '@/lib/types'
import { TrendingUp, TrendingDown, DollarSign, Wallet, Percent } from 'lucide-react'

interface ProfitCardProps {
  summary: CapitalSummary | null
  initialCapitalUSD?: number
  isLoading: boolean
}

export function ProfitChart({ summary, initialCapitalUSD, isLoading }: ProfitCardProps) {
  const isProfit = summary ? summary.profitUSD >= 0 : true
  const hasInitialCapital = initialCapitalUSD !== undefined && initialCapitalUSD > 0

  return (
    <div className="glass-card flex h-full flex-col rounded-xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Profit / Loss</h2>
        {summary && hasInitialCapital && (
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
            isProfit 
              ? 'bg-success/20 text-success' 
              : 'bg-destructive/20 text-destructive'
          }`}>
            {isProfit ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {isProfit ? '+' : ''}{summary.profitPercent.toFixed(2)}%
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 space-y-4">
          <div className="h-20 animate-pulse rounded-lg bg-muted/50" />
          <div className="h-20 animate-pulse rounded-lg bg-muted/50" />
        </div>
      ) : !summary ? (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Add wallets to see profit/loss
        </div>
      ) : !hasInitialCapital ? (
        <div className="flex flex-1 items-center justify-center text-center text-muted-foreground">
          Set initial capital in settings to track profit/loss
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-end space-y-4">
          {/* Initial Capital */}
          <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Initial Capital</p>
                <p className="text-lg font-semibold text-foreground">
                  ${initialCapitalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Profit/Loss */}
          <div className={`flex items-center justify-between rounded-lg p-4 ${
            isProfit ? 'bg-success/10' : 'bg-destructive/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isProfit ? 'bg-success/20' : 'bg-destructive/20'
              }`}>
                <Percent className={`h-5 w-5 ${isProfit ? 'text-success' : 'text-destructive'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit / Loss</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-lg font-semibold ${isProfit ? 'text-success' : 'text-destructive'}`}>
                    {isProfit ? '+' : ''}${summary.profitUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-sm ${isProfit ? 'text-success/70' : 'text-destructive/70'}`}>
                    ({isProfit ? '+' : ''}{summary.profitPercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
            {isProfit ? (
              <TrendingUp className="h-6 w-6 text-success" />
            ) : (
              <TrendingDown className="h-6 w-6 text-destructive" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
