const path = require('path');
const express = require('express');
const router = express.Router();
const modalidadeRouter = require('./modalidadeRota');
const trofeuRouter = require('./trofeuRota');
const eventoRouter = require('./eventos');
const lojaRouter = require('./lojaRota');

// Rota para a Home
router.get('/', (req, res) => {
    res.render('home'); // ✅ O Express buscará "home.ejs" dentro de "src/views/"
});


router.use('/', eventoRouter);

// Rota para a sala de troféus
router.use('/', trofeuRouter);

// rota da pagina de  modalidades
router.use('/', modalidadeRouter);

// rota da loja
router.use('/', lojaRouter);

module.exports = router;