'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserDropdownProps {
  expanded: boolean;
}

export function UserDropdown({ expanded }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSettingsClick = () => {
    setIsOpen(false);
    window.location.href = '/settings';
  };

  const menuItems = [
    { icon: User, label: 'Personal', sublabel: 'Free plan', active: true },
    { icon: Settings, label: 'Settings', onClick: handleSettingsClick },
    { icon: HelpCircle, label: 'Language', sublabel: 'BETA', badge: true },
    { icon: HelpCircle, label: 'Get help' },
    { icon: Settings, label: 'Upgrade plan' },
    { icon: HelpCircle, label: 'Learn more' },
    { icon: LogOut, label: 'Log out' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center transition-colors rounded-lg hover:bg-gray-100",
          expanded ? "w-full space-x-3 p-2" : "w-8 h-8 justify-center"
        )}
      >
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          C
        </div>
        {expanded && (
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-medium text-gray-900">Chijioke</div>
            <div className="text-xs text-gray-500">Free plan</div>
          </div>
        )}
      </button>

      {isOpen && (
        <div className={cn(
          "absolute bottom-full mb-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
          expanded ? "left-0" : "left-12"
        )}>
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm text-gray-600">osadebec98@gmail.com</div>
          </div>
          
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors",
                item.active && "bg-blue-50"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  item.active ? "bg-blue-100" : "bg-gray-100"
                )}>
                  <item.icon className={cn(
                    "w-3 h-3",
                    item.active ? "text-blue-600" : "text-gray-600"
                  )} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                  {item.sublabel && (
                    <div className="text-xs text-gray-500">{item.sublabel}</div>
                  )}
                </div>
              </div>
              {item.active && (
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
              {item.badge && (
                <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                  BETA
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}