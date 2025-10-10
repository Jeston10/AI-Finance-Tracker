import { io, Socket } from 'socket.io-client';
import { config } from './config';

const API_BASE_URL = config.apiUrl;

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  currency: string;
  category?: string;
  date: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: number;
  year: number;
  totalLimit: number;
  suggestions?: any;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateTransactionData {
  description: string;
  amount: number;
  currency?: string;
  date?: string;
}

export interface CreateBudgetData {
  month: number;
  year: number;
  totalLimit: number;
}

export interface SavingsProjection {
  series: Array<{ period: string; amount: number }>;
  advice?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  socket: Socket | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Try to get token from localStorage first, then from cookies
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      // If no token in localStorage, try to read from cookie
      if (!this.token) {
        const cookieToken = this.getTokenFromCookie();
        if (cookieToken) {
          this.token = cookieToken;
          localStorage.setItem('auth_token', cookieToken);
        }
      }
    }
  }

  private getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth-token') {
        return value;
      }
    }
    return null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async signup(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      // Set cookie for middleware authentication
      document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // Clear the auth cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
    this.disconnectSocket();
  }

  // Transaction methods
  async createTransaction(data: CreateTransactionData): Promise<{ transaction: Transaction }> {
    return this.request<{ transaction: Transaction }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactions(): Promise<{ transactions: Transaction[] }> {
    return this.request<{ transactions: Transaction[] }>('/transactions');
  }

  // Budget methods
  async createBudget(data: CreateBudgetData): Promise<{ budget: Budget }> {
    return this.request<{ budget: Budget }>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBudgets(): Promise<{ budgets: Budget[] }> {
    return this.request<{ budgets: Budget[] }>('/budgets');
  }

  // Insights methods
  async getSavingsProjection(monthlyTarget?: number): Promise<SavingsProjection> {
    const url = monthlyTarget 
      ? `/insights/savings-projection?monthlyTarget=${monthlyTarget}`
      : '/insights/savings-projection';
    return this.request<SavingsProjection>(url);
  }

  // Socket.io methods for real-time updates
  connectSocket(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (!this.token) {
      throw new Error('No authentication token available');
    }

    this.socket = io(config.socketUrl, {
      auth: {
        token: this.token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Real-time event listeners
  onTransactionCreated(callback: (transaction: Transaction) => void): void {
    if (!this.socket) {
      this.connectSocket();
    }
    // Remove existing listeners first to prevent duplicates
    this.socket?.off('transaction:created');
    this.socket?.on('transaction:created', callback);
  }

  onTransactionUpdated(callback: (transaction: Transaction) => void): void {
    if (!this.socket) {
      this.connectSocket();
    }
    // Remove existing listeners first to prevent duplicates
    this.socket?.off('transaction:updated');
    this.socket?.on('transaction:updated', callback);
  }

  onBudgetUpdated(callback: (budget: Budget) => void): void {
    if (!this.socket) {
      this.connectSocket();
    }
    // Remove existing listeners first to prevent duplicates
    this.socket?.off('budget:updated');
    this.socket?.on('budget:updated', callback);
  }

  // Budget monitoring methods
  async checkBudgetExceedances(): Promise<any> {
    try {
      const response = await this.request('/budget-monitoring/check-budget', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Failed to check budget exceedances:', error);
      throw error;
    }
  }

  async getSpendingSummary(): Promise<any> {
    try {
      const response = await this.request('/budget-monitoring/spending-summary', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Failed to get spending summary:', error);
      throw error;
    }
  }

  async sendTestEmail(): Promise<any> {
    try {
      const response = await this.request('/budget-monitoring/test-email', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Failed to send test email:', error);
      throw error;
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('current_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  setCurrentUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_user', JSON.stringify(user));
    }
  }

  clearCurrentUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_user');
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
