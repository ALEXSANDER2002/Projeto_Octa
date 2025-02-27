const express = require('express');
const router = express.Router();

router.get('/loja', (req, res) => {
    const produtos = [
        {
            nome: 'Camisa Casa',
            precoAntigo: 99.90,
            precoNovo: 89.90,
            imagem: '/img/produtos/camisas/camisa-verde.png'
        },
        {
            nome: 'Camisa Fora',
            precoAntigo: 120.00,
            precoNovo: 110.00,
            imagem: '/img/produtos/camisas/camisa-azul.png'
        },
        {
            nome: 'Camisa Curso',
            precoAntigo: 150.00,
            precoNovo: 135.00,
            imagem: '/img/produtos/camisas/camisa-preta.png'
        }
    ];

    res.render('loja', { produtos }); // <-- Passar a variável para a view
});



module.exports = router;