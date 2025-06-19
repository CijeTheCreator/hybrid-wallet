import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SendingConfirmationUI } from '@/components/ai/SendingConfirmationUI';

// Mock the useActions hook
jest.mock('ai/rsc', () => ({
  useActions: () => ({
    confirmTransaction: jest.fn().mockResolvedValue({}),
  }),
}));

describe('SendingConfirmationUI', () => {
  const defaultProps = {
    amount: 10,
    currency: 'ETH',
    recipient: 'alice_crypto',
    originalMessage: 'Send 10 ETH to @alice_crypto',
  };

  it('renders transaction details correctly', () => {
    render(<SendingConfirmationUI {...defaultProps} />);
    
    expect(screen.getByText('Confirm Transaction')).toBeInTheDocument();
    expect(screen.getByText('10 ETH')).toBeInTheDocument();
    expect(screen.getByText('alice_crypto')).toBeInTheDocument();
    expect(screen.getByText('~$2.50')).toBeInTheDocument();
  });

  it('parses amount and currency from message when not provided', () => {
    render(
      <SendingConfirmationUI
        originalMessage="Send 5.5 BTC to @bob_trader"
        amount={undefined}
        currency={undefined}
        recipient={undefined}
      />
    );
    
    expect(screen.getByText('5.5 BTC')).toBeInTheDocument();
  });

  it('handles confirm button click', async () => {
    render(<SendingConfirmationUI {...defaultProps} />);
    
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  it('handles cancel button click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<SendingConfirmationUI {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Transaction declined');
    consoleSpy.mockRestore();
  });

  it('displays security notice', () => {
    render(<SendingConfirmationUI {...defaultProps} />);
    
    expect(screen.getByText(/This transaction will be processed securely/)).toBeInTheDocument();
  });
});