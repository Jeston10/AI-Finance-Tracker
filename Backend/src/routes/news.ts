import express from 'express';
import { newsService } from '../services/news-service.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get financial news articles
 */
router.get('/news', authenticateJwt, async (req: any, res) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;

    console.log(`📰 Fetching news - Category: ${category || 'all'}, Search: ${search || 'none'}`);

    const articles = await newsService.getFinancialNews(category, search, pageSize);

    res.json({
      success: true,
      articles: articles,
      count: articles.length
    });
  } catch (error) {
    console.error('❌ Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;





