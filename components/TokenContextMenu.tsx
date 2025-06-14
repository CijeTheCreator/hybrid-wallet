'use client';

import { useMemo, useState } from 'react';

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

interface TokenContextMenuProps {
  token: Token;
  position: { x: number; y: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

interface ChainData {
  name: string;
  balance: number;
  value: number;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

const CHAIN_COLORS = {
  algorand: '#000000',  // Black for Algorand
  ethereum: '#627EEA'   // Blue for Ethereum
};

export function TokenContextMenu({ token, position, onMouseEnter, onMouseLeave }: TokenContextMenuProps) {
  const [hoveredChain, setHoveredChain] = useState<string | null>(null);

  const chainData = useMemo(() => {
    const chains: ChainData[] = [];
    let currentAngle = -90; // Start from top

    if (token.algorand.balance > 0) {
      const percentage = (token.algorand.value / token.totalValue) * 100;
      const angleSize = (percentage / 100) * 360;
      
      chains.push({
        name: 'Algorand',
        balance: token.algorand.balance,
        value: token.algorand.value,
        percentage,
        color: CHAIN_COLORS.algorand,
        startAngle: currentAngle,
        endAngle: currentAngle + angleSize
      });
      
      currentAngle += angleSize;
    }

    if (token.ethereum.balance > 0) {
      const percentage = (token.ethereum.value / token.totalValue) * 100;
      const angleSize = (percentage / 100) * 360;
      
      chains.push({
        name: 'Ethereum',
        balance: token.ethereum.balance,
        value: token.ethereum.value,
        percentage,
        color: CHAIN_COLORS.ethereum,
        startAngle: currentAngle,
        endAngle: currentAngle + angleSize
      });
    }

    return chains;
  }, [token]);

  const createPieSlicePath = (chain: ChainData, radius: number, centerX: number, centerY: number, isHovered: boolean = false) => {
    const expandedRadius = isHovered ? radius + 4 : radius;
    const startAngleRad = (chain.startAngle * Math.PI) / 180;
    const endAngleRad = (chain.endAngle * Math.PI) / 180;
    
    const x1 = centerX + expandedRadius * Math.cos(startAngleRad);
    const y1 = centerY + expandedRadius * Math.sin(startAngleRad);
    const x2 = centerX + expandedRadius * Math.cos(endAngleRad);
    const y2 = centerY + expandedRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = chain.endAngle - chain.startAngle > 180 ? 1 : 0;
    
    // If it's a full circle (360 degrees), we need to draw two arcs
    if (chain.endAngle - chain.startAngle >= 360) {
      return `M ${centerX} ${centerY} m ${-expandedRadius} 0 a ${expandedRadius} ${expandedRadius} 0 1 1 ${expandedRadius * 2} 0 a ${expandedRadius} ${expandedRadius} 0 1 1 ${-expandedRadius * 2} 0`;
    }
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${expandedRadius} ${expandedRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Calculate optimal positioning to avoid overflow
  const menuWidth = 320;
  const menuMaxHeight = 500;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  
  // Calculate position with overflow prevention
  let left = Math.min(position.x + 10, viewportWidth - menuWidth - 20);
  let top = Math.min(position.y - 10, viewportHeight - menuMaxHeight - 20);
  
  // Ensure minimum distance from edges
  left = Math.max(20, left);
  top = Math.max(20, top);

  // Position the menu to avoid going off-screen
  const menuStyle = {
    position: 'fixed' as const,
    left,
    top,
    zIndex: 1000,
    maxHeight: `${Math.min(menuMaxHeight, viewportHeight - 40)}px`,
  };

  return (
    <div
      style={menuStyle}
      className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden flex flex-col"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Scrollable Content Container */}
      <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{token.icon}</span>
              <div>
                <h3 className="font-medium text-gray-900">{token.name}</h3>
                <p className="text-sm text-gray-500">{token.symbol}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="font-semibold text-gray-900">
                  {token.totalBalance.toLocaleString()} {token.symbol}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="font-semibold text-gray-900">
                  ${token.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Distribution Chart */}
          {chainData.length > 1 ? (
            <>
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Blockchain Distribution
                </p>
                <div className="flex justify-center">
                  <svg width="120" height="120" className="transform -rotate-90">
                    {chainData.map((chain, index) => (
                      <path
                        key={index}
                        d={createPieSlicePath(chain, 50, 60, 60, hoveredChain === chain.name)}
                        fill={chain.color}
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                          filter: hoveredChain === chain.name ? 'brightness(1.2)' : 'none',
                          opacity: hoveredChain && hoveredChain !== chain.name ? 0.6 : 1
                        }}
                        onMouseEnter={() => setHoveredChain(chain.name)}
                        onMouseLeave={() => setHoveredChain(null)}
                      />
                    ))}
                  </svg>
                </div>
              </div>

              {/* Chain Breakdown */}
              <div className="space-y-3">
                {chainData.map((chain) => (
                  <div 
                    key={chain.name}
                    className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                      hoveredChain === chain.name 
                        ? 'bg-gray-50 border-gray-300 shadow-sm' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onMouseEnter={() => setHoveredChain(chain.name)}
                    onMouseLeave={() => setHoveredChain(null)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full transition-transform duration-200"
                          style={{ 
                            backgroundColor: chain.color,
                            transform: hoveredChain === chain.name ? 'scale(1.3)' : 'scale(1)'
                          }}
                        />
                        <span className={`text-sm font-medium ${
                          hoveredChain === chain.name ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {chain.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {chain.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {chain.balance.toLocaleString()} {token.symbol}
                      </span>
                      <span className={`font-semibold ${
                        hoveredChain === chain.name ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        ${chain.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Single chain display
            <div className="space-y-3">
              {chainData.map((chain) => (
                <div key={chain.name} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: chain.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {chain.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">100%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {chain.balance.toLocaleString()} {token.symbol}
                    </span>
                    <span className="font-semibold text-gray-700">
                      ${chain.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Price Info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Current Price</span>
              <div className="text-right">
                <span className="font-medium text-gray-900">
                  ${token.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}