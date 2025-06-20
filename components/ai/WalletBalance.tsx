'use client';

interface WalletData {
  balances: {
    [key: string]: {
      amount: number;
      value: number;
    };
  };
  totalValue: number;
  recentTransactions: Array<{
    id: string;
    type: 'received' | 'sent';
    amount: number;
    currency: string;
    from?: string;
    to?: string;
  }>;
}

interface WalletBalanceProps {
  query: string;
  data: WalletData;
}

export function WalletBalance({ query, data }: WalletBalanceProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto shadow-lg">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 text-xl">💰</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Wallet Overview</h3>
          <p className="text-sm text-gray-600">Your current balances</p>
        </div>
      </div>

      {/* Total Portfolio Value */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-100">
        <p className="text-sm text-gray-500 mb-1">Total Portfolio Value</p>
        <p className="text-2xl font-bold text-gray-900">
          ${data.totalValue.toLocaleString()}
        </p>
      </div>

      {/* Token Balances */}
      <div className="space-y-3 mb-4">
        <p className="text-sm font-medium text-gray-700">Token Balances</p>
        {Object.entries(data.balances).map(([currency, balance]) => (
          <div key={currency} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">{currency}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{currency}</p>
                <p className="text-xs text-gray-500">{balance.amount.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">${balance.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      {data.recentTransactions.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Recent Activity</p>
          <div className="space-y-2">
            {data.recentTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    tx.type === 'received' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className="text-xs">
                      {tx.type === 'received' ? '↓' : '↑'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">
                      {tx.type === 'received' ? 'Received' : 'Sent'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.type === 'received' ? `from ${tx.from}` : `to ${tx.to}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold ${
                    tx.type === 'received' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'received' ? '+' : '-'}{tx.amount} {tx.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}