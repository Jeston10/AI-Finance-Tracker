"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function ConnectBankPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const popularBanks = ["Bank of America", "Chase", "Wells Fargo", "Citibank", "Capital One", "PNC Bank"]

  const filteredBanks = popularBanks.filter((bank) => bank.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleConnect = (bankName: string) => {
    alert(`Connecting to ${bankName}... (Frontend simulation)`)
    // In a real application, this would initiate an OAuth flow or similar.
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold tracking-tight text-center mb-12">Connect Your Bank Accounts</h1>
      <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Securely link your financial institutions to get a comprehensive view of your money and unlock powerful AI
        insights.
      </p>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Image src="/bank-connectivity.svg" alt="Bank" width={24} height={24} />
            Connect a Bank
          </CardTitle>
          <CardDescription>Search for your bank or choose from popular options below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Image src="/search-icon.svg" alt="Search" width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for your bank..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredBanks.length > 0 ? (
              filteredBanks.map((bank) => (
                <motion.div key={bank} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-transparent"
                    onClick={() => handleConnect(bank)}
                  >
                    {bank}
                    <span>&rarr;</span>
                  </Button>
                </motion.div>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">No banks found matching your search.</p>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Your financial data is encrypted and secured. We do not store your bank login credentials.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
