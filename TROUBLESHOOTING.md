# 🔧 Troubleshooting Guide - Dynamic Pricing Engine

## Problem: Page Stuck on "Loading..." or "Starting..."

### **Solution 1: Clean Build and Restart**

Run this command:
```bash
.\clean-and-start.bat
```

This will:
1. Kill processes on ports 3000 and 3001
2. Delete the `.next` build cache
3. Restart the application

---

### **Solution 2: Manual Clean Build**

**Step 1: Stop all processes**
```bash
# Press Ctrl+C in the terminal running npm run dev
```

**Step 2: Kill port processes**
```bash
.\kill-ports.bat
```

**Step 3: Delete build cache**
```bash
cd client
rmdir /s /q .next
cd ..
```

**Step 4: Restart**
```bash
npm run dev
```

---

### **Solution 3: Check if Backend is Running**

Open a new browser tab and go to:
```
http://localhost:3001/api/products
```

**Expected:** You should see JSON data with products

**If you see an error:** Backend is not running properly

---

### **Solution 4: Check Browser Console**

1. Open browser (Chrome/Edge)
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for errors (red text)

**Common errors:**
- `Failed to fetch` - Backend not running
- `CORS error` - Port mismatch
- `Socket connection failed` - WebSocket issue

---

### **Solution 5: Clear Browser Cache**

1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh page (`F5`)

---

### **Solution 6: Run Backend and Frontend Separately**

**Terminal 1 (Backend):**
```bash
cd server
node index.js
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

This helps identify which part is failing.

---

### **Solution 7: Check Node Version**

```bash
node --version
```

**Required:** Node.js v18 or higher

**If lower:** Update Node.js from https://nodejs.org

---

### **Solution 8: Reinstall Dependencies**

**Warning:** This takes 5-10 minutes

```bash
# Delete node_modules
rmdir /s /q node_modules
rmdir /s /q client\node_modules

# Reinstall
npm install
cd client
npm install
cd ..

# Start
npm run dev
```

---

## Problem: Port Already in Use

### **Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3001
Error: listen EADDRINUSE: address already in use :::3000
```

### **Solution:**
```bash
.\kill-ports.bat
```

Then run:
```bash
npm run dev
```

---

## Problem: "Cannot find module" Error

### **Solution:**
```bash
npm install
cd client
npm install
cd ..
npm run dev
```

---

## Problem: Database Errors

### **Error Message:**
```
Error: SQLITE_ERROR: no such table: products
```

### **Solution:**

The database will auto-create on first run. If it's corrupted:

```bash
# Delete database
del server\database\pricing.db

# Restart (database will recreate)
npm run dev
```

---

## Problem: Prices Not Changing

### **Check:**

1. **Backend logs** - Should show:
   ```
   💰 Price updated: Product Name $X → $Y (strategy)
   ```

2. **If no price updates showing:**
   - Backend pricing engine might be stuck
   - Restart the application

---

## Problem: WebSocket Not Connecting

### **Symptoms:**
- Red dot in header (Disconnected)
- No real-time updates
- Activity feed empty

### **Solution:**

1. Check backend is running on port 3001
2. Check browser console for WebSocket errors
3. Restart both backend and frontend

---

## Problem: Blank Page

### **Solution:**

1. Open browser console (`F12`)
2. Check for JavaScript errors
3. Try:
   ```bash
   .\clean-and-start.bat
   ```

---

## Quick Diagnostic Checklist

- [ ] Backend running? (Check terminal for "Server running on port 3001")
- [ ] Frontend running? (Check terminal for "ready - started server on 0.0.0.0:3000")
- [ ] Ports free? (Run `.\kill-ports.bat` if needed)
- [ ] Browser console clear? (No red errors)
- [ ] Backend API working? (Visit http://localhost:3001/api/products)
- [ ] Build cache clean? (Delete `client\.next` folder)

---

## Still Not Working?

### **Nuclear Option: Complete Reset**

```bash
# 1. Stop everything
# Press Ctrl+C in terminal

# 2. Kill ports
.\kill-ports.bat

# 3. Delete all build artifacts
rmdir /s /q client\.next
del server\database\pricing.db

# 4. Restart
npm run dev

# 5. Wait 30 seconds for initial data generation

# 6. Open browser
# http://localhost:3000
```

---

## Expected Startup Sequence

When you run `npm run dev`, you should see:

```
[0] ℹ️  Running with statistical ML (TensorFlow not installed)
[0] ✅ ML Model initialized (Statistical)
[0] 🚀 Server running on port 3001
[0] ✅ System initialized
[0] ✅ Data simulation started
[0] ✅ Pricing engine started (optimizing every 8-15 seconds)
[1]   ▲ Next.js 14.2.35
[1]   - Local:        http://localhost:3000
[1]  ✓ Ready in 3.2s
```

Then prices should start updating:
```
[0] 💰 Price updated: Product Name $X → $Y (strategy)
```

---

## Contact Information

If none of these solutions work, check:
1. Node.js version (must be v18+)
2. Windows version (must support PowerShell)
3. Antivirus blocking ports 3000/3001
4. Firewall settings

---

**Most common fix: `.\clean-and-start.bat`** ✅

