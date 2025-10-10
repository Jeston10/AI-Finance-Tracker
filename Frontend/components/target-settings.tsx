"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface TargetSettings {
  daily: number
  weekly: number
  monthly: number
  yearly: number
}

export function TargetSettings() {
  const [targets, setTargets] = useState<TargetSettings>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0
  })
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly")
  const [targetAmount, setTargetAmount] = useState("")

  // Load saved targets from localStorage on component mount
  useEffect(() => {
    const savedTargets = localStorage.getItem("targetSettings")
    if (savedTargets) {
      try {
        const parsedTargets = JSON.parse(savedTargets)
        setTargets(parsedTargets)
        console.log('Loaded saved targets:', parsedTargets)
      } catch (error) {
        console.error('Error parsing saved targets:', error)
      }
    }
  }, [])

  // Save targets to localStorage whenever they change
  useEffect(() => {
    // Only save if targets have been initialized (not the default empty state)
    if (targets.daily > 0 || targets.weekly > 0 || targets.monthly > 0 || targets.yearly > 0) {
      localStorage.setItem("targetSettings", JSON.stringify(targets))
      console.log('Saved targets to localStorage:', targets)
    }
  }, [targets])

  const handleSaveTarget = () => {
    const amount = parseFloat(targetAmount)
    if (amount > 0) {
      setTargets(prev => ({
        ...prev,
        [selectedPeriod]: amount
      }))
      setTargetAmount("")
    }
  }

  const handleClearTarget = (period: keyof TargetSettings) => {
    setTargets(prev => ({
      ...prev,
      [period]: 0
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getPeriodLabel = (period: keyof TargetSettings) => {
    const labels = {
      daily: "Daily",
      weekly: "Weekly", 
      monthly: "Monthly",
      yearly: "Yearly"
    }
    return labels[period]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image src="/target-icon.svg" alt="Target" width={20} height={20} />
          Spending Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Set New Target */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Image src="/calendar-icon.svg" alt="Calendar" width={16} height={16} />
            Set New Target
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-period">Period</Label>
              <Select value={selectedPeriod} onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-amount">Amount</Label>
              <Input
                id="target-amount"
                type="number"
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={handleSaveTarget} className="w-full">
                Set Target
              </Button>
            </div>
          </div>
        </div>

        {/* Current Targets Display */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Image src="/transactions-icon.svg" alt="Dollar" width={16} height={16} />
            Current Targets
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(targets).map(([period, amount]) => (
              <div key={period} className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {getPeriodLabel(period as keyof TargetSettings)}
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-lg font-semibold">
                    {amount > 0 ? formatCurrency(amount) : "Not set"}
                  </div>
                  {amount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearTarget(period as keyof TargetSettings)}
                      className="mt-2 h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Info */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>How it works:</strong> Set your spending targets for different periods. 
          These targets will be used as default amounts when adding transactions, 
          and you can track your progress against these goals.
        </div>
      </CardContent>
    </Card>
  )
}
