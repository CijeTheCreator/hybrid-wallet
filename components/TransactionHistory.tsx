'use client';

import { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TransactionContextMenu } from './TransactionContextMenu';
import { AccountSwitcher } from './AccountSwitcher';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  title: string;
  lastMessage: string;
  amount: number; // positive for increase, negative for decrease
  type: 'increase' | 'decrease';
  transactionType: 'chat' | 'simple'; // New field to distinguish transaction types
  breakdown: {
    send: number;
    schedule: number;
    swap: number;
    borrow: number;
    lend: number;
    bridge: number;
  };
}

export function TransactionHistory() {
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTransaction, setHoveredTransaction] = useState<Transaction | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseOverMenu, setIsMouseOverMenu] = useState(false);
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock transaction data with breakdown - mix of chat and simple transactions
  const transactions: Transaction[] = [
    // Simple transactions (crypto transfers)
    {
      id: 'simple-1',
      title: 'Received ETH from Alice',
      lastMessage: 'Transaction completed 30 minutes ago',
      amount: 10.0,
      type: 'increase',
      transactionType: 'simple',
      breakdown: {
        send: 0,
        schedule: 0,
        swap: 0,
        borrow: 0,
        lend: 0,
        bridge: 0
      }
    },
    {
      id: 'simple-2',
      title: 'Sent USDC to Bob',
      lastMessage: 'Transaction completed 1 hour ago',
      amount: -500.0,
      type: 'decrease',
      transactionType: 'simple',
      breakdown: {
        send: 0,
        schedule: 0,
        swap: 0,
        borrow: 0,
        lend: 0,
        bridge: 0
      }
    },
    // Chat transactions (existing ones)
    {
      id: 'chat-1',
      title: 'Enhance this prompt for v0 Re...',
      lastMessage: 'Last message 3 hours ago',
      amount: 250.75,
      type: 'increase',
      transactionType: 'chat',
      breakdown: {
        send: 150.25,
        schedule: 50.00,
        swap: 30.50,
        borrow: 0,
        lend: 20.00,
        bridge: 0
      }
    },
    {
      id: 'chat-2',
      title: 'AI Assistant Capabilities Overview',
      lastMessage: 'Last message 3 hours ago',
      amount: -89.32,
      type: 'decrease',
      transactionType: 'chat',
      breakdown: {
        send: 45.32,
        schedule: 0,
        swap: 25.00,
        borrow: 19.00,
        lend: 0,
        bridge: 0
      }
    },
    {
      id: 'simple-3',
      title: 'Swapped ETH for USDC',
      lastMessage: 'Transaction completed 2 hours ago',
      amount: -2.5,
      type: 'decrease',
      transactionType: 'simple',
      breakdown: {
        send: 0,
        schedule: 0,
        swap: 0,
        borrow: 0,
        lend: 0,
        bridge: 0
      }
    },
    {
      id: 'chat-3',
      title: 'Docker Multi-App Container Setup',
      lastMessage: 'Last message 4 days ago',
      amount: 1500.00,
      type: 'increase',
      transactionType: 'chat',
      breakdown: {
        send: 800.00,
        schedule: 200.00,
        swap: 300.00,
        borrow: 0,
        lend: 150.00,
        bridge: 50.00
      }
    },
    {
      id: 'chat-4',
      title: 'Ethereum Faucet Route with Prisma',
      lastMessage: 'Last message 4 days ago',
      amount: -45.67,
      type: 'decrease',
      transactionType: 'chat',
      breakdown: {
        send: 25.67,
        schedule: 0,
        swap: 15.00,
        borrow: 5.00,
        lend: 0,
        bridge: 0
      }
    },
    {
      id: 'simple-4',
      title: 'Received ALGO from Carol',
      lastMessage: 'Transaction completed 1 day ago',
      amount: 150.0,
      type: 'increase',
      transactionType: 'simple',
      breakdown: {
        send: 0,
        schedule: 0,
        swap: 0,
        borrow: 0,
        lend: 0,
        bridge: 0
      }
    }
  ];

  const filteredTransactions = transactions.filter(transaction =>
    transaction.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    window.location.href = '/';
  };

  const handleTransactionClick = (transaction: Transaction) => {
    if (transaction.transactionType === 'simple') {
      // Navigate to transaction details page
      router.push(`/transactions/${transaction.id}`);
    } else {
      // Navigate to chat transaction
      router.push(`/chats/${transaction.id}`);
    }
  };

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = (transaction: Transaction, event: React.MouseEvent) => {
    // Only show context menu for chat transactions (they have breakdown data)
    if (transaction.transactionType !== 'chat') return;
    
    clearHideTimeout();
    setHoveredTransaction(transaction);
    setMousePosition({ x: event.clientX, y: event.clientY });
    setIsMenuAnimating(true);
    
    // Animation completes after 200ms (duration-200)
    setTimeout(() => {
      setIsMenuAnimating(false);
    }, 200);
  };

  const handleMouseLeave = () => {
    // Set a small delay before hiding to allow mouse to move to context menu
    hideTimeoutRef.current = setTimeout(() => {
      if (!isMouseOverMenu && !isMenuAnimating) {
        setHoveredTransaction(null);
      }
    }, 50);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (hoveredTransaction) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMenuMouseEnter = () => {
    clearHideTimeout();
    setIsMouseOverMenu(true);
  };

  const handleMenuMouseLeave = () => {
    setIsMouseOverMenu(false);
    // Hide immediately when leaving the menu
    setHoveredTransaction(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        expanded={sidebarExpanded} 
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        onNewChat={handleNewChat}
        currentChatId={undefined}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              {/* Account Switcher */}
              <div className="mb-4">
                <AccountSwitcher />
              </div>
              
              <h1 className="text-2xl font-light text-gray-800 mb-6">
                Your transaction history
              </h1>
              
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>
              
              {/* Transaction Count */}
              <p className="text-gray-600 text-sm mb-6">
                You have {transactions.length} previous transactions
              </p>
            </div>

            {/* Transaction List */}
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer relative"
                  onClick={() => handleTransactionClick(transaction)}
                  onMouseEnter={(e) => handleMouseEnter(transaction, e)}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-gray-900 font-medium text-sm truncate">
                          {transaction.title}
                        </h3>
                        {/* Transaction Type Badge */}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.transactionType === 'simple' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {transaction.transactionType === 'simple' ? 'Transfer' : 'Chat'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        {transaction.lastMessage}
                      </p>
                    </div>
                    
                    {/* Transaction Amount */}
                    <div className="ml-4 flex-shrink-0">
                      <span
                        className={`inline-flex items-center text-sm font-medium ${
                          transaction.type === 'increase'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'increase' ? '+' : '-'}
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredTransactions.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <p className="text-gray-500">No transactions found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu - Only for chat transactions */}
      {hoveredTransaction && hoveredTransaction.transactionType === 'chat' && (
        <TransactionContextMenu
          transaction={hoveredTransaction}
          position={mousePosition}
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        />
      )}
    </div>
  );
}