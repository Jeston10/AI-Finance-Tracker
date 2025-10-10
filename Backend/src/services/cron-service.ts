import cron from 'node-cron';
import { budgetMonitorService } from './budget-monitor-service.js';

class CronService {
  private tasks: cron.ScheduledTask[] = [];

  /**
   * Start all scheduled tasks
   */
  start(): void {
    console.log('🕐 Starting cron jobs for budget monitoring...');

    // Run budget monitoring every hour
    const hourlyTask = cron.schedule('0 * * * *', async () => {
      console.log('⏰ Running hourly budget monitoring...');
      try {
        await budgetMonitorService.runBudgetMonitoringForAllUsers();
      } catch (error) {
        console.error('❌ Error in hourly budget monitoring:', error);
      }
    }, {
      scheduled: false
    });

    // Run budget monitoring every day at 9 AM
    const dailyTask = cron.schedule('0 9 * * *', async () => {
      console.log('⏰ Running daily budget monitoring...');
      try {
        await budgetMonitorService.runBudgetMonitoringForAllUsers();
      } catch (error) {
        console.error('❌ Error in daily budget monitoring:', error);
      }
    }, {
      scheduled: false
    });

    // Run budget monitoring every Monday at 10 AM (weekly check)
    const weeklyTask = cron.schedule('0 10 * * 1', async () => {
      console.log('⏰ Running weekly budget monitoring...');
      try {
        await budgetMonitorService.runBudgetMonitoringForAllUsers();
      } catch (error) {
        console.error('❌ Error in weekly budget monitoring:', error);
      }
    }, {
      scheduled: false
    });

    // Run budget monitoring on the 1st of every month at 11 AM
    const monthlyTask = cron.schedule('0 11 1 * *', async () => {
      console.log('⏰ Running monthly budget monitoring...');
      try {
        await budgetMonitorService.runBudgetMonitoringForAllUsers();
      } catch (error) {
        console.error('❌ Error in monthly budget monitoring:', error);
      }
    }, {
      scheduled: false
    });

    // Store tasks
    this.tasks = [hourlyTask, dailyTask, weeklyTask, monthlyTask];

    // Start all tasks
    this.tasks.forEach(task => task.start());

    console.log('✅ All cron jobs started successfully');
    console.log('📅 Schedule:');
    console.log('   - Hourly budget monitoring: Every hour at minute 0');
    console.log('   - Daily budget monitoring: Every day at 9:00 AM');
    console.log('   - Weekly budget monitoring: Every Monday at 10:00 AM');
    console.log('   - Monthly budget monitoring: 1st of every month at 11:00 AM');
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    console.log('🛑 Stopping all cron jobs...');
    
    this.tasks.forEach(task => {
      task.stop();
    });

    this.tasks = [];
    console.log('✅ All cron jobs stopped');
  }

  /**
   * Get status of all tasks
   */
  getStatus(): { task: string; running: boolean; schedule: string }[] {
    return this.tasks.map((task, index) => {
      const schedules = [
        'Every hour at minute 0',
        'Every day at 9:00 AM',
        'Every Monday at 10:00 AM',
        '1st of every month at 11:00 AM'
      ];
      
      return {
        task: `Task ${index + 1}`,
        running: task.running,
        schedule: schedules[index] || 'Unknown'
      };
    });
  }

  /**
   * Run budget monitoring immediately (for testing)
   */
  async runBudgetMonitoringNow(): Promise<void> {
    console.log('🚀 Running budget monitoring immediately...');
    try {
      await budgetMonitorService.runBudgetMonitoringForAllUsers();
      console.log('✅ Immediate budget monitoring completed');
    } catch (error) {
      console.error('❌ Error in immediate budget monitoring:', error);
      throw error;
    }
  }
}

export const cronService = new CronService();
