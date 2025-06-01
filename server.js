require('dotenv').config();

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

// Configurar cache (10 minutos de TTL)
const cache = new NodeCache({ stdTTL: 600 });

// Configurar rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: {
        error: 'Muitas tentativas. Tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Configurar rate limiting específico para pagamentos
const paymentLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10, // máximo 10 tentativas de pagamento por IP
    message: {
        error: 'Muitas tentativas de pagamento. Tente novamente em 5 minutos.'
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'", 
                "'unsafe-inline'", 
                "https://fonts.googleapis.com", 
                "https://cdnjs.cloudflare.com",
                "https://cdn.jsdelivr.net",
                "https://*.mercadopago.com",
                "https://*.mlstatic.com"
            ],
            fontSrc: [
                "'self'", 
                "https://fonts.gstatic.com",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            scriptSrc: [
                "'self'", 
                "'unsafe-inline'", 
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com",
                "https://*.mercadopago.com",
                "https://secure.mlstatic.com",
                "https://http2.mlstatic.com",
                "https://*.mercadolibre.com"
            ],
            imgSrc: [
                "'self'", 
                "data:", 
                "https:",
                "https://*.mercadopago.com",
                "https://*.mlstatic.com"
            ],
            connectSrc: [
                "'self'", 
                "https://api.mercadopago.com",
                "https://*.mercadopago.com",
                "https://api.mercadolibre.com",
                "https://www.mercadolibre.com",
                "https://*.mlstatic.com"
            ],
            frameSrc: [
                "'self'", 
                "https://*.mercadopago.com",
                "https://www.mercadolibre.com"
            ]
        }
    }
}));

// Middleware de compressão
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024
}));

// Rate limiting geral
app.use(limiter);

// Rate limiting específico para rotas de pagamento
app.use('/pagamento', paymentLimiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Servir arquivos estáticos com cache headers
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache por 1 dia
    etag: true,
    lastModified: true
}));

// Favicon (comentado temporariamente até criar o arquivo)
// app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));

// Middleware para adicionar cache ao contexto das rotas
app.use((req, res, next) => {
    req.cache = cache;
    next();
});

// Importar rotas
const rotas = require('./src/routes/rotas');
const pagamentoRota = require('./src/routes/pagamentoRota');
const modalidadeRota = require('./src/routes/modalidadeRota');
const trofeuRota = require('./src/routes/trofeuRota');
const eventoRota = require('./src/routes/eventos');
const mercadoPagoRoutes = require('./src/routes/mercadoPagoRoutes');

// Usar rotas
app.use('/', rotas);
app.use('/mercadopago', mercadoPagoRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro interno:', err);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada'
    });
});

// Para Vercel (serverless)
if (process.env.VERCEL) {
    module.exports = app;
} else {
    // Para desenvolvimento local
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`🌐 Acesse: http://localhost:${PORT}`);
        console.log(`🔒 Segurança: Helmet ativado`);
        console.log(`⚡ Compressão: Ativada`);
        console.log(`🛡️ Rate Limiting: Ativado`);
        console.log(`💾 Cache: Ativado (TTL: 10min)`);
    });
}
