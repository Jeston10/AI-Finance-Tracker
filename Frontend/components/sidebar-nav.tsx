"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useApp } from "@/lib/contexts/app-context"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function SidebarNav({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useApp()

  const navItems = [
    { href: "/", icon: "/home-icon.svg", label: "Home" },
    { href: "/analytics", icon: "/analytics-icon.svg", label: "Analytics" },
    { href: "/transactions", icon: "/transactions-icon.svg", label: "Transactions" },
    { href: "/ai-insights", icon: "/ai-insights-icon.svg", label: "AI Insights" },
    { href: "/connect-bank", icon: "/bank-connectivity.svg", label: "Connect Bank" },
    { href: "/about", icon: "/about-icon.svg", label: "About" },
  ]

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully!")
    onClose()
    router.push("/login")
  }

  return (
    <nav className="flex flex-col space-y-2 p-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-foreground/80",
            pathname === item.href ? "bg-muted text-foreground" : "text-muted-foreground",
          )}
          onClick={onClose}
        >
          <Image src={item.icon} alt={item.label} width={20} height={20} />
          {item.label}
        </Link>
      ))}
      
      <div className="pt-4 mt-4 border-t border-muted">
        <Button
          variant="ghost"
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted justify-start"
          onClick={handleLogout}
        >
          <Image src="/logout-icon.svg" alt="Logout" width={20} height={20} />
          Logout
        </Button>
      </div>
    </nav>
  )
}
