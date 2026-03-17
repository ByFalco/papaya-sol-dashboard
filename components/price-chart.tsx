'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts'
import type { PriceHistoryPoint } from '@/lib/types'

interface PriceChartProps {
  currentPrice: number | null
}

export function PriceChart({ currentPrice }: PriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([])

  useEffect(() => {
    if (currentPrice === null) return

    setPriceHistory(prev => {
      const now = Date.now()
      const newPoint = { timestamp: now, price: currentPrice }
      
      // Keep last 20 data points
      const updated = [...prev, newPoint].slice(-20)
      return updated
    })
  }, [currentPrice])

  // Generate some initial variation for demo
  useEffect(() => {
    if (currentPrice && priceHistory.length === 0) {
      const now = Date.now()
      const initial: PriceHistoryPoint[] = []
      for (let i = 19; i >= 0; i--) {
        const variation = (Math.random() - 0.5) * currentPrice * 0.02
        initial.push({
          timestamp: now - i * 60000,
          price: currentPrice + variation
        })
      }
      setPriceHistory(initial)
    }
  }, [currentPrice, priceHistory.length])

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const minPrice = priceHistory.length > 0 
    ? Math.min(...priceHistory.map(p => p.price)) * 0.999
    : 0
  const maxPrice = priceHistory.length > 0 
    ? Math.max(...priceHistory.map(p => p.price)) * 1.001
    : 100

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">SOL Price History</h2>
        {currentPrice && (
          <span className="text-2xl font-bold text-primary">
            ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
      </div>

      {priceHistory.length > 0 ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceHistory}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.18 180)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.7 0.18 180)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime}
                stroke="oklch(0.65 0 0)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[minPrice, maxPrice]}
                stroke="oklch(0.65 0 0)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.15 0.015 270 / 0.9)',
                  border: '1px solid oklch(0.4 0.03 270 / 0.2)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
                labelStyle={{ color: 'oklch(0.65 0 0)' }}
                itemStyle={{ color: 'oklch(0.7 0.18 180)' }}
                labelFormatter={formatTime}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="oklch(0.7 0.18 180)"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          Loading price data...
        </div>
      )}
    </div>
  )
}
