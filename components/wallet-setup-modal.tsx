'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { isValidSolanaAddress, getWalletBalances } from '@/lib/solana'
import { Upload, Plus, Trash2, Wallet, AlertCircle, DollarSign } from 'lucide-react'

interface WalletSetupModalProps {
  open: boolean
  onComplete: (addresses: string[], initialCapitalUSD?: number) => void
  onImport: (content: string) => void
}

export function WalletSetupModal({ open, onComplete, onImport }: WalletSetupModalProps) {
  const [addresses, setAddresses] = useState<string[]>([''])
  const [errors, setErrors] = useState<string[]>([])
  const [capitalMethod, setCapitalMethod] = useState<'usd' | 'price'>('usd')
  const [initialCapital, setInitialCapital] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...addresses]
    newAddresses[index] = value
    setAddresses(newAddresses)

    const newErrors = [...errors]
    newErrors[index] = ''
    setErrors(newErrors)
  }

  const addAddressField = () => {
    setAddresses([...addresses, ''])
    setErrors([...errors, ''])
  }

  const removeAddressField = (index: number) => {
    if (addresses.length === 1) return
    setAddresses(addresses.filter((_, i) => i !== index))
    setErrors(errors.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setIsValidating(true)
    const newErrors: string[] = []
    const validAddresses: string[] = []

    addresses.forEach((addr, index) => {
      const trimmed = addr.trim()
      if (!trimmed) {
        newErrors[index] = 'Address required'
      } else if (!isValidSolanaAddress(trimmed)) {
        newErrors[index] = 'Invalid Solana address'
      } else if (validAddresses.includes(trimmed)) {
        newErrors[index] = 'Duplicate address'
      } else {
        newErrors[index] = ''
        validAddresses.push(trimmed)
      }
    })

    setErrors(newErrors)

    if (newErrors.every(e => !e) && validAddresses.length > 0) {
      let finalCapitalUSD: number | undefined

      if (capitalMethod === 'usd' && initialCapital) {
        const capital = parseFloat(initialCapital)
        if (!isNaN(capital)) finalCapitalUSD = capital
      } else if (capitalMethod === 'price' && purchasePrice) {
        const price = parseFloat(purchasePrice)
        if (!isNaN(price) && price > 0) {
          try {
            const balances = await getWalletBalances(validAddresses)
            const totalSOL = balances.reduce((sum, b) => sum + b.balanceSOL, 0)
            finalCapitalUSD = totalSOL * price
          } catch (error) {
            console.error('Failed to fetch balances for calculating initial capital', error)
          }
        }
      }

      setIsValidating(false)
      onComplete(validAddresses, finalCapitalUSD)
    } else {
      setIsValidating(false)
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
      } catch {
        setErrors(['Failed to parse file'])
      }
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="glass-card sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Welcome to Solana Portfolio Tracker</DialogTitle>
          <DialogDescription className="text-center">
            Enter your Solana wallet addresses to start tracking your investments
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-3">
            {addresses.map((address, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Solana wallet address"
                    value={address}
                    onChange={(e) => handleAddressChange(index, e.target.value)}
                    className={errors[index] ? 'border-destructive' : ''}
                  />
                  {errors[index] && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {errors[index]}
                    </p>
                  )}
                </div>
                {addresses.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAddressField(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={addAddressField}
            className="w-full cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Another Wallet
          </Button>

          {/* Initial Capital Input */}
          <div className="space-y-4 rounded-lg border border-border bg-secondary/20 p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Initial Capital Setup (Optional)
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
            {capitalMethod === 'usd' ? (
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Enter your initial investment in USD"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Used to calculate your profit/loss
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Enter SOL purchase price in USD (e.g. 150)"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your total initial capital will be calculated automatically based on your balances
                </p>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Import from JSON File
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isValidating}
            className="w-full cursor-pointer glow-primary"
          >
            {isValidating ? (
              <>
                <Spinner className="h-4 w-4" />
                Validating...
              </>
            ) : (
              'Start Tracking'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
