import { emailService, type BudgetExceedanceAlert } from './email-service.js';
import { getPrisma } from './prisma.js';
import dayjs from 'dayjs';

const prisma = getPrisma();

export interface BudgetTargets {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface SpendingData {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

class BudgetMonitorService {
  
  /**
   * Check if user has exceeded any budget targets and send alerts
   */
  async checkBudgetExceedances(userId: string): Promise<void> {
    try {
      console.log(`🔍 Checking budget exceedances for user: ${userId}`);
      
      // Get user information
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        console.log(`❌ User not found: ${userId}`);
        return;
      }

      // Get user's budget targets from localStorage (we'll need to store this in database later)
      const budgetTargets = await this.getUserBudgetTargets(userId);
      
      // Calculate current spending
      const spendingData = await this.calculateCurrentSpending(userId);
      
      // Check each budget type for exceedances
      await this.checkBudgetType(userId, user, 'daily', budgetTargets.daily, spendingData.daily);
      await this.checkBudgetType(userId, user, 'weekly', budgetTargets.weekly, spendingData.weekly);
      await this.checkBudgetType(userId, user, 'monthly', budgetTargets.monthly, spendingData.monthly);
      await this.checkBudgetType(userId, user, 'yearly', budgetTargets.yearly, spendingData.yearly);
      
    } catch (error) {
      console.error('❌ Error checking budget exceedances:', error);
    }
  }

  /**
   * Check a specific budget type for exceedance
   */
  private async checkBudgetType(
    userId: string, 
    user: any, 
    budgetType: 'daily' | 'weekly' | 'monthly' | 'yearly',
    targetAmount: number,
    actualAmount: number
  ): Promise<void> {
    
    if (targetAmount <= 0) {
      console.log(`⏭️ No ${budgetType} budget target set for user ${userId}`);
      return;
    }

    if (actualAmount <= targetAmount) {
      console.log(`✅ ${budgetType} budget within limits for user ${userId}: $${actualAmount} / $${targetAmount}`);
      return;
    }

    const exceedanceAmount = actualAmount - targetAmount;
    const exceedancePercentage = (exceedanceAmount / targetAmount) * 100;
    const period = this.getPeriodString(budgetType);

    console.log(`🚨 ${budgetType} budget exceeded for user ${userId}: $${actualAmount} / $${targetAmount} (${exceedancePercentage.toFixed(1)}% over)`);

    // Check if we've already sent an alert recently to avoid spam
    const alertKey = `${userId}-${budgetType}-${this.getPeriodKey(budgetType)}`;
    const lastAlertSent = await this.getLastAlertTime(alertKey);
    
    if (lastAlertSent && this.isRecentAlert(lastAlertSent, budgetType)) {
      console.log(`⏭️ Recent alert already sent for ${budgetType} budget exceedance`);
      return;
    }

    // Send email alert
    const alert: BudgetExceedanceAlert = {
      userId: userId,
      userEmail: user.email,
      userName: user.name || user.email.split('@')[0],
      budgetType: budgetType,
      targetAmount: targetAmount,
      actualAmount: actualAmount,
      exceedanceAmount: exceedanceAmount,
      exceedancePercentage: exceedancePercentage,
      period: period
    };

    const emailSent = await emailService.sendBudgetExceedanceAlert(alert);
    
    if (emailSent) {
      // Record that we sent an alert
      await this.recordAlertSent(alertKey);
      console.log(`✅ ${budgetType} budget exceedance alert sent to ${user.email}`);
    }
  }

  /**
   * Get user's budget targets from database
   */
  async getUserBudgetTargets(userId: string): Promise<BudgetTargets> {
    try {
      // Fetch budget targets from database
      const budgetTarget = await prisma.budgetTarget.findUnique({
        where: { userId }
      });
      
      if (budgetTarget) {
        return {
          daily: Number(budgetTarget.dailyLimit),
          weekly: Number(budgetTarget.weeklyLimit),
          monthly: Number(budgetTarget.monthlyLimit),
          yearly: Number(budgetTarget.yearlyLimit)
        };
      }
      
      // Create default budget targets if none exist
      const newTarget = await prisma.budgetTarget.create({
        data: {
          userId,
          dailyLimit: 100,
          weeklyLimit: 700,
          monthlyLimit: 3000,
          yearlyLimit: 36000
        }
      });
      
      return {
        daily: Number(newTarget.dailyLimit),
        weekly: Number(newTarget.weeklyLimit),
        monthly: Number(newTarget.monthlyLimit),
        yearly: Number(newTarget.yearlyLimit)
      };
    } catch (error) {
      console.error('❌ Error fetching budget targets:', error);
      // Return defaults if database fails
      return {
        daily: 100,
        weekly: 700,
        monthly: 3000,
        yearly: 36000
      };
    }
  }

