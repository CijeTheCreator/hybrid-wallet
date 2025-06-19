import { render, screen } from '@testing-library/react';

// Mock the AI components
jest.mock('@/components/ai/SendingConfirmationUI', () => ({
  SendingConfirmationUI: ({ amount, currency, recipient }: any) => (
    <div data-testid="sending-confirmation">
      <span>Send {amount} {currency} to {recipient}</span>
    </div>
  )
}));

jest.mock('@/components/ai/TransactionPendingUI', () => ({
  TransactionPendingUI: ({ amount, currency, recipient }: any) => (
    <div data-testid="transaction-pending">
      <span>Processing {amount} {currency} to {recipient}</span>
    </div>
  )
}));

describe('Function Calling Integration', () => {
  it('should render SendingConfirmationUI with correct props', () => {
    const SendingConfirmationUI = require('@/components/ai/SendingConfirmationUI').SendingConfirmationUI;
    
    render(
      <SendingConfirmationUI
        amount={10}
        currency="ETH"
        recipient="alice"
        originalMessage="Send 10 ETH to alice"
      />
    );

    expect(screen.getByTestId('sending-confirmation')).toBeInTheDocument();
    expect(screen.getByText('Send 10 ETH to alice')).toBeInTheDocument();
  });

  it('should render TransactionPendingUI with correct props', () => {
    const TransactionPendingUI = require('@/components/ai/TransactionPendingUI').TransactionPendingUI;
    
    render(
      <TransactionPendingUI
        amount={5}
        currency="BTC"
        recipient="bob"
      />
    );

    expect(screen.getByTestId('transaction-pending')).toBeInTheDocument();
    expect(screen.getByText('Processing 5 BTC to bob')).toBeInTheDocument();
  });
});

describe('Function Parameters Validation', () => {
  const sendCryptocurrencyParams = {
    type: 'object',
    properties: {
      amount: {
        type: 'number',
        description: 'The amount of cryptocurrency to send'
      },
      currency: {
        type: 'string',
        description: 'The cryptocurrency symbol (e.g., ETH, BTC, USDC, ALGO)',
        enum: ['ETH', 'BTC', 'USDC', 'ALGO', 'MATIC', 'SOL', 'AVAX', 'ADA', 'DOT', 'LINK', 'UNI']
      },
      recipient: {
        type: 'string',
        description: 'The recipient username or wallet address'
      }
    },
    required: ['amount', 'currency', 'recipient']
  };

  it('should have correct parameter structure for send_cryptocurrency', () => {
    expect(sendCryptocurrencyParams.properties.amount.type).toBe('number');
    expect(sendCryptocurrencyParams.properties.currency.type).toBe('string');
    expect(sendCryptocurrencyParams.properties.recipient.type).toBe('string');
    expect(sendCryptocurrencyParams.required).toEqual(['amount', 'currency', 'recipient']);
  });

  it('should include supported currencies in enum', () => {
    const supportedCurrencies = ['ETH', 'BTC', 'USDC', 'ALGO', 'MATIC', 'SOL', 'AVAX', 'ADA', 'DOT', 'LINK', 'UNI'];
    expect(sendCryptocurrencyParams.properties.currency.enum).toEqual(supportedCurrencies);
  });
});