"use client"

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TopExpenseCategoriesChart } from "@/components/top-expense-categories-chart"
import { CategoryInsights } from "@/components/category-insights"
import { useApp } from "@/lib/contexts/app-context"
import { useMemo } from "react"
import { format } from "date-fns"
import { BarChart3, TrendingDown, Target, Layers, Calculator, Activity, PieChart as PieChartIcon } from "lucide-react"

// Cohesive brand ramp — emerald shades + gold accent (no rainbow)
const COLORS = ["#10936A", "#E0B457", "#2E7D5B", "#7FB89E", "#1F5F47", "#C9A227"]

export default function AnalyticsPage() {
  const { transactions, isAuthenticated, isLoading } = useApp()

  // Process transaction data for analytics
  const analyticsData = useMemo(() => {
    if (!transactions.length) {
      return {
        monthlySpendingData: [],
        categorySpendingData: [],
        totalExpenses: 0,
        topCategory: null,
        categoryCount: 0,
        avgPerCategory: 0,
      }
    }

    // Group by month
    const monthlyData = new Map<string, { expenses: number; income: number }>()
    const categoryData = new Map<string, number>()

    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = format(date, "MMM")
      const amount = Number(transaction.amount)

      // Monthly data
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { expenses: 0, income: 0 })
      }

      const monthData = monthlyData.get(monthKey)!
      if (amount > 0) {
        monthData.expenses += amount
      } else {
        monthData.income += Math.abs(amount)
      }

      // Category data
      const category = transaction.category || 'Other'
      // Capitalize each word in the category name
      const capitalizedCategory = category.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
      categoryData.set(capitalizedCategory, (categoryData.get(capitalizedCategory) || 0) + Math.abs(amount))
    })

    // Convert to arrays
    const monthlySpendingData = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => {
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
      })

    const categorySpendingData = Array.from(categoryData.entries())
      .map(([name, value]) => ({
        name,
        value,
        previousValue: Math.round(value * 0.9), // Simulate previous period data (90% of current)
        trend: value > (Math.round(value * 0.9) * 1.05) ? "up" as const :
               value < (Math.round(value * 0.9) * 0.95) ? "down" as const :
               "stable" as const
      }))
      .sort((a, b) => b.value - a.value)

    const totalExpenses = categorySpendingData.reduce((sum, cat) => sum + cat.value, 0)

    // Calculate percentages for each category
    const categorySpendingDataWithPercentages = categorySpendingData.map(cat => ({
      ...cat,
      percentage: totalExpenses > 0 ? Number(((cat.value / totalExpenses) * 100).toFixed(2)) : 0
    }))

    const topCategory = categorySpendingDataWithPercentages[0] || null
    const categoryCount = categorySpendingDataWithPercentages.length
    const avgPerCategory = categoryCount > 0 ? totalExpenses / categoryCount : 0

    return {
      monthlySpendingData,
      categorySpendingData: categorySpendingDataWithPercentages,
      totalExpenses,
      topCategory,
      categoryCount,
      avgPerCategory,
    }
  }, [transactions])

  // Show loading state
  if (isLoading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </main>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Financial Analytics</h1>
          <p className="text-muted-foreground mb-8">Please log in to view your analytics.</p>
        </div>
      </main>
    )
  }

  const summaryCards = [
    {
      label: "Total Expenses",
      sub: "Current Period",
      value: `$${analyticsData.totalExpenses.toLocaleString()}`,
      foot: "All Categories",
      icon: TrendingDown,
      tone: "destructive" as const,
    },
    {
      label: "Top Category",
      sub: "Highest Spending",
      value: analyticsData.topCategory?.name || 'N/A',
      foot: analyticsData.topCategory ? `${analyticsData.topCategory.percentage.toFixed(1)}% of total expenses` : '0% of total expenses',
      icon: Target,
      tone: "primary" as const,
    },
    {
      label: "Categories",
      sub: "Active Tracking",
      value: `${analyticsData.categoryCount}`,
      foot: "Categories tracked",
      icon: Layers,
      tone: "primary" as const,
    },
    {
      label: "Avg per Category",
      sub: "Monthly Average",
      value: `$${analyticsData.avgPerCategory.toLocaleString()}`,
      foot: "Per category",
      icon: Calculator,
      tone: "primary" as const,
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Financial Analytics
            </h1>
            <p className="text-muted-foreground mt-1">Comprehensive insights into your spending patterns</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {summaryCards.map((card) => {
            const Icon = card.icon
            const chip = card.tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
            const dot = card.tone === "destructive" ? "bg-destructive" : "bg-primary"
            return (
              <Card key={card.label} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${chip}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{card.label}</h3>
                      <p className="text-xs text-muted-foreground">{card.sub}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground capitalize truncate">{card.value}</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${dot} rounded-full`}></div>
                      <span className="text-xs text-muted-foreground">{card.foot}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Monthly Spending Line Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">Monthly Spending &amp; Income</CardTitle>
                  <CardDescription className="text-muted-foreground">Overview of your financial flow over the last 6 months</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  expenses: { label: "Expenses", color: "#dc2626" },
                  income: { label: "Income", color: "#10936A" },
                }}
                className="h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.monthlySpendingData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis
                      domain={[0, 'dataMax + 500']}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#dc2626"
                      strokeWidth={3}
                      name="Expenses"
                      dot={{ fill: "#dc2626", strokeWidth: 2, r: 6 }}
                      connectNulls={false}
                      activeDot={{ r: 8, stroke: '#dc2626', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#10936A"
                      strokeWidth={3}
                      name="Income"
                      dot={{ fill: "#10936A", strokeWidth: 2, r: 6 }}
                      connectNulls={false}
                      activeDot={{ r: 8, stroke: '#10936A', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Spending by Category Pie Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <PieChartIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">Spending By Category</CardTitle>
                  <CardDescription className="text-muted-foreground">Distribution of your expenses across different categories</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  food: { label: "Food", color: COLORS[0] },
                  transport: { label: "Transport", color: COLORS[1] },
                  entertainment: { label: "Entertainment", color: COLORS[2] },
                  utilities: { label: "Utilities", color: COLORS[3] },
                  shopping: { label: "Shopping", color: COLORS[4] },
                  rent: { label: "Rent", color: COLORS[5] },
                }}
                className="h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.categorySpendingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      label={(props: any) => `${props.name.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ${(props.percent * 100).toFixed(1)}%`}
                    >
                      {analyticsData.categorySpendingData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="var(--card)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <TopExpenseCategoriesChart data={analyticsData.categorySpendingData} />
          </div>
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <CategoryInsights data={analyticsData.categorySpendingData} colors={COLORS} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>Real-time analytics powered by AI Finance Tracker</span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
