'use client';

import { useState } from 'react';
import { TransactionCard } from './TransactionCard';

// Demo logo component (you can replace with actual logos)
const FolksFinanceLogo = () => (
  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-lg">F</span>
  </div>
);

export function TransactionCardDemo() {
  const [currentState, setCurrentState] = useState<'confirmation' | 'scanning' | 'transferring' | 'completed' | 'error'>('confirmation');
  const [showOTP, setShowOTP] = useState(false);
  const [scanResult, setScanResult] = useState<'safe' | 'fraud' | null>(null);

  const transferSteps = [
    { id: '1', text: 'Convert 20 $DOGE to ~60 $USDC', status: 'pending' as const },
    { id: '2', text: 'Convert 40 $SHIBA to ~40 $USDC', status: 'pending' as const },
    { id: '3', text: 'Bridge 100 $USDC to Algorand', status: 'pending' as const },
    { id: '4', text: 'Transfer 100 $USDC to Mike', status: 'pending' as const },
  ];

  const handleConfirm = () => {
    setCurrentState('scanning');
    
    // Simulate scan result after scanning completes
    setTimeout(() => {
      const isFraud = Math.random() < 0.3; // 30% chance of fraud for demo
      setScanResult(isFraud ? 'fraud' : 'safe');
      
      if (!isFraud) {
        setTimeout(() => {
          setShowOTP(true);
        }, 2500);
      }
    }, 5000);
  };

  const handleOTPComplete = (otp: string) => {
    console.log('OTP entered:', otp);
    setShowOTP(false);
    setCurrentState('transferring');
  };

  const handleCancel = () => {
    setCurrentState('confirmation');
    setShowOTP(false);
    setScanResult(null);
  };

  return (
    <div className="space-y-8 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction Card Demo</h2>
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => {
              setCurrentState('confirmation');
              setShowOTP(false);
              setScanResult(null);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reset to Confirmation
          </button>
          <button
            onClick={() => setCurrentState('transferring')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Show Transferring
          </button>
          <button
            onClick={() => setShowOTP(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Show OTP
          </button>
        </div>
      </div>

      {/* Transfer Card */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Transfer Transaction</h3>
        <TransactionCard
          title="TRANSFER TO MIKE"
          amount="$100"
          description="This is how we will send $100 to MIKE"
          steps={transferSteps}
          state={currentState}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          scanResult={scanResult}
          showOTP={showOTP}
          onOTPComplete={handleOTPComplete}
        />
      </div>

      {/* Swap Card */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Swap Transaction</h3>
        <TransactionCard
          title="SWAP ON FOLKS FINANCE"
          amount="100 $DOGE → 20 $ETH"
          description="Swapping on Folks Finance"
          steps={[]}
          state="confirmation"
          logo={<FolksFinanceLogo />}
          onConfirm={() => console.log('Swap confirmed')}
          onCancel={() => console.log('Swap cancelled')}
        />
      </div>
    </div>
  );
}