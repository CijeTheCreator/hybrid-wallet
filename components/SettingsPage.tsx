'use client';

import { useState } from 'react';
import { 
  Shield, 
  Bell, 
  Globe, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Check,
  ChevronRight,
  QrCode,
  Copy,
  Download,
  AlertTriangle
} from 'lucide-react';
import { Sidebar } from './Sidebar';

interface SettingsPageProps {}

export function SettingsPage({}: SettingsPageProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'security' | 'notifications' | 'language'>('security');
  
  // 2FA Settings State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  
  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState({
    transactions: true,
    security: true,
    marketing: false,
    updates: true
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    transactions: true,
    priceAlerts: false,
    security: true,
    news: false
  });
  
  const [smsNotifications, setSmsNotifications] = useState({
    transactions: false,
    security: true,
    twoFactor: true
  });
  
  // Language Settings State
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const regions = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'EU', name: 'European Union', flag: '🇪🇺' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' }
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
  ];

  const handleNewChat = () => {
    window.location.href = '/';
  };

  const generateBackupCodes = () => {
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
    setShowBackupCodes(true);
  };

  const enable2FA = () => {
    setShowQRCode(true);
  };

  const confirm2FA = () => {
    setTwoFactorEnabled(true);
    setShowQRCode(false);
    generateBackupCodes();
  };

  const disable2FA = () => {
    setTwoFactorEnabled(false);
    setShowQRCode(false);
    setShowBackupCodes(false);
    setBackupCodes([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language & Region', icon: Globe }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        expanded={sidebarExpanded} 
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        onNewChat={handleNewChat}
        currentChatId={undefined}
      />
      
      <div className="flex-1 flex">
        {/* Settings Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
          </div>
          
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {activeSection === 'security' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Security Settings</h2>
                  <p className="text-gray-600">Manage your account security and authentication methods.</p>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {twoFactorEnabled && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Enabled
                        </span>
                      )}
                      <button
                        onClick={twoFactorEnabled ? disable2FA : enable2FA}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          twoFactorEnabled
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        {twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                      </button>
                    </div>
                  </div>

                  {showQRCode && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Set up your authenticator app</h4>
                      <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                          <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                            <QrCode className="w-16 h-16 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">Scan with your app</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-3">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                          </p>
                          <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-gray-500 mb-1">Manual entry key:</p>
                            <div className="flex items-center space-x-2">
                              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                JBSWY3DPEHPK3PXP
                              </code>
                              <button
                                onClick={() => copyToClipboard('JBSWY3DPEHPK3PXP')}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={confirm2FA}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Verify & Enable
                            </button>
                            <button
                              onClick={() => setShowQRCode(false)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {showBackupCodes && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-yellow-800 mb-2">Save your backup codes</h4>
                          <p className="text-sm text-yellow-700 mb-4">
                            Store these codes in a safe place. You can use them to access your account if you lose your phone.
                          </p>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {backupCodes.map((code, index) => (
                              <div key={index} className="bg-white border border-yellow-200 rounded px-3 py-2">
                                <code className="text-sm font-mono">{code}</code>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={downloadBackupCodes}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Codes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password Settings */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Password</h3>
                        <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Login Sessions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Smartphone className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
                        <p className="text-sm text-gray-500">Manage your active login sessions</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                      Sign Out All
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Current Session</p>
                          <p className="text-xs text-gray-500">Chrome on macOS • New York, US</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">Active now</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Mobile App</p>
                          <p className="text-xs text-gray-500">iPhone • New York, US</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Notification Settings</h2>
                  <p className="text-gray-600">Choose how you want to be notified about account activity.</p>
                </div>

                {/* Email Notifications */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(emailNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {key === 'marketing' ? 'Marketing & Promotions' : key}
                          </p>
                          <p className="text-xs text-gray-500">
                            {key === 'transactions' && 'Get notified about transaction confirmations'}
                            {key === 'security' && 'Important security alerts and login notifications'}
                            {key === 'marketing' && 'Product updates and promotional offers'}
                            {key === 'updates' && 'Platform updates and new features'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setEmailNotifications(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Bell className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
                      <p className="text-sm text-gray-500">Receive notifications on your devices</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(pushNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {key === 'priceAlerts' ? 'Price Alerts' : key}
                          </p>
                          <p className="text-xs text-gray-500">
                            {key === 'transactions' && 'Real-time transaction notifications'}
                            {key === 'priceAlerts' && 'Alerts when your assets reach target prices'}
                            {key === 'security' && 'Security alerts and suspicious activity'}
                            {key === 'news' && 'Market news and updates'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setPushNotifications(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SMS Notifications */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
                      <p className="text-sm text-gray-500">Receive critical notifications via SMS</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.entries(smsNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {key === 'twoFactor' ? 'Two-Factor Authentication' : key}
                          </p>
                          <p className="text-xs text-gray-500">
                            {key === 'transactions' && 'High-value transaction confirmations'}
                            {key === 'security' && 'Critical security alerts only'}
                            {key === 'twoFactor' && 'SMS codes for two-factor authentication'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setSmsNotifications(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'language' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Language & Region</h2>
                  <p className="text-gray-600">Customize your language, region, and currency preferences.</p>
                </div>

                {/* Language Selection */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Display Language</h3>
                      <p className="text-sm text-gray-500">Choose your preferred language for the interface</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => setSelectedLanguage(language.code)}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          selectedLanguage === language.code
                            ? 'border-orange-300 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{language.flag}</span>
                          <span className="font-medium">{language.name}</span>
                        </div>
                        {selectedLanguage === language.code && (
                          <Check className="w-5 h-5 text-orange-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region Selection */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Region</h3>
                      <p className="text-sm text-gray-500">Select your region for localized content and regulations</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {regions.map((region) => (
                      <button
                        key={region.code}
                        onClick={() => setSelectedRegion(region.code)}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          selectedRegion === region.code
                            ? 'border-orange-300 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{region.flag}</span>
                          <span className="font-medium">{region.name}</span>
                        </div>
                        {selectedRegion === region.code && (
                          <Check className="w-5 h-5 text-orange-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Currency Selection */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Globe className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Display Currency</h3>
                      <p className="text-sm text-gray-500">Choose your preferred currency for displaying values</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => setSelectedCurrency(currency.code)}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          selectedCurrency === currency.code
                            ? 'border-orange-300 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-mono font-bold text-gray-600">{currency.symbol}</span>
                          <div className="text-left">
                            <p className="font-medium">{currency.code}</p>
                            <p className="text-xs text-gray-500">{currency.name}</p>
                          </div>
                        </div>
                        {selectedCurrency === currency.code && (
                          <Check className="w-5 h-5 text-orange-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Zone */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Globe className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Time Zone</h3>
                        <p className="text-sm text-gray-500">Eastern Standard Time (EST)</p>
                      </div>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <span>Change</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}