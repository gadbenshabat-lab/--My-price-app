require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const dbInstance = require('./db.js'); // שימוש ב-dbInstance כמו שתיקנו
const adminRoutes = require('./adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', adminRoutes);
app.use(express.static('public'));

// --- API לקבלת הקטגוריות ---
app.get('/api/categories', (req, res) => {
    const categories = [
        { id: 1, name: "סלולר", image: "https://cdn-icons-png.flaticon.com/128/2965/2965879.png" },
        { id: 2, name: "מקררים", image: "https://cdn-icons-png.flaticon.com/128/3002/3002621.png" },
        { id: 3, name: "מחשבים", image: "https://cdn-icons-png.flaticon.com/128/3063/3063821.png" }
    ];
    res.json(categories);
});

// --- API לקבלת מותגים לפי קטגוריה ---
app.get('/api/brands/:category', (req, res) => {
    const category = req.params.category;
    const query = "SELECT DISTINCT brand FROM products WHERE category = ?";
    
    dbInstance.all(query, [category], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- API לחיפוש מוצרים ---
app.post('/api/search', (req, res) => {
    const { category, brand } = req.body;
    const query = `
        SELECT p.name, min(pr.price) as best_price, s.store_name
        FROM products p
        JOIN prices pr ON p.product_id = pr.product_id
        JOIN stores s ON pr.store_id = s.store_id
        WHERE p.category = ? AND p.brand = ?
        GROUP BY p.product_id
        ORDER BY best_price ASC
    `;
    dbInstance.all(query, [category, brand], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

cron.schedule('0 */4 * * *', () => {
    console.log('...מריץ סנכרון מחירים מתוזמן');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});