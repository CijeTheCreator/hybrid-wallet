'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastNotification, ToastData } from './ToastNotification';
import { useRouter } from 'next/navigation';

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const router = useRouter();

  const showToast = useCallback((toastData: Omit<ToastData, 'id' | 'timestamp'>) => {
    const toast: ToastData = {
      ...toastData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };

    setToasts(prev => [...prev, toast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const handleToastClick = useCallback((toast: ToastData) => {
    // Navigate to transaction details or transactions page
    if (toast.transactionId) {
      // Navigate to specific transaction details
      router.push(`/transactions/${toast.transactionId}`);
    } else {
      // Navigate to transactions page
      router.push('/transactions');
    }
  }, [router]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Render Toasts */}
      <div className="fixed top-0 right-0 z-50 pointer-events-none">
        <div className="flex flex-col space-y-2 p-4">
          {toasts.map((toast, index) => (
            <div 
              key={toast.id} 
              className="pointer-events-auto"
              style={{ 
                transform: `translateY(${index * 4}px)`,
                zIndex: 50 - index 
              }}
            >
              <ToastNotification
                toast={toast}
                onClose={removeToast}
                onClick={handleToastClick}
              />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}