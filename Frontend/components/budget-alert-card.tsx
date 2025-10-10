"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { apiClient } from '@/lib/api-client'
import { motion } from "framer-motion"
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Mail,
  CheckCircle2,
  XCircle
} from "lucide-react"

interface SpendingSummary {
  daily: {
    spent: number
    budget: number
    remaining: number
    percentage: number
  }
  weekly: {
    spent: number
    budget: number
    remaining: number
    percentage: number
  }
  monthly: {
    spent: number
    budget: number
    remaining: number
    percentage: number
  }
  yearly: {
    spent: number
    budget: number
    remaining: number
    percentage: number
  }
}

export function BudgetAlertCard() {
  const [spendingSummary, setSpendingSummary] = useState<SpendingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingBudget, setCheckingBudget] = useState(false)
  const [sendingTestEmail, setSendingTestEmail] = useState(false)
  const [testEmailSent, setTestEmailSent] = useState<boolean | null>(null)

  useEffect(() => {
    loadSpendingSummary()
  }, [])

  const loadSpendingSummary = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getSpendingSummary()
      if (response.success) {
        setSpendingSummary(response.data)
      }
    } catch (error) {
      console.error('Failed to load spending summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckBudget = async () => {
    try {
      setCheckingBudget(true)
      const response = await apiClient.checkBudgetExceedances()
      if (response.success) {
        // Reload the spending summary after checking
        await loadSpendingSummary()
      }
    } catch (error) {
      console.error('Failed to check budget:', error)
    } finally {
      setCheckingBudget(false)
    }
  }

  const handleSendTestEmail = async () => {
    try {
      setSendingTestEmail(true)
      const response = await apiClient.sendTestEmail()
      setTestEmailSent(response.success)
    } catch (error) {
      console.error('Failed to send test email:', error)
      setTestEmailSent(false)
    } finally {
      setSendingTestEmail(false)
    }
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'destructive'
    if (percentage >= 80) return 'destructive'
    if (percentage >= 60) return 'default'
    return 'secondary'
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) return { text: 'Exceeded', variant: 'destructive' as const }
    if (percentage >= 80) return { text: 'Warning', variant: 'default' as const }
    if (percentage >= 60) return { text: 'On Track', variant: 'secondary' as const }
    return { text: 'Good', variant: 'secondary' as const }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Budget Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Budget Alerts & Monitoring
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={handleCheckBudget}
              disabled={checkingBudget}
              size="sm"
              variant="outline"
            >
              {checkingBudget ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Check Now
            </Button>
            <Button
              onClick={handleSendTestEmail}
              disabled={sendingTestEmail}
              size="sm"
              variant="outline"
            >
              {sendingTestEmail ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Test Email
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Test Email Status */}
        {testEmailSent !== null && (
          <Alert className={testEmailSent ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className="flex items-center gap-2">
              {testEmailSent ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-green-800">Test email sent successfully!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800">Failed to send test email. Check your email configuration.</span>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Budget Status Overview */}
        {spendingSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(spendingSummary).map(([period, data]) => {
              const status = getStatusBadge(data.percentage)
              const isExceeded = data.percentage >= 100
              
              return (
                <motion.div
                  key={period}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <Card className={`${isExceeded ? 'border-red-200 bg-red-50' : data.percentage >= 80 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold capitalize flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {period}
                        </h3>
                        <Badge variant={status.variant}>
                          {status.text}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Spent</span>
                          <span className="font-medium">{formatCurrency(data.spent)}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span>Budget</span>
                          <span className="font-medium">{formatCurrency(data.budget)}</span>
                        </div>
                        
                        <Progress 
                          value={Math.min(data.percentage, 100)} 
                          className="h-2"
                        />
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{data.percentage.toFixed(1)}% used</span>
                          <span>{formatCurrency(data.remaining)} remaining</span>
                        </div>
                      </div>
                      
                      {isExceeded && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-red-800 text-xs">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          Budget exceeded by {formatCurrency(data.spent - data.budget)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Alert Information */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Email Notifications:</strong> You'll receive email alerts when you exceed your daily, weekly, monthly, or yearly budget targets. 
            Check your email settings to ensure notifications are enabled.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={loadSpendingSummary} variant="outline" className="flex-1">
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={handleCheckBudget} disabled={checkingBudget} className="flex-1">
            {checkingBudget ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Checking...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Check Budget Now
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
