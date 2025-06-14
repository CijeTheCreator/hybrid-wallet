'use client';

import { useMemo } from 'react';

interface Contact {
  id: string;
  name: string;
  username: string;
  walletAddress: string;
  avatar?: string;
  isOnline?: boolean;
}

interface ContactsContextMenuProps {
  contacts: Contact[];
  position: { x: number; y: number };
  onContactSelect: (contact: Contact) => void;
  onClose: () => void;
  searchQuery: string;
}

export function ContactsContextMenu({
  contacts,
  position,
  onContactSelect,
  onClose,
  searchQuery
}: ContactsContextMenuProps) {
  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      contact.username.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  // Calculate optimal positioning
  const menuWidth = 280;
  const menuMaxHeight = 240;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  
  let left = Math.min(position.x, viewportWidth - menuWidth - 20);
  let top = position.y - menuMaxHeight - 10;
  
  // If menu would go above viewport, position it below
  if (top < 20) {
    top = position.y + 60;
  }
  
  left = Math.max(20, left);

  const menuStyle = {
    position: 'fixed' as const,
    left,
    top,
    zIndex: 1000,
    width: menuWidth,
    maxHeight: menuMaxHeight,
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div
        style={menuStyle}
        className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200 z-50"
      >
        {/* Contacts List */}
        <div className="max-h-60 overflow-y-auto">
          {filteredContacts.length > 0 ? (
            <div className="py-2">
              {filteredContacts.map((contact, index) => (
                <button
                  key={contact.id}
                  onClick={() => onContactSelect(contact)}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left animate-in fade-in-0 slide-in-from-left-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">
                      {contact.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      @{contact.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate font-mono">
                      {truncateAddress(contact.walletAddress)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">
                {searchQuery ? `No contacts found for "${searchQuery}"` : 'No contacts available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}