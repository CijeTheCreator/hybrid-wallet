'use client';

import { useState } from 'react';
import { ChevronDown, Plus, User, Building2, Wallet } from 'lucide-react';
import { AccountSwitcherModal } from './AccountSwitcherModal';

interface Account {
  id: string;
  name: string;
  description: string;
  type: 'personal' | 'business';
  isActive: boolean;
}

interface AccountSwitcherProps {
  currentAccount?: Account;
  onAccountChange?: (account: Account) => void;
}

export function AccountSwitcher({ currentAccount, onAccountChange }: AccountSwitcherProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Default account if none provided
  const defaultAccount: Account = {
    id: '1',
    name: 'Account 1',
    description: 'Personal wallet account',
    type: 'personal',
    isActive: true
  };

  const activeAccount = currentAccount || defaultAccount;

  const handleAccountSelect = (account: Account) => {
    onAccountChange?.(account);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm"
      >
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
            {activeAccount.type === 'business' ? (
              <Building2 className="w-3 h-3 text-orange-600" />
            ) : (
              <User className="w-3 h-3 text-orange-600" />
            )}
          </div>
          <span className="font-medium text-gray-900">{activeAccount.name}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      <AccountSwitcherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentAccount={activeAccount}
        onAccountSelect={handleAccountSelect}
      />
    </>
  );
}