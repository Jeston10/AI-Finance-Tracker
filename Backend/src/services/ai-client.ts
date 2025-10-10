import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { HfInference } from '@huggingface/inference';
import { env } from '../config/env';

export class AiClientService {
	private openai?: OpenAI;
	private groq?: Groq;
	private hf?: HfInference;

	constructor() {
		console.log('🤖 [AI] Initializing AI services...');
		console.log('🤖 [AI] OpenAI API Key present:', !!env.OPENAI_API_KEY);
		console.log('🤖 [AI] Groq API Key present:', !!env.GROQ_API_KEY);
		console.log('🤖 [AI] Hugging Face API Key present:', !!env.HUGGINGFACE_API_KEY);
		
		if (env.OPENAI_API_KEY) {
			this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
			console.log('✅ [AI] OpenAI client initialized');
		} else {
			console.log('❌ [AI] OpenAI API key missing');
		}
		
		if (env.GROQ_API_KEY) {
			this.groq = new Groq({ apiKey: env.GROQ_API_KEY });
			console.log('✅ [AI] Groq client initialized');
		} else {
			console.log('❌ [AI] Groq API key missing');
		}
		
		if (env.HUGGINGFACE_API_KEY) {
			this.hf = new HfInference(env.HUGGINGFACE_API_KEY);
			console.log('✅ [AI] Hugging Face client initialized');
		} else {
			console.log('❌ [AI] Hugging Face API key missing');
		}
	}

	async classifyTransaction(text: string): Promise<string | null> {
		console.log('🤖 [HF] Starting transaction classification for:', text);
		
		if (!this.hf) {
			console.log('❌ [HF] Hugging Face client not initialized - API key missing or invalid');
			return null;
		}
		
		try {
			const labels = ['groceries', 'rent', 'utilities', 'entertainment', 'transport', 'health', 'other'];
			console.log('🤖 [HF] Calling zero-shot classification with labels:', labels);
			
			const res: any = await this.hf.zeroShotClassification({ 
				model: 'facebook/bart-large-mnli',
				inputs: text, 
				parameters: { candidate_labels: labels } 
			});
			
			console.log('🤖 [HF] Raw response:', JSON.stringify(res, null, 2));
			
			// Handle different response formats
			let result = null;
			if (Array.isArray(res)) {
				// Response is an array
				result = res[0]?.label || null;
			} else if (res.labels && Array.isArray(res.labels)) {
				// Response has labels array
				result = res.labels[0] || null;
			} else if (res.sequence && res.labels) {
				// Alternative format
				result = res.labels[0] || null;
			}
			
			console.log('🤖 [HF] Classification result:', result);
			
			// If AI returns null, use fallback
			if (!result) {
				console.log('🤖 [HF] AI returned null, using fallback categorization...');
				return this.fallbackCategorization(text);
			}
			
			return result;
		} catch (error: unknown) {
			console.error('❌ [HF] Classification error:', error);
			
			// Safely extract error details
			const errorDetails: { message?: string; status?: number; statusText?: string; data?: any } = {};
			if (error instanceof Error) {
				errorDetails.message = error.message;
			}
			if (error && typeof error === 'object' && 'status' in error && typeof (error as any).status === 'number') {
				errorDetails.status = (error as any).status;
			}
			if (error && typeof error === 'object' && 'statusText' in error && typeof (error as any).statusText === 'string') {
				errorDetails.statusText = (error as any).statusText;
			}
			if (error && typeof error === 'object' && 'data' in error) {
				errorDetails.data = (error as any).data;
			}
			
			console.error('❌ [HF] Error details:', errorDetails);
			
			// Fallback to simple keyword-based categorization
			console.log('🤖 [HF] Using fallback categorization...');
			return this.fallbackCategorization(text);
		}
	}

	private fallbackCategorization(text: string): string {
		const lowerText = text.toLowerCase();
		
		// Groceries
		if (lowerText.includes('grocery') || lowerText.includes('food') || lowerText.includes('supermarket') || 
			lowerText.includes('whole foods') || lowerText.includes('walmart') || lowerText.includes('target')) {
			return 'groceries';
		}
		
		// Rent
		if (lowerText.includes('rent') || lowerText.includes('housing') || lowerText.includes('apartment')) {
			return 'rent';
		}
		
		// Utilities
		if (lowerText.includes('electricity') || lowerText.includes('water') || lowerText.includes('gas bill') || 
			lowerText.includes('utility') || lowerText.includes('internet') || lowerText.includes('phone')) {
			return 'utilities';
		}
		
		// Entertainment
		if (lowerText.includes('restaurant') || lowerText.includes('dinner') || lowerText.includes('movie') || 
			lowerText.includes('netflix') || lowerText.includes('entertainment') || lowerText.includes('bar')) {
			return 'entertainment';
		}
		
		// Transport
		if (lowerText.includes('uber') || lowerText.includes('taxi') || lowerText.includes('gas station') || 
			lowerText.includes('fuel') || lowerText.includes('transport') || lowerText.includes('airport')) {
			return 'transport';
		}
		
		// Health
		if (lowerText.includes('doctor') || lowerText.includes('hospital') || lowerText.includes('pharmacy') || 
			lowerText.includes('medical') || lowerText.includes('health')) {
			return 'health';
		}
		
		return 'other';
	}

