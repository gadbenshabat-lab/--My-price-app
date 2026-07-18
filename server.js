require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbInstance = require('./db.js');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/categories', (req, res) => {
    // שליפת מוצר אחד כדי לראות את כל העמודות שיש בטבלה
    const query = "SELECT * FROM products LIMIT 1"; 
    
    dbInstance.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // מדפיס ללוגים את העמודות שיש לנו
        console.log("מבנה הטבלה שנמצא:", rows.length > 0 ? Object.keys(rows[0]) : "טבלה ריקה");
        
        // מחזיר את כל המוצרים כדי שנראה מה קורה
        res.json(rows);
    });
});

app.get('/api/brands/:category', (req, res) => {
    // השארנו את זה ככה, נתקן אחרי שנראה את שם העמודה
    res.json([{ brand: "בדיקה" }]);
});

app.listen(10000, () => console.log("Server running on port 10000"));