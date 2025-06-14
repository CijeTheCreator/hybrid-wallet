'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Plus, Zap, AtSign } from 'lucide-react';
import { ContactsContextMenu } from './ContactsContextMenu';

interface Contact {
  id: string;
  name: string;
  username: string;
  walletAddress: string;
  avatar?: string;
  isOnline?: boolean;
}

interface EnhancedChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  rows?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
}

interface HighlightedSegment {
  text: string;
  type: 'action' | 'blockchain' | 'currency' | 'contact' | 'address' | 'normal';
  startIndex: number;
  endIndex: number;
}

// Keywords configuration
const KEYWORDS = {
  actions: ['swap', 'borrow', 'send', 'receive', 'lend', 'bridge', 'stake', 'unstake', 'buy', 'sell', 'trade'],
  blockchains: ['algorand', 'ethereum', 'bitcoin', 'polygon', 'solana', 'avalanche', 'cardano', 'polkadot'],
  currencies: ['eth', 'btc', 'algo', 'usdc', 'usdt', 'matic', 'sol', 'avax', 'ada', 'dot', 'link', 'uni']
};

// Color mapping for different types
const HIGHLIGHT_COLORS = {
  action: 'bg-pink-100 text-pink-800',
  blockchain: 'bg-yellow-100 text-yellow-800',
  currency: 'bg-yellow-100 text-yellow-800',
  contact: 'bg-blue-100 text-blue-800',
  address: 'bg-blue-100 text-blue-800',
  normal: ''
};

