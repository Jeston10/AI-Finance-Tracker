"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useApp } from "@/lib/contexts/app-context"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function HoverSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useApp()

  const navItems = [
    { href: "/", icon: "/home-icon.svg", label: "Home" },
    { href: "/analytics", icon: "/analytics-icon.svg", label: "Analytics" },
    { href: "/transactions", icon: "/transactions-icon.svg", label: "Transactions" },
    { href: "/ai-insights", icon: "/ai-insights-icon.svg", label: "AI Insights" },
    { href: "/news", icon: "/news-icon.svg", label: "Financial News" },
    { href: "/connect-bank", icon: "/bank-connectivity.svg", label: "Connect Bank" },
    { href: "/about", icon: "/about-icon.svg", label: "About" },
  ]

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully!")
    setIsOpen(false)
    router.push("/login")
  }

  // Handle hover events
  const handleMouseEnter = () => {
    setIsHovering(true)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    // Delay closing to allow moving mouse to sidebar
    setTimeout(() => {
      if (!isHovering) {
        setIsOpen(false)
      }
    }, 150)
  }

  const handleSidebarMouseEnter = () => {
    setIsHovering(true)
    setIsOpen(true)
  }

  const handleSidebarMouseLeave = () => {
    setIsHovering(false)
    setIsOpen(false)
  }

  return (
    <>
      {/* Menu Icon */}
      <div
        className="fixed top-4 left-4 z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer group">
          <Image src="/menu-icon.svg" alt="Menu" width={24} height={24} className="group-hover:opacity-80 transition-opacity" />
        </div>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r shadow-xl transition-all duration-300 ease-in-out transform",
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        )}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-end p-4 border-b">
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <Image src="/close-icon.svg" alt="Close" width={16} height={16} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted/50",
                    pathname === item.href 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <Image src={item.icon} alt={item.label} width={20} height={20} className="flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Logout Section */}
            <div className="mt-6 pt-4 border-t">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-3">Account</div>
              <Button
                variant="ghost"
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium justify-start text-foreground/70 hover:text-foreground hover:bg-muted/30"
                onClick={handleLogout}
              >
                <Image src="/logout-icon.svg" alt="Logout" width={16} height={16} className="flex-shrink-0" />
                <span className="truncate">Logout</span>
              </Button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              Hover to open • Click to navigate
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
