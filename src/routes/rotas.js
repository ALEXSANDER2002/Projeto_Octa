const path = require('path');
const express = require('express');
const router = express.Router();
const modalidadeRouter = require('./modalidadeRota');
const trofeuRouter = require('./trofeuRota');

// Rota para a Home
router.get('/', (req, res) => {
    const section = req.query.section || null;
    res.render('home', { section });
});

// Rota para a loja
router.get('/loja', (req, res) => {
    res.render('loja'); // ✅ O Express buscará "loja.ejs" dentro de "src/views/"
});

// Rota para a sala de troféus
router.use('/', trofeuRouter);

// rota da pagina de  modalidades
router.use(`/`, modalidadeRouter);

module.exports = router;