	async generateBudgetInsights(history: Array<{ date: string; amount: number }>): Promise<string | null> {
		console.log('🤖 [AI] Starting budget insights generation for history:', history);
		
		// Calculate spending patterns for better AI analysis
		const totalSpending = history.reduce((sum, h) => sum + Math.abs(h.amount), 0);
		const avgMonthlySpending = totalSpending / Math.max(history.length, 1);
		const spendingTrend = this.calculateSpendingTrend(history);
		const overspendingMonths = history.filter(h => Math.abs(h.amount) > avgMonthlySpending * 1.2).length;
		
		const analysisContext = {
			totalSpending,
			avgMonthlySpending: Math.round(avgMonthlySpending),
			spendingTrend,
			overspendingMonths,
			historyLength: history.length
		};
		
		console.log('🤖 [AI] Analysis context:', analysisContext);
		
		// Try OpenAI first, then Groq as fallback
		if (this.openai) {
			try {
				console.log('🤖 [OpenAI] Attempting OpenAI...');
				const content = `Analyze this spending data and provide personalized budget advice. 
				
Spending Analysis:
- Total spending: $${totalSpending}
- Average monthly spending: $${Math.round(avgMonthlySpending)}
- Spending trend: ${spendingTrend}
- Months with overspending: ${overspendingMonths}/${history.length}
- Recent spending: ${JSON.stringify(history.slice(-3))}

Provide specific, actionable advice for controlling expenditure and improving financial condition. Format your response as numbered points (1., 2., 3., etc.). Focus on:
1. Identifying overspending patterns
2. Specific budget recommendations
3. Practical tips to reduce expenses
4. How to improve financial health
5. Emergency fund recommendations
6. Investment strategies
7. Debt management tips
8. Lifestyle adjustments
9. Technology tools for budgeting
10. Long-term financial planning

Provide at least 6-10 numbered points with specific, actionable advice.`;

				const chat = await this.openai.chat.completions.create({
					model: 'gpt-4o-mini',
					messages: [
						{ 
							role: 'system', 
							content: 'You are an expert financial advisor. Provide personalized, actionable budget advice based on spending patterns. Be specific and practical.' 
						},
						{ role: 'user', content },
					],
					max_tokens: 800,
				});
				
				const result = chat.choices?.[0]?.message?.content ?? null;
				console.log('✅ [OpenAI] Insights result:', result);
				return result;
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				console.log('❌ [OpenAI] Failed, trying Groq fallback...', errorMessage);
			}
		}
		
		// Fallback to Groq
		if (this.groq) {
			try {
				console.log('🤖 [Groq] Attempting Groq...');
				const content = `Analyze this spending data and provide personalized budget advice. 
				
Spending Analysis:
- Total spending: $${totalSpending}
- Average monthly spending: $${Math.round(avgMonthlySpending)}
- Spending trend: ${spendingTrend}
- Months with overspending: ${overspendingMonths}/${history.length}
- Recent spending: ${JSON.stringify(history.slice(-3))}

Provide specific, actionable advice for controlling expenditure and improving financial condition. Format your response as numbered points (1., 2., 3., etc.). Provide at least 6-10 numbered points with specific, actionable advice.`;

				const chat = await this.groq.chat.completions.create({
					messages: [
						{ 
							role: 'system', 
							content: 'You are an expert financial advisor. Provide personalized, actionable budget advice based on spending patterns. Be specific and practical.' 
						},
						{ role: 'user', content },
					],
					model: 'llama-3.1-8b-instant',
					max_tokens: 800,
				});
				
				const result = chat.choices?.[0]?.message?.content ?? null;
				console.log('✅ [Groq] Insights result:', result);
				return result;
			} catch (error: unknown) {
				console.error('❌ [Groq] Budget insights error:', error);
			}
		}
		
		console.log('❌ [AI] No AI service available for budget insights');
		return null;
	}

	private calculateSpendingTrend(history: Array<{ date: string; amount: number }>): string {
		if (history.length < 2) return 'insufficient data';
		
		const sortedHistory = history.sort((a, b) => a.date.localeCompare(b.date));
		const firstHalf = sortedHistory.slice(0, Math.floor(history.length / 2));
		const secondHalf = sortedHistory.slice(Math.floor(history.length / 2));
		
		const firstHalfAvg = firstHalf.reduce((sum, h) => sum + Math.abs(h.amount), 0) / firstHalf.length;
		const secondHalfAvg = secondHalf.reduce((sum, h) => sum + Math.abs(h.amount), 0) / secondHalf.length;
		
		const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
		
		if (change > 10) return 'increasing';
		if (change < -10) return 'decreasing';
		return 'stable';
	}
}

