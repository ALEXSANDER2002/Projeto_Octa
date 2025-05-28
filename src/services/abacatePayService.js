const axios = require('axios');

class AbacatePayService {
    constructor() {
        this.apiKey = process.env.ABACATE_PAY_API_KEY || process.env.ABACATEPAY_API_KEY || 'your_api_key_here';
        this.baseURL = process.env.ABACATE_PAY_BASE_URL || process.env.ABACATEPAY_BASE_URL || 'https://api.abacatepay.com/v1';
        this.webhookSecret = process.env.ABACATE_PAY_WEBHOOK_SECRET || process.env.ABACATEPAY_WEBHOOK_SECRET || 'your_webhook_secret_here';
        
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });
    }

    /**
     * Cria um QR Code PIX para pagamento
     * @param {Object} paymentData - Dados do pagamento
     * @returns {Promise<Object>} - Resposta da API com dados do PIX
     */
    async createPixQRCode(paymentData) {
        try {
            console.log('🚀 === ABACATE PAY SERVICE ===');
            console.log('🔑 API Key configurada:', !!this.apiKey);
            console.log('🔑 API Key (primeiros 10 chars):', this.apiKey?.substring(0, 10));
            console.log('🌐 Base URL:', this.baseURL);
            console.log('📥 Payment Data recebido:', JSON.stringify(paymentData, null, 2));
            
            const payload = {
                amount: paymentData.amount,
                description: paymentData.description,
                customer: {
                    name: paymentData.customer.name,
                    email: paymentData.customer.email,
                    cellphone: paymentData.customer.phone,
                    taxId: paymentData.customer.taxId
                }
            };

            console.log('🔄 Payload para Abacate Pay:', JSON.stringify(payload, null, 2));
            console.log('🔄 Headers da requisição:', {
                'Authorization': `Bearer ${this.apiKey?.substring(0, 10)}...`,
                'Content-Type': 'application/json'
            });

            // Configurar axios para aceitar status 400 como válido
            const response = await this.client.post('/pixQrCode/create', payload, {
                validateStatus: function (status) {
                    return status < 500; // Aceitar qualquer status < 500
                }
            });
            
            console.log('📨 Resposta do Abacate Pay (Status:', response.status, '):', JSON.stringify(response.data, null, 2));

            // Verificar se a resposta tem os dados necessários do PIX
            const responseData = response.data;
            
            // Caso 1: Dados diretos na resposta
            if (responseData && responseData.id && responseData.brCode) {
                console.log('✅ PIX criado com sucesso (dados diretos)');
                return {
                    success: true,
                    data: responseData
                };
            }
            
            // Caso 2: Dados aninhados em data
            if (responseData && responseData.data && responseData.data.id && responseData.data.brCode) {
                console.log('✅ PIX criado com sucesso (dados em data)');
                return {
                    success: true,
                    data: responseData.data
                };
            }
            
            // Caso 3: Dados aninhados em details.data
            if (responseData && responseData.details && responseData.details.data && 
                responseData.details.data.id && responseData.details.data.brCode) {
                console.log('✅ PIX criado com sucesso (dados em details.data)');
                return {
                    success: true,
                    data: responseData.details.data
                };
            }

            // Se chegou até aqui, não encontrou os dados do PIX
            console.log('❌ Resposta sem dados válidos do PIX');
            return {
                success: false,
                error: `Resposta inválida da API: ${JSON.stringify(responseData)}`
            };

        } catch (error) {
            console.error('❌ Erro ao criar PIX QR Code:', error.message);
            
            // Mesmo em caso de erro, verificar se há dados do PIX na resposta
            const responseData = error.response?.data;
            
            if (responseData && responseData.id && responseData.brCode) {
                console.log('✅ PIX criado com sucesso apesar do erro HTTP');
                return {
                    success: true,
                    data: responseData
                };
            }
            
            if (responseData && responseData.data && responseData.data.id && responseData.data.brCode) {
                console.log('✅ PIX criado com sucesso (dados em data) apesar do erro HTTP');
                return {
                    success: true,
                    data: responseData.data
                };
            }

            // Se chegou até aqui, realmente é um erro
            console.log('❌ Erro real na criação do PIX');
            return {
                success: false,
                error: responseData || error.message
            };
        }
    }

    /**
     * Verifica o status de um pagamento PIX
     * @param {string} pixId - ID do PIX
     * @returns {Promise<Object>} - Status do pagamento
     */
    async checkPixStatus(pixId) {
        try {
            console.log('🔍 Verificando status do PIX:', pixId);
            
            // Configurar axios para aceitar status 400 como válido
            const response = await this.client.get(`/pixQrCode/check?id=${pixId}`, {
                validateStatus: function (status) {
                    return status < 500; // Aceitar qualquer status < 500
                }
            });
            
            console.log('📨 Resposta do status (Status:', response.status, '):', JSON.stringify(response.data, null, 2));

            const responseData = response.data;
            
            // Caso 1: Dados diretos na resposta
            if (responseData && responseData.status) {
                console.log('✅ Status verificado com sucesso');
                return {
                    success: true,
                    data: responseData
                };
            }
            
            // Caso 2: Dados aninhados em data
            if (responseData && responseData.data && responseData.data.status) {
                console.log('✅ Status verificado com sucesso (dados em data)');
                return {
                    success: true,
                    data: responseData.data
                };
            }
            
            // Se chegou até aqui, verificar se há erro explícito
            if (responseData && responseData.error) {
                console.log('❌ Erro na verificação:', responseData.error);
                return {
                    success: false,
                    error: responseData.error
                };
            }

            // Se não há erro explícito, retornar os dados disponíveis
            console.log('✅ Dados de status retornados');
            return {
                success: true,
                data: responseData
            };

        } catch (error) {
            console.error('❌ Erro ao verificar status do PIX:', error.message);
            
            // Mesmo em caso de erro HTTP, verificar se há dados válidos na resposta
            const responseData = error.response?.data;
            
            if (responseData && responseData.status) {
                console.log('✅ Status verificado com sucesso apesar do erro HTTP');
                return {
                    success: true,
                    data: responseData
                };
            }
            
            return {
                success: false,
                error: responseData || error.message
            };
        }
    }

    /**
     * Simula um pagamento PIX (apenas para testes)
     * @param {string} pixId - ID do PIX
     * @returns {Promise<Object>} - Resultado da simulação
     */
    async simulatePixPayment(pixId) {
        try {
            console.log('🧪 Simulando pagamento para PIX:', pixId);
            
            // Configurar axios para aceitar status 400 como válido
            const response = await this.client.post(`/pixQrCode/simulate-payment?id=${pixId}`, {}, {
                validateStatus: function (status) {
                    return status < 500; // Aceitar qualquer status < 500
                }
            });
            
            console.log('📨 Resposta da simulação (Status:', response.status, '):', JSON.stringify(response.data, null, 2));

            const responseData = response.data;
            
            // Verificar se a simulação foi bem-sucedida
            if (responseData && (responseData.status === 'PAID' || responseData.message === 'Payment simulated successfully')) {
                return {
                    success: true,
                    data: responseData
                };
            }
            
            // Verificar se tem dados aninhados em details.data
            if (responseData && responseData.details && responseData.details.data) {
                return {
                    success: true,
                    data: responseData.details.data
                };
            }
            
            // Se chegou até aqui, considerar como sucesso se não há erro explícito
            return {
                success: true,
                data: responseData
            };
            
        } catch (error) {
            console.error('❌ Erro ao simular pagamento PIX:', error.message);
            
            // IMPORTANTE: O Abacate Pay pode retornar status 400 mas com dados válidos
            const responseData = error.response?.data;
            
            // Verificar se tem dados válidos na resposta de erro
            if (responseData && responseData.status === 'PAID') {
                console.log('✅ Simulação realizada com sucesso apesar do status HTTP 400');
                return {
                    success: true,
                    data: responseData
                };
            }
            
            // Verificar se tem dados aninhados em details.data
            if (responseData && responseData.details && responseData.details.data) {
                return {
                    success: true,
                    data: responseData.details.data
                };
            }
            
            return {
                success: false,
                error: 'Erro ao simular pagamento',
                details: error.response?.data || error.message
            };
        }
    }

    /**
     * Valida o webhook do Abacate Pay
     * @param {string} webhookSecret - Secret do webhook
     * @param {string} expectedSecret - Secret esperado
     * @returns {boolean} - Se o webhook é válido
     */
    validateWebhook(webhookSecret, expectedSecret = null) {
        const secret = expectedSecret || this.webhookSecret;
        return webhookSecret === secret;
    }

    /**
     * Processa dados do webhook
     * @param {Object} webhookData - Dados recebidos do webhook
     * @returns {Object} - Dados processados
     */
    processWebhookData(webhookData) {
        return {
            event: webhookData.event,
            pixId: webhookData.data?.id,
            status: webhookData.data?.status,
            amount: webhookData.data?.amount,
            paidAt: webhookData.data?.paidAt,
            customer: webhookData.data?.customer
        };
    }
}

module.exports = AbacatePayService; 