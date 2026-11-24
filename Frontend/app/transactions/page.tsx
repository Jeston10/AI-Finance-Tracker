"use client"

import { useState } from "react"
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
import Autoplay from "embla-carousel-autoplay"
import React from "react"
import { useApp } from "@/lib/contexts/app-context"
import {
  Receipt,
  History,
  FileText,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Coffee,
  ShoppingCart,
  Car,
  DollarSign,
  Film,
  CircleAlert,
} from "lucide-react"

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
  const cls = "h-5 w-5 text-primary"
  switch (category?.toLowerCase()) {
    case 'food':
    case 'groceries':
    case 'dining':
      return <Coffee className={cls} />
    case 'shopping':
    case 'retail':
      return <ShoppingCart className={cls} />
    case 'transport':
    case 'transportation':
    case 'travel':
      return <Car className={cls} />
    case 'income':
    case 'salary':
      return <DollarSign className={cls} />
    case 'entertainment':
    case 'recreation':
      return <Film className={cls} />
    default:
      return <CircleAlert className={cls} />
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
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Transaction Management
            </h1>
            <p className="text-muted-foreground mt-1">Track, manage, and analyze your financial transactions</p>
          </div>
        </div>

        {/* Form and Settings Section */}
        <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <AddTransactionForm />
          </div>
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <TargetSettings />
          </div>
        </div>

        {/* Budget Alert Section */}
        <div className="mb-12">
          <BudgetAlertCard />
        </div>

        {/* Recent Transactions Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Recent Transactions</h2>
              <p className="text-muted-foreground">Your latest financial activities at a glance</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden p-6">
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
        </section>

        {/* Transaction Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Date Filter */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Filter by Date</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              </CardContent>
            </Card>
          </div>

          {/* Transaction Table */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <FileText className="h-5 w-5" />
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
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
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
                            className={`hover:bg-muted/50 transition-colors ${
                              index % 2 === 0 ? 'bg-card' : 'bg-muted/30'
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
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium ${
                                Number(transaction.amount) >= 0
                                  ? "bg-primary/10 text-primary"
                                  : "bg-destructive/10 text-destructive"
                              }`}>
                                ${Math.abs(Number(transaction.amount)).toFixed(2)}
                                {Number(transaction.amount) >= 0
                                  ? <TrendingUp className="h-3.5 w-3.5" />
                                  : <TrendingDown className="h-3.5 w-3.5" />}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No transactions found</h3>
                    <p className="text-muted-foreground">No transactions found for the selected date.</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <div className="bg-card rounded-lg border p-2">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                if (currentPage > 1) handlePageChange(currentPage - 1)
                              }}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-muted"}
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
                                className="hover:bg-muted"
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
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-muted"}
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

        {/* Footer */}
        <div className="mt-16 pt-8 border-t">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>Transaction management powered by AI Finance Tracker</span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
