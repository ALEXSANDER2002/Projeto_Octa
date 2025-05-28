const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Configuração do transportador de email
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true para 465, false para outras portas
            auth: {
                user: process.env.EMAIL_USER, // seu email
                pass: process.env.EMAIL_PASS  // sua senha de app ou senha
            }
        });

        // Email remetente padrão
        this.fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
        this.fromName = process.env.EMAIL_FROM_NAME || 'Loja Online';
    }

    /**
     * Envia email de confirmação de pagamento
     * @param {Object} paymentData - Dados do pagamento
     * @returns {Promise<Object>} - Resultado do envio
     */
    async sendPaymentConfirmation(paymentData) {
        try {
            const { customer, product, pixId, amount, paidAt } = paymentData;

            // Formatar valor para exibição
            const formattedAmount = (amount / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            // Formatar data de pagamento
            const formattedDate = new Date(paidAt || Date.now()).toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const mailOptions = {
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to: customer.email,
                subject: '✅ Pagamento Confirmado - Pedido Aprovado!',
                html: this.generatePaymentConfirmationHTML({
                    customerName: customer.name,
                    productName: product.name,
                    amount: formattedAmount,
                    pixId: pixId,
                    paidAt: formattedDate
                })
            };

            console.log('📧 Enviando email de confirmação para:', customer.email);
            const result = await this.transporter.sendMail(mailOptions);
            
            console.log('✅ Email enviado com sucesso:', result.messageId);
            return {
                success: true,
                messageId: result.messageId
            };

        } catch (error) {
            console.error('❌ Erro ao enviar email:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Gera o HTML do email de confirmação
     * @param {Object} data - Dados para o template
     * @returns {string} - HTML do email
     */
    generatePaymentConfirmationHTML(data) {
        // URL dinâmica baseada no ambiente
        const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : process.env.BASE_URL || 'http://localhost:3000';
            
        return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pagamento Confirmado</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #28a745;
                }
                .success-icon {
                    font-size: 48px;
                    color: #28a745;
                    margin-bottom: 10px;
                }
                .title {
                    color: #28a745;
                    font-size: 24px;
                    margin: 0;
                    font-weight: bold;
                }
                .subtitle {
                    color: #666;
                    font-size: 16px;
                    margin: 5px 0 0 0;
                }
                .details {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }
                .detail-row:last-child {
                    border-bottom: none;
                    font-weight: bold;
                    font-size: 18px;
                    color: #28a745;
                }
                .label {
                    font-weight: 600;
                    color: #555;
                }
                .value {
                    color: #333;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }
                .button {
                    display: inline-block;
                    background: #28a745;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-weight: bold;
                }
                @media (max-width: 600px) {
                    body { padding: 10px; }
                    .container { padding: 20px; }
                    .detail-row { flex-direction: column; }
                    .value { margin-top: 5px; font-weight: bold; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="success-icon">✅</div>
                    <h1 class="title">Pagamento Confirmado!</h1>
                    <p class="subtitle">Seu pedido foi aprovado com sucesso</p>
                </div>

                <p>Olá <strong>${data.customerName}</strong>,</p>
                
                <p>Temos uma ótima notícia! Seu pagamento foi processado com sucesso e seu pedido foi confirmado.</p>

                <div class="details">
                    <div class="detail-row">
                        <span class="label">Produto:</span>
                        <span class="value">${data.productName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Valor Pago:</span>
                        <span class="value">${data.amount}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Data do Pagamento:</span>
                        <span class="value">${data.paidAt}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">ID da Transação:</span>
                        <span class="value">${data.pixId}</span>
                    </div>
                </div>

                <p>🎉 <strong>Parabéns!</strong> Sua compra foi finalizada com sucesso. Em breve você receberá mais informações sobre a entrega do seu produto.</p>

                <div style="text-align: center;">
                    <a href="${baseUrl}/loja" class="button">Continuar Comprando</a>
                </div>

                <div class="footer">
                    <p>Este é um email automático, não é necessário responder.</p>
                    <p>Em caso de dúvidas, entre em contato conosco.</p>
                    <p><strong>Obrigado por escolher nossa loja!</strong></p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Envia email de PIX criado (com QR Code)
     * @param {Object} pixData - Dados do PIX
     * @returns {Promise<Object>} - Resultado do envio
     */
    async sendPixCreated(pixData) {
        try {
            const { customer, product, pixId, qrCodeBase64, amount, expiresAt } = pixData;

            const formattedAmount = (amount / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const formattedExpiry = new Date(expiresAt).toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const mailOptions = {
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to: customer.email,
                subject: '📱 PIX Gerado - Complete seu Pagamento',
                html: this.generatePixCreatedHTML({
                    customerName: customer.name,
                    productName: product.name,
                    amount: formattedAmount,
                    pixId: pixId,
                    qrCodeBase64: qrCodeBase64,
                    expiresAt: formattedExpiry
                })
            };

            console.log('📧 Enviando PIX por email para:', customer.email);
            const result = await this.transporter.sendMail(mailOptions);
            
            console.log('✅ Email do PIX enviado com sucesso:', result.messageId);
            return {
                success: true,
                messageId: result.messageId
            };

        } catch (error) {
            console.error('❌ Erro ao enviar email do PIX:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Gera o HTML do email com PIX
     * @param {Object} data - Dados para o template
     * @returns {string} - HTML do email
     */
    generatePixCreatedHTML(data) {
        return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PIX Gerado</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #007bff;
                }
                .pix-icon {
                    font-size: 48px;
                    color: #007bff;
                    margin-bottom: 10px;
                }
                .title {
                    color: #007bff;
                    font-size: 24px;
                    margin: 0;
                    font-weight: bold;
                }
                .qr-code {
                    text-align: center;
                    margin: 20px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .qr-code img {
                    max-width: 200px;
                    height: auto;
                    border: 2px solid #007bff;
                    border-radius: 8px;
                }
                .details {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }
                .detail-row:last-child {
                    border-bottom: none;
                }
                .warning {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="pix-icon">📱</div>
                    <h1 class="title">PIX Gerado com Sucesso!</h1>
                    <p>Complete seu pagamento escaneando o QR Code</p>
                </div>

                <p>Olá <strong>${data.customerName}</strong>,</p>
                
                <p>Seu PIX foi gerado com sucesso! Escaneie o QR Code abaixo com o app do seu banco para completar o pagamento.</p>

                <div class="qr-code">
                    <img src="${data.qrCodeBase64}" alt="QR Code PIX" />
                    <p><strong>Escaneie este QR Code com seu app bancário</strong></p>
                </div>

                <div class="details">
                    <div class="detail-row">
                        <span class="label">Produto:</span>
                        <span class="value">${data.productName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Valor:</span>
                        <span class="value">${data.amount}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Válido até:</span>
                        <span class="value">${data.expiresAt}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">ID da Transação:</span>
                        <span class="value">${data.pixId}</span>
                    </div>
                </div>

                <div class="warning">
                    <strong>⚠️ Importante:</strong> Este PIX expira em 1 hora. Após o pagamento, você receberá uma confirmação por email.
                </div>

                <div class="footer">
                    <p>Este é um email automático, não é necessário responder.</p>
                    <p>Em caso de dúvidas, entre em contato conosco.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Testa a configuração de email
     * @returns {Promise<Object>} - Resultado do teste
     */
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Configuração de email válida');
            return { success: true };
        } catch (error) {
            console.error('❌ Erro na configuração de email:', error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailService; 