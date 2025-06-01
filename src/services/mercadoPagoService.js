const { MercadoPagoConfig, Payment, Preference } = require('mercadopago');
const crypto = require('crypto');

/**
 * Serviço responsável por gerenciar operações do Mercado Pago
 * @class MercadoPagoService
 */
class MercadoPagoService {
    constructor() {
        if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
            throw new Error('Token de acesso do Mercado Pago não configurado');
        }

        this.client = new MercadoPagoConfig({ 
            accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
            options: { 
                timeout: 5000, 
                idempotencyKey: 'px-' + Date.now()
            }
        });
        this.payment = new Payment(this.client);
        this.preference = new Preference(this.client);
    }

    /**
     * Cria um pagamento no Mercado Pago
     * @param {Object} paymentData - Dados do pagamento
     * @returns {Promise<Object>} Resposta do Mercado Pago
     */
    async createPayment(paymentData) {
        try {
            this.validatePaymentData(paymentData);

            console.log('💳 Criando pagamento com dados:', paymentData);

            const bodyData = {
                transaction_amount: paymentData.transaction_amount,
                token: paymentData.token,
                description: paymentData.description,
                installments: paymentData.installments,
                payment_method_id: paymentData.payment_method_id,
                issuer_id: paymentData.issuer_id,
                payer: {
                    email: paymentData.payer.email,
                    identification: paymentData.payer.identification
                },
                statement_descriptor: process.env.STORE_NAME || "Atlética Octa Core",
                metadata: {
                    order_id: `OCTA_${Date.now()}`,
                    product_name: paymentData.description
                }
            };

            // Adicionar notification_url apenas se não for PIX e se BASE_URL não for localhost
            if (paymentData.payment_method_id !== 'pix' && 
                process.env.BASE_URL && 
                !process.env.BASE_URL.includes('localhost')) {
                bodyData.notification_url = `${process.env.BASE_URL}/mercadopago/webhook`;
            }

            const payment = await this.payment.create({ body: bodyData });

            console.log('✅ Pagamento criado:', payment);
            return payment;
        } catch (error) {
            console.error('❌ Erro ao criar pagamento:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Cria uma preferência de pagamento
     * @param {Object} data - Dados da preferência
     * @returns {Promise<Object>} Preferência criada
     */
    async createPreference(data) {
        try {
            this.validatePreferenceData(data);
            
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            
            const preferenceData = {
                items: data.items,
                payer: data.payer,
                payment_methods: {
                    excluded_payment_methods: data.excludedPaymentMethods || [],
                    excluded_payment_types: data.excludedPaymentTypes || [],
                    installments: data.maxInstallments || 12,
                    default_installments: 1
                },
                back_urls: {
                    success: `${baseUrl}/mercadopago/success`,
                    failure: `${baseUrl}/mercadopago/failure`,
                    pending: `${baseUrl}/mercadopago/pending`
                },
                notification_url: `${baseUrl}/mercadopago/webhook`,
                statement_descriptor: process.env.STORE_NAME || "Atlética Octa Core",
                external_reference: data.externalReference || `OCTA_${Date.now()}`,
                expires: true,
                expiration_date_from: new Date().toISOString(),
                expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };

            if (data.shipments) {
                preferenceData.shipments = {
                    cost: data.shipments.cost,
                    mode: "not_specified",
                };
            }

            const response = await this.preference.create({ body: preferenceData });
            return response;
        } catch (error) {
            console.error('Erro ao criar preferência:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Busca informações de um pagamento
     * @param {string} paymentId - ID do pagamento
     * @returns {Promise<Object>} Informações do pagamento
     */
    async getPayment(paymentId) {
        try {
            if (!paymentId) throw new Error('ID do pagamento é obrigatório');
            
            const response = await this.payment.get({ id: paymentId });
            return response;
        } catch (error) {
            console.error('Erro ao buscar pagamento:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Processa webhook do Mercado Pago
     * @param {Object} data - Dados do webhook
     * @returns {Promise<Object>} Informações processadas
     */
    async processWebhook(data) {
        try {
            this.validateWebhook(data);
            
            if (data.type === 'payment') {
                const paymentId = data.data.id;
                const paymentInfo = await this.getPayment(paymentId);
                
                // Validar assinatura do webhook se configurada
                if (process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
                    const isValid = this.validateWebhookSignature(data);
                    if (!isValid) {
                        throw new Error('Assinatura do webhook inválida');
                    }
                }
                
                return paymentInfo;
            }
            return null;
        } catch (error) {
            console.error('Erro ao processar webhook:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Reembolsa um pagamento
     * @param {string} paymentId - ID do pagamento
     * @returns {Promise<Object>} Resultado do reembolso
     */
    async refundPayment(paymentId) {
        try {
            if (!paymentId) throw new Error('ID do pagamento é obrigatório');
            
            const response = await this.payment.refund({ payment_id: paymentId });
            return response;
        } catch (error) {
            console.error('Erro ao reembolsar pagamento:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Cancela um pagamento
     * @param {string} paymentId - ID do pagamento
     * @returns {Promise<Object>} Resultado do cancelamento
     */
    async cancelPayment(paymentId) {
        try {
            if (!paymentId) throw new Error('ID do pagamento é obrigatório');
            
            const response = await this.payment.cancel({ payment_id: paymentId });
            return response;
        } catch (error) {
            console.error('Erro ao cancelar pagamento:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Valida dados do pagamento
     * @private
     * @param {Object} data - Dados a serem validados
     */
    validatePaymentData(data) {
        if (!data) throw new Error('Dados do pagamento são obrigatórios');
        if (!data.transaction_amount) throw new Error('Valor da transação é obrigatório');
        if (!data.payment_method_id) throw new Error('Método de pagamento é obrigatório');
        if (!data.payer || !data.payer.email) throw new Error('Email do pagador é obrigatório');

        // Validações específicas para cartão de crédito
        if (data.payment_method_id === 'credit_card') {
            if (!data.token) throw new Error('Token do cartão é obrigatório');
            if (!data.installments) throw new Error('Número de parcelas é obrigatório');
            if (!data.issuer_id) throw new Error('Banco emissor é obrigatório');
        }
    }

    /**
     * Valida dados da preferência
     * @private
     * @param {Object} data - Dados a serem validados
     */
    validatePreferenceData(data) {
        if (!data) throw new Error('Dados da preferência são obrigatórios');
        if (!data.items || !data.items.length) throw new Error('Items são obrigatórios');
        if (!data.payer) throw new Error('Dados do pagador são obrigatórios');
    }

    /**
     * Valida dados do webhook
     * @private
     * @param {Object} data - Dados a serem validados
     */
    validateWebhook(data) {
        if (!data) throw new Error('Dados do webhook são obrigatórios');
        if (!data.type) throw new Error('Tipo do webhook é obrigatório');
        if (!data.data) throw new Error('Dados do webhook são obrigatórios');
    }

    /**
     * Valida assinatura do webhook
     * @private
     * @param {Object} data - Dados do webhook
     * @returns {boolean} Resultado da validação
     */
    validateWebhookSignature(data) {
        const signature = crypto
            .createHmac('sha256', process.env.MERCADO_PAGO_WEBHOOK_SECRET)
            .update(JSON.stringify(data))
            .digest('hex');
            
        return signature === data.signature;
    }

    /**
     * Trata erros da API
     * @private
     * @param {Error} error - Erro a ser tratado
     * @returns {Error} Erro tratado
     */
    handleError(error) {
        if (error.status === 400) {
            return new Error('Requisição inválida: ' + error.message);
        } else if (error.status === 401) {
            return new Error('Não autorizado: verifique suas credenciais');
        } else if (error.status === 404) {
            return new Error('Recurso não encontrado');
        } else if (error.status >= 500) {
            return new Error('Erro interno do Mercado Pago');
        }
        return error;
    }
}

module.exports = new MercadoPagoService(); 