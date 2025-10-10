"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, Transaction, Budget, User, CreateTransactionData, CreateBudgetData } from '../api-client';

interface AppContextType {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Data state
  transactions: Transaction[];
  budgets: Budget[];
  isCreatingTransaction: boolean;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  
  // Data methods
  createTransaction: (data: CreateTransactionData) => Promise<void>;
  createBudget: (data: CreateBudgetData) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshBudgets: () => Promise<void>;
  
  // Real-time updates
  subscribeToUpdates: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);

  // Initialize app state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is already authenticated
        const currentUser = apiClient.getCurrentUser();
        if (currentUser && apiClient.isAuthenticated()) {
          setUser(currentUser);
          setIsAuthenticated(true);
          
          // Load user data
          await Promise.all([
            loadTransactions(),
            loadBudgets(),
          ]);
          
          // Subscribe to real-time updates
          subscribeToUpdates();
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Clear invalid auth state
        apiClient.clearToken();
        apiClient.clearCurrentUser();
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await apiClient.getTransactions();
      setTransactions(response.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const loadBudgets = async () => {
    try {
      const response = await apiClient.getBudgets();
      setBudgets(response.budgets);
    } catch (error) {
      console.error('Failed to load budgets:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      apiClient.setCurrentUser(response.user);
      
      // Load user data
      await Promise.all([
        loadTransactions(),
        loadBudgets(),
      ]);
      
      // Subscribe to real-time updates
      subscribeToUpdates();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.signup(email, password, name);
      setUser(response.user);
      setIsAuthenticated(true);
      apiClient.setCurrentUser(response.user);
      
      // Load user data
      await Promise.all([
        loadTransactions(),
        loadBudgets(),
      ]);
      
      // Subscribe to real-time updates
      subscribeToUpdates();
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setTransactions([]);
    setBudgets([]);
    apiClient.clearToken();
    apiClient.clearCurrentUser();
    apiClient.disconnectSocket();
  };

  const createTransaction = async (data: CreateTransactionData) => {
    // Prevent multiple simultaneous submissions
    if (isCreatingTransaction) {
      console.log('Transaction creation already in progress, ignoring duplicate request');
      return;
    }

    try {
      setIsCreatingTransaction(true);
      console.log('Creating transaction:', data);
      
      // Add transaction immediately to local state to prevent UI delay
      const tempTransaction = {
        id: `temp-${Date.now()}`, // Temporary ID
        userId: user?.id || '',
        description: data.description,
        amount: data.amount,
        currency: data.currency || 'USD',
        category: null,
        date: data.date || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Add temporary transaction to state
      setTransactions(prev => [tempTransaction as Transaction, ...prev]);
      
      const response = await apiClient.createTransaction(data);
      console.log('Transaction created successfully:', response.transaction);
      
      // Replace temporary transaction with real one
      setTransactions(prev => 
        prev.map(t => 
          t.id === tempTransaction.id ? response.transaction : t
        )
      );
      
    } catch (error) {
      console.error('Failed to create transaction:', error);
      
      // Remove temporary transaction on error
      setTransactions(prev => 
        prev.filter(t => t.id.startsWith('temp-'))
      );
      
      throw error;
    } finally {
      setIsCreatingTransaction(false);
    }
  };

  const createBudget = async (data: CreateBudgetData) => {
    try {
      const response = await apiClient.createBudget(data);
      setBudgets(prev => [response.budget, ...prev]);
    } catch (error) {
      console.error('Failed to create budget:', error);
      throw error;
    }
  };

  const refreshTransactions = async () => {
    await loadTransactions();
  };

  const refreshBudgets = async () => {
    await loadBudgets();
  };

  const subscribeToUpdates = () => {
    try {
      // Only subscribe if not already connected
      if (!apiClient.socket?.connected) {
        apiClient.connectSocket();
      }

      // Subscribe to real-time transaction updates with deduplication
      apiClient.onTransactionCreated((transaction: Transaction) => {
        console.log('Real-time transaction received:', transaction);
        setTransactions(prev => {
          // Check if transaction already exists to prevent duplicates
          const exists = prev.some(t => t.id === transaction.id);
          if (exists) {
            console.log('Transaction already exists, skipping duplicate');
            return prev;
          }
          
          // Check if this is a temporary transaction that should be replaced
          const tempTransaction = prev.find(t => t.id.startsWith('temp-'));
          if (tempTransaction) {
            console.log('Replacing temporary transaction with real one');
            return prev.map(t => t.id === tempTransaction.id ? transaction : t);
          }
          
          console.log('Adding new transaction to state');
          return [transaction, ...prev];
        });
      });

      apiClient.onTransactionUpdated((transaction: Transaction) => {
        setTransactions(prev => 
          prev.map(t => t.id === transaction.id ? transaction : t)
        );
      });

      apiClient.onBudgetUpdated((budget: Budget) => {
        setBudgets(prev => 
          prev.map(b => b.id === budget.id ? budget : b)
        );
      });
    } catch (error) {
      console.error('Failed to subscribe to real-time updates:', error);
    }
  };

  const value: AppContextType = {
    user,
    isAuthenticated,
    isLoading,
    transactions,
    budgets,
    isCreatingTransaction,
    login,
    signup,
    logout,
    createTransaction,
    createBudget,
    refreshTransactions,
    refreshBudgets,
    subscribeToUpdates,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
