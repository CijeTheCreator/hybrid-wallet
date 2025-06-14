'use client';

import { 
  MessageSquare, 
  Plus, 
  Receipt, 
  PanelLeftClose, 
  PanelLeftOpen,
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserDropdown } from './UserDropdown';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  currentChatId?: string;
}

export function Sidebar({ expanded, onToggle, onNewChat, currentChatId }: SidebarProps) {
  const recentChats = [
    { id: 'chat_1', title: 'Docker Multi-App Container Setup' },
    { id: 'chat_2', title: 'Ethereum Faucet Route with Prisma' },
    { id: 'chat_3', title: 'Untitled' },
    { id: 'chat_4', title: 'SendGrid Email API Curl Request' },
    { id: 'chat_5', title: 'Flask Project Docker Configuration' },
    { id: 'chat_6', title: 'Clerk Webhook User Creation in N...' },
    { id: 'chat_7', title: 'Python API Balance Route Function' },
    { id: 'chat_8', title: 'Python Wallet Send Function' },
    { id: 'chat_9', title: 'Untitled' },
    { id: 'chat_10', title: 'Flask Postmark Webhook Endpoint' },
    { id: 'chat_11', title: 'Write a python function that c...' },
    { id: 'chat_12', title: 'Flask Postmark Webhook Endpoint' },
    { id: 'chat_13', title: 'Ethereum Transaction History Fet...' },
    { id: 'chat_14', title: 'Etherscan Transaction History Fu...' },
  ];

  return (
    <div className={cn(
      "relative bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
      expanded ? "w-64" : "w-12"
    )}>
      {/* Header */}
      <div className={cn(
        "p-3 border-b border-gray-100",
        !expanded && "flex justify-center"
      )}>
        <div className="flex items-center justify-between">
          {expanded && (
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-gray-700" />
              <span className="font-medium text-gray-900">Claude</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {expanded ? (
              <PanelLeftClose className="w-4 h-4 text-gray-600" />
            ) : (
              <PanelLeftOpen className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className={cn(
        "p-3",
        !expanded && "flex justify-center"
      )}>
        <button 
          onClick={onNewChat}
          className={cn(
            "bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center justify-center",
            expanded 
              ? "w-full space-x-3 p-2 rounded-lg" 
              : "w-8 h-8 rounded-full"
          )}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {expanded && <span className="text-sm font-medium">New chat</span>}
        </button>
      </div>

      {/* Transactions Section */}
      <div className={cn(
        "p-3 border-b border-gray-100",
        !expanded && "flex justify-center"
      )}>
        <button className={cn(
          "flex items-center hover:bg-gray-100 transition-colors",
          expanded 
            ? "w-full space-x-3 p-2 rounded-lg" 
            : "w-8 h-8 justify-center rounded-lg"
        )}>
          <Receipt className="w-4 h-4 flex-shrink-0 text-gray-600" />
          {expanded && <span className="text-sm text-gray-700">Transactions</span>}
        </button>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto">
        {expanded && (
          <div className="p-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Recents
            </h3>
            <div className="space-y-1">
              {recentChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => window.location.href = `/chats/${chat.id}`}
                  className={cn(
                    "w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors group",
                    currentChatId === chat.id && "bg-gray-100"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate pr-2">
                      {chat.title}
                    </span>
                    <MoreHorizontal className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom User Section */}
      <div className={cn(
        "p-3 border-t border-gray-100",
        !expanded && "flex justify-center"
      )}>
        <UserDropdown expanded={expanded} />
      </div>
    </div>
  );
}