"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/contexts/app-context"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Home,
  BarChart3,
  ArrowLeftRight,
  Sparkles,
  Newspaper,
  Info,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react"

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
}

const navItems: NavItem[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/ai-insights", icon: Sparkles, label: "AI Insights" },
  { href: "/news", icon: Newspaper, label: "Financial News" },
  { href: "/about", icon: Info, label: "About" },
]

export function HoverSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useApp()

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully!")
    setIsOpen(false)
    router.push("/login")
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
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
      {/* Menu trigger — top right */}
      <div
        className="fixed top-4 right-4 z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={() => setIsOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-lg border bg-background/95 shadow-sm backdrop-blur transition-all duration-200 hover:bg-accent hover:shadow-md supports-[backdrop-filter]:bg-background/70"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Sidebar — slides in from the right */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed top-0 right-0 z-40 h-full w-64 border-l bg-background/95 shadow-xl backdrop-blur transition-transform duration-300 ease-in-out supports-[backdrop-filter]:bg-background/80",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-4">
            <span className="text-sm font-semibold tracking-tight text-foreground">Menu</span>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Account */}
            <div className="mt-6 border-t pt-4">
              <div className="mb-1 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Account
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Logout</span>
              </Button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/10 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
