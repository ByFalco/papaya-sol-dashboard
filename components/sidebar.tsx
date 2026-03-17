'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Home, Calculator, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export type Page = 'home' | 'simulator'

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
}

const navItems = [
  { id: 'home' as Page, label: 'Home', icon: Home },
  { id: 'simulator' as Page, label: 'Simulator', icon: Calculator },
]

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      "sticky top-0 h-screen flex-shrink-0 border-r border-border/50 bg-background/50 backdrop-blur-xl transition-all duration-300",
      collapsed ? "w-16" : "w-56"
    )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-3">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center">
                <svg viewBox="0 0 512 512" className="h-8 w-8">
                  <path style={{fill: '#5EAC24'}} d="M286.13,7.604c-114.008,0-206.429,247.358-206.429,328.086s92.422,168.707,206.429,168.707L286.13,7.604L286.13,7.604z"/>
                  <path style={{fill: '#4E901E'}} d="M170.89,89.874c-5.695,12.62-11.252,26.284-16.665,41.003c-25.891,70.404-44.682,156.54-44.682,204.814c0,42.618,15.055,86.931,41.64,123.482c36.186,27.207,83.356,45.224,134.946,45.224V7.604C243.453,7.604,203.802,42.266,170.89,89.874z"/>
                  <path style={{fill: '#FFE477'}} d="M432.301,335.69c0,80.728-65.443,168.707-146.17,168.707s-146.17-87.978-146.17-168.707S205.402,7.604,286.13,7.604S432.301,254.962,432.301,335.69z"/>
                  <path style={{fill: '#FFDA44'}} d="M220.998,335.69c0-66.669,44.635-246.979,105.651-307.76c-12.867-12.817-26.461-20.326-40.52-20.326c-80.728,0-146.17,247.358-146.17,328.086s65.443,168.707,146.17,168.707c14.059,0,27.652-2.675,40.52-7.509C265.634,473.966,220.998,402.359,220.998,335.69z"/>
                  <path style={{fill: '#FF7956'}} d="M286.131,473.98c-38.658,0-66.646-26.948-79.89-43.012c-22.457-27.241-35.865-62.859-35.865-95.279c0-35.628,15.314-114.125,40.944-183.818C244.437,61.815,274.736,38.02,286.131,38.02s41.694,23.795,74.811,113.853c25.628,69.692,40.944,148.19,40.944,183.818c0,32.419-13.408,68.037-35.865,95.279C352.777,447.032,324.788,473.98,286.131,473.98z"/>
                  <path style={{fill: '#FF6243'}} d="M286.131,38.02c-11.394,0-41.694,23.795-74.812,113.853c-25.628,69.692-40.944,148.19-40.944,183.818c0,32.419,13.408,68.036,35.865,95.279c13.244,16.064,41.233,43.012,79.89,43.012c0.442,0,0.876-0.021,1.315-0.028c-40.002-32.714-66.447-86.949-66.447-138.262c0-59.428,35.467-209.152,86.388-284.023C298.028,41.709,290.614,38.02,286.131,38.02z"/>
                  <path style={{fill: '#3E3D42'}} d="M346.28,360.061c0,33.22-26.93,60.15-60.15,60.15s-60.15-26.93-60.15-60.15s26.93-169.647,60.15-169.647S346.28,326.841,346.28,360.061z"/>
                </svg>
              </div>
              <span className="font-semibold text-foreground">Papaya Tracker</span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center">
              <svg viewBox="0 0 512 512" className="h-8 w-8">
                <path style={{fill: '#5EAC24'}} d="M286.13,7.604c-114.008,0-206.429,247.358-206.429,328.086s92.422,168.707,206.429,168.707L286.13,7.604L286.13,7.604z"/>
                <path style={{fill: '#4E901E'}} d="M170.89,89.874c-5.695,12.62-11.252,26.284-16.665,41.003c-25.891,70.404-44.682,156.54-44.682,204.814c0,42.618,15.055,86.931,41.64,123.482c36.186,27.207,83.356,45.224,134.946,45.224V7.604C243.453,7.604,203.802,42.266,170.89,89.874z"/>
                <path style={{fill: '#FFE477'}} d="M432.301,335.69c0,80.728-65.443,168.707-146.17,168.707s-146.17-87.978-146.17-168.707S205.402,7.604,286.13,7.604S432.301,254.962,432.301,335.69z"/>
                <path style={{fill: '#FFDA44'}} d="M220.998,335.69c0-66.669,44.635-246.979,105.651-307.76c-12.867-12.817-26.461-20.326-40.52-20.326c-80.728,0-146.17,247.358-146.17,328.086s65.443,168.707,146.17,168.707c14.059,0,27.652-2.675,40.52-7.509C265.634,473.966,220.998,402.359,220.998,335.69z"/>
                <path style={{fill: '#FF7956'}} d="M286.131,473.98c-38.658,0-66.646-26.948-79.89-43.012c-22.457-27.241-35.865-62.859-35.865-95.279c0-35.628,15.314-114.125,40.944-183.818C244.437,61.815,274.736,38.02,286.131,38.02s41.694,23.795,74.811,113.853c25.628,69.692,40.944,148.19,40.944,183.818c0,32.419-13.408,68.037-35.865,95.279C352.777,447.032,324.788,473.98,286.131,473.98z"/>
                <path style={{fill: '#FF6243'}} d="M286.131,38.02c-11.394,0-41.694,23.795-74.812,113.853c-25.628,69.692-40.944,148.19-40.944,183.818c0,32.419,13.408,68.036,35.865,95.279c13.244,16.064,41.233,43.012,79.89,43.012c0.442,0,0.876-0.021,1.315-0.028c-40.002-32.714-66.447-86.949-66.447-138.262c0-59.428,35.467-209.152,86.388-284.023C298.028,41.709,290.614,38.02,286.131,38.02z"/>
                <path style={{fill: '#3E3D42'}} d="M346.28,360.061c0,33.22-26.93,60.15-60.15,60.15s-60.15-26.93-60.15-60.15s26.93-169.647,60.15-169.647S346.28,326.841,346.28,360.061z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onPageChange(item.id)}
              className={cn(
                "w-full justify-start gap-3 transition-all",
                collapsed && "justify-center px-0",
                currentPage === item.id
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border/50 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full justify-center text-muted-foreground hover:text-foreground",
              !collapsed && "justify-end"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <span className="text-xs">Collapse</span>
                <ChevronLeft className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}
