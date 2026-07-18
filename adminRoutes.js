const express = require('express');
const router = express.Router();

// בדיקה שהראוטר עובד
router.get('/test', (req, res) => {
    res.send('Admin routes are working!');
});

module.exports = router;