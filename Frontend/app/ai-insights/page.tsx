"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useApp } from "@/lib/contexts/app-context"
import { useMemo, useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

export default function AiFinancialInsightsPage() {
  const { transactions, budgets, isAuthenticated, isLoading } = useApp()
  const [savingsProjection, setSavingsProjection] = useState<any>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [aiBudgetAdvice, setAiBudgetAdvice] = useState<string | null>(null)
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false)
  const [spendingAnalysis, setSpendingAnalysis] = useState<any>(null)
  const [advicePoints, setAdvicePoints] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const pointsPerPage = 3
  const [spendingPattern, setSpendingPattern] = useState<string>('stable')

  // Function to parse AI advice into points
  const parseAdviceIntoPoints = (advice: string): string[] => {
    if (!advice) return []
    
    // Split by common patterns that indicate points
    const patterns = [
      /\d+\.\s+/g,  // "1. ", "2. ", etc.
      /•\s+/g,      // "• "
      /-\s+/g,      // "- "
      /\*\s+/g,     // "* "
      /→\s+/g,      // "→ "
    ]
    
    let points: string[] = []
    
    // Try each pattern
    for (const pattern of patterns) {
      const matches = advice.split(pattern).filter(point => point.trim().length > 0)
      if (matches.length > 1) {
        points = matches.map(point => point.trim()).filter(point => point.length > 10)
        break
      }
    }
    
    // If no patterns found, split by sentences and create points
    if (points.length <= 1) {
      const sentences = advice.split(/[.!?]+/).filter(s => s.trim().length > 20)
      points = sentences.map((sentence, index) => `${index + 1}. ${sentence.trim()}`)
    }
    
    return points.filter(point => point.length > 10)
  }

  // Calculate pagination
  const totalPages = Math.ceil(advicePoints.length / pointsPerPage)
  const startIndex = (currentPage - 1) * pointsPerPage
  const endIndex = startIndex + pointsPerPage
  const currentPoints = advicePoints.slice(startIndex, endIndex)

  // Process transaction data for AI insights
  const insightsData = useMemo(() => {
    if (!transactions.length) {
      return {
        forecastData: [],
        budgetSuggestionData: [],
        categorizationSummary: {
          autoCategorized: 0,
          totalTransactions: 0,
          accuracy: 0,
          topCategories: [],
        },
        budgetSuggestion: null,
      }
    }

    // Calculate categorization summary
    const categorizedTransactions = transactions.filter(t => t.category)
    const autoCategorized = categorizedTransactions.length
    const totalTransactions = transactions.length
    const accuracy = totalTransactions > 0 ? (autoCategorized / totalTransactions) * 100 : 0

    // Get top categories
    const categoryCount = new Map<string, number>()
    transactions.forEach(transaction => {
      if (transaction.category) {
        categoryCount.set(transaction.category, (categoryCount.get(transaction.category) || 0) + 1)
      }
    })
    const topCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name)

    // Generate comprehensive forecast data with proper monthly aggregation
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() // 0-11
    const currentYear = currentDate.getFullYear()
    
    // Process all transactions and group by month
    const monthlySpending = new Map<string, number>()
    const monthlyTransactions = new Map<string, any[]>()
    
    console.log('🔍 All transactions:', transactions)
    
    transactions.forEach(transaction => {
      console.log('🔍 Processing transaction:', transaction)
      
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const amount = Number(transaction.amount)
      
      console.log('🔍 Transaction details:', {
        originalDate: transaction.date,
        parsedDate: date,
        monthKey: monthKey,
        amount: amount,
        description: transaction.description,
        category: transaction.category
      })
      
      // Count all expenses (negative amounts) as spending
      if (amount < 0) {
        const absAmount = Math.abs(amount)
        const currentSpending = monthlySpending.get(monthKey) || 0
        monthlySpending.set(monthKey, currentSpending + absAmount)
        
        console.log('💰 Added spending (negative amount):', {
          monthKey,
          amount: absAmount,
          totalForMonth: currentSpending + absAmount
        })
        
        // Store transaction details for analysis
        if (!monthlyTransactions.has(monthKey)) {
          monthlyTransactions.set(monthKey, [])
        }
        monthlyTransactions.get(monthKey)!.push({
          amount: absAmount,
          category: transaction.category || 'Other',
          description: transaction.description,
          date: transaction.date
        })
      } else if (amount > 0) {
        // Handle case where expenses might be stored as positive values
        // Check if it's likely an expense based on description or category
        const isExpense = transaction.description?.toLowerCase().includes('expense') || 
                         transaction.description?.toLowerCase().includes('spent') ||
                         transaction.description?.toLowerCase().includes('payment') ||
                         transaction.category?.toLowerCase() !== 'income'
        
        if (isExpense) {
          const currentSpending = monthlySpending.get(monthKey) || 0
          monthlySpending.set(monthKey, currentSpending + amount)
          
          console.log('💰 Added spending (positive amount treated as expense):', {
            monthKey,
            amount: amount,
            totalForMonth: currentSpending + amount
          })
          
          // Store transaction details for analysis
          if (!monthlyTransactions.has(monthKey)) {
            monthlyTransactions.set(monthKey, [])
          }
          monthlyTransactions.get(monthKey)!.push({
            amount: amount,
            category: transaction.category || 'Other',
            description: transaction.description,
            date: transaction.date
          })
        } else {
          console.log('⚠️ Skipping transaction (likely income):', {
            amount: amount,
            description: transaction.description,
            category: transaction.category
          })
        }
      } else {
        console.log('⚠️ Skipping transaction (zero amount):', {
          amount: amount,
          description: transaction.description
        })
      }
    })
    
    console.log('📊 Monthly spending map:', Object.fromEntries(monthlySpending))
    
    // If no spending data found, add a test entry for current month
    if (monthlySpending.size === 0 && transactions.length > 0) {
      const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
      const totalSpending = transactions.reduce((sum, t) => {
        const amount = Number(t.amount)
        return sum + (amount < 0 ? Math.abs(amount) : (amount > 0 ? amount : 0))
      }, 0)
      
      if (totalSpending > 0) {
        monthlySpending.set(currentMonthKey, totalSpending)
        console.log('🧪 Added test spending data:', {
          monthKey: currentMonthKey,
          totalSpending: totalSpending
        })
      }
    }

    // Calculate average monthly spending from historical data
    const historicalAmounts = Array.from(monthlySpending.values())
    const avgMonthlySpending = historicalAmounts.length > 0 
      ? historicalAmounts.reduce((sum, amount) => sum + amount, 0) / historicalAmounts.length 
      : 0

    // Analyze spending patterns and calculate intelligent predictions
    let trendMultiplier = 1.0
    let currentSpendingPattern = 'stable' // 'increasing', 'decreasing', 'stable'
    let overspendingFactor = 1.0
    
    if (historicalAmounts.length >= 2) {
      const sortedAmounts = [...historicalAmounts].sort((a, b) => a - b)
      const recentMonths = sortedAmounts.slice(-3)
      const olderMonths = sortedAmounts.slice(0, -3)
      
      if (recentMonths.length > 0 && olderMonths.length > 0) {
        const recentAvg = recentMonths.reduce((sum, amount) => sum + amount, 0) / recentMonths.length
        const olderAvg = olderMonths.reduce((sum, amount) => sum + amount, 0) / olderMonths.length
        
        // Calculate spending trend
        const trend = (recentAvg - olderAvg) / olderAvg
        
        // Determine spending pattern
        if (trend > 0.1) {
          currentSpendingPattern = 'increasing'
          trendMultiplier = 1 + (trend * 0.4) // Apply 40% of trend for increasing spending
        } else if (trend < -0.1) {
          currentSpendingPattern = 'decreasing'
          trendMultiplier = 1 + (trend * 0.3) // Apply 30% of trend for decreasing spending
        } else {
          currentSpendingPattern = 'stable'
          trendMultiplier = 1.0
        }
        
        // Analyze overspending patterns
        const maxSpending = Math.max(...historicalAmounts)
        const minSpending = Math.min(...historicalAmounts)
        const spendingVariability = (maxSpending - minSpending) / avgMonthlySpending
        
        if (spendingVariability > 0.5) {
          // High variability indicates inconsistent spending
          overspendingFactor = 1.2
        } else if (recentAvg > avgMonthlySpending * 1.2) {
          // Recent overspending
          overspendingFactor = 1.15
        } else if (recentAvg < avgMonthlySpending * 0.8) {
          // Recent underspending
          overspendingFactor = 0.9
        }
      }
    }

    // Generate forecast data for current month + next 6 months
    const forecastData = []
    
    for (let i = 0; i < 7; i++) { // Current month + next 6 months
      const targetDate = new Date(currentYear, currentMonth + i, 1)
      const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`
      const monthName = targetDate.toLocaleDateString('en-US', { month: 'short' })
      
      // Get actual spending for this month (if it exists)
      const actualSpending = monthlySpending.get(monthKey) || null
      
      console.log('📅 Processing month:', {
        monthName,
        monthKey,
        actualSpending,
        i
      })
      
      // Calculate intelligent projected spending for future months
      let projectedSpending = null
      if (i > 0) { // Only project future months, not current month
        const seasonalAdjustment = getSeasonalAdjustment(targetDate.getMonth())
        
        // Base projection on average spending
        let baseProjection = avgMonthlySpending * trendMultiplier * seasonalAdjustment
        
        // Apply spending pattern adjustments
        if (currentSpendingPattern === 'increasing') {
          // If spending is increasing, project continued growth
          const growthRate = Math.min(0.05, trendMultiplier - 1) // Cap at 5% monthly growth
          baseProjection = baseProjection * (1 + growthRate * i) // Apply growth to future months
        } else if (currentSpendingPattern === 'decreasing') {
          // If spending is decreasing, project continued reduction
          const reductionRate = Math.min(0.03, Math.abs(trendMultiplier - 1)) // Cap at 3% monthly reduction
          baseProjection = baseProjection * (1 - reductionRate * i) // Apply reduction to future months
        }
        
        // Apply overspending factor
        baseProjection = baseProjection * overspendingFactor
        
        // Add some realistic variation (±5%)
        const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
        projectedSpending = Math.round(baseProjection * (1 + variation))
        
        // Ensure minimum reasonable spending
        projectedSpending = Math.max(projectedSpending, avgMonthlySpending * 0.5)
      }
      
      const forecastPoint = {
        month: monthName,
        actualSpending: actualSpending,
        projectedSpending: projectedSpending,
        isHistorical: actualSpending !== null,
        monthKey: monthKey,
        transactionCount: monthlyTransactions.get(monthKey)?.length || 0,
        spendingPattern: currentSpendingPattern,
        overspendingFactor: overspendingFactor
      }
      
      console.log('📊 Forecast point:', forecastPoint)
      forecastData.push(forecastPoint)
    }

    // Helper function for seasonal adjustments
    function getSeasonalAdjustment(month: number): number {
      const adjustments: Record<number, number> = {
        0: 1.1,  // January - post-holiday spending
        1: 0.9,  // February - lower spending
        2: 1.0,  // March - normal
        3: 1.0,  // April - normal
        4: 1.0,  // May - normal
        5: 1.0,  // June - normal
        6: 1.0,  // July - normal
        7: 1.0,  // August - normal
        8: 1.0,  // September - normal
        9: 1.0,  // October - normal
        10: 1.1, // November - pre-holiday
        11: 1.2  // December - holiday spending
      }
      return adjustments[month] || 1.0
    }

    // Get spending targets from localStorage
    const getSpendingTargets = () => {
      if (typeof window !== 'undefined') {
        const targetSettings = localStorage.getItem('targetSettings')
        if (targetSettings) {
          try {
            return JSON.parse(targetSettings)
          } catch (error) {
            console.error('Error parsing target settings:', error)
          }
        }
      }
      return { daily: 0, weekly: 0, monthly: 0, yearly: 0 }
    }

    const spendingTargets = getSpendingTargets()
    console.log('💰 Spending targets from localStorage:', spendingTargets)

    // Calculate actual spending by category
    const categorySpending = new Map<string, number>()
    transactions.forEach(transaction => {
      if (Number(transaction.amount) < 0) {
        const category = transaction.category || 'Other'
        categorySpending.set(category, (categorySpending.get(category) || 0) + Math.abs(Number(transaction.amount)))
      }
    })

    // Create budget allocation vs suggestion data
    const budgetSuggestionData = []
    
    // Add monthly target (allocated amount from user's target settings)
    if (spendingTargets.monthly > 0) {
      budgetSuggestionData.push({
        category: 'Monthly Budget',
        allocated: spendingTargets.monthly,
        suggested: Math.round(spendingTargets.monthly * 0.85), // AI suggests 15% reduction
      })
    }

    // Add weekly target
    if (spendingTargets.weekly > 0) {
      budgetSuggestionData.push({
        category: 'Weekly Budget',
        allocated: spendingTargets.weekly,
        suggested: Math.round(spendingTargets.weekly * 0.9), // AI suggests 10% reduction
      })
    }

    // Add daily target
    if (spendingTargets.daily > 0) {
      budgetSuggestionData.push({
        category: 'Daily Budget',
        allocated: spendingTargets.daily,
        suggested: Math.round(spendingTargets.daily * 0.95), // AI suggests 5% reduction
      })
    }

    // Add category-based suggestions based on actual spending
    const topSpendingCategories = Array.from(categorySpending.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3) // Top 3 categories

    topSpendingCategories.forEach(([category, spent]) => {
      // AI suggests reducing spending in categories where user overspends
      const suggestedAmount = Math.round(spent * 0.8) // 20% reduction for overspending categories
      budgetSuggestionData.push({
        category: `${category} Spending`,
        allocated: spent,
        suggested: suggestedAmount,
      })
    })

    // Sort by allocated amount (highest first)
    budgetSuggestionData.sort((a, b) => b.allocated - a.allocated)

    console.log('📊 Budget suggestion data:', budgetSuggestionData)

    console.log('🎯 Final forecast data:', forecastData)
    console.log('📈 Average monthly spending:', avgMonthlySpending)
    console.log('🔢 Historical amounts:', historicalAmounts)
    
    return {
      forecastData,
      budgetSuggestionData,
      categorizationSummary: {
        autoCategorized,
        totalTransactions,
        accuracy,
        topCategories,
      },
      budgetSuggestion: budgetSuggestionData.length > 0 ? 
        Math.round(budgetSuggestionData.reduce((sum, cat) => sum + (cat.allocated - cat.suggested), 0)) : 0,
      spendingPattern: currentSpendingPattern,
    }
  }, [transactions])

  // Update spending pattern state when insights data changes
  useEffect(() => {
    if (insightsData.spendingPattern) {
      setSpendingPattern(insightsData.spendingPattern)
    }
  }, [insightsData.spendingPattern])

  // Load savings projection from API
  useEffect(() => {
    const loadSavingsProjection = async () => {
      if (!isAuthenticated) return
      
      try {
        setIsLoadingInsights(true)
        const projection = await apiClient.getSavingsProjection()
        setSavingsProjection(projection)
      } catch (error) {
        console.error('Failed to load savings projection:', error)
      } finally {
        setIsLoadingInsights(false)
      }
    }

    loadSavingsProjection()
  }, [isAuthenticated])

  // Function to get AI budget advice
  const getAiBudgetAdvice = async () => {
    console.log('🔍 [AI] Starting getAiBudgetAdvice...')
    console.log('🔍 [AI] isAuthenticated:', isAuthenticated)
    console.log('🔍 [AI] transactions.length:', transactions.length)
    console.log('🔍 [AI] insightsData.budgetSuggestion:', insightsData.budgetSuggestion)
    
    if (!isAuthenticated) {
      console.log('❌ [AI] Not authenticated')
      return
    }
    
    if (!transactions.length) {
      console.log('❌ [AI] No transactions - showing fallback advice')
      const fallbackAdvice = 'Welcome! To get personalized AI budget advice, please add some transactions first. Start by recording your daily expenses to see AI-powered insights and recommendations.'
      setAiBudgetAdvice(fallbackAdvice)
      setSpendingAnalysis({
        totalSpending: 0,
        avgMonthlySpending: 0,
        overspendingMonths: 0,
        topCategories: []
      })
      
      // Parse fallback advice into points
      const points = parseAdviceIntoPoints(fallbackAdvice)
      setAdvicePoints(points)
      setCurrentPage(1)
      return
    }
    
    try {
      console.log('🔄 [AI] Setting loading state...')
      setIsLoadingAdvice(true)
      
      // Get monthly target from localStorage
      const targetSettings = localStorage.getItem('targetSettings')
      let monthlyTarget = 0
      if (targetSettings) {
        try {
          const parsed = JSON.parse(targetSettings)
          monthlyTarget = parsed.monthly || 0
          console.log('💰 [AI] Monthly target from localStorage:', monthlyTarget)
        } catch (error) {
          console.error('❌ [AI] Error parsing target settings:', error)
        }
      }
      
      console.log('📡 [AI] Calling getSavingsProjection...')
      const projection = await apiClient.getSavingsProjection(monthlyTarget)
      console.log('✅ [AI] Got projection:', projection)
      
      const advice = projection.advice || 'Based on your spending patterns, I recommend setting a monthly budget and tracking your expenses more closely. Consider reducing discretionary spending and focusing on essential expenses only.'
      setAiBudgetAdvice(advice)
      setSpendingAnalysis((projection as any).analysis || null)
      
      // Parse advice into points
      const points = parseAdviceIntoPoints(advice)
      setAdvicePoints(points)
      setCurrentPage(1) // Reset to first page
      
      console.log('✅ [AI] Set AI advice and analysis')
    } catch (error) {
      console.error('❌ [AI] Failed to get AI budget advice:', error)
      const errorAdvice = 'Unable to generate AI advice at this time. Please try again later.'
      setAiBudgetAdvice(errorAdvice)
      setSpendingAnalysis(null)
      
      // Parse error advice into points
      const points = parseAdviceIntoPoints(errorAdvice)
      setAdvicePoints(points)
      setCurrentPage(1)
    } finally {
      console.log('🔄 [AI] Setting loading to false')
      setIsLoadingAdvice(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading AI insights...</p>
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
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">AI Financial Insights</h1>
          <p className="text-muted-foreground mb-8">Please log in to view your AI insights.</p>
        </div>
      </main>
    )
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Simple Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            AI Financial Insights
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover intelligent patterns in your spending and unlock personalized recommendations powered by advanced AI
          </p>
        </motion.div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Enhanced Smart Categorization Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-white/20 dark:border-slate-800/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="mb-4">
                  <CardTitle className="text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Smart Categorization Summary
                  </CardTitle>
                  <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80">
                    Your expenses are automatically categorized with 98% accuracy
                  </CardDescription>
                </div>
            </CardHeader>
              <CardContent className="pt-0">
                {/* Enhanced categorization info */}
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/50">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {insightsData.categorizationSummary.accuracy.toFixed(1)}%
                      </div>
                      <div className="text-sm text-emerald-600/80 dark:text-emerald-400/80">Accuracy Rate</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {insightsData.categorizationSummary.totalTransactions}
                      </div>
                      <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Transactions</div>
                    </div>
                  </div>
                  
                  {/* Top Categories */}
                  {insightsData.categorizationSummary.topCategories.length > 0 && (
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Top Categories
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {insightsData.categorizationSummary.topCategories.map((category, index) => (
                          <span 
                            key={category} 
                            className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              {/* Enhanced details when budget advice is expanded */}
              {aiBudgetAdvice && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">📊 Detailed Spending Analysis:</h4>
                  
                  {/* Category breakdown with amounts */}
                  <div className="space-y-3">
                    {transactions.length > 0 && (
                      <>
                        {/* Category spending breakdown */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">💰 Category Breakdown:</h5>
                          <div className="space-y-1">
                            {(() => {
                              const categoryTotals = transactions.reduce((acc, t) => {
                                const category = t.category || 'Other';
                                const amount = Math.abs(Number(t.amount));
                                acc[category] = (acc[category] || 0) + amount;
                                return acc;
                              }, {} as Record<string, number>);
                              
                              const sortedCategories = Object.entries(categoryTotals)
                                .sort(([,a], [,b]) => b - a)
                                .slice(0, 5);
                              
                              return sortedCategories.map(([category, amount]) => (
                                <div key={category} className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">{category}:</span>
                                  <span className="font-medium text-gray-900 dark:text-gray-100">${amount.toFixed(2)}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>

                        {/* Recent transactions preview */}
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                          <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📝 Recent Transactions:</h5>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {transactions.slice(0, 3).map((transaction, index) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span className="text-blue-700 dark:text-blue-300 truncate">
                                  {transaction.description}
                                </span>
                                <span className="font-medium text-blue-900 dark:text-blue-100 ml-2">
                                  ${Math.abs(Number(transaction.amount)).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Spending insights */}
                        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                          <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">💡 AI Insights:</h5>
                          <div className="text-xs text-green-800 dark:text-green-200 space-y-1">
                            <div>• Total transactions analyzed: {transactions.length}</div>
                            <div>• Average transaction: ${(transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) / transactions.length).toFixed(2)}</div>
                            <div>• Most active category: {(() => {
                              const categoryCounts = transactions.reduce((acc, t) => {
                                const category = t.category || 'Other';
                                acc[category] = (acc[category] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>);
                              return Object.entries(categoryCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
                            })()}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

          {/* Enhanced AI Budget Advice Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-white/20 dark:border-slate-800/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="mb-2">
                <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Budget Advisor
                </CardTitle>
                <CardDescription className="text-blue-600/80 dark:text-blue-400/80">
                  Personalized recommendations powered by AI
                </CardDescription>
              </div>
              
              {/* Enhanced Professional Savings Highlight */}
                {insightsData.budgetSuggestion && insightsData.budgetSuggestion > 0 ? (
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl border border-blue-400/30">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
                  </div>
                  
                  {/* Enhanced Background Overlay for Better Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-purple-500/20"></div>
                  
                  {/* Main Content */}
                  <div className="relative p-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="text-white text-sm font-semibold uppercase tracking-wide drop-shadow-md">Potential Monthly Savings</h3>
                          <p className="text-blue-100 text-xs font-medium">AI-powered optimization</p>
                        </div>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className="flex items-center gap-2 bg-blue-500/30 px-3 py-1 rounded-full border border-blue-300/40">
                        <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse shadow-lg"></div>
                        <span className="text-blue-100 text-xs font-semibold">Live</span>
                      </div>
                    </div>
                    
                    {/* Main Savings Amount */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-white text-5xl font-black tracking-tight drop-shadow-2xl bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">${insightsData.budgetSuggestion.toLocaleString()}</span>
                        <span className="text-blue-100 text-xl font-bold">/month</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border border-blue-300/50">
                          <svg className="w-4 h-4 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-blue-100 text-sm font-medium">Optimized based on your spending patterns</span>
                      </div>
                    </div>
                    
                    {/* Additional Insights */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/25">
                      <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                        <div className="text-blue-100 text-xs font-semibold mb-1 uppercase tracking-wide">Annual Potential</div>
                        <div className="text-white text-lg font-bold drop-shadow-md">${(insightsData.budgetSuggestion * 12).toLocaleString()}</div>
                      </div>
                      <div className="text-center bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                        <div className="text-blue-100 text-xs font-semibold mb-1 uppercase tracking-wide">Optimization Rate</div>
                        <div className="text-white text-lg font-bold drop-shadow-md">~15-20%</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-4 right-4 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-4 left-4 w-24 h-24 bg-blue-400 rounded-full blur-2xl"></div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="relative p-6">
                    {/* Header Section */}
                    <div className="flex items-center gap-3 mb-4">
                      <div>
                        <h3 className="text-slate-700 dark:text-slate-300 text-sm font-medium uppercase tracking-wide">Ready for Analysis</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">AI budget optimization available</p>
                      </div>
                    </div>
                    
                    {/* Main Message */}
                    <div className="mb-4">
                      <div className="text-slate-600 dark:text-slate-400 text-xl font-semibold mb-2">
                        Get Personalized AI Budget Advice
                      </div>
                      <div className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed">
                        Our AI will analyze your spending patterns and provide actionable recommendations to help you save more money each month.
                      </div>
                    </div>
                    
                    {/* Features Preview */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-600 dark:text-slate-400 text-xs">Smart Categorization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-600 dark:text-slate-400 text-xs">Spending Analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-600 dark:text-slate-400 text-xs">Budget Optimization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-600 dark:text-slate-400 text-xs">Actionable Insights</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              {aiBudgetAdvice && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* AI Advice Header */}
                  <div className="flex items-center gap-2 pb-3 border-b border-blue-200/50 dark:border-blue-800/50">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Smart Recommendations</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tailored to your spending behavior</p>
                    </div>
                  </div>
                  
                  {/* Enhanced Advice Points */}
                  {advicePoints.length > 0 && (
                    <div className="space-y-3">
                        {currentPoints.map((point, index) => (
                        <motion.div 
                          key={startIndex + index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative"
                        >
                          <div className="flex items-start gap-4 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-blue-100/50 dark:border-blue-900/50 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                              {startIndex + index + 1}
                          </div>
                      </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                                {point}
                              </p>
                            </div>
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Enhanced Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
                          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Showing {startIndex + 1}-{Math.min(endIndex, advicePoints.length)} of {advicePoints.length} insights</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="h-8 px-3 text-xs border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              ← Previous
                            </Button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                            <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 text-xs rounded-full transition-colors ${
                                      currentPage === pageNum
                                        ? 'bg-blue-500 text-white'
                                        : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                              className="h-8 px-3 text-xs border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              Next →
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Enhanced Spending Analysis */}
                  {spendingAnalysis && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800/50 dark:to-blue-950/20 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs">📊</span>
                        </div>
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">Spending Analysis</h5>
                        </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-gray-700/60 rounded-lg">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Total Spending</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">${spendingAnalysis.totalSpending.toLocaleString()}</span>
                        </div>
                          <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-gray-700/60 rounded-lg">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Avg Monthly</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">${spendingAnalysis.avgMonthlySpending.toLocaleString()}</span>
                        </div>
                      </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-gray-700/60 rounded-lg">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Overspending Months</span>
                            <span className={`font-semibold ${spendingAnalysis.overspendingMonths > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                              {spendingAnalysis.overspendingMonths}
                            </span>
                    </div>
                          <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-gray-700/60 rounded-lg">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Top Category</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                              {spendingAnalysis.topCategories[0]?.name || 'N/A'}
                            </span>
                </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
              
              {/* Enhanced CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
              <Button 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                onClick={() => {
                  console.log('🖱️ [AI] Button clicked!')
                  console.log('🖱️ [AI] Budget suggestion:', insightsData.budgetSuggestion)
                  console.log('🖱️ [AI] Transactions count:', transactions.length)
                  console.log('🖱️ [AI] Is loading:', isLoadingAdvice)
                  getAiBudgetAdvice()
                }}
                disabled={!isAuthenticated || isLoadingAdvice}
              >
                  {isLoadingAdvice ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Analyzing your data...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Get AI Budget Advice</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
              </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Spending Forecast Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-white/20 dark:border-slate-800/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Future Spending Forecast
                    </CardTitle>
                    <CardDescription className="text-blue-600/80 dark:text-blue-400/80">
                      Projected vs. Actual spending for the next 6 months
            </CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardContent>
            
            <ChartContainer
              config={{
                actualSpending: {
                  label: "Actual Spending (Historical)",
                  color: "#10b981", // Green color for actual data
                },
                projectedSpending: {
                  label: "Projected Spending (Future Months)",
                  color: "#3b82f6", // Blue color for projections
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={insightsData.forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis 
                    domain={[0, 'dataMax + 500']}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actualSpending" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Actual Spending (Historical)" 
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedSpending"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Projected Spending (Future)"
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
          </motion.div>

          {/* Enhanced Budget Allocation Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-white/20 dark:border-slate-800/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Budget Allocation vs. Suggestion
                    </CardTitle>
                    <CardDescription className="text-purple-600/80 dark:text-purple-400/80">
                      Compare your current budget with AI-driven suggestions
                    </CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                allocated: {
                  label: "Your Allocated Budget",
                  color: "#dc2626", // Red color for allocated
                },
                suggested: {
                  label: "AI Suggested Budget",
                  color: "#eab308", // Yellow color for suggested
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insightsData.budgetSuggestionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="allocated" 
                    fill="#dc2626" 
                    name="Your Allocated Budget"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="suggested" 
                    fill="#eab308" 
                    name="AI Suggested Budget"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
          </motion.div>
        </div>
        
        {/* Professional Footer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-2xl p-8 border border-white/20 dark:border-slate-800/20 backdrop-blur-sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI-Powered Insights
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
                Our advanced AI algorithms continuously analyze your spending patterns to provide personalized recommendations and help you achieve your financial goals.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Smart Categorization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Predictive Forecasting</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
