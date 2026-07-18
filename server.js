require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbInstance = require('./db.js');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- API חכם לשלב הבא ---
app.get('/api/next-step', (req, res) => {
    const { category, brand } = req.query;

    if (!category) {
        dbInstance.all("SELECT DISTINCT category FROM products", [], (err, rows) => {
            res.json({ step: 'category', options: rows.map(r => r.category) });
        });
    } else if (!brand) {
        dbInstance.all("SELECT DISTINCT brand FROM products WHERE category = ?", [category], (err, rows) => {
            res.json({ step: 'brand', options: rows.map(r => r.brand) });
        });
    } else {
        // שלב שלישי: שליפת המוצרים הספציפיים
        dbInstance.all("SELECT name FROM products WHERE category = ? AND brand = ?", [category, brand], (err, rows) => {
            res.json({ step: 'product', options: rows.map(r => r.name) });
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));