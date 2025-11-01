"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { SidebarNav } from "@/components/sidebar-nav"
import { useState } from "react"

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Image src="/menu-icon.svg" alt="Menu" width={24} height={24} />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-4">
                <Link href="/" className="flex items-center space-x-2 mb-4" onClick={() => setIsOpen(false)}>
                  <span className="font-bold text-lg">Finance Tracker</span>
                </Link>
                <SidebarNav onClose={() => setIsOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Finance Tracker</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/analytics"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/analytics" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Analytics
            </Link>
            <Link
              href="/transactions"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/transactions" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Transactions
            </Link>
            <Link
              href="/ai-insights"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/ai-insights" ? "text-foreground" : "text-foreground/60",
              )}
            >
              AI Insights
            </Link>
            <Link
              href="/about"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/about" ? "text-foreground" : "text-foreground/60",
              )}
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
