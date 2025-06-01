const express = require('express');
const router = express.Router();

// Cache de produtos
const CACHE_DURATION = 600; // 10 minutos
let productsCache = null;
let lastCacheTime = null;

// Função para obter produtos
function getProducts() {
    // Se o cache é válido, retorna os produtos em cache
    if (productsCache && lastCacheTime && (Date.now() - lastCacheTime) < (CACHE_DURATION * 1000)) {
        console.log('⚡ Produtos carregados do cache');
        return productsCache;
    }

    // Se não há cache ou está expirado, gera novos produtos
    const produtos = [
        {
            imagem: '/img/produtos/camisas/camisa-azul.png',
            nome: 'Camisa Atlética Octa Core - Azul',
            precoAntigo: 89.90,
            precoNovo: 69.90
        },
        {
            imagem: '/img/produtos/camisas/camisa-verde.png',
            nome: 'Camisa Treino Octa Core - Verde',
            precoAntigo: 79.90,
            precoNovo: 59.90
        },
        {
            imagem: '/img/produtos/camisas/camisa-preta.png',
            nome: 'Camisa Oficial Octa Core - Preta',
            precoAntigo: 99.90,
            precoNovo: 79.90
        },
        {
            imagem: '/img/produtos/camisas/camisa-azul.png',
            nome: 'Camisa Polo Octa Core - Azul',
            precoAntigo: 109.90,
            precoNovo: 89.90
        },
        {
            imagem: '/img/produtos/camisas/camisa-verde.png',
            nome: 'Camisa Regata Octa Core - Verde',
            precoAntigo: 69.90,
            precoNovo: 49.90
        },
        {
            imagem: '/img/produtos/camisas/camisa-preta.png',
            nome: 'Camisa Manga Longa Octa Core - Preta',
            precoAntigo: 119.90,
            precoNovo: 99.90
        },
        {
            imagem: '/img/produtos/camisas/camisa-azul.png',
            nome: 'Camisa Esportiva Octa Core - Azul',
            precoAntigo: 94.90,
            precoNovo: 74.90
        },
        {
            imagem: '/img/produtos/camisas/camisa-verde.png',
            nome: 'Camisa Casual Octa Core - Verde',
            precoAntigo: 84.90,
            precoNovo: 64.90
        },
        {
            imagem: '/img/produtos/camisas/camisa-preta.png',
            nome: 'Camisa Premium Octa Core - Preta',
            precoAntigo: 129.90,
            precoNovo: 109.90
        }
    ];

    // Atualiza o cache
    productsCache = produtos;
    lastCacheTime = Date.now();
    console.log('📦 Produtos gerados e armazenados em cache');

    return produtos;
}

// Rota para a loja
router.get('/loja', (req, res) => {
    try {
        console.log('🔑 Chave pública do Mercado Pago:', process.env.MERCADO_PAGO_PUBLIC_KEY);
        
        const produtos = getProducts();
        console.log('📦 Produtos carregados:', produtos.length);
        
        // Headers de cache para o navegador
        res.set({
            'Cache-Control': 'public, max-age=300', // 5 minutos
            'ETag': `"produtos-${lastCacheTime}"`,
            'Last-Modified': new Date(lastCacheTime).toUTCString()
        });
        
        const viewData = { 
            produtos: produtos,
            title: 'Loja - Atlética Octa Core',
            description: 'Produtos exclusivos da Atlética Octa Core',
            process: {
                env: {
                    MERCADO_PAGO_PUBLIC_KEY: process.env.MERCADO_PAGO_PUBLIC_KEY
                }
            }
        };
        
        console.log('🎨 Renderizando view com dados:', {
            produtosCount: viewData.produtos.length,
            temChaveMP: !!viewData.process.env.MERCADO_PAGO_PUBLIC_KEY
        });
        
        res.render('loja', viewData);
    } catch (error) {
        console.error('❌ Erro ao carregar a loja:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro interno do servidor' 
        });
    }
});

module.exports = router;