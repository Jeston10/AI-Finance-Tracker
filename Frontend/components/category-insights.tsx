"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

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
            <Image src="/target-icon.svg" alt="Target" width={16} height={16} />
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
            <Image src="/transactions-icon.svg" alt="Dollar" width={16} height={16} />
            Quick Stats
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Total Spent</div>
                  <div className="text-lg font-bold">${totalSpent}</div>
                </div>
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Image src="/transactions-icon.svg" alt="Dollar" width={16} height={16} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Top Category</div>
                  <div className="text-lg font-bold">{topCategory?.name || 'No data'}</div>
                  <div className="text-xs text-muted-foreground">{topCategory?.percentage.toFixed(2) || '0.00'}% of total</div>
                </div>
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Image src="/target-icon.svg" alt="Target" width={16} height={16} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
