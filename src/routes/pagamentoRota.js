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
        console.log('📥 Dados recebidos:', JSON.stringify(req.body, null, 2));
        
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
        const { pixId } = req.params;

        if (!pixId) {
            return res.status(400).json({
                success: false,
                error: 'ID do PIX é obrigatório'
            });
        }

        const result = await abacatePayService.checkPixStatus(pixId);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Erro ao verificar status do pagamento',
                details: result.error
            });
        }

        res.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('Erro ao verificar status:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
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

module.exports = router; 