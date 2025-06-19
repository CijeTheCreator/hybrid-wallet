import { render, screen, waitFor } from '@testing-library/react';
import { TransactionPendingUI } from '@/components/ai/TransactionPendingUI';

// Mock Math.random to control test behavior
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5; // Always return 0.5 to avoid random failures
global.Math = mockMath;

describe('TransactionPendingUI', () => {
  const defaultProps = {
    amount: 10,
    currency: 'ETH',
    recipient: 'alice_crypto',
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders transaction details correctly', () => {
    render(<TransactionPendingUI {...defaultProps} />);
    
    expect(screen.getByText('Transaction Pending')).toBeInTheDocument();
    expect(screen.getByText('10 ETH')).toBeInTheDocument();
    expect(screen.getByText('Sent to alice_crypto')).toBeInTheDocument();
  });

  it('shows progress bar initially', () => {
    render(<TransactionPendingUI {...defaultProps} />);
    
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('updates progress over time', async () => {
    render(<TransactionPendingUI {...defaultProps} />);
    
    // Fast-forward time to trigger progress updates
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      const progressText = screen.getByText(/\d+%/);
      expect(progressText).toBeInTheDocument();
    });
  });

  it('displays transaction hash', () => {
    render(<TransactionPendingUI {...defaultProps} />);
    
    expect(screen.getByText('Transaction Hash')).toBeInTheDocument();
    expect(screen.getByText(/0x[a-f0-9]+\.\.\.[a-f0-9]+/)).toBeInTheDocument();
  });

  it('shows estimated completion time', () => {
    render(<TransactionPendingUI {...defaultProps} />);
    
    expect(screen.getByText('Estimated completion: 2-5 minutes')).toBeInTheDocument();
  });

  it('eventually shows completed state', async () => {
    render(<TransactionPendingUI {...defaultProps} />);
    
    // Fast-forward enough time for completion
    jest.advanceTimersByTime(10000);
    
    await waitFor(() => {
      expect(screen.getByText('Transaction Completed')).toBeInTheDocument();
      expect(screen.getByText('View Transaction Details')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});