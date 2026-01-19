import { TrendingUp, TrendingDown, Package, Eye, ShoppingCart, DollarSign, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/currency';

export default function ProductCard({ product, onClick }) {
  const [priceChanged, setPriceChanged] = useState(false);
  const [previousPrice, setPreviousPrice] = useState(product.current_price);

  useEffect(() => {
    if (product.current_price !== previousPrice) {
      setPriceChanged(true);
      setPreviousPrice(product.current_price);
      setTimeout(() => setPriceChanged(false), 2000);
    }
  }, [product.current_price]);

  const stockPercentage = (product.stock_level / product.initial_stock) * 100;
  const stockColor = stockPercentage > 50 ? 'bg-green-500' : stockPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500';
  const stockTextColor = stockPercentage > 50 ? 'text-green-400' : stockPercentage > 20 ? 'text-yellow-400' : 'text-red-400';

  const priceVsCompetitor = product.competitorAvgPrice
    ? ((product.current_price - product.competitorAvgPrice) / product.competitorAvgPrice * 100).toFixed(1)
    : null;

  const margin = ((product.current_price - product.base_cost) / product.current_price * 100).toFixed(1);

  // Calculate demand indicator
  const totalInteractions = (product.interactions?.view || 0) + (product.interactions?.cart_add || 0);
  const demandLevel = totalInteractions > 20 ? 'High' : totalInteractions > 10 ? 'Medium' : 'Low';
  const demandColor = totalInteractions > 20 ? 'text-green-400' : totalInteractions > 10 ? 'text-yellow-400' : 'text-red-400';

  // Price change indicator
  const priceChange = previousPrice !== product.current_price
    ? ((product.current_price - previousPrice) / previousPrice * 100).toFixed(2)
    : null;

  return (
    <div
      onClick={onClick}
      className={`bg-gray-750 rounded-lg p-4 border transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 group relative overflow-hidden ${
        priceChanged ? 'border-yellow-500 shadow-lg shadow-yellow-500/30' : 'border-gray-700 hover:border-blue-500'
      }`}
    >
      {/* Price Change Flash Animation */}
      {priceChanged && (
        <div className="absolute inset-0 bg-yellow-500/10 animate-pulse pointer-events-none" />
      )}

      {/* AI Optimized Badge */}
      <div className="absolute top-2 right-2">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Zap className="w-3 h-3" />
          AI Optimized
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-3 mt-6">
        <div className="flex-1">
          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{product.category}</p>
        </div>
      </div>

      {/* Price Section with Animation */}
      <div className="mb-3 bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Current Price</p>
            <div className={`text-3xl font-bold transition-all duration-500 ${
              priceChanged ? 'text-yellow-400 scale-110' : 'text-green-400'
            }`}>
              {formatCurrency(product.current_price)}
            </div>
            {priceChange && parseFloat(priceChange) !== 0 && (
              <div className={`text-xs mt-1 flex items-center ${
                parseFloat(priceChange) > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {parseFloat(priceChange) > 0 ? '↑' : '↓'} {Math.abs(priceChange)}% from last
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Base Cost</p>
            <p className="text-sm text-gray-300">{formatCurrency(product.base_cost)}</p>
            <p className="text-xs text-green-400 mt-1">+{margin}% margin</p>
          </div>
        </div>
      </div>

      {/* Competitor Comparison */}
      {priceVsCompetitor && (
        <div className="mb-3 bg-gray-800 rounded-lg p-2 border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">vs Competitors</span>
            <div className={`text-xs flex items-center font-semibold ${
              parseFloat(priceVsCompetitor) < 0 ? 'text-green-400' : 'text-orange-400'
            }`}>
              {parseFloat(priceVsCompetitor) < 0 ? (
                <>
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {Math.abs(priceVsCompetitor)}% cheaper
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {Math.abs(priceVsCompetitor)}% pricier
                </>
              )}
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Avg: {product.competitorAvgPrice ? formatCurrency(product.competitorAvgPrice) : 'N/A'}
          </div>
        </div>
      )}

      {/* Demand Indicator */}
      <div className="mb-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-2 border border-blue-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Demand Level</span>
          <div className={`text-xs font-bold ${demandColor} flex items-center`}>
            {demandLevel === 'High' && <CheckCircle className="w-3 h-3 mr-1" />}
            {demandLevel === 'Medium' && <AlertCircle className="w-3 h-3 mr-1" />}
            {demandLevel === 'Low' && <AlertCircle className="w-3 h-3 mr-1" />}
            {demandLevel}
          </div>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {totalInteractions} interactions (1h)
        </div>
      </div>

      {/* Stock Level */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="flex items-center text-gray-400">
            <Package className="w-3 h-3 mr-1" />
            Stock Level
          </span>
          <span className={`font-semibold ${stockTextColor}`}>
            {product.stock_level} / {product.initial_stock} ({stockPercentage.toFixed(0)}%)
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`${stockColor} h-2 rounded-full transition-all duration-500 relative`}
            style={{ width: `${stockPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        {stockPercentage < 30 && (
          <p className="text-xs text-red-400 mt-1 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Low stock - Scarcity pricing active
          </p>
        )}
        {stockPercentage > 80 && (
          <p className="text-xs text-yellow-400 mt-1 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            High stock - Clearance pricing active
          </p>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded p-2 border border-blue-700/30">
          <div className="flex items-center text-xs text-blue-300 mb-1">
            <Eye className="w-3 h-3 mr-1" />
            Views
          </div>
          <div className="text-lg font-bold text-white">
            {product.interactions?.view || 0}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 rounded p-2 border border-green-700/30">
          <div className="flex items-center text-xs text-green-300 mb-1">
            <ShoppingCart className="w-3 h-3 mr-1" />
            Cart
          </div>
          <div className="text-lg font-bold text-white">
            {product.interactions?.cart_add || 0}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded p-2 border border-purple-700/30">
          <div className="flex items-center text-xs text-purple-300 mb-1">
            <DollarSign className="w-3 h-3 mr-1" />
            Sales
          </div>
          <div className="text-lg font-bold text-white">
            {product.recentSales || 0}
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="bg-gray-800 rounded-lg p-2 border border-gray-700">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">Revenue (1h):</span>
          <span className="font-bold text-green-400">
            {formatCurrency(product.recentRevenue || 0)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Profit (1h):</span>
          <span className="font-bold text-blue-400">
            {formatCurrency(product.recentProfit || 0)}
          </span>
        </div>
      </div>

      {/* Click to view details hint */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors">
          Click for detailed analytics →
        </p>
      </div>
    </div>
  );
}