  /**
   * Calculate current spending for different time periods
   */
  async calculateCurrentSpending(userId: string): Promise<SpendingData> {
    const now = dayjs();
    
    // Calculate daily spending (today)
    const dailyStart = now.startOf('day').toDate();
    const dailyEnd = now.endOf('day').toDate();
    const dailySpending = await this.getSpendingInPeriod(userId, dailyStart, dailyEnd);
    
    // Calculate weekly spending (current week)
    const weeklyStart = now.startOf('week').toDate();
    const weeklyEnd = now.endOf('week').toDate();
    const weeklySpending = await this.getSpendingInPeriod(userId, weeklyStart, weeklyEnd);
    
    // Calculate monthly spending (current month)
    const monthlyStart = now.startOf('month').toDate();
    const monthlyEnd = now.endOf('month').toDate();
    const monthlySpending = await this.getSpendingInPeriod(userId, monthlyStart, monthlyEnd);
    
    // Calculate yearly spending (current year)
    const yearlyStart = now.startOf('year').toDate();
    const yearlyEnd = now.endOf('year').toDate();
    const yearlySpending = await this.getSpendingInPeriod(userId, yearlyStart, yearlyEnd);
    
    return {
      daily: dailySpending,
      weekly: weeklySpending,
      monthly: monthlySpending,
      yearly: yearlySpending
    };
  }

  /**
   * Get spending amount for a specific time period
   */
  private async getSpendingInPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: userId,
          date: {
            gte: startDate,
            lte: endDate
          },
          amount: {
            gt: 0 // Only expenses (positive amounts represent spending)
          }
        }
      });

      // Sum up the expenses
      const totalSpending = transactions.reduce((sum, transaction) => {
        return sum + Number(transaction.amount);
      }, 0);

      console.log(`💰 [Budget] Spending in period ${startDate.toISOString()} to ${endDate.toISOString()}: $${totalSpending} (${transactions.length} transactions)`);
      return totalSpending;
    } catch (error) {
      console.error('❌ Error calculating spending:', error);
      return 0;
    }
  }

  /**
   * Get a human-readable period string
   */
  private getPeriodString(budgetType: string): string {
    const now = dayjs();
    
    switch (budgetType) {
      case 'daily':
        return `Today (${now.format('MMM DD, YYYY')})`;
      case 'weekly':
        return `This Week (${now.startOf('week').format('MMM DD')} - ${now.endOf('week').format('MMM DD, YYYY')})`;
      case 'monthly':
        return now.format('MMMM YYYY');
      case 'yearly':
        return now.format('YYYY');
      default:
        return 'Current Period';
    }
  }

  /**
   * Get a unique key for the current period (for tracking sent alerts)
   */
  private getPeriodKey(budgetType: string): string {
    const now = dayjs();
    
    switch (budgetType) {
      case 'daily':
        return now.format('YYYY-MM-DD');
      case 'weekly':
        return now.format('YYYY-[W]WW');
      case 'monthly':
        return now.format('YYYY-MM');
      case 'yearly':
        return now.format('YYYY');
      default:
        return now.format('YYYY-MM-DD');
    }
  }

  /**
   * Check if we've sent a recent alert to avoid spam
   */
  private async getLastAlertTime(alertKey: string): Promise<Date | null> {
    try {
      const parts = alertKey.split('-');
      const userId = parts[0];
      const budgetType = parts[1];
      const periodKey = parts.slice(2).join('-'); // Handle period keys with dashes
      
      if (!userId || !budgetType || !periodKey) {
        console.error('❌ Invalid alert key format:', alertKey);
        return null;
      }
      
      const alert = await prisma.budgetAlert.findUnique({
        where: {
          userId_budgetType_periodKey: {
            userId,
            budgetType,
            periodKey
          }
        }
      });
      
      return alert ? alert.sentAt : null;
    } catch (error) {
      console.error('❌ Error getting last alert time:', error);
      return null;
    }
  }

  /**
   * Check if an alert was sent recently
   */
  private isRecentAlert(lastAlertSent: Date, budgetType: string): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - lastAlertSent.getTime();
    
    // Don't send alerts more than once per period
    switch (budgetType) {
      case 'daily':
        return timeDiff < 24 * 60 * 60 * 1000; // 24 hours
      case 'weekly':
        return timeDiff < 7 * 24 * 60 * 60 * 1000; // 7 days
      case 'monthly':
        return timeDiff < 30 * 24 * 60 * 60 * 1000; // 30 days
      case 'yearly':
        return timeDiff < 365 * 24 * 60 * 60 * 1000; // 365 days
      default:
        return timeDiff < 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Record that an alert was sent
   */
  private async recordAlertSent(alertKey: string): Promise<void> {
    try {
      const parts = alertKey.split('-');
      const userId = parts[0];
      const budgetType = parts[1];
      const periodKey = parts.slice(2).join('-'); // Handle period keys with dashes
      
      if (!userId || !budgetType || !periodKey) {
        console.error('❌ Invalid alert key format:', alertKey);
        return;
      }
      
      await prisma.budgetAlert.upsert({
        where: {
          userId_budgetType_periodKey: {
            userId,
            budgetType,
            periodKey
          }
        },
        create: {
          userId,
          budgetType,
          periodKey
        },
        update: {
          sentAt: new Date()
        }
      });
      
      console.log(`📝 Alert recorded: ${alertKey} at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('❌ Error recording alert:', error);
    }
  }

  /**
   * Run budget monitoring for all active users
   */
  async runBudgetMonitoringForAllUsers(): Promise<void> {
    try {
      console.log('🔄 Starting budget monitoring for all users...');
      
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true }
      });

      console.log(`📊 Found ${users.length} users to monitor`);

      for (const user of users) {
        await this.checkBudgetExceedances(user.id);
        // Add a small delay to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('✅ Budget monitoring completed for all users');
    } catch (error) {
      console.error('❌ Error running budget monitoring:', error);
    }
  }
}

export const budgetMonitorService = new BudgetMonitorService();
