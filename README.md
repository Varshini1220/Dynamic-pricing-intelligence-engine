# 🚀 Dynamic Pricing Intelligence Engine

A fully functional real-time AI-powered dynamic pricing system for e-commerce platforms that continuously optimizes product prices using simulated live marketplace data.

## 🌟 Features

### Real-time Data Simulation
- **Customer Interactions**: Automated generation of product views, cart additions, purchases, and bounce behavior
- **Live Inventory Management**: Dynamic stock reduction with each purchase
- **Competitor Price Tracking**: Continuous simulation of competitor prices with realistic market fluctuations
- **Time-based Demand**: Peak hours, weekends, and festival multipliers

### Machine Learning Demand Prediction
- **TensorFlow.js Model**: Neural network trained on historical sales and interaction data
- **Feature Engineering**: Price positioning, stock levels, competitor analysis, margins, and interaction scores
- **Confidence Scoring**: AI confidence levels for each prediction

### Dynamic Pricing Engine
- **Multi-scenario Analysis**: Evaluates 7+ pricing strategies per product
- **Revenue Optimization**: Automatically selects the most profitable price point
- **Business Constraints**: Enforces margin protection and price caps
- **Strategies Implemented**:
  - Maintain current price
  - Match competitor average
  - Undercut competitors (5%)
  - Premium pricing (10% above)
  - Scarcity-based pricing
  - Inventory clearance
  - Demand-based adjustments

### Live Dashboard
- **Real-time Updates**: WebSocket-powered instant data refresh
- **Product Performance**: Live metrics for all products
- **Demand Analytics**: Visual charts and trend analysis
- **Price Change History**: Complete audit trail with AI explanations
- **Competitor Comparison**: Side-by-side price analysis
- **Activity Feed**: Real-time stream of all system events
- **Revenue Tracking**: Profit, sales, and interaction metrics

### 🎨 Visual Price Change Indicators
- **Flash Animations**: Product cards flash yellow when prices change
- **Price Direction Badges**: Color-coded indicators (🟢 increase, 🔴 decrease)
- **Old vs New Comparison**: Side-by-side price comparison boxes
- **AI Reasoning Display**: Detailed explanation for every price change
- **Demand Level Visualization**: High/Medium/Low indicators with color coding
- **Stock Alerts**: Visual warnings for low stock (scarcity) and high stock (clearance)
- **Competitor Position**: Shows if you're cheaper or pricier than competitors
- **Pricing Factors Panel**: 4 key factors (Demand, Stock, Competition, Margin) with impact indicators
- **Strategy Display**: Shows which AI strategy is currently active
- **Live Indicators**: Pulsing animations on real-time metrics

**See VISUAL_FEATURES.md for complete visual documentation**

## 🏗️ Architecture

```
├── server/
│   ├── index.js                 # Express + Socket.IO server
│   ├── database/
│   │   └── schema.js            # SQLite database with 6 tables
│   ├── simulation/
│   │   └── dataGenerator.js     # Real-time data simulation engine
│   ├── ml/
│   │   └── demandPredictor.js   # TensorFlow.js ML model
│   └── pricing/
│       └── pricingEngine.js     # Dynamic pricing optimization
│
├── client/
│   ├── app/
│   │   ├── page.js              # Main dashboard
│   │   ├── layout.js            # App layout
│   │   └── globals.css          # Tailwind styles
│   └── components/
│       ├── Header.js            # Dashboard header
│       ├── Dashboard.js         # Analytics cards
│       ├── ProductGrid.js       # Product catalog
│       ├── ProductCard.js       # Individual product card
│       ├── ProductModal.js      # Detailed product view with charts
│       └── ActivityFeed.js      # Real-time activity stream
```

## 🚀 Quick Start

⚠️ **Important:**  
The application links use `localhost` and will **not work when clicked directly from GitHub**.  
Please follow the steps below to run the project locally, then open the links in your browser.

### Prerequisites
- Node.js 18+ (you have v20.17.0 ✅)
- npm (comes with Node.js)

### Installation & Running

#### Windows Users (Easiest):

1. **Install dependencies** - Double-click `install.bat`
2. **Start the app** - Double-click `start.bat`
3. **Open browser** - Go to http://localhost:3000

#### Manual Installation:

