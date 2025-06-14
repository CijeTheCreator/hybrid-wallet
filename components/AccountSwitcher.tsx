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
        className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-sm rounded-md"
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
            {activeAccount.type === 'business' ? (
              <Building2 className="w-2.5 h-2.5 text-gray-500" />
            ) : (
              <User className="w-2.5 h-2.5 text-gray-500" />
            )}
          </div>
          <span className="font-medium text-gray-700">{activeAccount.name}</span>
        </div>
        <ChevronDown className="w-3 h-3 text-gray-400" />
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