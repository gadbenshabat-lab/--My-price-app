require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbInstance = require('./db.js');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

function initDatabase() {
    dbInstance.serialize(() => {
        dbInstance.run(`CREATE TABLE IF NOT EXISTS products (product_id INTEGER PRIMARY KEY, name TEXT, category TEXT, brand TEXT)`);
        
        dbInstance.get("SELECT count(*) as count FROM products", [], (err, row) => {
            if (row.count === 0) {
                const stmt = dbInstance.prepare("INSERT INTO products (name, category, brand) VALUES (?, ?, ?)");
                const data = [
                    ["גלקסי S24", "סלולר", "Samsung"], ["אייפון 15", "סלולר", "Apple"],
                    ["מקרר 4 דלתות", "מקררים", "LG"], ["מקרר מקפיא עליון", "מקררים", "Samsung"],
                    ["מכונת כביסה 8 קילו", "מכונות כביסה", "Bosch"], ["מדיח כלים", "מדיחי כלים", "Electrolux"],
                    ["טלוויזיה 65 אינץ'", "טלוויזיות", "Sony"], ["מיקרוגל", "מוצרי חשמל", "Panasonic"]
                ];
                data.forEach(item => stmt.run(item));
                stmt.finalize();
            }
        });
    });
}
initDatabase();

app.get('/api/next-step', (req, res) => {
    const { category, brand } = req.query;
    if (!category) {
        dbInstance.all("SELECT DISTINCT category FROM products WHERE category IS NOT NULL", [], (err, rows) => {
            res.json({ step: 'category', options: rows.map(r => r.category) });
        });
    } else if (!brand) {
        dbInstance.all("SELECT DISTINCT brand FROM products WHERE category = ? AND brand IS NOT NULL", [category], (err, rows) => {
            res.json({ step: 'brand', options: rows.map(r => r.brand) });
        });
    } else {
        dbInstance.all("SELECT name FROM products WHERE category = ? AND brand = ? AND name IS NOT NULL", [category, brand], (err, rows) => {
            res.json({ step: 'product', options: rows.map(r => r.name) });
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));