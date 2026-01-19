const { v4: uuidv4 } = require('uuid');

class DataSimulator {
  constructor(db, io) {
    this.db = db;
    this.io = io;
    this.activeSessions = new Map();
    this.competitorNames = ['CompeteShop', 'MarketLeader', 'PriceKing', 'ValueMart', 'TechDeals'];
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Generate customer interactions every 2-5 seconds
    this.customerInteractionInterval = setInterval(() => {
      this.generateCustomerInteraction();
    }, Math.random() * 3000 + 2000);

    // Update competitor prices every 10-20 seconds
    this.competitorPriceInterval = setInterval(() => {
      this.updateCompetitorPrices();
    }, Math.random() * 10000 + 10000);

    // Generate purchases every 5-15 seconds
    this.purchaseInterval = setInterval(() => {
      this.generatePurchase();
    }, Math.random() * 10000 + 5000);

    console.log('✅ Data simulation started');
  }

  stop() {
    this.isRunning = false;
    clearInterval(this.customerInteractionInterval);
    clearInterval(this.competitorPriceInterval);
    clearInterval(this.purchaseInterval);
    console.log('⏹️  Data simulation stopped');
  }

  generateCustomerInteraction() {
    const products = this.db.db.prepare('SELECT * FROM products').all();
    if (products.length === 0) return;

    // Weighted selection - products with lower stock or higher prices get less traffic
    const product = this.selectWeightedProduct(products);
    const sessionId = this.getOrCreateSession();
    
    const interactionTypes = ['view', 'view', 'view', 'cart_add', 'cart_remove', 'bounce'];
    const weights = [40, 30, 20, 15, 5, 10]; // Views are most common
    const interactionType = this.weightedRandom(interactionTypes, weights);

    const timestamp = Math.floor(Date.now() / 1000);
    
    this.db.db.prepare(`
      INSERT INTO customer_interactions (product_id, interaction_type, session_id, price_at_interaction, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(product.id, interactionType, sessionId, product.current_price, timestamp);

    // Emit real-time event
    this.io.emit('customer_interaction', {
      productId: product.id,
      productName: product.name,
      type: interactionType,
      sessionId,
      price: product.current_price,
      timestamp: timestamp * 1000
    });
  }

  generatePurchase() {
    const products = this.db.db.prepare('SELECT * FROM products WHERE stock_level > 0').all();
    if (products.length === 0) return;

    // Higher chance of purchase for products with good price/demand ratio
    const product = this.selectWeightedProduct(products, true);
    
    // Purchase probability based on price competitiveness
    const purchaseProbability = this.calculatePurchaseProbability(product);
    if (Math.random() > purchaseProbability) return;

    const quantity = Math.random() < 0.8 ? 1 : Math.floor(Math.random() * 3) + 1;
    
    // Check stock
    if (product.stock_level < quantity) return;

    const revenue = product.current_price * quantity;
    const profit = (product.current_price - product.base_cost) * quantity;
    const timestamp = Math.floor(Date.now() / 1000);

    // Record sale
    this.db.db.prepare(`
      INSERT INTO sales (product_id, quantity, price, revenue, profit, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(product.id, quantity, product.current_price, revenue, profit, timestamp);

    // Update stock
    this.db.db.prepare(`
      UPDATE products SET stock_level = stock_level - ? WHERE id = ?
    `).run(quantity, product.id);

    // Emit real-time event
    this.io.emit('purchase', {
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.current_price,
      revenue,
      profit,
      remainingStock: product.stock_level - quantity,
      timestamp: timestamp * 1000
    });
  }

  updateCompetitorPrices() {
    const products = this.db.db.prepare('SELECT * FROM products').all();
    
    products.forEach(product => {
      // Each competitor updates with some probability
      this.competitorNames.forEach(competitor => {
        if (Math.random() < 0.3) { // 30% chance each competitor updates
          // Competitor prices fluctuate around our price ±20%
          const basePrice = product.current_price;
          const variation = (Math.random() - 0.5) * 0.4; // -20% to +20%
          const competitorPrice = basePrice * (1 + variation);
          const timestamp = Math.floor(Date.now() / 1000);

          this.db.db.prepare(`
            INSERT INTO competitor_prices (product_id, competitor_name, price, timestamp)
            VALUES (?, ?, ?, ?)
          `).run(product.id, competitor, competitorPrice, timestamp);
        }
      });
    });

    // Emit competitor update
    this.io.emit('competitor_update', { timestamp: Date.now() });
  }

  selectWeightedProduct(products, favorLowPrice = false) {
    const weights = products.map(p => {
      let weight = 1;
      // More stock = more visibility
      weight *= Math.log(p.stock_level + 1);
      // Lower price = more interest (if favorLowPrice)
      if (favorLowPrice) {
        weight *= (p.max_price - p.current_price) / (p.max_price - p.min_price + 1);
      }
      return Math.max(weight, 0.1);
    });

    return this.weightedRandom(products, weights);
  }

  weightedRandom(items, weights) {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  calculatePurchaseProbability(product) {
    // Base probability
    let prob = 0.15;
    
    // Price factor (lower price = higher probability)
    const priceRatio = (product.current_price - product.min_price) / (product.max_price - product.min_price);
    prob *= (1.5 - priceRatio);
    
    // Stock scarcity factor
    const stockRatio = product.stock_level / product.initial_stock;
    if (stockRatio < 0.2) prob *= 1.3; // Scarcity increases urgency
    
    return Math.min(prob, 0.5);
  }

  getOrCreateSession() {
    // Simulate realistic session behavior
    if (Math.random() < 0.3 || this.activeSessions.size === 0) {
      // 30% chance of new session
      const sessionId = uuidv4();
      this.activeSessions.set(sessionId, Date.now());
      return sessionId;
    }
    
    // Return random existing session
    const sessions = Array.from(this.activeSessions.keys());
    return sessions[Math.floor(Math.random() * sessions.length)];
  }

  getTimeDemandMultiplier() {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Peak hours: 10am-2pm, 6pm-10pm
    let multiplier = 1.0;
    if ((hour >= 10 && hour <= 14) || (hour >= 18 && hour <= 22)) {
      multiplier = 1.5;
    } else if (hour >= 0 && hour <= 6) {
      multiplier = 0.5; // Low activity at night
    }
    
    // Weekend boost
    if (day === 0 || day === 6) {
      multiplier *= 1.3;
    }
    
    return multiplier;
  }
}

module.exports = DataSimulator;

