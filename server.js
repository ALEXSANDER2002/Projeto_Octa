const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');

const app = express();
const PORT = process.env.PORT || 3000;
const IP_LOCAL = "0.0.0.0"; // Permite conexões externas na mesma rede

// Configurar o Express para servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, 'src', 'public')));

app.use(favicon(path.join(__dirname, 'src','public','img','icon','logo.ico')));

// Configurar o Express para usar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));


// Importar as rotas
const rotas = require('./src/routes/rotas');
app.use('/', rotas);

// Iniciar o servidor e permitir acesso pelo IP local
app.listen(PORT, IP_LOCAL, () => {
    console.log(`Servidor rodando em:`);
    console.log(`➡ No PC: http://localhost:${PORT}`);
    console.log(`➡ No Celular: http://192.168.1.108:${PORT}`); // Substitua pelo seu IP
});
