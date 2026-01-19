import { TrendingUp, TrendingDown, Users, Package, DollarSign, Zap, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function PricingFactors({ product }) {
  if (!product) return null;

  const stockPercentage = (product.stock_level / product.initial_stock) * 100;
  const totalInteractions = (product.interactions?.view || 0) + (product.interactions?.cart_add || 0);
  const demandLevel = totalInteractions > 20 ? 'High' : totalInteractions > 10 ? 'Medium' : 'Low';
  
  const priceVsCompetitor = product.competitorAvgPrice 
    ? ((product.current_price - product.competitorAvgPrice) / product.competitorAvgPrice * 100).toFixed(1)
    : null;

  const margin = ((product.current_price - product.base_cost) / product.current_price * 100).toFixed(1);

  const factors = [
    {
      icon: Users,
      label: 'Demand',
      value: demandLevel,
      detail: `${totalInteractions} interactions`,
      color: demandLevel === 'High' ? 'text-green-400' : demandLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400',
      bgColor: demandLevel === 'High' ? 'bg-green-500/20' : demandLevel === 'Medium' ? 'bg-yellow-500/20' : 'bg-red-500/20',
      impact: demandLevel === 'High' ? '↑ Price' : demandLevel === 'Low' ? '↓ Price' : '→ Stable'
    },
    {
      icon: Package,
      label: 'Stock Level',
      value: `${stockPercentage.toFixed(0)}%`,
      detail: `${product.stock_level} / ${product.initial_stock} units`,
      color: stockPercentage > 50 ? 'text-green-400' : stockPercentage > 20 ? 'text-yellow-400' : 'text-red-400',
      bgColor: stockPercentage > 50 ? 'bg-green-500/20' : stockPercentage > 20 ? 'bg-yellow-500/20' : 'bg-red-500/20',
      impact: stockPercentage < 30 ? '↑ Scarcity' : stockPercentage > 80 ? '↓ Clearance' : '→ Normal'
    },
    {
      icon: BarChart3,
      label: 'Competition',
      value: priceVsCompetitor ? `${parseFloat(priceVsCompetitor) > 0 ? '+' : ''}${priceVsCompetitor}%` : 'N/A',
      detail: product.competitorAvgPrice ? `Avg: ${formatCurrency(product.competitorAvgPrice)}` : 'No data',
      color: priceVsCompetitor && parseFloat(priceVsCompetitor) < 0 ? 'text-green-400' : 'text-orange-400',
      bgColor: priceVsCompetitor && parseFloat(priceVsCompetitor) < 0 ? 'bg-green-500/20' : 'bg-orange-500/20',
      impact: priceVsCompetitor && parseFloat(priceVsCompetitor) > 5 ? '↓ Match' : '→ Competitive'
    },
    {
      icon: DollarSign,
      label: 'Profit Margin',
      value: `${margin}%`,
      detail: `Cost: ${formatCurrency(product.base_cost)}`,
      color: parseFloat(margin) > 30 ? 'text-green-400' : parseFloat(margin) > 20 ? 'text-yellow-400' : 'text-red-400',
      bgColor: parseFloat(margin) > 30 ? 'bg-green-500/20' : parseFloat(margin) > 20 ? 'bg-yellow-500/20' : 'bg-red-500/20',
      impact: parseFloat(margin) < 20 ? '↑ Protect' : '→ Healthy'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center mb-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-2">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white">AI Pricing Factors</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {factors.map((factor, index) => {
          const Icon = factor.icon;
          return (
            <div
              key={index}
              className={`${factor.bgColor} rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <Icon className={`w-5 h-5 ${factor.color} mt-0.5`} />
                  <div>
                    <p className="text-xs text-gray-400">{factor.label}</p>
                    <p className={`text-xl font-bold ${factor.color}`}>{factor.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{factor.detail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-semibold px-2 py-1 rounded ${
                    factor.impact.includes('↑') ? 'bg-green-500/30 text-green-300' :
                    factor.impact.includes('↓') ? 'bg-red-500/30 text-red-300' :
                    'bg-gray-500/30 text-gray-300'
                  }`}>
                    {factor.impact}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-3 border border-blue-700/30">
        <div className="flex items-start">
          <Zap className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400 mb-1">Current Strategy:</p>
            <p className="text-sm text-blue-300 font-medium">
              {stockPercentage < 30 
                ? '🔥 Scarcity Pricing - Low stock drives premium pricing'
                : stockPercentage > 80
                ? '📦 Clearance Mode - High stock requires aggressive pricing'
                : demandLevel === 'High'
                ? '📈 Demand-Based - High interest allows price optimization'
                : priceVsCompetitor && parseFloat(priceVsCompetitor) > 5
                ? '🎯 Competitive Matching - Adjusting to market rates'
                : '⚖️ Balanced Pricing - Optimizing for profit and volume'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