export function EnhancedChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your message...",
  rows = 2,
  onFocus,
  onBlur,
  isFocused = false
}: EnhancedChatInputProps) {
  const [showContacts, setShowContacts] = useState(false);
  const [contactsPosition, setContactsPosition] = useState({ x: 0, y: 0 });
  const [atSymbolPosition, setAtSymbolPosition] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock contacts data
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      username: 'alice_crypto',
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
      isOnline: true
    },
    {
      id: '2',
      name: 'Bob Smith',
      username: 'bob_trader',
      walletAddress: '0x8ba1f109551bD432803012645Hac136c0532925a',
      isOnline: false
    },
    {
      id: '3',
      name: 'Carol Davis',
      username: 'carol_defi',
      walletAddress: 'ALGO123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      isOnline: true
    },
    {
      id: '4',
      name: 'David Wilson',
      username: 'david_nft',
      walletAddress: '0x123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
      isOnline: true
    }
  ];

  // Parse text and create highlighted segments
  const highlightedSegments = useMemo(() => {
    if (!value) return [];

    const segments: HighlightedSegment[] = [];
    const text = value.toLowerCase();
    let currentIndex = 0;

    // Create regex patterns for different types
    const actionPattern = new RegExp(`\\b(${KEYWORDS.actions.join('|')})\\b`, 'gi');
    const blockchainPattern = new RegExp(`\\b(${KEYWORDS.blockchains.join('|')})\\b`, 'gi');
    const currencyPattern = new RegExp(`\\b(${KEYWORDS.currencies.join('|')})\\b`, 'gi');
    const contactPattern = /@(\w+)/g;
    const addressPattern = /(0x[a-fA-F0-9]{40}|[A-Z2-7]{58})/g;

    // Find all matches
    const matches: Array<{ match: RegExpExecArray; type: HighlightedSegment['type'] }> = [];

    let match;
    while ((match = actionPattern.exec(value)) !== null) {
      matches.push({ match, type: 'action' });
    }
    while ((match = blockchainPattern.exec(value)) !== null) {
      matches.push({ match, type: 'blockchain' });
    }
    while ((match = currencyPattern.exec(value)) !== null) {
      matches.push({ match, type: 'currency' });
    }
    while ((match = contactPattern.exec(value)) !== null) {
      matches.push({ match, type: 'contact' });
    }
    while ((match = addressPattern.exec(value)) !== null) {
      matches.push({ match, type: 'address' });
    }

    // Sort matches by position
    matches.sort((a, b) => a.match.index! - b.match.index!);

    // Create segments
    matches.forEach(({ match, type }) => {
      const startIndex = match.index!;
      const endIndex = startIndex + match[0].length;

      // Add normal text before this match
      if (startIndex > currentIndex) {
        segments.push({
          text: value.substring(currentIndex, startIndex),
          type: 'normal',
          startIndex: currentIndex,
          endIndex: startIndex
        });
      }

      // Add highlighted match
      segments.push({
        text: match[0],
        type,
        startIndex,
        endIndex
      });

      currentIndex = endIndex;
    });

    // Add remaining normal text
    if (currentIndex < value.length) {
      segments.push({
        text: value.substring(currentIndex),
        type: 'normal',
        startIndex: currentIndex,
        endIndex: value.length
      });
    }

    // If no matches, return the entire text as normal
    if (segments.length === 0) {
      segments.push({
        text: value,
        type: 'normal',
        startIndex: 0,
        endIndex: value.length
      });
    }

    return segments;
  }, [value]);

  // Handle @ symbol detection
  useEffect(() => {
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1);
      const hasSpaceAfterAt = textAfterAt.includes(' ');
      
      if (!hasSpaceAfterAt && textareaRef.current && containerRef.current) {
        setAtSymbolPosition(lastAtIndex);
        setShowContacts(true);
        
        // Calculate position for contacts menu
        const containerRect = containerRef.current.getBoundingClientRect();
        setContactsPosition({
          x: containerRect.left,
          y: containerRect.top - 10
        });
      } else {
        setShowContacts(false);
        setAtSymbolPosition(-1);
      }
    } else {
      setShowContacts(false);
      setAtSymbolPosition(-1);
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    if (atSymbolPosition !== -1) {
      const beforeAt = value.substring(0, atSymbolPosition);
      const afterAt = value.substring(atSymbolPosition + 1);
      const afterSpace = afterAt.indexOf(' ');
      const afterAtText = afterSpace !== -1 ? afterAt.substring(afterSpace) : '';
      
      const newValue = `${beforeAt}@${contact.username}${afterAtText}`;
      onChange(newValue);
    }
    setShowContacts(false);
    setAtSymbolPosition(-1);
    textareaRef.current?.focus();
  };

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay blur to allow contact selection
    setTimeout(() => {
      if (!showContacts) {
        onBlur?.();
      }
    }, 150);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="relative">
        <div ref={containerRef} className="relative">
          {/* Highlighted Text Overlay */}
          <div
            className="absolute inset-0 p-4 pr-16 pointer-events-none whitespace-pre-wrap break-words overflow-hidden"
            style={{
              font: 'inherit',
              lineHeight: 'inherit',
              letterSpacing: 'inherit',
              wordSpacing: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              color: 'transparent'
            }}
          >
            {highlightedSegments.map((segment, index) => (
              <span
                key={index}
                className={`${HIGHLIGHT_COLORS[segment.type]} ${
                  segment.type !== 'normal' ? 'px-1 py-0.5 rounded-md' : ''
                }`}
              >
                {segment.text}
              </span>
            ))}
          </div>

          {/* Actual Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-4 pr-16 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white relative z-10"
            style={{ 
              caretColor: 'black',
              color: 'black'
            }}
          />

          {/* Action Buttons */}
          <div className="absolute bottom-4 right-4 flex items-center space-x-2 z-20">
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Contacts Context Menu */}
      {showContacts && (
        <ContactsContextMenu
          contacts={contacts}
          position={contactsPosition}
          onContactSelect={handleContactSelect}
          onClose={() => {
            setShowContacts(false);
            setAtSymbolPosition(-1);
          }}
          searchQuery={
            atSymbolPosition !== -1 
              ? value.substring(atSymbolPosition + 1).split(' ')[0]
              : ''
          }
        />
      )}
    </>
  );
}