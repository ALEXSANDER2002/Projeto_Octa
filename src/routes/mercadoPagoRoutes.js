const express = require('express');
const router = express.Router();
const mercadoPagoService = require('../services/mercadoPagoService');
const { body, validationResult } = require('express-validator');

// Middleware de validação
const validatePaymentData = [
    body('items').isArray().withMessage('Items deve ser um array'),
    body('items.*.title').notEmpty().withMessage('Título do item é obrigatório'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que 0'),
    body('items.*.unit_price').isFloat({ min: 0.01 }).withMessage('Preço unitário deve ser maior que 0'),
    body('token').notEmpty().withMessage('Token do cartão é obrigatório'),
    body('issuerId').notEmpty().withMessage('Banco emissor é obrigatório'),
    body('paymentMethodId').notEmpty().withMessage('Método de pagamento é obrigatório'),
    body('installments').isInt({ min: 1 }).withMessage('Número de parcelas inválido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('productData').isObject().withMessage('Dados do produto são obrigatórios'),
    body('productData.nome').notEmpty().withMessage('Nome do produto é obrigatório'),
    body('productData.preco').isFloat({ min: 0.01 }).withMessage('Preço do produto inválido'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        next();
    }
];

// Middleware de validação para preferência
const validatePreferenceData = [
    body('items').isArray().withMessage('Items deve ser um array'),
    body('items.*.title').notEmpty().withMessage('Título do item é obrigatório'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que 0'),
    body('items.*.unit_price').isFloat({ min: 0.01 }).withMessage('Preço unitário deve ser maior que 0'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        next();
    }
];

// Criar pagamento
router.post('/payment', validatePaymentData, async (req, res) => {
    try {
        const payment = await mercadoPagoService.createPayment(req.body);
        res.json(payment);
    } catch (error) {
        console.error('Erro na rota de pagamento:', error);
        res.status(500).json({ error: 'Erro ao processar pagamento' });
    }
});

// Criar preferência de pagamento
router.post('/preference', validatePreferenceData, async (req, res) => {
    try {
        const preference = await mercadoPagoService.createPreference({
            items: req.body.items,
            payer: req.body.payer || {},
            excludedPaymentMethods: req.body.excludedPaymentMethods,
            excludedPaymentTypes: req.body.excludedPaymentTypes,
            maxInstallments: req.body.maxInstallments,
            externalReference: `OCTA_${Date.now()}`,
            shipments: req.body.shipments
        });

        res.json(preference);
    } catch (error) {
        console.error('Erro na criação da preferência:', error);
        res.status(500).json({ error: error.message || 'Erro ao criar preferência de pagamento' });
    }
});

// Webhook para notificações do Mercado Pago
router.post('/webhook', async (req, res) => {
    try {
        const result = await mercadoPagoService.processWebhook(req.body);
        
        if (result) {
            // Processar diferentes status de pagamento
            switch(result.status) {
                case 'approved':
                    console.log('Pagamento aprovado:', result.id);
                    // Aqui você pode adicionar lógica específica para pagamentos aprovados
                    break;
                case 'pending':
                    console.log('Pagamento pendente:', result.id);
                    // Lógica para pagamentos pendentes
                    break;
                case 'rejected':
                    console.log('Pagamento rejeitado:', result.id);
                    // Lógica para pagamentos rejeitados
                    break;
                default:
                    console.log('Status de pagamento:', result.status);
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Erro no webhook:', error);
        res.status(500).json({ error: 'Erro ao processar webhook' });
    }
});

// Rota para reembolso
router.post('/refund/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const refund = await mercadoPagoService.refundPayment(paymentId);
        res.json(refund);
    } catch (error) {
        console.error('Erro ao processar reembolso:', error);
        res.status(500).json({ error: 'Erro ao processar reembolso' });
    }
});

// Rota para cancelamento
router.post('/cancel/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const cancelation = await mercadoPagoService.cancelPayment(paymentId);
        res.json(cancelation);
    } catch (error) {
        console.error('Erro ao cancelar pagamento:', error);
        res.status(500).json({ error: 'Erro ao cancelar pagamento' });
    }
});

// Rotas de retorno
router.get('/success', (req, res) => {
    const paymentId = req.query.payment_id;
    const status = req.query.status;
    const externalReference = req.query.external_reference;

    res.render('payment-result', {
        status: 'success',
        message: 'Pagamento processado com sucesso!',
        paymentId,
        externalReference,
        paymentMethod: req.query.payment_type,
        installments: req.query.installments,
        installmentAmount: req.query.transaction_amount ? 
            (parseFloat(req.query.transaction_amount) / parseInt(req.query.installments || 1)).toFixed(2) : 
            null,
        totalAmount: req.query.transaction_amount
    });
});

router.get('/failure', (req, res) => {
    const paymentId = req.query.payment_id;
    const status = req.query.status;
    const externalReference = req.query.external_reference;

    res.render('payment-result', {
        status: 'failure',
        message: 'Falha no pagamento. Por favor, tente novamente.',
        paymentId,
        externalReference
    });
});

router.get('/pending', (req, res) => {
    const paymentId = req.query.payment_id;
    const status = req.query.status;
    const externalReference = req.query.external_reference;

    res.render('payment-result', {
        status: 'pending',
        message: 'Pagamento pendente de processamento.',
        paymentId,
        externalReference,
        paymentMethod: req.query.payment_type,
        paymentInstructions: req.query.payment_method_id === 'pix' ? {
            qrCode: req.query.qr_code_base64,
            pixCode: req.query.qr_code
        } : req.query.payment_method_id === 'boleto' ? {
            url: req.query.transaction_details?.external_resource_url,
            barCode: req.query.transaction_details?.financial_institution,
            expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
        } : null
    });
});

// Processar pagamento com cartão
router.post('/process_payment', validatePaymentData, async (req, res) => {
    try {
        const { 
            token,
            issuerId,
            paymentMethodId,
            installments,
            email,
            productData
        } = req.body;

        const payment = await mercadoPagoService.createPayment({
            transaction_amount: parseFloat(productData.preco),
            token: token,
            description: productData.nome,
            installments: parseInt(installments),
            payment_method_id: paymentMethodId,
            issuer_id: issuerId,
            payer: {
                email: email
            }
        });

        res.json({
            status: payment.status,
            status_detail: payment.status_detail,
            id: payment.id
        });
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        res.status(500).json({ 
            error: error.message || 'Erro ao processar pagamento',
            status: 'rejected'
        });
    }
});

// Criar pagamento PIX
router.post('/create_pix', async (req, res) => {
    try {
        const { nome, preco, email } = req.body;
        console.log('📦 Dados recebidos:', { nome, preco, email });

        if (!nome || !preco || !email) {
            console.log('❌ Dados inválidos:', { nome, preco, email });
            return res.status(400).json({ error: 'Nome, preço e email são obrigatórios' });
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Email inválido:', email);
            return res.status(400).json({ error: 'Email inválido' });
        }

        const precoNumerico = parseFloat(preco);
        console.log('💰 Preço convertido:', precoNumerico);

        if (isNaN(precoNumerico) || precoNumerico <= 0) {
            console.log('❌ Preço inválido:', { preco, precoNumerico });
            return res.status(400).json({ error: 'Preço inválido' });
        }

        const paymentData = {
            transaction_amount: precoNumerico,
            payment_method_id: 'pix',
            description: nome,
            payer: {
                email: email
            }
        };
        console.log('💳 Dados do pagamento:', paymentData);

        const payment = await mercadoPagoService.createPayment(paymentData);
        console.log('✅ Pagamento criado:', payment);

        if (!payment.point_of_interaction?.transaction_data?.qr_code) {
            console.log('❌ QR Code não gerado:', payment);
            throw new Error('QR Code PIX não gerado pelo Mercado Pago');
        }

        // Retornar dados do PIX
        const response = {
            qr_code: payment.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: payment.point_of_interaction.transaction_data.qr_code_base64,
            payment_id: payment.id
        };
        console.log('📤 Resposta:', response);

        res.json(response);
    } catch (error) {
        console.error('❌ Erro ao criar PIX:', error);
        res.status(500).json({ 
            error: error.message || 'Erro ao gerar PIX',
            details: error.cause || []
        });
    }
});

module.exports = router; 