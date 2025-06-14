'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Wallet, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TokenContextMenu } from './TokenContextMenu';

interface Token {
  id: string;
  name: string;
  symbol: string;
  totalBalance: number;
  totalValue: number;
  price: number;
  change24h: number;
  algorand: {
    balance: number;
    value: number;
  };
  ethereum: {
    balance: number;
    value: number;
  };
  icon: string;
}

interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  blockchain: 'algorand' | 'ethereum';
  floorPrice: number;
}

export function AssetsPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts'>('tokens');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredToken, setHoveredToken] = useState<Token | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseOverMenu, setIsMouseOverMenu] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Mock token data
  const tokens: Token[] = [
    {
      id: '1',
      name: 'Ethereum',
      symbol: 'ETH',
      totalBalance: 2.5,
      totalValue: 8750.00,
      price: 3500.00,
      change24h: 2.5,
      algorand: { balance: 0, value: 0 },
      ethereum: { balance: 2.5, value: 8750.00 },
      icon: '🔷'
    },
    {
      id: '2',
      name: 'Algorand',
      symbol: 'ALGO',
      totalBalance: 1500.0,
      totalValue: 450.00,
      price: 0.30,
      change24h: -1.2,
      algorand: { balance: 1500.0, value: 450.00 },
      ethereum: { balance: 0, value: 0 },
      icon: '⚫'
    },
    {
      id: '3',
      name: 'USD Coin',
      symbol: 'USDC',
      totalBalance: 2500.0,
      totalValue: 2500.00,
      price: 1.00,
      change24h: 0.1,
      algorand: { balance: 1000.0, value: 1000.00 },
      ethereum: { balance: 1500.0, value: 1500.00 },
      icon: '💵'
    },
    {
      id: '4',
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      totalBalance: 0.15,
      totalValue: 6750.00,
      price: 45000.00,
      change24h: 1.8,
      algorand: { balance: 0.05, value: 2250.00 },
      ethereum: { balance: 0.10, value: 4500.00 },
      icon: '₿'
    },
    {
      id: '5',
      name: 'Chainlink',
      symbol: 'LINK',
      totalBalance: 200.0,
      totalValue: 3000.00,
      price: 15.00,
      change24h: -0.5,
      algorand: { balance: 80.0, value: 1200.00 },
      ethereum: { balance: 120.0, value: 1800.00 },
      icon: '🔗'
    }
  ];

  // Mock NFT data
  const nfts: NFT[] = [
    {
      id: '1',
      name: 'Bored Ape #1234',
      collection: 'Bored Ape Yacht Club',
      image: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      blockchain: 'ethereum',
      floorPrice: 25.5
    },
    {
      id: '2',
      name: 'AlgoApe #567',
      collection: 'AlgoApes',
      image: 'https://images.pexels.com/photos/8566526/pexels-photo-8566526.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      blockchain: 'algorand',
      floorPrice: 150.0
    },
    {
      id: '3',
      name: 'CryptoPunk #8901',
      collection: 'CryptoPunks',
      image: 'https://images.pexels.com/photos/8566445/pexels-photo-8566445.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      blockchain: 'ethereum',
      floorPrice: 45.2
    },
    {
      id: '4',
      name: 'AlgoWorld #234',
      collection: 'AlgoWorld',
      image: 'https://images.pexels.com/photos/8566464/pexels-photo-8566464.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      blockchain: 'algorand',
      floorPrice: 75.0
    }
  ];

  // Calculate summary statistics
  const totalPortfolioValue = tokens.reduce((sum, token) => sum + token.totalValue, 0);
  const totalTokens = tokens.length;
  const totalNFTs = nfts.length;

  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNFTs = nfts.filter(nft =>
    nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nft.collection.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    window.location.href = '/';
  };

  const handleTokenMouseEnter = (token: Token, event: React.MouseEvent) => {
    setHoveredToken(token);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleTokenMouseLeave = () => {
    // Small delay to allow mouse to move to context menu
    setTimeout(() => {
      if (!isMouseOverMenu) {
        setHoveredToken(null);
      }
    }, 100);
  };

  const handleTokenMouseMove = (event: React.MouseEvent) => {
    if (hoveredToken) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMenuMouseEnter = () => {
    setIsMouseOverMenu(true);
  };

  const handleMenuMouseLeave = () => {
    setIsMouseOverMenu(false);
    setHoveredToken(null);
  };

  // Handle click outside to close context menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setHoveredToken(null);
        setIsMouseOverMenu(false);
      }
    };

    if (hoveredToken) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hoveredToken]);

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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-light text-gray-800 mb-6">
                Your Assets
              </h1>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Portfolio</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${totalPortfolioValue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Portfolio value</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Wallet className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                      <p className="text-2xl font-bold text-gray-900">{totalTokens}</p>
                      <p className="text-sm text-gray-500">Across 2 chains</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">NFTs Owned</p>
                      <p className="text-2xl font-bold text-gray-900">{totalNFTs}</p>
                      <p className="text-sm text-gray-500">Digital collectibles</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search your ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
                <button
                  onClick={() => setActiveTab('tokens')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'tokens'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tokens
                </button>
                <button
                  onClick={() => setActiveTab('nfts')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'nfts'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  NFTs
                </button>
              </div>
            </div>

            {/* Content */}
            {activeTab === 'tokens' ? (
              <div className="space-y-3">
                {filteredTokens.map((token) => (
                  <div
                    key={token.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onMouseEnter={(e) => handleTokenMouseEnter(token, e)}
                    onMouseLeave={handleTokenMouseLeave}
                    onMouseMove={handleTokenMouseMove}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{token.icon}</div>
                        <div>
                          <h3 className="font-medium text-gray-900">{token.name}</h3>
                          <p className="text-sm text-gray-500">{token.symbol}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">Balance</p>
                            <p className="font-medium text-gray-900">
                              {token.totalBalance.toLocaleString()} {token.symbol}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Value</p>
                            <p className="font-medium text-gray-900">
                              ${token.totalValue.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTokens.length === 0 && searchQuery && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No tokens found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNFTs.map((nft) => (
                  <div
                    key={nft.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="aspect-square">
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1">{nft.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{nft.collection}</p>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          nft.blockchain === 'ethereum' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {nft.blockchain === 'ethereum' ? 'Ethereum' : 'Algorand'}
                        </span>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Floor</p>
                          <p className="text-sm font-medium text-gray-900">
                            {nft.floorPrice} {nft.blockchain === 'ethereum' ? 'ETH' : 'ALGO'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredNFTs.length === 0 && searchQuery && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No NFTs found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Token Context Menu */}
      {hoveredToken && (
        <div ref={contextMenuRef}>
          <TokenContextMenu
            token={hoveredToken}
            position={mousePosition}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
          />
        </div>
      )}
    </div>
  );
}