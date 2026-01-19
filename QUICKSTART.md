# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18 or higher installed
- npm (comes with Node.js)

## Installation & Running

### Option 1: Automated Start (Recommended for Windows)
Simply double-click the `start.bat` file in the project folder, or run:
```bash
start.bat
```

### Option 2: Manual Start

#### Step 1: Install Dependencies

Open PowerShell or Command Prompt in the project folder and run:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

#### Step 2: Start the Application

**Option A - Run Both Together:**
```bash
npm run dev
```

**Option B - Run Separately (2 terminals):**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

Or manually:
```bash
# Terminal 1 - Backend
node server/index.js

# Terminal 2 - Frontend
cd client
npm run dev
```

## Access the Application

Once running, open your browser and go to:

- **Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001

## What You'll See

1. **Live Dashboard** - Real-time metrics updating every few seconds
2. **Product Cards** - 10 products with live pricing, stock, and demand data
3. **Activity Feed** - Real-time stream of:
   - Customer interactions (views, cart adds, purchases)
   - Price changes with AI explanations
   - Sales transactions
4. **Click any product** - Opens detailed modal with:
   - Price history charts
   - Competitor comparison
   - Customer interaction trends
   - AI pricing explanations

## System Behavior

The system automatically:
- ✅ Generates customer interactions every 2-5 seconds
- ✅ Simulates purchases every 5-15 seconds
- ✅ Updates competitor prices every 10-20 seconds
- ✅ Optimizes prices every 15-30 seconds
- ✅ Reduces inventory with each purchase
- ✅ Broadcasts all changes in real-time to the dashboard

## Troubleshooting

### Port Already in Use
If you get an error about ports 3000 or 3001 being in use:

**Kill the process:**
```bash
# For port 3001 (backend)
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# For port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
rm -rf client/node_modules
npm install
cd client
npm install
```

### TensorFlow Installation (Optional)
The system works without TensorFlow using statistical ML. To enable full TensorFlow.js:

```bash
npm install @tensorflow/tfjs-node
```

Note: TensorFlow installation can take 5-10 minutes.

## Stopping the Application

Press `Ctrl + C` in the terminal(s) where the servers are running.

## Next Steps

- Watch the real-time activity feed
- Click on products to see detailed analytics
- Observe how prices change based on demand, stock, and competitors
- Monitor revenue and profit metrics
- See AI explanations for every pricing decision

Enjoy exploring the Dynamic Pricing Intelligence Engine! 🎉

