'use client';

import { useState } from 'react';
import { Check, X, ArrowRight, Wallet } from 'lucide-react';

interface SendingConfirmationUIProps {
  amount?: number;
  currency?: string;
  recipient?: string;
  originalMessage: string;
}

export function SendingConfirmationUI({
  amount,
  currency,
  recipient,
  originalMessage
}: SendingConfirmationUIProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPending, setShowPending] = useState(false);

  // Parse amount and currency from message if not provided
  const parsedAmount = amount || parseFloat(originalMessage.match(/[\d.]+/)?.[0] || '0');
  const parsedCurrency = currency || originalMessage.match(/\b(ETH|BTC|USDC|ALGO)\b/i)?.[0]?.toUpperCase() || 'ETH';
  const parsedRecipient = recipient || originalMessage.match(/@(\w+)/)?.[1] || 'Unknown';

  const handleConfirm = async () => {
    setIsProcessing(true);
    
    // Simulate transaction processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowPending(true);
    }, 2000);
  };

  const handleDecline = () => {
    console.log('Transaction declined');
  };

  if (showPending) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-auto shadow-lg">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Transaction Pending</h3>
            <p className="text-sm text-gray-600">Processing your transaction...</p>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {parsedAmount} {parsedCurrency}
            </div>
            <div className="text-sm text-gray-600">
              Sent to {parsedRecipient}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Estimated completion: 2-5 minutes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 rounded-xl p-6 max-w-md mx-auto shadow-lg">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <Wallet className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Confirm Transaction</h3>
          <p className="text-sm text-gray-600">Review the details below</p>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-gray-100">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="font-semibold text-gray-900">
              {parsedAmount} {parsedCurrency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">To</span>
            <span className="font-semibold text-gray-900">{parsedRecipient}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Network Fee</span>
            <span className="font-semibold text-gray-900">~$2.50</span>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Total</span>
              <span className="font-bold text-gray-900">
                {parsedAmount} {parsedCurrency} + Fee
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleDecline}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-all duration-200 font-medium"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>

        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Confirm</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          🔒 This transaction will be processed securely on the blockchain.
          Please verify all details before confirming.
        </p>
      </div>
    </div>
  );
}