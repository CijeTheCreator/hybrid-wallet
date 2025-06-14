'use client';

import { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TransactionContextMenu } from './TransactionContextMenu';

interface Transaction {
  id: string;
  title: string;
  lastMessage: string;
  amount: number; // positive for increase, negative for decrease
  type: 'increase' | 'decrease';
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredTransaction, setHoveredTransaction] = useState<Transaction | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseOverMenu, setIsMouseOverMenu] = useState(false);
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock transaction data with breakdown
  const transactions: Transaction[] = [
    {
      id: '1',
      title: 'Enhance this prompt for v0 Re...',
      lastMessage: 'Last message 3 hours ago',
      amount: 250.75,
      type: 'increase',
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
      id: '2',
      title: 'AI Assistant Capabilities Overview',
      lastMessage: 'Last message 3 hours ago',
      amount: -89.32,
      type: 'decrease',
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
      id: '3',
      title: 'Docker Multi-App Container Setup',
      lastMessage: 'Last message 4 days ago',
      amount: 1500.00,
      type: 'increase',
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
      id: '4',
      title: 'Ethereum Faucet Route with Prisma',
      lastMessage: 'Last message 4 days ago',
      amount: -45.67,
      type: 'decrease',
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
      id: '5',
      title: 'Untitled',
      lastMessage: 'Last message 4 days ago',
      amount: 75.25,
      type: 'increase',
      breakdown: {
        send: 40.25,
        schedule: 15.00,
        swap: 20.00,
        borrow: 0,
        lend: 0,
        bridge: 0
      }
    },
    {
      id: '6',
      title: 'SendGrid Email API Curl Request',
      lastMessage: 'Last message 5 days ago',
      amount: -320.50,
      type: 'decrease',
      breakdown: {
        send: 200.50,
        schedule: 50.00,
        swap: 70.00,
        borrow: 0,
        lend: 0,
        bridge: 0
      }
    },
    {
      id: '7',
      title: 'Flask Project Docker Configuration',
      lastMessage: 'Last message 5 days ago',
      amount: 125.80,
      type: 'increase',
      breakdown: {
        send: 75.80,
        schedule: 25.00,
        swap: 15.00,
        borrow: 0,
        lend: 10.00,
        bridge: 0
      }
    },
    {
      id: '8',
      title: 'Clerk Webhook User Creation',
      lastMessage: 'Last message 6 days ago',
      amount: -67.45,
      type: 'decrease',
      breakdown: {
        send: 35.45,
        schedule: 0,
        swap: 20.00,
        borrow: 12.00,
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

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = (transaction: Transaction, event: React.MouseEvent) => {
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
                You have {transactions.length} previous transactions with Claude
              </p>
            </div>

            {/* Transaction List */}
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer relative"
                  onMouseEnter={(e) => handleMouseEnter(transaction, e)}
                  onMouseLeave={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900 font-medium text-sm mb-1 truncate">
                        {transaction.title}
                      </h3>
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

      {/* Context Menu */}
      {hoveredTransaction && (
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