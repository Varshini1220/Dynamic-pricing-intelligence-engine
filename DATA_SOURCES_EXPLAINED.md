# 📊 Data Sources & Real-time Simulation Explained

## 🎯 For Jury Presentation

### **Important Context:**
This system uses **INTERNAL SIMULATION** (not external APIs) as per the original requirement: *"without relying on external APIs"*. The data is generated internally to demonstrate the AI pricing logic that would work with real-world data sources.

---

## 🔄 Internal Data Generators (Simulated Real-time Data)

### 1. **Customer Interaction Simulator**
**File:** `server/simulation/dataGenerator.js` (Lines 50-120)

**What it generates:**
- Product views
- Cart additions
- Purchases
- Bounce events
- Session activity

**How it works:**
```javascript
// Weighted random selection based on:
- Product popularity (some products get more views)
- Time of day (peak hours: 10am-2pm, 6pm-10pm)
- Day of week (weekends get 1.5x traffic)
- Current price (lower prices = more interest)
```

**Frequency:** Every 2-5 seconds

**Algorithm:**
- Uses probability distribution
- Products with lower prices get higher interaction probability
- Simulates realistic customer behavior patterns

**Real-world equivalent:**
- Google Analytics
- Mixpanel
- Segment
- Custom event tracking

---

### 2. **Competitor Price Simulator**
**File:** `server/simulation/dataGenerator.js` (Lines 130-180)

**What it generates:**
- 5 competitor prices per product
- Realistic price fluctuations
- Market positioning data

**How it works:**
```javascript
// For each product:
- Base competitor price = Product base cost × (1.2 to 1.8)
- Random fluctuations: ±5-10% every 10-20 seconds
- Simulates competitor dynamic pricing
```

**Frequency:** Every 10-20 seconds

**Competitors simulated:**
1. Amazon India
2. Flipkart
3. Myntra
4. Snapdeal
5. Meesho

**Real-world equivalent:**
- Price monitoring APIs (Prisync, Competera)
- Web scraping services
- Competitor intelligence platforms

---

### 3. **Purchase Event Generator**
**File:** `server/simulation/dataGenerator.js` (Lines 190-250)

**What it generates:**
- Purchase transactions
- Revenue calculations
- Inventory reduction
- Profit tracking

**How it works:**
```javascript
// Purchase probability based on:
- Demand score (views + cart adds)
- Price competitiveness (vs competitors)
- Stock availability
- Random factor (simulates conversion rate)

// When purchase occurs:
- Reduce inventory by 1-3 units
- Calculate revenue = price × quantity
- Calculate profit = (price - cost) × quantity
- Update product metrics
```

**Frequency:** Every 5-15 seconds

**Real-world equivalent:**
- Payment gateway webhooks (Razorpay, Stripe)
- Order management systems
- ERP integrations

---

### 4. **ML Demand Predictor**
**File:** `server/ml/demandPredictor.js`

**What it analyzes:**
8 features for demand prediction:

1. **Price Position** = (current_price - min_competitor) / (max_competitor - min_competitor)
2. **Stock Ratio** = current_stock / initial_stock
3. **Interaction Score** = (views × 1) + (cart_adds × 3) + (purchases × 5)
4. **Competitor Advantage** = (avg_competitor_price - current_price) / current_price
5. **Margin Ratio** = (current_price - base_cost) / current_price
6. **Recent Sales Velocity** = sales in last hour
7. **Time Factor** = hour of day (0-23)
8. **Day Factor** = day of week (0-6)

**Algorithm:**
- Statistical ML model (default)
- TensorFlow.js neural network (optional)
- Outputs: Demand score (0-100) + Confidence (0-1)

**Real-world equivalent:**
- Custom ML models trained on historical data
- Cloud ML services (AWS SageMaker, Google AI)
- Demand forecasting platforms

---

### 5. **Dynamic Pricing Engine**
**File:** `server/pricing/pricingEngine.js`

**What it does:**
Evaluates 7+ pricing strategies and selects the most profitable

**Strategies:**
1. **Maintain Current** - Keep existing price
2. **Match Competitor Average** - Align with market
3. **Undercut by 5%** - Beat competition
4. **Premium +10%** - Position as premium
5. **Scarcity Pricing** - Increase when stock < 30%
6. **Clearance Pricing** - Decrease when stock > 80%
7. **Demand-Based** - Optimize based on interactions

**Decision factors:**
- Demand prediction
- Stock levels
- Competitor prices
- Profit margins
- Business constraints (min margin, price caps)

**Frequency:** Every 8-15 seconds

**Real-world equivalent:**
- Proprietary pricing algorithms
- Revenue management systems
- Dynamic pricing platforms (Prisync, Competera, Omnia)

---

## 📈 Data Flow Diagram

