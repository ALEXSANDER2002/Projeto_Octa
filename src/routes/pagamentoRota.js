const express = require('express');
const router = express.Router();
const AbacatePayService = require('../services/abacatePayService');
const EmailService = require('../services/emailService');
const pixDataStore = require('../services/pixDataStore');

const abacatePayService = new AbacatePayService();
const emailService = new EmailService();

// Rota para criar um pagamento PIX
router.post('/pagamento/criar-pix', async (req, res) => {
    try {
        console.log('🚀 === INÍCIO CRIAÇÃO PIX ===');
        console.log('📥 Headers:', JSON.stringify(req.headers, null, 2));
        console.log('📥 Body completo:', JSON.stringify(req.body, null, 2));
        console.log('📥 Content-Type:', req.get('Content-Type'));
        console.log('🌍 Environment:', process.env.NODE_ENV);
        console.log('🔑 API Key presente:', !!process.env.ABACATE_PAY_API_KEY);
        console.log('🔑 API Key (primeiros 10 chars):', process.env.ABACATE_PAY_API_KEY?.substring(0, 10));
        
        const { produto, cliente } = req.body;

        // Validação básica
        if (!produto || !cliente) {
            console.log('❌ Erro: Dados do produto ou cliente ausentes');
            return res.status(400).json({
                success: false,
                error: 'Dados do produto e cliente são obrigatórios'
            });
        }

        // Validação dos dados do cliente
        if (!cliente.nome || !cliente.email || !cliente.telefone || !cliente.cpf) {
            console.log('❌ Erro: Dados do cliente incompletos');
            return res.status(400).json({
                success: false,
                error: 'Nome, email, telefone e CPF são obrigatórios'
            });
        }

        // Validação dos dados do produto
        if (!produto.nome || !produto.preco) {
            console.log('❌ Erro: Dados do produto incompletos');
            return res.status(400).json({
                success: false,
                error: 'Nome e preço do produto são obrigatórios'
            });
        }

        // Converter preço para centavos
        const valorEmCentavos = Math.round(produto.preco * 100);

        // Preparar dados para o Abacate Pay
        const paymentData = {
            amount: valorEmCentavos,
            description: `Compra: ${produto.nome}`,
            customer: {
                name: cliente.nome,
                email: cliente.email,
                phone: cliente.telefone,
                taxId: cliente.cpf.replace(/\D/g, '') // Remove caracteres não numéricos
            }
        };

        console.log('🔄 Criando PIX no Abacate Pay...');
        const pixResult = await abacatePayService.createPixQRCode(paymentData);

        if (!pixResult.success) {
            console.log('❌ Erro ao criar PIX:', pixResult.error);
            return res.status(400).json({
                success: false,
                error: 'Erro ao criar PIX',
                details: pixResult.error
            });
        }

        console.log('✅ PIX criado com sucesso:', pixResult.data.id || pixResult.data.pixId);

        // Preparar resposta com dados do PIX
        const responseData = {
            pixId: pixResult.data.id || pixResult.data.pixId,
            qrCode: pixResult.data.brCode || pixResult.data.qrCode,
            qrCodeBase64: pixResult.data.brCodeBase64 || pixResult.data.qrCodeBase64,
            status: pixResult.data.status || 'PENDING',
            amount: pixResult.data.amount || valorEmCentavos,
            expiresAt: pixResult.data.expiresAt
        };

        // Armazenar dados do cliente e produto para uso posterior
        pixDataStore.store(responseData.pixId, {
            customer: {
                name: cliente.nome,
                email: cliente.email,
                phone: cliente.telefone,
                cpf: cliente.cpf
            },
            product: {
                name: produto.nome,
                price: produto.preco
            },
            amount: valorEmCentavos,
            pixData: responseData
        });

        // Enviar email com o PIX criado (opcional, não bloquear se falhar)
        try {
            console.log('📧 Enviando email com PIX...');
            await emailService.sendPixCreated({
                customer: {
                    name: cliente.nome,
                    email: cliente.email
                },
                product: {
                    name: produto.nome
                },
                pixId: responseData.pixId,
                qrCodeBase64: responseData.qrCodeBase64,
                amount: responseData.amount,
                expiresAt: responseData.expiresAt
            });
        } catch (emailError) {
            console.log('⚠️ Erro ao enviar email (não crítico):', emailError.message);
        }

        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error('❌ Erro interno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Rota para verificar status do pagamento
router.get('/pagamento/status/:pixId', async (req, res) => {
    try {
        console.log('🔍 === VERIFICAÇÃO DE STATUS ===');
        console.log('📥 Params:', req.params);
        console.log('📥 Headers:', JSON.stringify(req.headers, null, 2));
        console.log('🌍 Environment:', process.env.NODE_ENV);
        
        const { pixId } = req.params;

        if (!pixId) {
            console.log('❌ PIX ID não fornecido');
            return res.status(400).json({
                success: false,
                error: 'ID do PIX é obrigatório'
            });
        }

        console.log('🔍 Verificando status do PIX:', pixId);
        const result = await abacatePayService.checkPixStatus(pixId);

        if (!result.success) {
            console.log('❌ Erro ao verificar status:', result.error);
            return res.status(400).json({
                success: false,
                error: 'Erro ao verificar status do pagamento',
                details: result.error
            });
        }

        console.log('✅ Status verificado com sucesso:', result.data);
        res.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('❌ Erro interno na verificação de status:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

// Rota para simular pagamento (apenas para testes)
router.post('/pagamento/simular/:pixId', async (req, res) => {
    try {
        const { pixId } = req.params;

        if (!pixId) {
            return res.status(400).json({
                success: false,
                error: 'ID do PIX é obrigatório'
            });
        }

        console.log('🧪 Simulando pagamento para PIX:', pixId);
        const result = await abacatePayService.simulatePixPayment(pixId);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Erro ao simular pagamento',
                details: result.error
            });
        }

        console.log('✅ Simulação de pagamento realizada com sucesso');

        // Recuperar dados reais do cliente armazenados
        const storedData = pixDataStore.get(pixId);
        
        if (storedData) {
            // Enviar email de confirmação com dados reais do cliente
            try {
                console.log('📧 Enviando email de confirmação com dados reais do cliente...');
                
                await emailService.sendPaymentConfirmation({
                    customer: {
                        name: storedData.customer.name,
                        email: storedData.customer.email
                    },
                    product: {
                        name: storedData.product.name
                    },
                    pixId: pixId,
                    amount: storedData.amount,
                    paidAt: new Date().toISOString()
                });
                
                console.log('✅ Email de confirmação enviado para:', storedData.customer.email);
            } catch (emailError) {
                console.log('⚠️ Erro ao enviar email após simulação (não crítico):', emailError.message);
            }
        } else {
            console.log('⚠️ Dados do cliente não encontrados para PIX:', pixId);
        }

        res.json({
            success: true,
            data: result.data,
            message: 'Pagamento simulado com sucesso! Email de confirmação enviado.'
        });

    } catch (error) {
        console.error('❌ Erro ao simular pagamento:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Webhook para receber notificações do Abacate Pay
router.post('/webhook/abacatepay', async (req, res) => {
    try {
        const webhookSecret = req.query.webhookSecret;
        const webhookData = req.body;

        console.log('🔔 Webhook recebido:', JSON.stringify(webhookData, null, 2));

        // Validar webhook
        if (!abacatePayService.validateWebhook(webhookSecret)) {
            console.log('❌ Webhook não autorizado');
            return res.status(401).json({
                success: false,
                error: 'Webhook não autorizado'
            });
        }

        // Processar dados do webhook
        const processedData = abacatePayService.processWebhookData(webhookData);

        console.log('📋 Dados processados do webhook:', processedData);

        // Processar eventos do webhook
        switch (processedData.event) {
            case 'billing.paid':
                console.log(`✅ Pagamento confirmado para PIX ${processedData.pixId}`);
                
                // Recuperar dados reais do cliente armazenados
                const storedData = pixDataStore.get(processedData.pixId);
                
                if (storedData) {
                    // Enviar email de confirmação com dados reais do cliente
                    try {
                        console.log('📧 Enviando email de confirmação de pagamento...');
                        
                        await emailService.sendPaymentConfirmation({
                            customer: {
                                name: storedData.customer.name,
                                email: storedData.customer.email
                            },
                            product: {
                                name: storedData.product.name
                            },
                            pixId: processedData.pixId,
                            amount: storedData.amount,
                            paidAt: processedData.paidAt || new Date().toISOString()
                        });
                        
                        console.log('✅ Email de confirmação enviado para:', storedData.customer.email);
                        
                        // Limpar dados após envio bem-sucedido (opcional)
                        // pixDataStore.remove(processedData.pixId);
                        
                    } catch (emailError) {
                        console.error('❌ Erro ao enviar email de confirmação:', emailError.message);
                    }
                } else {
                    console.log('⚠️ Dados do cliente não encontrados no armazenamento para PIX:', processedData.pixId);
                    
                    // Fallback: tentar usar dados do webhook (se disponíveis)
                    const customerData = processedData.customer || webhookData.data?.customer;
                    const pixData = webhookData.data;
                    
                    if (customerData && customerData.email) {
                        try {
                            await emailService.sendPaymentConfirmation({
                                customer: {
                                    name: customerData.name,
                                    email: customerData.email
                                },
                                product: {
                                    name: pixData?.description || 'Produto da Loja'
                                },
                                pixId: processedData.pixId,
                                amount: processedData.amount,
                                paidAt: processedData.paidAt || new Date().toISOString()
                            });
                            
                            console.log('✅ Email de confirmação enviado via fallback para:', customerData.email);
                        } catch (emailError) {
                            console.error('❌ Erro ao enviar email via fallback:', emailError.message);
                        }
                    } else {
                        console.log('⚠️ Dados do cliente não encontrados nem no armazenamento nem no webhook');
                    }
                }
                
                // Aqui você pode implementar outras lógicas:
                // - Atualizar status do pedido no banco de dados
                // - Liberar produto/serviço
                // - Enviar notificação para admin
                // - etc.
                break;
                
            case 'billing.expired':
                console.log(`⏰ Pagamento expirado para PIX ${processedData.pixId}`);
                // Implementar lógica de pagamento expirado
                // - Notificar cliente sobre expiração
                // - Limpar dados temporários
                // - etc.
                break;
                
            case 'billing.cancelled':
                console.log(`❌ Pagamento cancelado para PIX ${processedData.pixId}`);
                // Implementar lógica de pagamento cancelado
                break;
                
            default:
                console.log(`ℹ️ Evento não tratado: ${processedData.event}`);
        }

        // Responder rapidamente para o webhook
        res.status(200).json({ 
            success: true,
            message: 'Webhook processado com sucesso'
        });

    } catch (error) {
        console.error('❌ Erro ao processar webhook:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Rota de teste para verificar variáveis de ambiente (REMOVER EM PRODUÇÃO)
router.get('/pagamento/test-env', (req, res) => {
    const envVars = {
        NODE_ENV: process.env.NODE_ENV,
        ABACATE_PAY_API_KEY_EXISTS: !!process.env.ABACATE_PAY_API_KEY,
        ABACATE_PAY_API_KEY_PREFIX: process.env.ABACATE_PAY_API_KEY?.substring(0, 10),
        ABACATE_PAY_BASE_URL: process.env.ABACATE_PAY_BASE_URL,
        ABACATEPAY_API_KEY_EXISTS: !!process.env.ABACATEPAY_API_KEY,
        ABACATEPAY_API_KEY_PREFIX: process.env.ABACATEPAY_API_KEY?.substring(0, 10),
        ABACATEPAY_BASE_URL: process.env.ABACATEPAY_BASE_URL,
        EMAIL_USER_EXISTS: !!process.env.EMAIL_USER,
        EMAIL_HOST: process.env.EMAIL_HOST,
        EMAIL_PORT: process.env.EMAIL_PORT,
        VERCEL_URL: process.env.VERCEL_URL
    };
    
    res.json({
        message: 'Teste de Variáveis de Ambiente',
        environment: envVars,
        timestamp: new Date().toISOString()
    });
});

// Rota de teste simples para verificar se as rotas estão funcionando
router.get('/pagamento/test-route', (req, res) => {
    res.json({
        message: 'Rota de pagamento funcionando!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

module.exports = router; 