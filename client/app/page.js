'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Dashboard from '../components/Dashboard';
import ProductGrid from '../components/ProductGrid';
import ActivityFeed from '../components/ActivityFeed';
import Header from '../components/Header';

const API_URL = 'http://localhost:3001';

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Listen for real-time events
    newSocket.on('price_change', (data) => {
      console.log('Price change:', data);
      addActivity({
        type: 'price_change',
        ...data
      });
      fetchProducts();
    });

    newSocket.on('purchase', (data) => {
      console.log('Purchase:', data);
      addActivity({
        type: 'purchase',
        ...data
      });
      fetchProducts();
      fetchAnalytics();
    });

    newSocket.on('customer_interaction', (data) => {
      addActivity({
        type: 'interaction',
        ...data
      });
    });

    newSocket.on('competitor_update', (data) => {
      fetchProducts();
    });

    // Initial data fetch
    fetchProducts();
    fetchAnalytics();

    // Periodic refresh
    const interval = setInterval(() => {
      fetchProducts();
      fetchAnalytics();
    }, 10000); // Refresh every 10 seconds

    return () => {
      newSocket.close();
      clearInterval(interval);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/dashboard`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const addActivity = (activity) => {
    setActivities(prev => [activity, ...prev].slice(0, 50)); // Keep last 50 activities
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header isConnected={isConnected} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Dashboard Analytics */}
        {analytics && <Dashboard analytics={analytics} />}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ProductGrid products={products} />
          </div>

          {/* Activity Feed - Takes 1 column */}
          <div className="lg:col-span-1">
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </main>
    </div>
  );
}

