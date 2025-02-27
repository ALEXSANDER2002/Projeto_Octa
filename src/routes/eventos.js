const express = require('express');
const router = express.Router();

router.get('/eventos', (req, res) => {
    const eventos = [
        { imagem: '/img/mamae.mp4',
            title: 'Mamãe Bloquei' },
            { imagem: '/img/tony2.mp4',
                title: 'Natal Feliz' },
        { imagem: '/img/tony.mp4',
            title: 'Quinta da OCTA' },
       
        { imagem: '/img/tony3.mp4',
            title: 'Araia do C2' },
            
                
    ];

    res.render('eventos', { eventos }); // Enviando os dados para a view
});

module.exports = router;