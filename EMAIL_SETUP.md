# 📧 Configuração de Email - Guia Completo

## 🎯 Funcionalidades de Email Implementadas

O sistema agora envia emails automaticamente em duas situações:

1. **📱 PIX Criado**: Email com QR Code quando o PIX é gerado
2. **✅ Pagamento Confirmado**: Email de confirmação quando o pagamento é aprovado

## ⚙️ Configuração do Gmail (Recomendado)

### 1. Habilitar Autenticação de 2 Fatores
1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em **Segurança** → **Verificação em duas etapas**
3. Ative a verificação em duas etapas

### 2. Gerar Senha de App
1. Na mesma página de Segurança
2. Clique em **Senhas de app**
3. Selecione **Email** como aplicativo
4. Copie a senha gerada (16 caracteres)

### 3. Configurar Variáveis de Ambiente
Edite o arquivo `.env` e configure:

```env
# Configurações de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_16_caracteres
EMAIL_FROM_NAME=Nome da Sua Loja
```

## 🔧 Outras Opções de Email

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=seu_email@outlook.com
EMAIL_PASS=sua_senha
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=seu_email@yahoo.com
EMAIL_PASS=sua_senha_de_app
```

### Provedor Personalizado
```env
EMAIL_HOST=smtp.seuprovedor.com
EMAIL_PORT=587
EMAIL_USER=seu_email@seuprovedor.com
EMAIL_PASS=sua_senha
```

## 🧪 Testando a Configuração

### 1. Teste Básico
Execute o servidor e verifique se não há erros de conexão:
```bash
node server.js
```

### 2. Teste Completo
1. Acesse: http://localhost:3000/loja
2. Clique em "Comprar com PIX"
3. Preencha com **seu email real**
4. Verifique se recebeu o email com QR Code
5. Clique em "Simular Pagamento"
6. Verifique se recebeu o email de confirmação

## 📋 Estrutura dos Emails

### Email de PIX Criado
- ✅ QR Code para pagamento
- ✅ Dados do produto e valor
- ✅ Data de expiração
- ✅ ID da transação

### Email de Confirmação
- ✅ Confirmação visual de pagamento aprovado
- ✅ Detalhes da compra
- ✅ Data e hora do pagamento
- ✅ Botão para continuar comprando

## 🔒 Segurança

- ✅ Senhas de app (mais seguro que senha normal)
- ✅ Conexão criptografada (TLS)
- ✅ Validação de dados antes do envio
- ✅ Tratamento de erros sem quebrar o fluxo

## 🚨 Solução de Problemas

### Erro: "Invalid login"
- Verifique se a senha de app está correta
- Confirme se a autenticação de 2 fatores está ativa

### Erro: "Connection timeout"
- Verifique sua conexão com internet
- Confirme se o host e porta estão corretos

### Email não chega
- Verifique a pasta de spam
- Confirme se o email está correto
- Teste com outro provedor de email

### Para Desenvolvimento/Teste
Se não quiser configurar email real, o sistema funciona normalmente sem enviar emails. Os logs mostrarão que tentou enviar mas falhou (não crítico).

## 📞 Suporte

Em caso de dúvidas:
1. Verifique os logs do servidor
2. Teste com diferentes provedores de email
3. Confirme se todas as variáveis estão configuradas

---

**✅ Configuração concluída!** Agora seus clientes receberão emails automáticos para uma experiência completa de compra. 