```bash
# Step 1: Install backend dependencies
npm install

# Step 2: Install frontend dependencies
cd client
npm install
cd ..

# Step 3: Start both servers
npm run dev
```

#### Alternative - Run Separately:

**Terminal 1 (Backend):**
```bash
node server/index.js
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

⚠️ **Important:**  
The application links use `localhost` and will **not work when clicked directly from GitHub**.  
Please follow the steps below to run the project locally, then open the links in your browser.

### Access the Dashboard
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/products

## 📊 Database Schema

### Products
- Product details, pricing constraints, stock levels

### Pricing History
- Complete audit trail of all price changes with reasons

### Customer Interactions
- Views, cart additions, purchases, bounces

### Competitor Prices
- Historical competitor pricing data

### Sales
- Transaction records with revenue and profit

### Demand Predictions
- ML model predictions with confidence scores

## 🤖 How It Works

### 1. Data Simulation (Every 2-5 seconds)
- Generates realistic customer interactions
- Simulates purchases with dynamic inventory reduction
- Updates competitor prices with market fluctuations

### 2. ML Demand Prediction
- Extracts 8 key features per product
- Predicts demand probability (0-100 scale)
- Calculates confidence based on data availability

### 3. Pricing Optimization (Every 15-30 seconds)
- Generates 7+ pricing scenarios per product
- Evaluates expected revenue and profit for each
- Applies business constraints (margins, caps)
- Selects and applies optimal price
- Broadcasts changes via WebSocket

### 4. Real-time Dashboard Updates
- Instant price change notifications
- Live activity feed
- Auto-refreshing charts and metrics
- AI-generated explanations for every decision

## 🎯 Key Metrics Tracked

- **Total Revenue & Profit** (24h)
- **Sales Count** (24h)
- **Customer Interactions** (1h)
- **Price Optimizations** (24h)
- **Stock Levels** (real-time)
- **Competitor Positioning** (real-time)
- **Demand Scores** (real-time)
- **Margin Analysis** (real-time)

## 🎨 UI/UX Features

- **Modern Dark Theme**: Professional gradient design
- **Responsive Layout**: Works on all screen sizes
- **Real-time Indicators**: Live connection status
- **Smooth Animations**: Slide-in effects and transitions
- **Interactive Charts**: Recharts with tooltips and legends
- **Color-coded Metrics**: Visual indicators for performance
- **Detailed Modals**: Deep-dive into product analytics

## 🔧 Configuration

### Pricing Constraints (per product)
- `min_price`: Minimum allowed price
- `max_price`: Maximum allowed price
- `min_margin_percent`: Minimum profit margin

### Simulation Intervals
- Customer interactions: 2-5 seconds
- Competitor updates: 10-20 seconds
- Purchases: 5-15 seconds
- Pricing optimization: 15-30 seconds

## 📈 Sample Products

10 pre-seeded products across categories:
- **Electronics**: Headphones, Smart Watch, Keyboard, Webcam, SSD
- **Accessories**: Laptop Stand, USB Hub, Mouse, Phone Stand, Cable Organizer

## 🛠️ Technologies Used

### Backend
- Node.js + Express
- Socket.IO (WebSocket)
- better-sqlite3 (Database)
- TensorFlow.js (ML)

### Frontend
- Next.js 14
- React 18
- Tailwind CSS
- Recharts (Charts)
- Lucide React (Icons)
- date-fns (Date formatting)

## 📝 API Endpoints

- `GET /api/products` - All products with metrics
- `GET /api/products/:id` - Detailed product data
- `GET /api/analytics/dashboard` - Dashboard analytics

## 🔌 WebSocket Events

- `price_change` - Price optimization applied
- `purchase` - Product sold
- `customer_interaction` - User activity
- `competitor_update` - Competitor prices updated

## 🎓 Learning Outcomes

This project demonstrates:
- Real-time data streaming with WebSockets
- Machine learning integration in Node.js
- Dynamic pricing algorithms
- Revenue optimization strategies
- Modern React patterns and hooks
- Responsive dashboard design
- Database design for analytics
- Event-driven architecture

## 📄 License

MIT License - Feel free to use for learning and commercial projects!

---

Built with ❤️ for demonstrating real-world AI-powered e-commerce systems

