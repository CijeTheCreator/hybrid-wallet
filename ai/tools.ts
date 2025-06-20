import { tool as createTool } from 'ai';
import { z } from 'zod';

// Cryptocurrency sending tool
export const sendCryptocurrencyTool = createTool({
  description: 'Process a cryptocurrency sending request',
  parameters: z.object({
    amount: z.number().describe('The amount of cryptocurrency to send'),
    currency: z.string().describe('The cryptocurrency symbol (e.g., ETH, BTC, USDC, ALGO)'),
    recipient: z.string().describe('The recipient username or wallet address'),
  }),
  execute: async function ({ amount, currency, recipient }) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return transaction data
    return {
      amount,
      currency,
      recipient,
      transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };
  },
});

// General wallet information tool
export const getWalletInfoTool = createTool({
  description: 'Get wallet balance and information',
  parameters: z.object({
    query: z.string().describe('The type of wallet information requested'),
  }),
  execute: async function ({ query }) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock wallet data
    const walletData = {
      balances: {
        ETH: { amount: 2.45, value: 8575.00 },
        USDC: { amount: 1234.56, value: 1234.56 },
        ALGO: { amount: 500.00, value: 150.00 },
        BTC: { amount: 0.15, value: 6750.00 },
      },
      totalValue: 16709.56,
      recentTransactions: [
        { id: '1', type: 'received', amount: 10, currency: 'ETH', from: 'alice_crypto' },
        { id: '2', type: 'sent', amount: 500, currency: 'USDC', to: 'bob_trader' },
      ]
    };
    
    return { query, data: walletData };
  },
});

// Swap cryptocurrency tool
export const swapCryptocurrencyTool = createTool({
  description: 'Swap between different cryptocurrencies',
  parameters: z.object({
    fromCurrency: z.string().describe('The currency to swap from'),
    toCurrency: z.string().describe('The currency to swap to'),
    amount: z.number().describe('The amount to swap'),
  }),
  execute: async function ({ fromCurrency, toCurrency, amount }) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock exchange rate calculation
    const exchangeRate = Math.random() * 0.1 + 0.95; // Simulate 95-105% rate
    const receivedAmount = amount * exchangeRate;
    
    return {
      fromCurrency,
      toCurrency,
      fromAmount: amount,
      toAmount: receivedAmount,
      exchangeRate,
      transactionId: `swap_${Date.now()}`,
      status: 'pending',
    };
  },
});

// Export all tools
export const tools = {
  sendCryptocurrency: sendCryptocurrencyTool,
  getWalletInfo: getWalletInfoTool,
  swapCryptocurrency: swapCryptocurrencyTool,
};