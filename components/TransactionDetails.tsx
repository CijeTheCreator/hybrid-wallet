'use client';

import { useState } from 'react';
import { ArrowLeft, Copy, ExternalLink, Check, Clock, Shield } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { AccountSwitcher } from './AccountSwitcher';

interface TransactionDetailsProps {
  transactionId: string;
}

interface SimpleTransaction {
  id: string;
  type: 'received' | 'sent';
  amount: number;
  currency: string;
  fromAddress: string;
  toAddress: string;
  txHash: string;
  blockNumber: number;
  confirmations: number;
  gasUsed: number;
  gasFee: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  blockchain: 'ethereum' | 'algorand';
}

export function TransactionDetails({ transactionId }: TransactionDetailsProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Mock transaction data - in real app, fetch based on transactionId
  const transaction: SimpleTransaction = {
    id: transactionId,
    type: 'received',
    amount: 10.0,
    currency: 'ETH',
    fromAddress: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
    toAddress: '0x8ba1f109551bD432803012645Hac136c0532925a',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: 18500000,
    confirmations: 12,
    gasUsed: 21000,
    gasFee: 0.002,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: 'completed',
    blockchain: 'ethereum'
  };

  const handleNewChat = () => {
    window.location.href = '/';
  };

  const handleBack = () => {
    window.history.back();
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'received' ? 'text-green-600' : 'text-blue-600';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        expanded={sidebarExpanded} 
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        onNewChat={handleNewChat}
        currentChatId={undefined}
      />
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Account Switcher */}
            <div className="mb-4">
              <AccountSwitcher />
            </div>
            
            <h1 className="text-2xl font-light text-gray-800 mb-2">Transaction Details</h1>
            <p className="text-gray-600">Complete information about this transaction</p>
          </div>

          {/* Transaction Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    transaction.type === 'received' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <span className="text-2xl">
                      {transaction.type === 'received' ? '📥' : '📤'}
                    </span>
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'received' ? 'Received' : 'Sent'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {transaction.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-2xl font-bold ${getTypeColor(transaction.type)}`}>
                      {transaction.type === 'received' ? '+' : '-'}{transaction.amount}
                    </span>
                    <span className="text-lg font-medium text-gray-600 uppercase">
                      {transaction.currency}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status === 'completed' && <Check className="w-3 h-3 mr-1" />}
                    {transaction.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {transaction.status === 'failed' && <Shield className="w-3 h-3 mr-1" />}
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6 space-y-6">
              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">From Address</h3>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-mono text-gray-900 flex-1">
                      {truncateAddress(transaction.fromAddress)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(transaction.fromAddress, 'from')}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedField === 'from' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">To Address</h3>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-mono text-gray-900 flex-1">
                      {truncateAddress(transaction.toAddress)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(transaction.toAddress, 'to')}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedField === 'to' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transaction Hash */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Transaction Hash</h3>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <code className="text-sm font-mono text-gray-900 flex-1 break-all">
                    {transaction.txHash}
                  </code>
                  <button
                    onClick={() => copyToClipboard(transaction.txHash, 'hash')}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    {copiedField === 'hash' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => window.open(`https://etherscan.io/tx/${transaction.txHash}`, '_blank')}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Transaction Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Block Number
                  </h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {transaction.blockNumber.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Confirmations
                  </h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {transaction.confirmations}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Gas Used
                  </h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {transaction.gasUsed.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Gas Fee
                  </h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {transaction.gasFee} ETH
                  </p>
                </div>
              </div>

              {/* Blockchain Info */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">Ξ</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900">Ethereum Network</h4>
                    <p className="text-sm text-blue-700">Mainnet</p>
                  </div>
                </div>
                <button
                  onClick={() => window.open('https://etherscan.io/', '_blank')}
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <span className="text-sm font-medium">View on Etherscan</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}