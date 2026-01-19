class PricingEngine {
  constructor(db, demandPredictor, io) {
    this.db = db;
    this.demandPredictor = demandPredictor;
    this.io = io;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Run pricing optimization every 8-15 seconds for more visible changes
    const runOptimization = () => {
      this.optimizeAllPrices();
      const nextRun = 8000 + Math.random() * 7000; // 8-15 seconds
      this.optimizationTimeout = setTimeout(runOptimization, nextRun);
    };

    // Start after initial delay
    this.optimizationTimeout = setTimeout(runOptimization, 3000);

    console.log('✅ Pricing engine started (optimizing every 8-15 seconds)');
  }

  stop() {
    this.isRunning = false;
    if (this.optimizationTimeout) {
      clearTimeout(this.optimizationTimeout);
    }
    console.log('⏹️  Pricing engine stopped');
  }

  async optimizeAllPrices() {
    const products = this.db.db.prepare('SELECT * FROM products').all();

    for (const product of products) {
      try {
        await this.optimizeProductPrice(product);
      } catch (error) {
        console.error(`Error optimizing price for ${product.id}:`, error.message);
      }
    }
  }

  async optimizeProductPrice(product) {
    // Get competitor average
    const competitorAvg = this.getCompetitorAverage(product.id);
    
    // Get time-based demand multiplier
    const timeMultiplier = this.getTimeMultiplier();

    // Predict demand at current price
    const currentDemand = await this.demandPredictor.predictDemand(product, competitorAvg, timeMultiplier);

    // Generate price scenarios
    const scenarios = this.generatePriceScenarios(product, competitorAvg);

    // Evaluate each scenario
    const evaluatedScenarios = [];
    for (const scenario of scenarios) {
      const evaluation = await this.evaluateScenario(scenario, product, competitorAvg, timeMultiplier);
      evaluatedScenarios.push(evaluation);
    }

    // Select best scenario
    const bestScenario = this.selectBestScenario(evaluatedScenarios, product);

    // Apply price change if beneficial and different from current
    if (bestScenario && Math.abs(bestScenario.price - product.current_price) > 0.5) {
      this.applyPriceChange(product, bestScenario, currentDemand);
    }
  }

  generatePriceScenarios(product, competitorAvg) {
    const scenarios = [];
    const currentPrice = product.current_price;

    // Scenario 1: Keep current price
    scenarios.push({ price: currentPrice, strategy: 'maintain' });

    // Scenario 2: Match competitor average
    if (competitorAvg > 0 && competitorAvg >= product.min_price && competitorAvg <= product.max_price) {
      scenarios.push({ price: competitorAvg, strategy: 'match_competitor' });
    }

    // Scenario 3: Undercut competitors by 5%
    if (competitorAvg > 0) {
      const undercutPrice = competitorAvg * 0.95;
      if (undercutPrice >= product.min_price && undercutPrice <= product.max_price) {
        scenarios.push({ price: undercutPrice, strategy: 'undercut_competitor' });
      }
    }

    // Scenario 4: Premium pricing (10% above competitor)
    if (competitorAvg > 0) {
      const premiumPrice = competitorAvg * 1.10;
      if (premiumPrice >= product.min_price && premiumPrice <= product.max_price) {
        scenarios.push({ price: premiumPrice, strategy: 'premium' });
      }
    }

    // Scenario 5: Stock-based pricing
    const stockRatio = product.stock_level / product.initial_stock;
    if (stockRatio < 0.3) {
      // Low stock - increase price
      const scarcityPrice = Math.min(currentPrice * 1.15, product.max_price);
      scenarios.push({ price: scarcityPrice, strategy: 'scarcity_premium' });
    } else if (stockRatio > 0.8) {
      // High stock - decrease price to move inventory
      const clearancePrice = Math.max(currentPrice * 0.90, product.min_price);
      scenarios.push({ price: clearancePrice, strategy: 'inventory_clearance' });
    }

    // Scenario 6: Demand-based adjustments
    const priceRange = product.max_price - product.min_price;
    scenarios.push({ price: Math.min(currentPrice + priceRange * 0.05, product.max_price), strategy: 'demand_test_high' });
    scenarios.push({ price: Math.max(currentPrice - priceRange * 0.05, product.min_price), strategy: 'demand_test_low' });

    return scenarios;
  }

  async evaluateScenario(scenario, product, competitorAvg, timeMultiplier) {
    // Create temporary product with scenario price
    const tempProduct = { ...product, current_price: scenario.price };

    // Predict demand at this price
    const demand = await this.demandPredictor.predictDemand(tempProduct, competitorAvg, timeMultiplier);

    // Calculate expected sales volume (demand score influences probability)
    const baseSalesRate = 0.1; // Base: 10% conversion
    const demandFactor = demand.demandScore / 100;
    const expectedSales = baseSalesRate * demandFactor * timeMultiplier;

    // Calculate revenue and profit
    const expectedRevenue = scenario.price * expectedSales;
    const expectedProfit = (scenario.price - product.base_cost) * expectedSales;

    // Calculate margin
    const margin = ((scenario.price - product.base_cost) / scenario.price) * 100;

    // Competitiveness score
    const competitivenessScore = competitorAvg > 0 ? 
      Math.max(0, 100 - Math.abs((scenario.price - competitorAvg) / competitorAvg * 100)) : 50;

    // Overall score (weighted combination)
    const score = (
      expectedProfit * 0.5 +           // 50% weight on profit
      competitivenessScore * 0.2 +     // 20% weight on competitiveness
      demand.demandScore * 0.2 +       // 20% weight on demand
      margin * 0.1                     // 10% weight on margin
    );

    return {
      ...scenario,
      demand: demand.demandScore,
      confidence: demand.confidence,
      expectedSales,
      expectedRevenue,
      expectedProfit,
      margin,
      competitivenessScore,
      score
    };
  }

  selectBestScenario(scenarios, product) {
    // Filter scenarios that meet business constraints
    const validScenarios = scenarios.filter(s => {
      const margin = ((s.price - product.base_cost) / s.price) * 100;
      return margin >= product.min_margin_percent;
    });

    if (validScenarios.length === 0) return null;

    // Select scenario with highest score
    return validScenarios.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  applyPriceChange(product, scenario, currentDemand) {
    const oldPrice = product.current_price;
    const newPrice = Math.round(scenario.price * 100) / 100; // Round to 2 decimals

    // Update product price
    this.db.db.prepare(`
      UPDATE products SET current_price = ? WHERE id = ?
    `).run(newPrice, product.id);

    // Record in pricing history
    const reason = this.generatePriceChangeReason(scenario, product);
    const timestamp = Math.floor(Date.now() / 1000);

    this.db.db.prepare(`
      INSERT INTO pricing_history (product_id, old_price, new_price, reason, demand_score, competitor_avg, stock_level, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      product.id,
      oldPrice,
      newPrice,
      reason,
      scenario.demand,
      this.getCompetitorAverage(product.id),
      product.stock_level,
      timestamp
    );

    // Emit real-time price change event
    this.io.emit('price_change', {
      productId: product.id,
      productName: product.name,
      oldPrice,
      newPrice,
      change: ((newPrice - oldPrice) / oldPrice * 100).toFixed(2),
      reason,
      scenario: scenario.strategy,
      demand: scenario.demand,
      expectedProfit: scenario.expectedProfit,
      timestamp: timestamp * 1000
    });

    console.log(`💰 Price updated: ${product.name} ${oldPrice} → ${newPrice} (${scenario.strategy})`);
  }

  generatePriceChangeReason(scenario, product) {
    const reasons = {
      maintain: 'Optimal price maintained based on current market conditions',
      match_competitor: 'Price adjusted to match competitor average for competitiveness',
      undercut_competitor: 'Strategic price reduction to gain market share',
      premium: 'Premium pricing strategy based on product value proposition',
      scarcity_premium: `Low stock (${product.stock_level} units) - scarcity pricing applied`,
      inventory_clearance: `High inventory (${product.stock_level} units) - clearance pricing to accelerate sales`,
      demand_test_high: 'Testing higher price point based on strong demand signals',
      demand_test_low: 'Price optimization to stimulate demand and maximize revenue'
    };

    return reasons[scenario.strategy] || 'AI-optimized pricing adjustment';
  }

  getCompetitorAverage(productId) {
    const result = this.db.db.prepare(`
      SELECT AVG(price) as avg_price FROM (
        SELECT price FROM competitor_prices
        WHERE product_id = ?
        ORDER BY timestamp DESC
        LIMIT 15
      )
    `).get(productId);

    return result?.avg_price || 0;
  }

  getTimeMultiplier() {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
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

module.exports = PricingEngine;

