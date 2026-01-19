// Lightweight ML predictor using statistical methods
// For full TensorFlow.js support, install: npm install @tensorflow/tfjs-node

class DemandPredictor {
  constructor(db) {
    this.db = db;
    this.model = null;
    this.isTraining = false;
    this.featureStats = null;
    this.useTensorFlow = false;

    // Try to load TensorFlow if available
    try {
      this.tf = require('@tensorflow/tfjs-node');
      this.useTensorFlow = true;
    } catch (e) {
      console.log('ℹ️  Running with statistical ML (TensorFlow not installed)');
    }
  }

  async initialize() {
    if (this.useTensorFlow) {
      // Create a simple neural network for demand prediction
      this.model = this.tf.sequential({
        layers: [
          this.tf.layers.dense({ inputShape: [8], units: 16, activation: 'relu' }),
          this.tf.layers.dropout({ rate: 0.2 }),
          this.tf.layers.dense({ units: 8, activation: 'relu' }),
          this.tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      this.model.compile({
        optimizer: this.tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });

      console.log('✅ ML Model initialized (TensorFlow)');
    } else {
      console.log('✅ ML Model initialized (Statistical)');
    }
  }

  extractFeatures(product, competitorAvg, timeMultiplier, recentInteractions) {
    // Feature engineering
    const priceRatio = (product.current_price - product.min_price) / (product.max_price - product.min_price);
    const stockRatio = product.stock_level / product.initial_stock;
    const competitivenessRatio = competitorAvg > 0 ? product.current_price / competitorAvg : 1.0;
    const marginRatio = (product.current_price - product.base_cost) / product.current_price;
    
    // Interaction metrics
    const viewCount = recentInteractions.filter(i => i.interaction_type === 'view').length;
    const cartAddCount = recentInteractions.filter(i => i.interaction_type === 'cart_add').length;
    const bounceCount = recentInteractions.filter(i => i.interaction_type === 'bounce').length;
    
    const interactionScore = (viewCount * 0.3 + cartAddCount * 0.7 - bounceCount * 0.5) / Math.max(viewCount + cartAddCount + bounceCount, 1);

    return [
      priceRatio,                    // 0-1: where price sits in min-max range
      stockRatio,                    // 0-1: stock availability
      competitivenessRatio,          // <1 = cheaper than competitors, >1 = more expensive
      marginRatio,                   // profit margin ratio
      timeMultiplier,                // time-based demand (peak hours, weekends)
      Math.min(interactionScore, 1), // normalized interaction score
      product.category === 'Electronics' ? 1 : 0, // category encoding
      Math.log(product.stock_level + 1) / 10 // log-scaled stock level
    ];
  }

  normalizeFeatures(features) {
    // Simple min-max normalization
    return features.map((f, i) => {
      if (i === 2) return Math.min(f, 2) / 2; // Competitiveness ratio
      if (i === 7) return Math.min(f, 1); // Log stock
      return Math.max(0, Math.min(f, 1));
    });
  }

  async predictDemand(product, competitorAvg, timeMultiplier) {
    if (!this.model && this.useTensorFlow) {
      await this.initialize();
    }

    // Get recent interactions (last 5 minutes)
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
    const recentInteractions = this.db.db.prepare(`
      SELECT interaction_type FROM customer_interactions
      WHERE product_id = ? AND timestamp > ?
    `).all(product.id, fiveMinutesAgo);

    const features = this.extractFeatures(product, competitorAvg, timeMultiplier, recentInteractions);
    const normalizedFeatures = this.normalizeFeatures(features);

    let demandScore;

    if (this.useTensorFlow && this.model) {
      // Use TensorFlow prediction
      const inputTensor = this.tf.tensor2d([normalizedFeatures]);
      const prediction = this.model.predict(inputTensor);
      demandScore = (await prediction.data())[0];

      // Cleanup tensors
      inputTensor.dispose();
      prediction.dispose();
    } else {
      // Use statistical prediction (weighted average of features)
      demandScore = this.statisticalPredict(normalizedFeatures);
    }

    // Calculate confidence based on data availability
    const confidence = Math.min(0.5 + (recentInteractions.length / 20), 0.95);

    return {
      demandScore: demandScore * 100, // Convert to 0-100 scale
      confidence: confidence * 100,
      features: {
        pricePosition: normalizedFeatures[0],
        stockLevel: normalizedFeatures[1],
        competitiveness: normalizedFeatures[2],
        margin: normalizedFeatures[3],
        timeMultiplier: normalizedFeatures[4],
        interactionScore: normalizedFeatures[5]
      }
    };
  }

  statisticalPredict(features) {
    // Statistical prediction using weighted features
    // Lower price position = higher demand
    const priceScore = (1 - features[0]) * 0.25;
    // Higher stock = higher availability
    const stockScore = features[1] * 0.15;
    // Lower price vs competitors = higher demand
    const competitiveScore = Math.max(0, (2 - features[2]) / 2) * 0.25;
    // Margin doesn't directly affect demand
    const marginScore = features[3] * 0.05;
    // Time multiplier
    const timeScore = features[4] * 0.15;
    // Interaction score
    const interactionScore = features[5] * 0.15;

    return Math.min(Math.max(
      priceScore + stockScore + competitiveScore + marginScore + timeScore + interactionScore,
      0.1
    ), 0.9);
  }

  async trainOnHistoricalData() {
    if (this.isTraining || !this.useTensorFlow) return;
    this.isTraining = true;

    try {
      // Get historical sales data
      const salesData = this.db.db.prepare(`
        SELECT s.*, p.* FROM sales s
        JOIN products p ON s.product_id = p.id
        LIMIT 1000
      `).all();

      if (salesData.length < 10) {
        console.log('⚠️  Not enough historical data for training');
        this.isTraining = false;
        return;
      }

      // Prepare training data
      const features = [];
      const labels = [];

      for (const sale of salesData) {
        const product = sale;
        const competitorAvg = this.getCompetitorAverage(product.id, sale.timestamp);
        const timeMultiplier = this.getTimeMultiplier(sale.timestamp);

        const feat = this.extractFeatures(product, competitorAvg, timeMultiplier, []);
        const normalizedFeat = this.normalizeFeatures(feat);

        features.push(normalizedFeat);
        labels.push([Math.min(sale.quantity / 5, 1)]); // Normalize quantity to 0-1
      }

      const xs = this.tf.tensor2d(features);
      const ys = this.tf.tensor2d(labels);

      // Train
      await this.model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
            }
          }
        }
      });

      // Cleanup
      xs.dispose();
      ys.dispose();

      console.log('✅ Model training completed');
    } catch (error) {
      console.error('❌ Training error:', error.message);
    } finally {
      this.isTraining = false;
    }
  }

  getCompetitorAverage(productId, timestamp) {
    const result = this.db.db.prepare(`
      SELECT AVG(price) as avg_price FROM competitor_prices
      WHERE product_id = ? AND timestamp <= ?
      AND timestamp > ? - 3600
    `).get(productId, timestamp, timestamp);

    return result?.avg_price || 0;
  }

  getTimeMultiplier(timestamp) {
    const date = new Date(timestamp * 1000);
    const hour = date.getHours();
    const day = date.getDay();
    
    let multiplier = 1.0;
    if ((hour >= 10 && hour <= 14) || (hour >= 18 && hour <= 22)) {
      multiplier = 1.5;
    } else if (hour >= 0 && hour <= 6) {
      multiplier = 0.5;
    }
    
    if (day === 0 || day === 6) {
      multiplier *= 1.3;
    }
    
    return multiplier;
  }
}

module.exports = DemandPredictor;

