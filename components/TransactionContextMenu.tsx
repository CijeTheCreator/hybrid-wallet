'use client';

import { useMemo, useState } from 'react';

interface TransactionBreakdown {
  send: number;
  schedule: number;
  swap: number;
  borrow: number;
  lend: number;
  bridge: number;
}

interface Transaction {
  id: string;
  title: string;
  lastMessage: string;
  amount: number;
  type: 'increase' | 'decrease';
  breakdown: TransactionBreakdown;
}

interface TransactionContextMenuProps {
  transaction: Transaction;
  position: { x: number; y: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

interface PieSlice {
  type: keyof TransactionBreakdown;
  value: number;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

const COLORS = {
  send: '#3B82F6',      // Blue
  schedule: '#10B981',   // Green
  swap: '#F59E0B',      // Amber
  borrow: '#EF4444',    // Red
  lend: '#8B5CF6',      // Purple
  bridge: '#06B6D4'     // Cyan
};

const LABELS = {
  send: 'Send',
  schedule: 'Schedule',
  swap: 'Swap',
  borrow: 'Borrow',
  lend: 'Lend',
  bridge: 'Bridge'
};

export function TransactionContextMenu({ transaction, position, onMouseEnter, onMouseLeave }: TransactionContextMenuProps) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const pieData = useMemo(() => {
    const total = Object.values(transaction.breakdown).reduce((sum, value) => sum + value, 0);
    
    if (total === 0) return [];

    let currentAngle = -90; // Start from top
    const slices: PieSlice[] = [];

    Object.entries(transaction.breakdown).forEach(([type, value]) => {
      if (value > 0) {
        const percentage = (value / total) * 100;
        const angleSize = (percentage / 100) * 360;
        
        slices.push({
          type: type as keyof TransactionBreakdown,
          value,
          percentage,
          color: COLORS[type as keyof TransactionBreakdown],
          startAngle: currentAngle,
          endAngle: currentAngle + angleSize
        });
        
        currentAngle += angleSize;
      }
    });

    return slices;
  }, [transaction.breakdown]);

  const createPieSlicePath = (slice: PieSlice, radius: number, centerX: number, centerY: number, isHovered: boolean = false) => {
    const expandedRadius = isHovered ? radius + 3 : radius;
    const startAngleRad = (slice.startAngle * Math.PI) / 180;
    const endAngleRad = (slice.endAngle * Math.PI) / 180;
    
    const x1 = centerX + expandedRadius * Math.cos(startAngleRad);
    const y1 = centerY + expandedRadius * Math.sin(startAngleRad);
    const x2 = centerX + expandedRadius * Math.cos(endAngleRad);
    const y2 = centerY + expandedRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${expandedRadius} ${expandedRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Position the menu to avoid going off-screen
  const menuStyle = {
    position: 'fixed' as const,
    left: Math.min(position.x + 10, window.innerWidth - 320),
    top: Math.min(position.y - 10, window.innerHeight - 400),
    zIndex: 1000,
  };

  return (
    <div
      style={menuStyle}
      className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-80 animate-in fade-in-0 zoom-in-95 duration-200"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
          {transaction.title}
        </h3>
        <p className="text-xs text-gray-500">Transaction Breakdown</p>
      </div>

      {/* Pie Chart */}
      <div className="flex justify-center mb-4">
        <svg width="120" height="120" className="transform -rotate-90">
          {pieData.map((slice, index) => (
            <path
              key={index}
              d={createPieSlicePath(slice, 50, 60, 60, hoveredSlice === slice.type)}
              fill={slice.color}
              className="transition-all duration-200 cursor-pointer"
              style={{
                filter: hoveredSlice === slice.type ? 'brightness(1.1)' : 'none',
                opacity: hoveredSlice && hoveredSlice !== slice.type ? 0.7 : 1
              }}
              onMouseEnter={() => setHoveredSlice(slice.type)}
              onMouseLeave={() => setHoveredSlice(null)}
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {pieData.map((slice) => (
          <div 
            key={slice.type} 
            className={`flex items-center justify-between text-xs transition-all duration-200 p-1 rounded ${
              hoveredSlice === slice.type ? 'bg-gray-50' : ''
            }`}
            onMouseEnter={() => setHoveredSlice(slice.type)}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full transition-transform duration-200"
                style={{ 
                  backgroundColor: slice.color,
                  transform: hoveredSlice === slice.type ? 'scale(1.2)' : 'scale(1)'
                }}
              />
              <span className={`text-gray-700 ${hoveredSlice === slice.type ? 'font-medium' : ''}`}>
                {LABELS[slice.type]}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-gray-900 ${hoveredSlice === slice.type ? 'font-bold' : 'font-medium'}`}>
                ${slice.value.toFixed(2)}
              </span>
              <span className="text-gray-500">
                ({slice.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-gray-700">Total</span>
          <span className={`${
            transaction.type === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'increase' ? '+' : '-'}
            ${Math.abs(transaction.amount).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}