const express = require('express');
const router = express.Router();

router.get('/sala-trofeu', (req, res) => {
    const trofeus = [
        { imagem: '/img/trofeusImg/trofeu1.jpg',
            title: 'Atletismo' },
        { imagem: '/img/trofeusImg/trofeu2.jpg',
            title: 'Handebol' },
        { imagem: '/img/trofeusImg/trofeu1.jpg',
            title: 'Atletismo' },
        { imagem: '/img/trofeusImg/trofeu2.jpg',
            title: 'Handebol' }
    ];

    res.render('sala-trofeu', { trofeus }); // Enviando os dados para a view
});

module.exports = router;