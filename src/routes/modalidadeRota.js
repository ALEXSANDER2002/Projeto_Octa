const express = require('express');
const router = express.Router();

router.get('/modalidades', (req, res) => {
    const modalidades = [
        { icon: '/img/handebol.svg',
            title: 'Handebol',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis condimentum libero.' },
        { icon: '/img/basquete.svg',
            title: 'Basquetebol',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis condimentum libero.' },
        { icon: '/img/volei.svg',
            title: 'Vôleibol',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis condimentum libero.' },
        { icon: '/img/futsal.svg',
            title: 'Futsal',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis condimentum libero.' },
        { icon: '/img/ping-pong.svg',
            title: 'Ping-Pong',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis condimentum libero.' },
        { icon: '/img/xadrez.svg',
            title: 'Xadrez',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis condimentum libero.' }
    ];

    res.render('modalidades', { modalidades }); // Enviando os dados para a view
});

module.exports = router;