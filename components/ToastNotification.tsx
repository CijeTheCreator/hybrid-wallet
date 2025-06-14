'use client';

import { useState, useEffect } from 'react';
import { X, ArrowUpRight, Coins } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'crypto-received' | 'crypto-sent' | 'transaction-complete';
  title: string;
  message: string;
  amount?: string;
  currency?: string;
  transactionId?: string;
  timestamp: Date;
}

interface ToastNotificationProps {
  toast: ToastData;
  onClose: (id: string) => void;
  onClick: (toast: ToastData) => void;
}

export function ToastNotification({ toast, onClose, onClick }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    
    // Auto-dismiss after 2 seconds
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const handleClick = () => {
    onClick(toast);
    handleClose();
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'crypto-received':
        return <ArrowUpRight className="w-5 h-5 text-green-600 transform rotate-180" />;
      case 'crypto-sent':
        return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
      default:
        return <Coins className="w-5 h-5 text-orange-600" />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'crypto-received':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          iconBg: 'bg-green-100'
        };
      case 'crypto-sent':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100'
        };
      default:
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          iconBg: 'bg-orange-100'
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 w-80 max-w-sm
        ${colors.bg} ${colors.border} border rounded-lg shadow-lg
        cursor-pointer transition-all duration-300 ease-out
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        hover:shadow-xl hover:scale-105 transform
      `}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 ${colors.iconBg} rounded-full flex items-center justify-center`}>
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {toast.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {toast.message}
                </p>
                {toast.amount && toast.currency && (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {toast.amount}
                    </span>
                    <span className="text-sm font-medium text-gray-500 uppercase">
                      {toast.currency}
                    </span>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-white/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timestamp */}
            <p className="text-xs text-gray-400 mt-2">
              {toast.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-[shrink_2000ms_linear_forwards]"
            style={{
              animation: 'shrink 2000ms linear forwards'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}