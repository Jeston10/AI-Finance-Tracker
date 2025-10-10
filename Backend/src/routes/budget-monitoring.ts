import express from 'express';
import { budgetMonitorService } from '../services/budget-monitor-service.js';
import { emailService } from '../services/email-service.js';
import { authenticateJwt } from '../middleware/auth.js';

const router = express.Router();

/**
 * Check budget exceedances for the authenticated user
 */
router.post('/check-budget', authenticateJwt, async (req: any, res) => {
  try {
    const userId = req.user.sub;
    
    console.log(`🔍 Manual budget check requested by user: ${userId}`);
    
    await budgetMonitorService.checkBudgetExceedances(userId);
    
    res.json({
      success: true,
      message: 'Budget check completed successfully'
    });
  } catch (error) {
    console.error('❌ Error in budget check endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check budget exceedances',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Run budget monitoring for all users (admin endpoint)
 */
router.post('/check-all-users', authenticateJwt, async (req: any, res) => {
  try {
    // Check if user is admin (you can implement admin role checking)
    const userId = req.user.sub;
    
    // Get user email from database
    const { getPrisma } = await import('../services/prisma.js');
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`🔄 Manual budget monitoring for all users requested by: ${user.email}`);
    
    await budgetMonitorService.runBudgetMonitoringForAllUsers();
    
    res.json({
      success: true,
      message: 'Budget monitoring completed for all users'
    });
  } catch (error) {
    console.error('❌ Error in budget monitoring endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run budget monitoring',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Send test email to verify email service is working
 */
router.post('/test-email', authenticateJwt, async (req: any, res) => {
  try {
    const userId = req.user.sub;
    
    // Get user email from database
    const { getPrisma } = await import('../services/prisma.js');
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`📧 Test email requested by: ${user.email}`);
    
    const emailSent = await emailService.sendTestEmail(user.email);
    
    if (emailSent) {
      res.json({
        success: true,
        message: 'Test email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get current spending summary for authenticated user
 */
router.get('/spending-summary', authenticateJwt, async (req: any, res) => {
  try {
    const userId = req.user.sub;
    
    // Calculate current spending
    const spendingData = await budgetMonitorService.calculateCurrentSpending(userId);
    const budgetTargets = await budgetMonitorService.getUserBudgetTargets(userId);
    
    const summary = {
      daily: {
        spent: spendingData.daily,
        budget: budgetTargets.daily,
        remaining: budgetTargets.daily - spendingData.daily,
        percentage: budgetTargets.daily > 0 ? (spendingData.daily / budgetTargets.daily) * 100 : 0
      },
      weekly: {
        spent: spendingData.weekly,
        budget: budgetTargets.weekly,
        remaining: budgetTargets.weekly - spendingData.weekly,
        percentage: budgetTargets.weekly > 0 ? (spendingData.weekly / budgetTargets.weekly) * 100 : 0
      },
      monthly: {
        spent: spendingData.monthly,
        budget: budgetTargets.monthly,
        remaining: budgetTargets.monthly - spendingData.monthly,
        percentage: budgetTargets.monthly > 0 ? (spendingData.monthly / budgetTargets.monthly) * 100 : 0
      },
      yearly: {
        spent: spendingData.yearly,
        budget: budgetTargets.yearly,
        remaining: budgetTargets.yearly - spendingData.yearly,
        percentage: budgetTargets.yearly > 0 ? (spendingData.yearly / budgetTargets.yearly) * 100 : 0
      }
    };
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('❌ Error getting spending summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get spending summary',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
