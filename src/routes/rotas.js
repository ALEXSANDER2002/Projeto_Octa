const path = require('path');
const express = require('express');
const router = express.Router();

// Rota para a Home
router.get('/', (req, res) => {
    res.render('home'); // ✅ O Express buscará "home.ejs" dentro de "src/views/"
});

// Rota para a loja
router.get('/loja', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views','partials', 'loja.html'));
});

module.exports = router;
