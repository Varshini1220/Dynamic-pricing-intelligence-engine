import { DollarSign, ShoppingCart, Eye, MousePointer, TrendingUp, TrendingDown, Zap, BarChart3, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '../utils/currency';

export default function ActivityFeed({ activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'price_change':
        return DollarSign;
      case 'purchase':
        return ShoppingCart;
      case 'interaction':
        return Eye;
      default:
        return MousePointer;
    }
  };

  const getActivityColor = (activity) => {
    if (activity.type === 'price_change') {
      return parseFloat(activity.change) > 0 ? 'text-green-400' : 'text-red-400';
    }
    if (activity.type === 'purchase') {
      return 'text-blue-400';
    }
    return 'text-gray-400';
  };

  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'price_change':
        const change = parseFloat(activity.change);
        const direction = change > 0 ? 'increased' : 'decreased';
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-white">{activity.productName}</p>
              <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center ${
                change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {change > 0 ? '+' : ''}{change.toFixed(2)}%
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-2 border border-gray-700 mb-2">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Old Price</span>
                  <p className="text-red-400 font-semibold line-through">
                    {formatCurrency(activity.oldPrice)}
                  </p>
                </div>
                <div className="text-gray-600 text-xl">→</div>
                <div>
                  <span className="text-gray-500 text-xs">New Price</span>
                  <p className="text-green-400 font-semibold text-lg">
                    {formatCurrency(activity.newPrice)}
                  </p>
                </div>
              </div>
            </div>

            {activity.reason && (
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-2 border border-blue-700/30">
                <div className="flex items-start">
                  <Zap className="w-3 h-3 text-yellow-400 mr-1 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">AI Reasoning:</p>
                    <p className="text-xs text-blue-300 font-medium">
                      {activity.reason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'purchase':
        return (
          <div>
            <p className="font-medium text-white">{activity.productName}</p>
            <p className="text-sm text-gray-400">
              {activity.quantity} unit{activity.quantity > 1 ? 's' : ''} sold for {formatCurrency(activity.revenue)}
            </p>
            <p className="text-xs text-green-400 mt-1">
              Profit: {formatCurrency(activity.profit)} • Stock: {activity.remainingStock}
            </p>
          </div>
        );
      case 'interaction':
        const interactionLabels = {
          view: 'viewed',
          cart_add: 'added to cart',
          cart_remove: 'removed from cart',
          bounce: 'bounced'
        };
        return (
          <div>
            <p className="font-medium text-white">{activity.productName}</p>
            <p className="text-sm text-gray-400">
              Customer {interactionLabels[activity.type] || activity.type}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Price: {activity.price ? formatCurrency(activity.price) : 'N/A'}
            </p>
          </div>
        );
      default:
        return <p className="text-sm text-gray-400">Unknown activity</p>;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-[calc(100vh-20rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Live Activity Feed</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Real-time</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {activities.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Waiting for activity...</p>
          </div>
        )}

        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const color = getActivityColor(activity);

          return (
            <div
              key={index}
              className="bg-gray-750 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all duration-200 animate-slideIn"
            >
              <div className="flex items-start space-x-3">
                <div className={`${color} mt-1`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  {getActivityMessage(activity)}
                  <p className="text-xs text-gray-600 mt-2">
                    {activity.timestamp && formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

