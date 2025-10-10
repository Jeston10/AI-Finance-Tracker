import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface RecentTransactionCardProps {
  icon: React.ReactNode
  name: string
  category: string
  amount: number
  date: string
}

export function RecentTransactionCard({ icon, name, category, amount, date }: RecentTransactionCardProps) {
  return (
    <Card className="w-full bg-gray-800 text-white rounded-lg shadow-lg">
      <CardContent className="flex flex-col p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-lg font-semibold">{name}</span>
          </div>
          <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{category}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
          <span className="text-sm text-gray-400">{date}</span>
        </div>
      </CardContent>
    </Card>
  )
}
