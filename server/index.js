const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const DatabaseManager = require('./database/schema');
const DataSimulator = require('./simulation/dataGenerator');
const DemandPredictor = require('./ml/demandPredictor');
const PricingEngine = require('./pricing/pricingEngine');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize components
const db = new DatabaseManager();
const demandPredictor = new DemandPredictor(db);
const pricingEngine = new PricingEngine(db, demandPredictor, io);
const dataSimulator = new DataSimulator(db, io);

// Initialize ML model
demandPredictor.initialize().then(() => {
  console.log('✅ System initialized');
  
  // Start simulation and pricing engine
  dataSimulator.start();
  pricingEngine.start();
});

// API Routes

// Get all products with current metrics
app.get('/api/products', (req, res) => {
  try {
    const products = db.db.prepare('SELECT * FROM products').all();
    
    const enrichedProducts = products.map(product => {
      // Get recent interactions
      const interactions = db.db.prepare(`
        SELECT COUNT(*) as count, interaction_type 
        FROM customer_interactions 
        WHERE product_id = ? AND timestamp > ?
        GROUP BY interaction_type
      `).all(product.id, Math.floor(Date.now() / 1000) - 3600);

      // Get competitor average
      const competitorAvg = db.db.prepare(`
        SELECT AVG(price) as avg_price FROM (
          SELECT price FROM competitor_prices
          WHERE product_id = ?
          ORDER BY timestamp DESC
          LIMIT 10
        )
      `).get(product.id);

      // Get recent sales
      const sales = db.db.prepare(`
        SELECT SUM(quantity) as total_sold, SUM(revenue) as total_revenue, SUM(profit) as total_profit
        FROM sales
        WHERE product_id = ? AND timestamp > ?
      `).get(product.id, Math.floor(Date.now() / 1000) - 3600);

      return {
        ...product,
        interactions: interactions.reduce((acc, i) => ({ ...acc, [i.interaction_type]: i.count }), {}),
        competitorAvgPrice: competitorAvg?.avg_price || null,
        recentSales: sales?.total_sold || 0,
        recentRevenue: sales?.total_revenue || 0,
        recentProfit: sales?.total_profit || 0
      };
    });

    res.json(enrichedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product details
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get pricing history
    const pricingHistory = db.db.prepare(`
      SELECT * FROM pricing_history
      WHERE product_id = ?
      ORDER BY timestamp DESC
      LIMIT 50
    `).all(req.params.id);

    // Get competitor prices
    const competitorPrices = db.db.prepare(`
      SELECT * FROM competitor_prices
      WHERE product_id = ?
      ORDER BY timestamp DESC
      LIMIT 100
    `).all(req.params.id);

    // Get interactions
    const interactions = db.db.prepare(`
      SELECT * FROM customer_interactions
      WHERE product_id = ?
      ORDER BY timestamp DESC
      LIMIT 100
    `).all(req.params.id);

    // Get sales
    const sales = db.db.prepare(`
      SELECT * FROM sales
      WHERE product_id = ?
      ORDER BY timestamp DESC
      LIMIT 50
    `).all(req.params.id);

    res.json({
      product,
      pricingHistory,
      competitorPrices,
      interactions,
      sales
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard analytics
app.get('/api/analytics/dashboard', (req, res) => {
  try {
    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
    const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;

    // Total metrics
    const totalRevenue = db.db.prepare(`
      SELECT SUM(revenue) as total FROM sales WHERE timestamp > ?
    `).get(oneDayAgo);

    const totalProfit = db.db.prepare(`
      SELECT SUM(profit) as total FROM sales WHERE timestamp > ?
    `).get(oneDayAgo);

    const totalSales = db.db.prepare(`
      SELECT COUNT(*) as total FROM sales WHERE timestamp > ?
    `).get(oneDayAgo);

    const totalInteractions = db.db.prepare(`
      SELECT COUNT(*) as total FROM customer_interactions WHERE timestamp > ?
    `).get(oneHourAgo);

    const priceChanges = db.db.prepare(`
      SELECT COUNT(*) as total FROM pricing_history WHERE timestamp > ?
    `).get(oneDayAgo);

    // Recent activity
    const recentPriceChanges = db.db.prepare(`
      SELECT ph.*, p.name as product_name
      FROM pricing_history ph
      JOIN products p ON ph.product_id = p.id
      ORDER BY ph.timestamp DESC
      LIMIT 10
    `).all();

    const recentSales = db.db.prepare(`
      SELECT s.*, p.name as product_name
      FROM sales s
      JOIN products p ON s.product_id = p.id
      ORDER BY s.timestamp DESC
      LIMIT 10
    `).all();

    // Category performance
    const categoryPerformance = db.db.prepare(`
      SELECT p.category, 
             COUNT(DISTINCT s.id) as sales_count,
             SUM(s.revenue) as revenue,
             SUM(s.profit) as profit
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE s.timestamp > ?
      GROUP BY p.category
    `).all(oneDayAgo);

    res.json({
      metrics: {
        totalRevenue: totalRevenue?.total || 0,
        totalProfit: totalProfit?.total || 0,
        totalSales: totalSales?.total || 0,
        totalInteractions: totalInteractions?.total || 0,
        priceChanges: priceChanges?.total || 0
      },
      recentPriceChanges,
      recentSales,
      categoryPerformance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/out')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/out/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  dataSimulator.stop();
  pricingEngine.stop();
  db.close();
  process.exit(0);
});

