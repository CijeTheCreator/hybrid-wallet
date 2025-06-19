'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface TransactionPendingUIProps {
  amount: number;
  currency: string;
  recipient: string;
}

type TransactionStatus = 'pending' | 'completed' | 'failed';

export function TransactionPendingUI({
  amount,
  currency,
  recipient
}: TransactionPendingUIProps) {
  const [status, setStatus] = useState<TransactionStatus>('pending');
  const [progress, setProgress] = useState(0);
  const [txHash] = useState(`0x${Math.random().toString(16).substr(2, 64)}`);

  useEffect(() => {
    // Simulate transaction progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setStatus('completed');
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    // Simulate random failure (10% chance)
    const failureTimeout = setTimeout(() => {
      if (Math.random() < 0.1) {
        setStatus('failed');
        clearInterval(interval);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(failureTimeout);
    };
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          title: 'Transaction Pending',
          subtitle: 'Processing your transaction...',
          bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
          borderColor: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          progressColor: 'bg-gradient-to-r from-yellow-400 to-orange-500'
        };
      case 'completed':
        return {
          icon: Check,
          title: 'Transaction Completed',
          subtitle: 'Your transaction was successful!',
          bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          progressColor: 'bg-gradient-to-r from-green-400 to-emerald-500'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          title: 'Transaction Failed',
          subtitle: 'There was an issue processing your transaction',
          bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          progressColor: 'bg-gradient-to-r from-red-400 to-pink-500'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-6 max-w-md mx-auto shadow-lg`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className={`w-10 h-10 ${config.iconBg} rounded-full flex items-center justify-center`}>
          <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{config.title}</h3>
          <p className="text-sm text-gray-600">{config.subtitle}</p>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {amount} {currency}
          </div>
          <div className="text-sm text-gray-600">
            Sent to {recipient}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {status === 'pending' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full ${config.progressColor} transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Transaction Hash */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
            <p className="text-xs font-mono text-gray-700 break-all">
              {txHash.slice(0, 20)}...{txHash.slice(-10)}
            </p>
          </div>
          <button
            onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status-specific content */}
      {status === 'completed' && (
        <div className="text-center">
          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200">
            View Transaction Details
          </button>
        </div>
      )}

      {status === 'failed' && (
        <div className="space-y-2">
          <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200">
            Try Again
          </button>
          <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200">
            Contact Support
          </button>
        </div>
      )}

      {/* Estimated time */}
      {status === 'pending' && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Estimated completion: 2-5 minutes
          </p>
        </div>
      )}
    </div>
  );
}