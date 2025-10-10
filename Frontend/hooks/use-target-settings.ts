"use client"

import { useState, useEffect } from "react"

interface TargetSettings {
  daily: number
  weekly: number
  monthly: number
  yearly: number
}

export function useTargetSettings() {
  const [targets, setTargets] = useState<TargetSettings>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0
  })

  // Load targets from localStorage
  useEffect(() => {
    const savedTargets = localStorage.getItem("targetSettings")
    if (savedTargets) {
      try {
        const parsedTargets = JSON.parse(savedTargets)
        setTargets(parsedTargets)
        console.log('Hook: Loaded saved targets:', parsedTargets)
      } catch (error) {
        console.error('Hook: Error parsing saved targets:', error)
      }
    }
  }, [])

  // Listen for changes to localStorage (when targets are updated in other components)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTargets = localStorage.getItem("targetSettings")
      if (savedTargets) {
        try {
          const parsedTargets = JSON.parse(savedTargets)
          setTargets(parsedTargets)
          console.log('Hook: Updated targets from storage:', parsedTargets)
        } catch (error) {
          console.error('Hook: Error parsing updated targets:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const getTargetForPeriod = (period: "daily" | "weekly" | "monthly" | "yearly") => {
    return targets[period] || 0
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const updateTargets = (newTargets: TargetSettings) => {
    setTargets(newTargets)
    localStorage.setItem("targetSettings", JSON.stringify(newTargets))
    console.log('Hook: Updated targets:', newTargets)
  }

  return {
    targets,
    getTargetForPeriod,
    formatCurrency,
    updateTargets
  }
}
