'use client';

import { useState } from 'react';
import { ArrowUpDown, Check } from 'lucide-react';

interface SwapInterfaceProps {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  transactionId: string;
  status: string;
}

export function SwapInterface({
  fromCurrency,
  toCurrency,
  fromAmount,
  toAmount,
  exchangeRate,
  transactionId,
  status
}: SwapInterfaceProps) {
  const [isProcessing, setIsProcessing] = useState(status === 'pending');

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 max-w-md mx-auto shadow-lg">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <ArrowUpDown className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Crypto Swap</h3>
          <p className="text-sm text-gray-600">Exchange confirmation</p>
        </div>
      </div>

      {/* Swap Details */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-gray-100">
        <div className="space-y-4">
          {/* From Currency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">{fromCurrency}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">You're swapping</p>
                <p className="font-semibold text-gray-900">{fromAmount} {fromCurrency}</p>
              </div>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ArrowUpDown className="w-4 h-4 text-purple-600" />
            </div>
          </div>

          {/* To Currency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">{toCurrency}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">You'll receive</p>
                <p className="font-semibold text-gray-900">{toAmount.toFixed(6)} {toCurrency}</p>
              </div>
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Exchange Rate</span>
              <span className="text-sm font-medium text-gray-900">
                1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className={`flex items-center justify-center space-x-2 p-3 rounded-lg ${
        isProcessing 
          ? 'bg-yellow-50 border border-yellow-200' 
          : 'bg-green-50 border border-green-200'
      }`}>
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-yellow-800">Processing swap...</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Swap completed!</span>
          </>
        )}
      </div>

      {/* Transaction ID */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
        <p className="text-xs font-mono text-gray-700 break-all">{transactionId}</p>
      </div>
    </div>
  );
}