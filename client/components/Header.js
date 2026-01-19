import { Activity, Zap, IndianRupee } from 'lucide-react';
import { getConversionInfo } from '../utils/currency';

export default function Header({ isConnected }) {
  const conversionInfo = getConversionInfo();
  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Dynamic Pricing Intelligence Engine
              </h1>
              <p className="text-sm text-gray-400">
                AI-Powered Real-time Price Optimization
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-600">
              <div className="flex items-center space-x-2 mb-1">
                <IndianRupee className="w-4 h-4 text-green-400" />
                <span className="text-white text-xs font-medium">Currency: INR</span>
              </div>
              <div className="text-green-300 text-xs">{conversionInfo.formatted}</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-300">
                {isConnected ? 'Live' : 'Disconnected'}
              </span>
            </div>
            <Activity className="w-5 h-5 text-blue-400 animate-pulse-slow" />
          </div>
        </div>
      </div>
    </header>
  );
}

