import * as nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export interface BudgetExceedanceAlert {
  userId: string;
  userEmail: string;
  userName?: string;
  budgetType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  targetAmount: number;
  actualAmount: number;
  exceedanceAmount: number;
  exceedancePercentage: number;
  period: string; // e.g., "January 2024", "Week 3", "Today"
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter using Gmail SMTP (you can configure other providers)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });
  }

  async sendBudgetExceedanceAlert(alert: BudgetExceedanceAlert): Promise<boolean> {
    try {
      const subject = `🚨 Budget Alert: ${alert.budgetType.charAt(0).toUpperCase() + alert.budgetType.slice(1)} Target Exceeded`;
      
      const htmlContent = this.generateBudgetAlertHTML(alert);
      const textContent = this.generateBudgetAlertText(alert);

      const mailOptions = {
        from: `"AI Finance Tracker" <${process.env.EMAIL_USER || 'noreply@finance-tracker.com'}>`,
        to: alert.userEmail,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Budget exceedance email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send budget exceedance email:', error);
      return false;
    }
  }

  private generateBudgetAlertHTML(alert: BudgetExceedanceAlert): string {
    const budgetTypeFormatted = alert.budgetType.charAt(0).toUpperCase() + alert.budgetType.slice(1);
    const exceedanceColor = alert.exceedancePercentage > 50 ? '#dc2626' : '#f59e0b';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Budget Alert</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .budget-stats { display: flex; justify-content: space-between; margin: 20px 0; }
            .stat { text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-value { font-size: 24px; font-weight: bold; color: ${exceedanceColor}; }
            .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 Budget Alert</h1>
                <p>AI Finance Tracker Notification</p>
            </div>
            <div class="content">
                <h2>Hello ${alert.userName || 'User'}!</h2>
                <p>We wanted to let you know that you've exceeded your <strong>${budgetTypeFormatted} Budget</strong> for ${alert.period}.</p>
                
                <div class="alert-box">
                    <h3>⚠️ Budget Exceedance Details</h3>
                    <p><strong>Budget Type:</strong> ${budgetTypeFormatted}</p>
                    <p><strong>Period:</strong> ${alert.period}</p>
                    <p><strong>Target Amount:</strong> $${alert.targetAmount.toLocaleString()}</p>
                    <p><strong>Actual Spending:</strong> $${alert.actualAmount.toLocaleString()}</p>
                    <p><strong>Exceeded by:</strong> $${alert.exceedanceAmount.toLocaleString()} (${alert.exceedancePercentage.toFixed(1)}%)</p>
                </div>

                <div class="budget-stats">
                    <div class="stat">
                        <div class="stat-value">$${alert.targetAmount.toLocaleString()}</div>
                        <div class="stat-label">Budget Target</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" style="color: ${exceedanceColor};">$${alert.actualAmount.toLocaleString()}</div>
                        <div class="stat-label">Actual Spending</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value" style="color: ${exceedanceColor};">+${alert.exceedancePercentage.toFixed(1)}%</div>
                        <div class="stat-label">Over Budget</div>
                    </div>
                </div>

                <h3>💡 What you can do:</h3>
                <ul>
                    <li>Review your recent transactions to identify unnecessary expenses</li>
                    <li>Consider adjusting your budget for the remaining period</li>
                    <li>Use our AI insights to get personalized saving recommendations</li>
                    <li>Set up alerts for upcoming budget milestones</li>
                </ul>

                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/transactions" class="cta-button">
                    View Your Transactions
                </a>

                <div class="footer">
                    <p>This is an automated message from AI Finance Tracker.</p>
                    <p>To manage your notification preferences, visit your account settings.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateBudgetAlertText(alert: BudgetExceedanceAlert): string {
    const budgetTypeFormatted = alert.budgetType.charAt(0).toUpperCase() + alert.budgetType.slice(1);
    
    return `
Budget Alert - ${budgetTypeFormatted} Target Exceeded

Hello ${alert.userName || 'User'}!

You've exceeded your ${budgetTypeFormatted} Budget for ${alert.period}.

BUDGET DETAILS:
- Budget Type: ${budgetTypeFormatted}
- Period: ${alert.period}
- Target Amount: $${alert.targetAmount.toLocaleString()}
- Actual Spending: $${alert.actualAmount.toLocaleString()}
- Exceeded by: $${alert.exceedanceAmount.toLocaleString()} (${alert.exceedancePercentage.toFixed(1)}%)

WHAT YOU CAN DO:
- Review your recent transactions
- Consider adjusting your budget
- Use AI insights for saving recommendations
- Set up budget milestone alerts

View your transactions: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/transactions

---
This is an automated message from AI Finance Tracker.
To manage notification preferences, visit your account settings.
    `;
  }

  // Test email functionality
  async sendTestEmail(to: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"AI Finance Tracker" <${process.env.EMAIL_USER || 'noreply@finance-tracker.com'}>`,
        to: to,
        subject: 'AI Finance Tracker - Test Email',
        text: 'This is a test email from AI Finance Tracker. If you receive this, email notifications are working correctly!',
        html: '<h2>AI Finance Tracker - Test Email</h2><p>This is a test email from AI Finance Tracker. If you receive this, email notifications are working correctly!</p>'
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Test email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
