'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/use-wallet'
import { WalletSetupModal } from '@/components/wallet-setup-modal'
import { CapitalCard } from '@/components/capital-card'
import { PriceChart } from '@/components/price-chart'
import { ProfitChart } from '@/components/profit-chart'
import { PriceSimulator } from '@/components/price-simulator'
import { SettingsPanel } from '@/components/settings-panel'
import { Sidebar, type Page } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { Settings, RefreshCw } from 'lucide-react'

export function Dashboard() {
  const {
    walletData,
    balances,
    priceData,
    capitalSummary,
    isLoading,
    isRefreshing,
    isInitialized,
    needsSetup,
    addAddress,
    removeAddress,
    importFromFile,
    exportToFile,
    initializeWallets,
    setInitialCapital,
    refreshBalances,
    resetWallet
  } = useWallet()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<Page>('home')

  // Show setup modal on first run
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Global Loader Overlay */}
      {(isLoading || isRefreshing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader />
        </div>
      )}

      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Wallet setup modal */}
      <WalletSetupModal
        open={needsSetup}
        onComplete={(addresses, capital) => initializeWallets(addresses, capital)}
        onImport={(content) => importFromFile(content)}
      />

      {/* Settings panel */}
      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        balances={balances}
        initialCapitalUSD={walletData?.initialCapitalUSD}
        onAddAddress={addAddress}
        onRemoveAddress={removeAddress}
        onImport={importFromFile}
        onExport={exportToFile}
        onSetInitialCapital={setInitialCapital}
        onLogout={resetWallet}
      />

      {/* Sidebar */}
      {!needsSetup && (
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {currentPage === 'home' ? 'Portfolio Overview' : 'Price Simulator'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {currentPage === 'home' ? 'Real-time tracking' : 'Simulate different scenarios'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshBalances}
                disabled={isRefreshing}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative flex-1 px-6 py-8">
          {!needsSetup && currentPage === 'home' && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top row - Portfolio & Profit */}
              <CapitalCard
                summary={capitalSummary}
                priceData={priceData}
                isLoading={isLoading}
              />
              <ProfitChart
                summary={capitalSummary}
                initialCapitalUSD={walletData?.initialCapitalUSD}
                isLoading={isLoading}
              />

              {/* Bottom row - Full width chart */}
              <div className="lg:col-span-2">
                <PriceChart currentPrice={priceData?.solUSD || null} />
              </div>
            </div>
          )}

          {!needsSetup && currentPage === 'simulator' && priceData && capitalSummary && (
            <div className="mx-auto max-w-4xl h-[calc(100vh-12rem)] min-h-[600px]">
              <PriceSimulator
                currentPrice={priceData.solUSD}
                totalSOL={capitalSummary.totalSOL}
                initialCapitalUSD={walletData?.initialCapitalUSD}
              />
            </div>
          )}

          {/* Last updated */}
          {priceData && (
            <div className="mt-8 text-center text-xs text-muted-foreground">
              Last updated: {priceData.lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
