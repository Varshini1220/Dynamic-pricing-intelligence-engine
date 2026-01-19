const Database = require('better-sqlite3');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.db = new Database(path.join(__dirname, 'pricing.db'));
    this.initializeTables();
    this.seedInitialData();
  }

  initializeTables() {
    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        base_cost REAL NOT NULL,
        current_price REAL NOT NULL,
        stock_level INTEGER NOT NULL,
        initial_stock INTEGER NOT NULL,
        min_price REAL NOT NULL,
        max_price REAL NOT NULL,
        min_margin_percent REAL NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Pricing history
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pricing_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        old_price REAL NOT NULL,
        new_price REAL NOT NULL,
        reason TEXT,
        demand_score REAL,
        competitor_avg REAL,
        stock_level INTEGER,
        timestamp INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Customer interactions
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customer_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        interaction_type TEXT NOT NULL,
        session_id TEXT NOT NULL,
        price_at_interaction REAL,
        timestamp INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Competitor prices
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS competitor_prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        competitor_name TEXT NOT NULL,
        price REAL NOT NULL,
        timestamp INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Sales transactions
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        revenue REAL NOT NULL,
        profit REAL NOT NULL,
        timestamp INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Demand predictions
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS demand_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        predicted_demand REAL NOT NULL,
        confidence REAL NOT NULL,
        features TEXT,
        timestamp INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
  }

  seedInitialData() {
    const count = this.db.prepare('SELECT COUNT(*) as count FROM products').get();
    if (count.count === 0) {
      const products = [
        { id: 'prod-001', name: 'Wireless Headphones Pro', category: 'Electronics', base_cost: 50, current_price: 99.99, stock: 150, min_margin: 25 },
        { id: 'prod-002', name: 'Smart Watch Ultra', category: 'Electronics', base_cost: 120, current_price: 249.99, stock: 80, min_margin: 30 },
        { id: 'prod-003', name: 'Laptop Stand Aluminum', category: 'Accessories', base_cost: 15, current_price: 39.99, stock: 200, min_margin: 40 },
        { id: 'prod-004', name: 'USB-C Hub 7-in-1', category: 'Accessories', base_cost: 20, current_price: 49.99, stock: 120, min_margin: 35 },
        { id: 'prod-005', name: 'Mechanical Keyboard RGB', category: 'Electronics', base_cost: 60, current_price: 129.99, stock: 90, min_margin: 30 },
        { id: 'prod-006', name: 'Wireless Mouse Ergonomic', category: 'Accessories', base_cost: 18, current_price: 44.99, stock: 180, min_margin: 35 },
        { id: 'prod-007', name: '4K Webcam Pro', category: 'Electronics', base_cost: 80, current_price: 159.99, stock: 60, min_margin: 28 },
        { id: 'prod-008', name: 'Phone Stand Adjustable', category: 'Accessories', base_cost: 8, current_price: 24.99, stock: 250, min_margin: 45 },
        { id: 'prod-009', name: 'Portable SSD 1TB', category: 'Electronics', base_cost: 90, current_price: 179.99, stock: 70, min_margin: 25 },
        { id: 'prod-010', name: 'Cable Organizer Set', category: 'Accessories', base_cost: 5, current_price: 16.99, stock: 300, min_margin: 50 }
      ];

      const insert = this.db.prepare(`
        INSERT INTO products (id, name, category, base_cost, current_price, stock_level, initial_stock, min_price, max_price, min_margin_percent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const p of products) {
        const minPrice = p.base_cost * (1 + p.min_margin / 100);
        const maxPrice = p.current_price * 1.5;
        insert.run(p.id, p.name, p.category, p.base_cost, p.current_price, p.stock, p.stock, minPrice, maxPrice, p.min_margin);
      }
    }
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseManager;

