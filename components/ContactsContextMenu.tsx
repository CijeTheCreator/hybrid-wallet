'use client';

import { useMemo, useEffect, useRef } from 'react';

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
  selectedIndex: number;
  onSelectedIndexChange: (index: number) => void;
}

export function ContactsContextMenu({
  contacts,
  position,
  onContactSelect,
  onClose,
  searchQuery,
  selectedIndex,
  onSelectedIndexChange
}: ContactsContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      contact.username.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredContacts.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = selectedIndex < filteredContacts.length - 1 ? selectedIndex + 1 : 0;
          onSelectedIndexChange(nextIndex);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredContacts.length - 1;
          onSelectedIndexChange(prevIndex);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < filteredContacts.length) {
            onContactSelect(filteredContacts[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredContacts, selectedIndex, onSelectedIndexChange, onContactSelect, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

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
        ref={menuRef}
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
                  ref={index === selectedIndex ? selectedItemRef : null}
                  onClick={() => onContactSelect(contact)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors text-left animate-in fade-in-0 slide-in-from-left-2 duration-200 ${
                    index === selectedIndex 
                      ? 'bg-orange-50 border-l-2 border-orange-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                      index === selectedIndex 
                        ? 'bg-gradient-to-br from-orange-400 to-pink-500 scale-110' 
                        : 'bg-gradient-to-br from-orange-400 to-pink-500'
                    }`}>
                      <span className="text-white font-medium text-sm">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate text-sm transition-colors duration-200 ${
                      index === selectedIndex ? 'text-orange-900' : 'text-gray-900'
                    }`}>
                      {contact.name}
                    </p>
                    <p className={`text-sm truncate transition-colors duration-200 ${
                      index === selectedIndex ? 'text-orange-700' : 'text-gray-500'
                    }`}>
                      @{contact.username}
                    </p>
                    <p className={`text-xs truncate font-mono transition-colors duration-200 ${
                      index === selectedIndex ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                      {truncateAddress(contact.walletAddress)}
                    </p>
                  </div>

                  {/* Selection Indicator */}
                  {index === selectedIndex && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    </div>
                  )}
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