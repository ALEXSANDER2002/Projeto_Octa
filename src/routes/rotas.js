const path = require('path');
const express = require('express');
const router = express.Router();

// Rota para a Home
router.get('/', (req, res) => {
    res.render('home'); // ✅ O Express buscará "home.ejs" dentro de "src/views/"
});

// Rota para a loja
router.get('/loja', (req, res) => {
    res.render('loja'); // ✅ O Express buscará "loja.ejs" dentro de "src/views/"
});

router.get('/modalidades', (req, res) => {
    res.render('modalidades');
});

module.exports = router;