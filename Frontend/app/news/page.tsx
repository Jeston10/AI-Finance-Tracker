"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { useApp } from "@/lib/contexts/app-context"

interface NewsArticle {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  imageUrl?: string
  category: string
}

export default function NewsPage() {
  const { isAuthenticated, isLoading } = useApp()
  const [news, setNews] = React.useState<NewsArticle[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [category, setCategory] = React.useState("all")

  // Fetch financial news from backend API
  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:4000/api/news?category=${category}&search=${searchTerm}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setNews(data.articles || [])
        } else {
          console.error('Failed to fetch news')
          setNews(getMockNews())
        }
      } catch (error) {
        console.error('Error fetching news:', error)
        setNews(getMockNews())
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [category, searchTerm])

  const getMockNews = (): NewsArticle[] => {
    return [
      {
        title: "Federal Reserve Signals Potential Rate Cuts in 2025",
        description: "The Federal Reserve has indicated a shift in monetary policy, suggesting potential interest rate cuts in the coming year as inflation shows signs of cooling.",
        url: "https://www.federalreserve.gov/newsevents.htm",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: "monetary-policy"
      },
      {
        title: "Global Stock Markets Rally on Tech Sector Gains",
        description: "Major stock indices worldwide posted significant gains today, driven by strong earnings reports from technology giants and positive economic data.",
        url: "https://www.bloomberg.com/markets",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        category: "markets"
      },
      {
        title: "Cryptocurrency Market Sees Renewed Investor Interest",
        description: "Bitcoin and major altcoins have surged over 15% this week as institutional investors return to the crypto market amid regulatory clarity.",
        url: "https://www.coindesk.com/",
        source: "CoinDesk",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        category: "crypto"
      },
      {
        title: "Oil Prices Fluctuate Amid OPEC+ Production Decisions",
        description: "Crude oil prices experienced volatility following OPEC+ announcements regarding production quotas for the next quarter.",
        url: "https://www.reuters.com/markets/commodities/",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        category: "commodities"
      },
      {
        title: "Major Banks Report Strong Q4 Earnings",
        description: "Leading financial institutions exceeded analyst expectations with robust quarterly earnings, signaling strength in the banking sector.",
        url: "https://www.wsj.com/finance",
        source: "Wall Street Journal",
        publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        category: "banking"
      },
      {
        title: "Inflation Data Shows Continued Decline Across Major Economies",
        description: "Latest inflation figures from the US, EU, and UK indicate a sustained downward trend, easing concerns about persistent price pressures.",
        url: "https://www.cnbc.com/economy/",
        source: "CNBC",
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        category: "economy"
      },
      {
        title: "Gold Reaches New Highs Amid Economic Uncertainty",
        description: "Gold prices hit record levels as investors seek safe-haven assets in response to geopolitical tensions and economic uncertainty.",
        url: "https://www.marketwatch.com/investing/metal/gold",
        source: "MarketWatch",
        publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        category: "commodities"
      },
      {
        title: "Tech IPOs Make Strong Comeback in 2025",
        description: "Several technology companies have successfully launched initial public offerings, marking a resurgence in the IPO market after a quiet period.",
        url: "https://techcrunch.com/tag/ipo/",
        source: "TechCrunch",
        publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        category: "markets"
      },
      {
        title: "Central Banks Coordinate on Digital Currency Initiatives",
        description: "Major central banks are collaborating on frameworks for central bank digital currencies (CBDCs), signaling a shift in monetary infrastructure.",
        url: "https://www.ft.com/central-banks",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
        category: "monetary-policy"
      },
      {
        title: "Emerging Markets Attract Record Foreign Investment",
        description: "Developing economies are experiencing unprecedented capital inflows as investors diversify portfolios and seek higher growth opportunities.",
        url: "https://www.economist.com/finance-and-economics",
        source: "The Economist",
        publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        category: "economy"
      },
      {
        title: "Real Estate Market Shows Signs of Recovery",
        description: "Housing markets in major cities are rebounding with increased sales activity and stabilizing prices after a period of correction.",
        url: "https://www.bloomberg.com/real-estate",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString(),
        category: "real-estate"
      },
      {
        title: "Sustainable Finance Gains Momentum with ESG Investments",
        description: "Environmental, Social, and Governance (ESG) investment funds continue to attract billions in assets as sustainability becomes a priority.",
        url: "https://www.reuters.com/sustainability/",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
        category: "investing"
      }
    ]
  }

  const filteredNews = React.useMemo(() => {
    return news.filter(article => {
      const matchesSearch = searchTerm === "" || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = category === "all" || article.category === category
      
      return matchesSearch && matchesCategory
    })
  }, [news, searchTerm, category])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "Yesterday"
    return `${diffInDays} days ago`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <Image src="/news-icon.svg" alt="News" width={80} height={80} className="mx-auto mb-6 opacity-50" />
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">Financial News</h1>
          <p className="text-muted-foreground mb-8">
            Please log in to access the latest financial news and market updates from around the world.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Financial News
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Stay updated with the latest financial news, market trends, and economic developments from around the globe.
          </p>
        </motion.div>
      </div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <Card className="border-2 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Image 
                    src="/search-icon.svg" 
                    alt="Search" 
                    width={16} 
                    height={16} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                  />
                  <Input
                    placeholder="Search news..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="markets">Markets</SelectItem>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="banking">Banking</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="commodities">Commodities</SelectItem>
                    <SelectItem value="monetary-policy">Monetary Policy</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="investing">Investing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* News Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredNews.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-20 text-center">
            <Image src="/news-icon.svg" alt="No news" width={64} height={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground text-lg">No news articles found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {article.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(article.publishedAt)}
                    </span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-3">
                    {article.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Image src="/news-icon.svg" alt="Source" width={16} height={16} />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{article.source}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      onClick={() => {
                        if (article.url && article.url !== '#') {
                          window.open(article.url, '_blank', 'noopener,noreferrer')
                        }
                      }}
                      disabled={!article.url || article.url === '#'}
                    >
                      Read More →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-12"
      >
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Stay Informed</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get real-time updates on financial markets, economic indicators, and breaking news that could impact your investments and financial decisions.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}

