'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { TrendingUp, TrendingDown, Calculator } from 'lucide-react'

interface PriceSimulatorProps {
  currentPrice: number
  totalSOL: number
  initialCapitalUSD?: number
}

export function PriceSimulator({ currentPrice, totalSOL, initialCapitalUSD = 0 }: PriceSimulatorProps) {
  const [simulatedPrice, setSimulatedPrice] = useState(currentPrice)

  useEffect(() => {
    setSimulatedPrice(currentPrice)
  }, [currentPrice])

  const minPrice = currentPrice * 0.5
  const maxPrice = currentPrice * 3

  const currentValue = totalSOL * currentPrice
  const simulatedValue = totalSOL * simulatedPrice
  const priceChange = ((simulatedPrice - currentPrice) / currentPrice) * 100
  const valueChange = simulatedValue - currentValue
  const totalProfit = simulatedValue - initialCapitalUSD
  const totalProfitPercent = initialCapitalUSD > 0 
    ? ((simulatedValue - initialCapitalUSD) / initialCapitalUSD) * 100 
    : 0

  const isPositive = priceChange > 0

  return (
    <div className="glass-card rounded-xl p-8 flex flex-col h-full min-h-[500px]">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
          <Calculator className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Price Simulator</h2>
          <p className="text-sm text-muted-foreground">Forecast your portfolio value</p>
        </div>
      </div>

      <div className="mb-10 flex-1">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-base font-medium text-muted-foreground">Simulated SOL Price</span>
          <span className="text-4xl font-bold text-accent">
            ${simulatedPrice.toFixed(2)}
          </span>
        </div>
        
        <div className="py-6">
          <Slider
            value={[simulatedPrice]}
            onValueChange={(v) => setSimulatedPrice(v[0])}
            min={minPrice}
            max={maxPrice}
            step={0.01}
            className="my-4"
          />
        </div>

        <div className="flex justify-between text-sm text-muted-foreground font-medium px-1">
          <span>${minPrice.toFixed(0)}</span>
          <span className="text-primary px-3 py-1 rounded-full bg-primary/10">${currentPrice.toFixed(2)} (current)</span>
          <span>${maxPrice.toFixed(0)}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mt-auto">
        <div className="flex flex-col justify-center rounded-xl bg-secondary/30 p-5">
          <span className="text-sm font-medium text-muted-foreground mb-2">Simulated Portfolio Value</span>
          <span className="text-2xl font-bold text-foreground">
            ${simulatedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex flex-col justify-center rounded-xl bg-secondary/30 p-5">
          <span className="text-sm font-medium text-muted-foreground mb-2">Price Change</span>
          <span className={`flex items-center gap-1.5 text-xl font-bold ${
            isPositive ? 'text-success' : priceChange < 0 ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {isPositive ? <TrendingUp className="h-5 w-5" /> : priceChange < 0 ? <TrendingDown className="h-5 w-5" /> : null}
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </div>

        <div className="flex flex-col justify-center rounded-xl bg-secondary/30 p-5">
          <span className="text-sm font-medium text-muted-foreground mb-2">Value Change vs Current</span>
          <span className={`text-xl font-bold ${
            valueChange > 0 ? 'text-success' : valueChange < 0 ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {valueChange > 0 ? '+' : ''}${valueChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {initialCapitalUSD > 0 ? (
          <div className={`flex flex-col justify-center rounded-xl p-5 ${
            totalProfit > 0 ? 'bg-success/10 border border-success/20' : totalProfit < 0 ? 'bg-destructive/10 border border-destructive/20' : 'bg-secondary/30'
          }`}>
            <span className="text-sm font-medium text-muted-foreground mb-2">Total Profit vs Initial</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-bold ${
                totalProfit > 0 ? 'text-success' : totalProfit < 0 ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {totalProfit > 0 ? '+' : ''}${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-medium ${
                totalProfit > 0 ? 'text-success/80' : totalProfit < 0 ? 'text-destructive/80' : 'text-muted-foreground'
              }`}>
                ({totalProfit > 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center rounded-xl bg-secondary/30 p-5 opacity-50">
            <span className="text-sm font-medium text-muted-foreground mb-2">Total Profit vs Initial</span>
            <span className="text-sm text-muted-foreground">Set initial capital to track</span>
          </div>
        )}
      </div>
    </div>
  )
}
