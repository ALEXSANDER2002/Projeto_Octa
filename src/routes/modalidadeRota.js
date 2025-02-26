const express = require('express');
const router = express.Router();

router.get('/modalidades', (req, res) => {
    const modalidades = [
        { icon: '/img/modalidadeSvg/handebol.svg',
            title: 'Handebol',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis condimentum libero.' },
        { icon: '/img/modalidadeSvg/basquete.svg',
            title: 'Basquetebol',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis condimentum libero.' },
        { icon: '/img/modalidadeSvg/volei.svg',
            title: 'Vôleibol',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis condimentum libero.' },
        { icon: '/img/modalidadeSvg/futsal.svg',
            title: 'Futsal',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis condimentum libero.' },
        { icon: '/img/modalidadeSvg/ping-pong.svg',
            title: 'Ping-Pong',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis condimentum libero.' },
        { icon: '/img/modalidadeSvg/xadrez.svg',
            title: 'Xadrez',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean quis condimentum libero.' }
    ];

    res.render('modalidades', { modalidades }); // Enviando os dados para a view
});

module.exports = router;