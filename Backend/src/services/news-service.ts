import axios from 'axios';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  category: string;
}

class NewsService {
  private apiKey: string;
  private baseUrl: string = 'https://newsapi.org/v2';

  constructor() {
    // NewsAPI key - get from environment or use a default for testing
    this.apiKey = process.env.NEWS_API_KEY || '';
  }

  /**
   * Fetch financial news articles
   */
  async getFinancialNews(category?: string, searchQuery?: string, pageSize: number = 20): Promise<NewsArticle[]> {
    try {
      if (!this.apiKey) {
        console.warn('⚠️  NEWS_API_KEY not set, returning mock data');
        return this.getMockNews();
      }

      // Build query parameters
      const params: any = {
        apiKey: this.apiKey,
        language: 'en',
        pageSize: pageSize,
        sortBy: 'publishedAt'
      };

      // Use different endpoints based on search/category
      let endpoint = '/everything';
      
      if (searchQuery) {
        params.q = `${searchQuery} AND (finance OR economy OR market OR stock OR investment)`;
      } else if (category && category !== 'all') {
        // Map our categories to search terms
        const categoryMap: { [key: string]: string } = {
          'markets': 'stock market OR trading OR equity',
          'economy': 'economy OR GDP OR inflation OR economic growth',
          'banking': 'bank OR banking OR financial institution',
          'crypto': 'cryptocurrency OR bitcoin OR ethereum OR blockchain',
          'commodities': 'oil OR gold OR commodity OR precious metals',
          'monetary-policy': 'central bank OR federal reserve OR monetary policy OR interest rate',
          'real-estate': 'real estate OR property OR housing market',
          'investing': 'investment OR portfolio OR mutual fund OR ETF'
        };
        params.q = categoryMap[category] || 'finance';
      } else {
        // Default: top financial news
        params.q = 'finance OR economy OR stock market OR investment';
      }

      const response = await axios.get(`${this.baseUrl}${endpoint}`, { params });

      if (response.data.status === 'ok') {
        return response.data.articles.map((article: any) => ({
          title: article.title,
          description: article.description || 'No description available',
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
          imageUrl: article.urlToImage,
          category: this.inferCategory(article.title + ' ' + article.description)
        }));
      }

      return this.getMockNews();
    } catch (error) {
      console.error('❌ Error fetching news:', error);
      return this.getMockNews();
    }
  }

  /**
   * Infer category from article content
   */
  private inferCategory(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('crypto') || lowerText.includes('bitcoin') || lowerText.includes('ethereum')) {
      return 'crypto';
    }
    if (lowerText.includes('bank') || lowerText.includes('banking')) {
      return 'banking';
    }
    if (lowerText.includes('stock') || lowerText.includes('market') || lowerText.includes('trading')) {
      return 'markets';
    }
    if (lowerText.includes('economy') || lowerText.includes('gdp') || lowerText.includes('inflation')) {
      return 'economy';
    }
    if (lowerText.includes('oil') || lowerText.includes('gold') || lowerText.includes('commodity')) {
      return 'commodities';
    }
    if (lowerText.includes('federal reserve') || lowerText.includes('central bank') || lowerText.includes('interest rate')) {
      return 'monetary-policy';
    }
    if (lowerText.includes('real estate') || lowerText.includes('property') || lowerText.includes('housing')) {
      return 'real-estate';
    }
    if (lowerText.includes('investment') || lowerText.includes('portfolio') || lowerText.includes('fund')) {
      return 'investing';
    }
    
    return 'markets';
  }

  /**
   * Get mock news data as fallback
   */
  private getMockNews(): NewsArticle[] {
    return [
      {
        title: "Federal Reserve Signals Potential Rate Cuts in 2025",
        description: "The Federal Reserve has indicated a shift in monetary policy, suggesting potential interest rate cuts in the coming year as inflation shows signs of cooling.",
        url: "https://www.federalreserve.gov/",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: "monetary-policy"
      },
      {
        title: "Global Stock Markets Rally on Tech Sector Gains",
        description: "Major stock indices worldwide posted significant gains today, driven by strong earnings reports from technology giants and positive economic data.",
        url: "https://www.bloomberg.com/",
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
        url: "https://www.reuters.com/",
        source: "Reuters",
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        category: "commodities"
      },
      {
        title: "Major Banks Report Strong Q4 Earnings",
        description: "Leading financial institutions exceeded analyst expectations with robust quarterly earnings, signaling strength in the banking sector.",
        url: "https://www.wsj.com/",
        source: "Wall Street Journal",
        publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        category: "banking"
      },
      {
        title: "Inflation Data Shows Continued Decline Across Major Economies",
        description: "Latest inflation figures from the US, EU, and UK indicate a sustained downward trend, easing concerns about persistent price pressures.",
        url: "https://www.cnbc.com/",
        source: "CNBC",
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        category: "economy"
      },
      {
        title: "Gold Reaches New Highs Amid Economic Uncertainty",
        description: "Gold prices hit record levels as investors seek safe-haven assets in response to geopolitical tensions and economic uncertainty.",
        url: "https://www.marketwatch.com/",
        source: "MarketWatch",
        publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        category: "commodities"
      },
      {
        title: "Tech IPOs Make Strong Comeback in 2025",
        description: "Several technology companies have successfully launched initial public offerings, marking a resurgence in the IPO market after a quiet period.",
        url: "https://techcrunch.com/",
        source: "TechCrunch",
        publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        category: "markets"
      },
      {
        title: "Central Banks Coordinate on Digital Currency Initiatives",
        description: "Major central banks are collaborating on frameworks for central bank digital currencies (CBDCs), signaling a shift in monetary infrastructure.",
        url: "https://www.ft.com/",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
        category: "monetary-policy"
      },
      {
        title: "Emerging Markets Attract Record Foreign Investment",
        description: "Developing economies are experiencing unprecedented capital inflows as investors diversify portfolios and seek higher growth opportunities.",
        url: "https://www.economist.com/",
        source: "The Economist",
        publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        category: "economy"
      }
    ];
  }
}

export const newsService = new NewsService();

