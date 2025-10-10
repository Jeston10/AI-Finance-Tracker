"use client"

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6B6B"]

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
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Financial Analytics
              </h1>
              <p className="text-muted-foreground mt-2">Comprehensive insights into your spending patterns</p>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200/50 dark:border-red-800/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide">Total Expenses</h3>
                    <p className="text-xs text-red-600/70 dark:text-red-400/70">Current Period</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-red-900 dark:text-red-100">${analyticsData.totalExpenses.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-700/80 dark:text-red-300/80">All Categories</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Top Category</h3>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Highest Spending</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xl font-bold text-blue-900 dark:text-blue-100 capitalize">
                  {analyticsData.topCategory?.name || 'N/A'}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {analyticsData.topCategory ? `${analyticsData.topCategory.percentage.toFixed(1)}%` : '0%'}
                  </div>
                  <span className="text-xs text-blue-700/80 dark:text-blue-300/80">of total expenses</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Categories</h3>
                    <p className="text-xs text-green-600/70 dark:text-green-400/70">Active Tracking</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">{analyticsData.categoryCount}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-700/80 dark:text-green-300/80">Categories tracked</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50 dark:border-purple-800/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Avg per Category</h3>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Monthly Average</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">${analyticsData.avgPerCategory.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-purple-700/80 dark:text-purple-300/80">Per category</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Monthly Spending Line Chart */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full -translate-y-20 translate-x-20"></div>
            <CardHeader className="relative pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Monthly Spending & Income</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Overview of your financial flow over the last 6 months</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  expenses: {
                    label: "Expenses",
                    color: "#ef4444",
                  },
                  income: {
                    label: "Income",
                    color: "#10b981",
                  },
                }}
                className="h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.monthlySpendingData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      domain={[0, 'dataMax + 500']}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: '#1e293b',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#1e293b', fontSize: '14px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="Expenses" 
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 6 }}
                      connectNulls={false}
                      activeDot={{ r: 8, stroke: '#ef4444', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Income"
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                      connectNulls={false}
                      activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Spending by Category Pie Chart */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full -translate-y-20 translate-x-20"></div>
            <CardHeader className="relative pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Spending By Category</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Distribution of your expenses across different categories</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  food: {
                    label: "Food",
                    color: COLORS[0],
                  },
                  transport: {
                    label: "Transport",
                    color: COLORS[1],
                  },
                  entertainment: {
                    label: "Entertainment",
                    color: COLORS[2],
                  },
                  utilities: {
                    label: "Utilities",
                    color: COLORS[3],
                  },
                  shopping: {
                    label: "Shopping",
                    color: COLORS[4],
                  },
                  rent: {
                    label: "Rent",
                    color: COLORS[5],
                  },
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
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={(props: any) => `${props.name.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ${(props.percent * 100).toFixed(1)}%`}
                    >
                      {analyticsData.categorySpendingData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: '#1e293b',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#1e293b', fontSize: '14px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Expense Categories Chart */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl overflow-hidden">
              <TopExpenseCategoriesChart data={analyticsData.categorySpendingData} />
            </div>
          </div>

          {/* Category Insights */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl overflow-hidden">
              <CategoryInsights data={analyticsData.categorySpendingData} colors={COLORS} />
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Real-time analytics powered by AI Finance Tracker</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

