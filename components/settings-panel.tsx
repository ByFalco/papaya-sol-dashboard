'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { isValidSolanaAddress } from '@/lib/solana'
import type { WalletBalance } from '@/lib/types'
import { Settings, Plus, Trash2, Download, Upload, Wallet, AlertCircle, DollarSign, LogOut, AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  balances: WalletBalance[]
  initialCapitalUSD?: number
  onAddAddress: (address: string) => void
  onRemoveAddress: (address: string) => void
  onImport: (content: string) => void
  onExport: () => void
  onSetInitialCapital: (capital: number) => void
  onLogout: () => void
}

export function SettingsPanel({
  open,
  onOpenChange,
  balances,
  initialCapitalUSD,
  onAddAddress,
  onRemoveAddress,
  onImport,
  onExport,
  onSetInitialCapital,
  onLogout
}: SettingsPanelProps) {
  const [newAddress, setNewAddress] = useState('')
  const [addressError, setAddressError] = useState('')
  const [capitalInput, setCapitalInput] = useState(initialCapitalUSD?.toString() || '')
  const [capitalMethod, setCapitalMethod] = useState<'usd' | 'price'>('usd')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync capital input with prop when it changes
  useEffect(() => {
    setCapitalInput(initialCapitalUSD?.toString() || '')
  }, [initialCapitalUSD])

  const handleAddAddress = async () => {
    const trimmed = newAddress.trim()
    
    if (!trimmed) {
      setAddressError('Address required')
      return
    }

    if (!isValidSolanaAddress(trimmed)) {
      setAddressError('Invalid Solana address')
      return
    }

    if (balances.some(b => b.address === trimmed)) {
      setAddressError('Address already added')
      return
    }

    setIsAdding(true)
    try {
      onAddAddress(trimmed)
      setNewAddress('')
      setAddressError('')
    } catch {
      setAddressError('Failed to add address')
    } finally {
      setIsAdding(false)
    }
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      try {
        onImport(content)
        onOpenChange(false)
      } catch {
        setAddressError('Failed to parse file')
      }
    }
    reader.readAsText(file)
  }

  const handleSetCapital = () => {
    if (capitalMethod === 'usd') {
      const value = parseFloat(capitalInput)
      if (!isNaN(value) && value >= 0) {
        onSetInitialCapital(value)
      }
    } else if (capitalMethod === 'price') {
      const price = parseFloat(purchasePrice)
      if (!isNaN(price) && price >= 0) {
        const totalSOL = balances.reduce((sum, b) => sum + b.balanceSOL, 0)
        onSetInitialCapital(totalSOL * price)
      }
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-lg border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your wallet addresses and portfolio settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Initial Capital */}
          <div className="space-y-4 rounded-lg border border-border bg-secondary/20 p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Initial Capital Setup
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  checked={capitalMethod === 'usd'}
                  onChange={() => setCapitalMethod('usd')}
                  className="accent-primary"
                />
                Provide USD value
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  checked={capitalMethod === 'price'}
                  onChange={() => setCapitalMethod('price')}
                  className="accent-primary"
                />
                Provide Solana purchase price
              </label>
            </div>
            
            <div className="flex gap-2">
              {capitalMethod === 'usd' ? (
                <Input
                  type="number"
                  placeholder="0.00"
                  value={capitalInput}
                  onChange={(e) => setCapitalInput(e.target.value)}
                  className="flex-1"
                />
              ) : (
                <Input
                  type="number"
                  placeholder="Enter SOL purchase price in USD"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="flex-1"
                />
              )}
              <Button onClick={handleSetCapital} variant="secondary" className="cursor-pointer">
                Set
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {capitalMethod === 'usd' 
                ? 'Used to calculate profit/loss from your initial investment'
                : 'Your total initial capital will be calculated automatically based on your balances'}
            </p>
          </div>

          {/* Add New Address */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Plus className="h-4 w-4 text-muted-foreground" />
              Add New Wallet
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Solana wallet address"
                  value={newAddress}
                  onChange={(e) => {
                    setNewAddress(e.target.value)
                    setAddressError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAddress()}
                  className={addressError ? 'border-destructive' : ''}
                />
                {addressError && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {addressError}
                  </p>
                )}
              </div>
              <Button onClick={handleAddAddress} disabled={isAdding} className="cursor-pointer">
                {isAdding ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Current Wallets */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              Current Wallets ({balances.length})
            </label>
            <div className="max-h-48 space-y-2 overflow-y-auto custom-scrollbar pr-2">
              {balances.map((wallet) => (
                <div
                  key={wallet.address}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <a
                      href={`https://solscan.io/account/${wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-foreground hover:text-primary cursor-pointer transition-colors"
                    >
                      {truncateAddress(wallet.address)}
                    </a>
                    {wallet.error ? (
                      <p className="flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {wallet.error}
                      </p>
                    ) : wallet.balanceSOL === 0 ? (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        Account not found or empty
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {wallet.balanceSOL.toFixed(4)} SOL
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRemoveAddress(wallet.address)}
                    className="text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-foreground">Data Management</h3>
            <div className="flex gap-2">
              <Button onClick={onExport} variant="outline" className="flex-1 cursor-pointer">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <div className="relative flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full cursor-pointer mt-2">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout & Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Reset Wallet Data?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will clear all your wallet data from this browser. 
                    Please make sure you have exported your data if you want to restore it later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    onLogout()
                    onOpenChange(false)
                  }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer">
                    Yes, Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
