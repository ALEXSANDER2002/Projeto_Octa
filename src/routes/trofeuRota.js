const express = require('express');
const router = express.Router();

router.get('/trofeus', (req, res) => {
    const trofeus = [
        { imagem: '/img/trofeusImg/trofeu-master.jpg',
            title: 'Campeã JIU 2023' },
        { imagem: '/img/trofeusImg/trofeu-atletismo.jpg',
            title: 'Atletismo' },
        { imagem: '/img/trofeusImg/trofeu-handebol.jpg',
            title: 'Handebol' },
    ];

    res.render('sala-trofeu', { trofeus }); // Enviando os dados para a view
});

module.exports = router;