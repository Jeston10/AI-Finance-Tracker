"use client"

import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { cn } from "@/lib/utils"
import { HoverSidebar } from "@/components/hover-sidebar" // Hover sidebar for navigation
import { SiteFooter } from "@/components/site-footer"
import { AppProvider, useApp } from "@/lib/contexts/app-context"
import { Toaster } from "sonner"

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp()
  
  return (
    <div className="relative flex min-h-screen flex-col">
      {isAuthenticated && <HoverSidebar />} {/* Only show sidebar when authenticated */}
      <div className="flex-1">{children}</div>
      {isAuthenticated && <SiteFooter />} {/* Only show footer when authenticated */}
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cn("min-h-screen bg-background font-sans antialiased", GeistSans.variable, GeistMono.variable)}
    >
      <body>
        <AppProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  )
}