```
Customer Interactions (2-5s)
         ↓
Competitor Prices (10-20s)
         ↓
Stock Levels (real-time)
         ↓
    ┌────────────────┐
    │ ML Demand      │
    │ Predictor      │ → 8 Features → Demand Score
    └────────────────┘
         ↓
    ┌────────────────┐
    │ Pricing Engine │ → 7 Strategies → Best Price
    └────────────────┘
         ↓
    ┌────────────────┐
    │ Database       │ → Store History
    └────────────────┘
         ↓
    ┌────────────────┐
    │ WebSocket      │ → Push to Dashboard
    └────────────────┘
         ↓
    Live UI Updates (<100ms)
```

---

## 🎓 For Jury Explanation

### **Script for Presentation:**

> "This system demonstrates a complete dynamic pricing pipeline using **simulated real-time data**. In a production environment, these simulations would be replaced with:
>
> 1. **Customer Analytics** - Real user behavior from Google Analytics or custom tracking
> 2. **Competitor APIs** - Live price monitoring from services like Prisync
> 3. **Inventory Systems** - ERP integration for real-time stock levels
> 4. **Transaction Data** - Payment gateway webhooks from Razorpay or Stripe
>
> The **AI pricing logic** you see here is production-ready and would work identically with real data sources. The simulation allows us to demonstrate the complete system without external dependencies, showing how the AI makes pricing decisions based on demand, competition, inventory, and profitability."

---

## 💰 Currency Conversion (USD → INR)

**File:** `client/utils/currency.js`

**Conversion Rate:** 1 USD = ₹83.50 (configurable)

**All prices displayed in Indian Rupees (₹)**

**Functions:**
- `formatCurrency(amount)` - Converts USD to INR and formats
- `formatLargeCurrency(amount)` - Uses K/L/Cr notation
- `getConversionInfo()` - Returns conversion rate info

**Display locations:**
- Header (shows conversion rate)
- Product cards (all prices)
- Activity feed (all prices)
- Dashboard metrics (revenue, profit)
- Product modal (detailed view)

---

## 📁 Key Files to Show Jury

1. **`server/simulation/dataGenerator.js`** - All data simulation logic
2. **`server/ml/demandPredictor.js`** - ML demand prediction
3. **`server/pricing/pricingEngine.js`** - Pricing strategies
4. **`client/utils/currency.js`** - Currency conversion
5. **`server/database/schema.sql`** - Database structure

---

## 🔗 "Links" to Data Sources

Since this is a **self-contained simulation**, there are no external URLs. However, here's what you can show:

### **Internal Endpoints (Local):**
- `http://localhost:3001/api/products` - Product data
- `http://localhost:3001/api/analytics` - Analytics data
- `http://localhost:3001/api/products/:id` - Product details
- WebSocket: `ws://localhost:3001` - Real-time updates

### **Database Tables:**
- `products` - Product catalog
- `pricing_history` - Price change log
- `competitor_prices` - Competitor data
- `customer_interactions` - User behavior
- `purchases` - Transaction history
- `demand_predictions` - ML predictions

### **Code References:**
- Data generation: `server/simulation/dataGenerator.js`
- ML prediction: `server/ml/demandPredictor.js`
- Pricing logic: `server/pricing/pricingEngine.js`
- Database: `server/database/db.js`

---

## ✅ What to Tell the Jury

**Question:** "Where does the data come from?"

**Answer:** 
> "The system uses an internal simulation engine that generates realistic e-commerce data patterns. This demonstrates the AI pricing logic without requiring external API dependencies. In production, these would be replaced with:
> - Real customer analytics (Google Analytics)
> - Competitor price APIs (Prisync, Competera)
> - Live inventory systems (ERP integration)
> - Transaction data (Payment gateways)
>
> The simulation is visible in `server/simulation/dataGenerator.js` and runs in real-time, updating every few seconds to mimic actual marketplace dynamics."

**Question:** "How does the AI make pricing decisions?"

**Answer:**
> "The AI analyzes 4 key factors in real-time:
> 1. **Demand** - Customer interactions (views, cart adds, purchases)
> 2. **Stock** - Inventory levels (scarcity vs clearance)
> 3. **Competition** - Market positioning vs 5 competitors
> 4. **Margin** - Profitability protection
>
> It evaluates 7+ pricing strategies every 8-15 seconds and selects the most profitable option while respecting business constraints. Every decision is logged and explained in the UI."

---

## 🎉 Summary

- ✅ All data is **simulated internally** (no external APIs)
- ✅ Simulation mimics **real-world patterns**
- ✅ AI logic is **production-ready**
- ✅ All prices displayed in **Indian Rupees (₹)**
- ✅ Complete **transparency** of data sources
- ✅ Real-time updates every **2-15 seconds**
- ✅ Full **audit trail** in database

**The system is a complete, self-contained demonstration of enterprise-grade dynamic pricing intelligence!**

