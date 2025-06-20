'use client';

import { useState, useEffect } from 'react';
import { X, Plus, User, Building2, Check, Wallet } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  description: string;
  type: 'personal' | 'business';
  isActive: boolean;
}

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: Account;
  onAccountSelect: (account: Account) => void;
}

export function AccountSwitcherModal({ 
  isOpen, 
  onClose, 
  currentAccount, 
  onAccountSelect 
}: AccountSwitcherModalProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountDescription, setNewAccountDescription] = useState('');
  const [newAccountType, setNewAccountType] = useState<'personal' | 'business'>('personal');

  // Mock accounts data
  useEffect(() => {
    const mockAccounts: Account[] = [
      {
        id: '1',
        name: 'Account 1',
        description: 'Personal wallet account',
        type: 'personal',
        isActive: true
      },
      {
        id: '2',
        name: 'Business Account',
        description: 'Company treasury wallet',
        type: 'business',
        isActive: false
      },
      {
        id: '3',
        name: 'Trading Account',
        description: 'High-frequency trading wallet',
        type: 'personal',
        isActive: false
      },
      {
        id: '4',
        name: 'DeFi Portfolio',
        description: 'Decentralized finance investments',
        type: 'personal',
        isActive: false
      }
    ];
    setAccounts(mockAccounts);
  }, []);

  const handleCreateAccount = () => {
    if (!newAccountName.trim()) return;

    const newAccount: Account = {
      id: Date.now().toString(),
      name: newAccountName.trim(),
      description: newAccountDescription.trim() || 'New account',
      type: newAccountType,
      isActive: false
    };

    setAccounts(prev => [...prev, newAccount]);
    setNewAccountName('');
    setNewAccountDescription('');
    setNewAccountType('personal');
    setShowCreateForm(false);
  };

  const handleAccountClick = (account: Account) => {
    // Update the active status
    const updatedAccounts = accounts.map(acc => ({
      ...acc,
      isActive: acc.id === account.id
    }));
    setAccounts(updatedAccounts);
    
    // Call the parent handler
    onAccountSelect({ ...account, isActive: true });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center p-6 relative">
          <h2 className="text-lg font-medium text-gray-900">Switch Account</h2>
          <button
            onClick={onClose}
            className="absolute right-6 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {!showCreateForm ? (
            <>
              {/* Account List */}
              <div className="px-6 pb-6">
                <div className="space-y-2">
                  {accounts.map((account, index) => (
                    <div
                      key={account.id}
                      className="animate-in fade-in-0 slide-in-from-left-4 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <button
                        onClick={() => handleAccountClick(account)}
                        className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                          account.id === currentAccount.id
                            ? 'bg-orange-50 shadow-sm'
                            : 'hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                            account.type === 'business' 
                              ? 'bg-blue-100' 
                              : 'bg-orange-100'
                          }`}>
                            {account.type === 'business' ? (
                              <Building2 className={`w-5 h-5 transition-colors duration-200 ${
                                account.type === 'business' ? 'text-blue-600' : 'text-orange-600'
                              }`} />
                            ) : (
                              <User className="w-5 h-5 text-orange-600 transition-colors duration-200" />
                            )}
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-gray-900 transition-colors duration-200">{account.name}</h3>
                            <p className="text-sm text-gray-500 transition-colors duration-200">{account.description}</p>
                          </div>
                        </div>
                        
                        {account.id === currentAccount.id && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-orange-600">Active</span>
                            <Check className="w-4 h-4 text-orange-600" />
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create New Account Button */}
              <div className="px-6 pb-6">
                <div
                  className="animate-in fade-in-0 slide-in-from-left-4 duration-300"
                  style={{ animationDelay: `${accounts.length * 50}ms` }}
                >
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full flex items-center justify-center space-x-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 text-gray-600 hover:scale-[1.01] hover:shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Create New Account</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Create Account Form */
            <div className="px-6 pb-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <div className="mb-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Account</h3>
                <p className="text-sm text-gray-500">Set up a new wallet account for your crypto assets.</p>
              </div>

              <div className="space-y-4">
                {/* Account Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="Enter account name"
                    className="w-full px-3 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200 focus:scale-[1.01]"
                  />
                </div>

                {/* Account Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newAccountDescription}
                    onChange={(e) => setNewAccountDescription(e.target.value)}
                    placeholder="Brief description of this account"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200 resize-none focus:scale-[1.01]"
                  />
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewAccountType('personal')}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                        newAccountType === 'personal'
                          ? 'bg-orange-50 text-orange-700 shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100 hover:shadow-sm'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">Personal</span>
                    </button>
                    <button
                      onClick={() => setNewAccountType('business')}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                        newAccountType === 'business'
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100 hover:shadow-sm'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                      <span className="font-medium">Business</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCreateAccount}
                  disabled={!newAccountName.trim()}
                  className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium hover:scale-[1.01] hover:shadow-md active:scale-[0.99]"
                >
                  Create Account
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewAccountName('');
                    setNewAccountDescription('');
                    setNewAccountType('personal');
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium hover:scale-[1.01] hover:shadow-md active:scale-[0.99]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}