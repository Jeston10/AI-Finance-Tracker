"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, DollarSign } from "lucide-react"

interface CategoryData {
  name: string
  value: number
  percentage: number
}

interface CategoryInsightsProps {
  data: CategoryData[]
  colors: string[]
}

export function CategoryInsights({ data, colors }: CategoryInsightsProps) {
  const totalSpent = data.reduce((sum, cat) => sum + cat.value, 0)
  const topCategory = data.length > 0 ? data.reduce((prev, current) => (prev.value > current.value) ? prev : current) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Overview of your spending categories and key statistics.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Category Breakdown
          </h4>
          <div className="space-y-2">
            {data.length > 0 ? (
              data.slice(0, 4).map((category, index) => (
                <div key={category.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">${category.value}</div>
                    <div className="text-xs text-muted-foreground">{category.percentage.toFixed(2)}%</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No category data available
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Quick Stats
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Total Spent</div>
                  <div className="text-lg font-bold">${totalSpent}</div>
                </div>
                <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Top Category</div>
                  <div className="text-lg font-bold">{topCategory?.name || 'No data'}</div>
                  <div className="text-xs text-muted-foreground">{topCategory?.percentage.toFixed(2) || '0.00'}% of total</div>
                </div>
                <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
