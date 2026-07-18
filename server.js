require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const dbInstance = require('./db.js');
const adminRoutes = require('./adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', adminRoutes);
app.use(express.static('public'));

// --- API לקבלת כל הקטגוריות באופן דינמי מה-DB ---
app.get('/api/categories', (req, res) => {
    const query = "SELECT DISTINCT category FROM products WHERE category IS NOT NULL";
    dbInstance.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error fetching categories:", err);
            return res.status(500).json({ error: err.message });
        }
        
        // יצירת רשימה עם תמונות דינמיות לפי שם הקטגוריה
        const categories = rows.map(row => ({
            name: row.category,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.category)}&background=random&size=128`
        }));
        res.json(categories);
    });
});

// --- API לקבלת מותגים לפי קטגוריה ---
app.get('/api/brands/:category', (req, res) => {
    const category = decodeURIComponent(req.params.category);
    const query = "SELECT DISTINCT brand FROM products WHERE category = ? AND brand IS NOT NULL";
    
    dbInstance.all(query, [category], (err, rows) => {
        if (err) {
            console.error("Error fetching brands:", err);
            return res.status(500).json({ error: err.message });
        }
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

// משימות מתוזמנות
cron.schedule('0 */4 * * *', () => {
    console.log('...מריץ סנכרון מחירים מתוזמן');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});