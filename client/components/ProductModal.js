import { useEffect, useState } from 'react';
import { X, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import PricingFactors from './PricingFactors';
import { formatCurrency, CURRENCY_SYMBOL } from '../utils/currency';

const API_URL = 'http://localhost:3001';

export default function ProductModal({ product, onClose }) {
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [product.id]);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${product.id}`);
      const data = await response.json();
      setProductDetails(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const priceHistory = productDetails?.pricingHistory?.slice(0, 20).reverse().map(h => ({
    time: format(new Date(h.timestamp * 1000), 'HH:mm'),
    price: h.new_price,
    demand: h.demand_score,
    competitor: h.competitor_avg
  })) || [];

  const competitorData = productDetails?.competitorPrices?.slice(0, 30).reverse().reduce((acc, cp) => {
    const existing = acc.find(item => item.competitor === cp.competitor_name);
    if (!existing) {
      acc.push({
        competitor: cp.competitor_name,
        price: cp.price,
        ourPrice: product.current_price
      });
    }
    return acc;
  }, []) || [];

  const interactionData = productDetails?.interactions?.slice(0, 50).reverse().reduce((acc, interaction) => {
    const time = format(new Date(interaction.timestamp * 1000), 'HH:mm');
    const existing = acc.find(item => item.time === time);
    if (existing) {
      existing[interaction.interaction_type] = (existing[interaction.interaction_type] || 0) + 1;
    } else {
      acc.push({
        time,
        [interaction.interaction_type]: 1
      });
    }
    return acc;
  }, []) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-start justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-400">{product.category}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">ID: {product.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              icon={DollarSign}
              label="Current Price"
              value={formatCurrency(product.current_price)}
              color="from-green-500 to-emerald-600"
            />
            <MetricCard
              icon={Package}
              label="Stock Level"
              value={`${product.stock_level} / ${product.initial_stock}`}
              color="from-blue-500 to-cyan-600"
            />
            <MetricCard
              icon={TrendingUp}
              label="Margin"
              value={`${(((product.current_price - product.base_cost) / product.current_price) * 100).toFixed(1)}%`}
              color="from-purple-500 to-pink-600"
            />
            <MetricCard
              icon={Users}
              label="Recent Sales"
              value={product.recentSales || 0}
              color="from-orange-500 to-red-600"
            />
          </div>

          {/* AI Pricing Factors */}
          <PricingFactors product={product} />

          {/* Price History Chart */}
          <ChartCard title="Price & Demand History">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} name="Our Price" />
                <Line type="monotone" dataKey="competitor" stroke="#F59E0B" strokeWidth={2} name="Competitor Avg" />
                <Line type="monotone" dataKey="demand" stroke="#3B82F6" strokeWidth={2} name="Demand Score" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Competitor Comparison */}
          <ChartCard title="Competitor Price Comparison">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={competitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="competitor" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Bar dataKey="price" fill="#F59E0B" name="Competitor Price" />
                <Bar dataKey="ourPrice" fill="#10B981" name="Our Price" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Customer Interactions */}
          <ChartCard title="Customer Interaction Trends">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={interactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Area type="monotone" dataKey="view" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Views" />
                <Area type="monotone" dataKey="cart_add" stackId="1" stroke="#10B981" fill="#10B981" name="Cart Adds" />
                <Area type="monotone" dataKey="bounce" stackId="1" stroke="#EF4444" fill="#EF4444" name="Bounces" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Recent Price Changes */}
          <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Price Changes & AI Explanations</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {productDetails?.pricingHistory?.slice(0, 10).map((change, index) => (
                <div key={index} className="bg-gray-800 rounded p-3 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                      ${change.old_price.toFixed(2)} → ${change.new_price.toFixed(2)}
                    </span>
                    <span className={`text-sm font-semibold ${
                      change.new_price > change.old_price ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {((change.new_price - change.old_price) / change.old_price * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-blue-400 italic">{change.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(change.timestamp * 1000), 'MMM dd, HH:mm:ss')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
      <div className={`bg-gradient-to-br ${color} p-2 rounded-lg w-fit mb-2`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-gray-750 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

