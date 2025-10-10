"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination"
import { format } from "date-fns"
import { AddTransactionForm } from "@/components/add-transaction-form"
import { TargetSettings } from "@/components/target-settings"
import { RecentTransactionCard } from "@/components/recent-transaction-card"
import { BudgetAlertCard } from "@/components/budget-alert-card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import React from "react"
import { useApp } from "@/lib/contexts/app-context"
import { Transaction } from "@/lib/api-client"

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'food':
    case 'groceries':
    case 'dining':
      return <Image src="/coffee-icon.svg" alt="Coffee" width={24} height={24} />
    case 'shopping':
    case 'retail':
      return <Image src="/shopping-cart-icon.svg" alt="Shopping Cart" width={24} height={24} />
    case 'transport':
    case 'transportation':
    case 'travel':
      return <Image src="/car-icon.svg" alt="Car" width={24} height={24} />
    case 'income':
    case 'salary':
      return <Image src="/transactions-icon.svg" alt="Dollar" width={24} height={24} />
    case 'entertainment':
    case 'recreation':
      return <Image src="/trending-up-icon.svg" alt="Trending Up" width={24} height={24} />
    default:
      return <Image src="/alert-circle-icon.svg" alt="Alert" width={24} height={24} />
  }
}

const ITEMS_PER_PAGE = 5

export default function TransactionsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [currentPage, setCurrentPage] = useState(1)
  const { transactions, isAuthenticated, isLoading } = useApp()

  const plugin = React.useRef(Autoplay({ delay: 3000, stopOnInteraction: false }))

  // Filter transactions by date if selected
  const filteredTransactions = date
    ? transactions.filter((transaction) => 
        format(new Date(transaction.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      )
    : transactions

  // Get recent transactions for carousel (last 5)
  const recentTransactionsData = transactions.slice(0, 5).map(transaction => ({
    id: transaction.id,
    icon: getCategoryIcon(transaction.category || 'other'),
    name: transaction.description,
    category: transaction.category || 'Other',
    amount: Number(transaction.amount),
    date: format(new Date(transaction.date), "yyyy-MM-dd"),
  }))

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Show loading state
  if (isLoading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading transactions...</p>
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
          <h1 className="text-4xl font-bold tracking-tight mb-4">Your Transactions</h1>
          <p className="text-muted-foreground mb-8">Please log in to view your transactions.</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Transaction Management
              </h1>
              <p className="text-muted-foreground mt-2">Track, manage, and analyze your financial transactions</p>
            </div>
          </div>
        </div>

        {/* Enhanced Form and Settings Section */}
        <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl overflow-hidden">
              <AddTransactionForm />
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl overflow-hidden">
              <TargetSettings />
            </div>
          </div>
        </div>

        {/* Budget Alert Section */}
        <div className="mb-12">
          <BudgetAlertCard />
        </div>

        {/* Enhanced Recent Transactions Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Recent Transactions</h2>
              <p className="text-slate-600 dark:text-slate-400">Your latest financial activities at a glance</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl overflow-hidden p-6">
              <Carousel
                plugins={[plugin.current]}
                className="w-full"
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent className="-ml-4">
                  {recentTransactionsData.map((transaction) => (
                    <CarouselItem key={transaction.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <RecentTransactionCard {...transaction} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        </section>

        {/* Enhanced Transaction Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Date Filter */}
          <div className="lg:col-span-1">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-30"></div>
              <Card className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <CardTitle className="text-lg">Filter by Date</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border border-slate-200 dark:border-slate-700" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Transaction Table */}
          <div className="lg:col-span-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur opacity-30"></div>
              <Card className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <CardTitle className="text-lg">Transaction Details</CardTitle>
                        <p className="text-sm text-muted-foreground">View and manage your transaction history</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {currentTransactions.length} transaction{currentTransactions.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentTransactions.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-800">
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="font-semibold">Time</TableHead>
                            <TableHead className="font-semibold">Description</TableHead>
                            <TableHead className="font-semibold">Category</TableHead>
                            <TableHead className="font-semibold text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentTransactions.map((transaction, index) => (
                            <TableRow 
                              key={transaction.id} 
                              className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'
                              }`}
                            >
                              <TableCell className="font-medium">
                                {format(new Date(transaction.date), "yyyy-MM-dd")}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(transaction.date), "HH:mm")}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate" title={transaction.description}>
                                {transaction.description}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(transaction.category || 'Other')}
                                  <span className="capitalize">{transaction.category || 'Other'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                                  Number(transaction.amount) >= 0 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                }`}>
                                  ${Math.abs(Number(transaction.amount)).toFixed(2)}
                                  {Number(transaction.amount) >= 0 ? ' ↗' : ' ↘'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No transactions found</h3>
                      <p className="text-muted-foreground">No transactions found for the selected date.</p>
                    </div>
                  )}
                  
                  {/* Enhanced Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (currentPage > 1) handlePageChange(currentPage - 1)
                                }}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-slate-100 dark:hover:bg-slate-700"}
                              />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, index) => (
                              <PaginationItem key={index}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handlePageChange(index + 1)
                                  }}
                                  isActive={currentPage === index + 1}
                                  className="hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                  {index + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (currentPage < totalPages) handlePageChange(currentPage + 1)
                                }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-slate-100 dark:hover:bg-slate-700"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Transaction management powered by AI Finance Tracker</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
