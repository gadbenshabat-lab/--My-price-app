require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbInstance = require('./db.js');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- פונקציית אתחול נתונים במידה והטבלה ריקה ---
function initDatabase() {
    dbInstance.serialize(() => {
        // יצירת הטבלאות אם לא קיימות
        dbInstance.run(`CREATE TABLE IF NOT EXISTS products (product_id INTEGER PRIMARY KEY, name TEXT, category TEXT, brand TEXT)`);
        
        // בדיקה אם הטבלה ריקה
        dbInstance.get("SELECT count(*) as count FROM products", [], (err, row) => {
            if (row.count === 0) {
                console.log("הטבלה ריקה, מכניס נתוני דוגמה...");
                const stmt = dbInstance.prepare("INSERT INTO products (name, category, brand) VALUES (?, ?, ?)");
                stmt.run("גלקסי S24", "סלולר", "Samsung");
                stmt.run("אייפון 15", "סלולר", "Apple");
                stmt.run("מקרר 4 דלתות", "מקררים", "LG");
                stmt.finalize();
            }
        });
    });
}
initDatabase(); // הרצת הפונקציה בעליית השרת

// --- API קטגוריות ---
app.get('/api/categories', (req, res) => {
    dbInstance.all("SELECT DISTINCT category FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const categories = rows.map(r => ({
            name: r.category,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.category)}&size=128`
        }));
        res.json(categories);
    });
});

// --- API מותגים ---
app.get('/api/brands/:category', (req, res) => {
    const category = decodeURIComponent(req.params.category);
    dbInstance.all("SELECT DISTINCT brand FROM products WHERE category = ?", [category], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));