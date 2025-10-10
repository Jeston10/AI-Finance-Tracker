"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DatePicker } from "@/components/date-picker"
import { useTargetSettings } from "@/hooks/use-target-settings"
import { useApp } from "@/lib/contexts/app-context"
import { toast } from "sonner"

export function AddTransactionForm() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { targets, getTargetForPeriod, formatCurrency } = useTargetSettings()
  const { createTransaction, isAuthenticated, isCreatingTransaction } = useApp()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast.error("Please log in to add transactions")
      return
    }

    if (!amount || !description) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)
      
      const transactionData = {
        description,
        amount: parseFloat(amount),
        currency: "USD",
        date: date ? date.toISOString() : new Date().toISOString(),
      }

      await createTransaction(transactionData)
      
      // Reset form
      setDate(new Date())
      setAmount("")
      setCategory("")
      setDescription("")
      
      toast.success("Transaction added successfully!")
    } catch (error) {
      console.error("Failed to create transaction:", error)
      toast.error("Failed to add transaction. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            {/* Option 1: Native HTML date input (most reliable) */}
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={date ? format(date, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const selectedDate = e.target.value ? new Date(e.target.value) : undefined
                  setDate(selectedDate)
                }}
                className="w-full"
              />
            </div>
            
            {/* Option 2: Custom DatePicker component (uncomment to use) */}
            {/* <DatePicker 
              date={date} 
              onDateChange={setDate} 
              placeholder="Pick a date"
            /> */}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount Spent</Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 50.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {/* Suggested amounts based on saved targets */}
            {Object.values(targets).some(target => target > 0) && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Quick fill from your targets:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(targets).map(([period, targetAmount]) => (
                    targetAmount > 0 && (
                      <Button
                        key={period}
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(targetAmount.toString())}
                        className="text-xs"
                      >
                        {period}: {formatCurrency(targetAmount)}
                      </Button>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g., Groceries at SuperMart"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food & Dining</SelectItem>
                <SelectItem value="transport">Transportation</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="bills">Bills & Utilities</SelectItem>
                <SelectItem value="health">Health & Medical</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || isCreatingTransaction}>
            {isSubmitting || isCreatingTransaction ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
