'use client'

import { useState, useEffect, useCallback } from 'react'
import type { WalletData, WalletBalance, CapitalSummary, PriceData } from '@/lib/types'
import { loadWalletData, saveWalletData, exportWalletData, parseImportedFile, clearWalletData } from '@/lib/storage'
import { isValidSolanaAddress, getWalletBalances } from '@/lib/solana'
import { fetchPriceData } from '@/lib/price'

export function useWallet() {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [balances, setBalances] = useState<WalletBalance[]>([])
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load wallet data from storage on mount
  useEffect(() => {
    const data = loadWalletData()
    setWalletData(data)
    setIsInitialized(true)
    if (!data) {
      setIsLoading(false)
    }
  }, [])

  // Fetch balances when wallet data changes
  const fetchBalances = useCallback(async (showLoader = true) => {
    if (!walletData?.addresses.length) {
      setBalances([])
      setIsLoading(false)
      return
    }

    setIsRefreshing(true)
    if (showLoader) {
      setIsLoading(true)
    }
    setError(null)

    try {
      // Add minimum delay promise only if showing loader
      const promises: Promise<any>[] = [
        getWalletBalances(walletData.addresses),
        fetchPriceData()
      ]

      if (showLoader) {
        promises.push(new Promise(resolve => setTimeout(resolve, 1250)))
      }

      const results = await Promise.all(promises)
      const newBalances = results[0]
      const newPriceData = results[1]
      
      setBalances(newBalances)
      setPriceData(newPriceData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [walletData?.addresses])

  // Fetch on wallet data change
  useEffect(() => {
    if (isInitialized && walletData) {
      // Only show loader if balances are empty (first load)
      fetchBalances(balances.length === 0)
    }
  }, [isInitialized, walletData])

  // Price polling every 60 seconds
  useEffect(() => {
    if (!walletData?.addresses.length) return

    const interval = setInterval(async () => {
      try {
        const newPriceData = await fetchPriceData()
        setPriceData(newPriceData)
      } catch (err) {
        console.error('Price update failed:', err)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [walletData?.addresses])

  // Add address
  const addAddress = useCallback((address: string) => {
    if (!isValidSolanaAddress(address)) {
      throw new Error('Invalid Solana address format')
    }

    const newData: WalletData = {
      addresses: [...(walletData?.addresses || []), address],
      initialCapitalUSD: walletData?.initialCapitalUSD
    }
    setWalletData(newData)
    saveWalletData(newData)
  }, [walletData])

  // Remove address
  const removeAddress = useCallback((address: string) => {
    if (!walletData) return

    const newData: WalletData = {
      addresses: walletData.addresses.filter(a => a !== address),
      initialCapitalUSD: walletData.initialCapitalUSD
    }
    setWalletData(newData)
    saveWalletData(newData)
  }, [walletData])

  // Import from file
  const importFromFile = useCallback((content: string) => {
    const imported = parseImportedFile(content)
    setWalletData(imported)
    saveWalletData(imported)
  }, [])

  // Export to file
  const exportToFile = useCallback(() => {
    if (!walletData) return
    exportWalletData(walletData)
  }, [walletData])

  // Initialize with addresses (first run)
  const initializeWallets = useCallback((addresses: string[], currentCapitalUSD?: number) => {
    const validAddresses = addresses.filter(isValidSolanaAddress)
    if (validAddresses.length === 0) {
      throw new Error('No valid addresses provided')
    }

    setIsLoading(true)
    const newData: WalletData = {
      addresses: validAddresses,
      initialCapitalUSD: currentCapitalUSD
    }
    setWalletData(newData)
    saveWalletData(newData)
  }, [])

  // Set initial capital
  const setInitialCapital = useCallback((capitalUSD: number) => {
    if (!walletData) return
    const newData: WalletData = {
      ...walletData,
      initialCapitalUSD: capitalUSD
    }
    setWalletData(newData)
    saveWalletData(newData)
  }, [walletData])

  // Calculate capital summary
  const capitalSummary: CapitalSummary | null = (() => {
    if (!priceData || balances.length === 0) return null

    const totalSOL = balances.reduce((sum, b) => sum + b.balanceSOL, 0)
    const totalUSD = totalSOL * priceData.solUSD
    const totalEUR = totalUSD * priceData.usdEUR

    const initialUSD = walletData?.initialCapitalUSD || 0
    const profitUSD = totalUSD - initialUSD
    const profitEUR = profitUSD * priceData.usdEUR
    const profitPercent = initialUSD > 0 ? ((totalUSD - initialUSD) / initialUSD) * 100 : 0

    return {
      totalSOL,
      totalUSD,
      totalEUR,
      profitUSD,
      profitEUR,
      profitPercent
    }
  })()

  // Reset/Logout
  const resetWallet = useCallback(() => {
    clearWalletData()
    setWalletData(null)
    setBalances([])
    setPriceData(null)
  }, [])

  return {
    walletData,
    balances,
    priceData,
    capitalSummary,
    isLoading,
    isRefreshing,
    error,
    isInitialized,
    needsSetup: isInitialized && !walletData,
    addAddress,
    removeAddress,
    importFromFile,
    exportToFile,
    initializeWallets,
    setInitialCapital,
    refreshBalances: () => fetchBalances(true),
    resetWallet
  }
}
