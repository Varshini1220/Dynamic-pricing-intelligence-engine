import { DollarSign, TrendingUp, ShoppingCart, Activity, RefreshCw, Zap } from 'lucide-react';
import { formatCurrency, formatLargeCurrency } from '../utils/currency';

export default function Dashboard({ analytics }) {
  const metrics = analytics?.metrics || {};

  const cards = [
    {
      title: 'Total Revenue',
      value: formatLargeCurrency(metrics.totalRevenue || 0),
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      change: '+12.5%',
      subtitle: 'Last 24 hours'
    },
    {
      title: 'Total Profit',
      value: formatLargeCurrency(metrics.totalProfit || 0),
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600',
      change: '+8.3%',
      subtitle: 'Last 24 hours'
    },
    {
      title: 'Sales Count',
      value: metrics.totalSales || 0,
      icon: ShoppingCart,
      color: 'from-purple-500 to-pink-600',
      change: '+15.2%',
      subtitle: 'Last 24 hours'
    },
    {
      title: 'Customer Interactions',
      value: metrics.totalInteractions || 0,
      icon: Activity,
      color: 'from-orange-500 to-red-600',
      change: '+23.1%',
      subtitle: 'Last hour'
    },
    {
      title: 'AI Price Optimizations',
      value: metrics.priceChanges || 0,
      icon: Zap,
      color: 'from-yellow-500 to-amber-600',
      change: 'Live',
      subtitle: 'Real-time updates',
      pulse: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl animate-slideIn ${
            card.pulse ? 'animate-pulse-glow' : ''
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`bg-gradient-to-br ${card.color} p-2.5 rounded-lg ${card.pulse ? 'animate-pulse' : ''}`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            {card.pulse && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-semibold">Live</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">
              {card.title}
            </p>
            <p className="text-2xl font-bold text-white">
              {card.value}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {card.subtitle}
              </p>
              <span className={`text-xs font-semibold ${card.pulse ? 'text-yellow-400' : 'text-green-400'}`}>
                {card.change}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

