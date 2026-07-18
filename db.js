const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./price_comp.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (product_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, brand TEXT, category TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS stores (store_id INTEGER PRIMARY KEY AUTOINCREMENT, store_name TEXT, rating REAL DEFAULT 5.0)`);
    db.run(`CREATE TABLE IF NOT EXISTS prices (price_id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, store_id INTEGER, price REAL, last_updated DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS pending_matches (match_id INTEGER PRIMARY KEY AUTOINCREMENT, scraped_name TEXT, scraped_price REAL, store_name TEXT, suggested_product_id INTEGER, suggested_product_name TEXT, confidence_rating REAL, status TEXT DEFAULT 'pending')`);
});

module.exports = db;