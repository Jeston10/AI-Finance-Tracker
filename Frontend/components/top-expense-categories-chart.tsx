"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CategoryData {
  name: string
  value: number
  previousValue: number
  trend: "up" | "down" | "stable"
  percentage: number
}

interface TopExpenseCategoriesChartProps {
  data: CategoryData[]
}

export function TopExpenseCategoriesChart({ data }: TopExpenseCategoriesChartProps) {
  // Define colors for different categories
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6B6B", "#8884d8", "#82ca9d", "#ffc658", "#ff7300"]
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Expense Categories</CardTitle>
        <CardDescription>Visual breakdown of your highest spending categories.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ChartContainer
          config={{
            value: {
              label: "Amount",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [`$${value}`, "Amount Spent"]}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                name="Amount Spent"
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Add vertical space below the chart */}
        <div className="pt-8"></div>
      </CardContent>
    </Card>
  )
}
