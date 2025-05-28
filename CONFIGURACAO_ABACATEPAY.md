# Configuração do Abacate Pay

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do Abacate Pay
ABACATEPAY_API_KEY=your_api_key_here
ABACATEPAY_BASE_URL=https://api.abacatepay.com/v1
ABACATEPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Configurações do servidor
PORT=3000
```

## Como Obter as Credenciais

1. **API Key**: Acesse o painel do Abacate Pay e gere uma chave de API
2. **Base URL**: Use `https://api.abacatepay.com/v1` para produção
3. **Webhook Secret**: Configure um secret para validar os webhooks

## Instalação das Dependências

As dependências já estão configuradas no `package.json`:
- `axios`: Para fazer requisições HTTP
- `dotenv`: Para carregar variáveis de ambiente

Execute:
```bash
npm install
```

## Testando a Integração

1. Configure as variáveis de ambiente
2. Inicie o servidor: `npm start` ou `node server.js`
3. Acesse a loja em `http://localhost:3000/loja`
4. Clique em "Comprar com PIX" em qualquer produto
5. Preencha os dados e teste o pagamento

## Funcionalidades Implementadas

- ✅ Criação de QR Code PIX
- ✅ Verificação de status de pagamento
- ✅ Simulação de pagamento (para testes)
- ✅ Webhook para notificações
- ✅ Interface moderna com modal
- ✅ Validação de dados do cliente
- ✅ Máscaras para CPF e telefone
- ✅ Verificação automática de status

## Endpoints da API

- `POST /pagamento/criar-pix` - Criar pagamento PIX
- `GET /pagamento/status/:pixId` - Verificar status
- `POST /pagamento/simular/:pixId` - Simular pagamento (teste)
- `POST /webhook/abacatepay` - Webhook do Abacate Pay

## Estrutura dos Arquivos

```
src/
├── services/
│   └── abacatePayService.js    # Serviço do Abacate Pay
├── routes/
│   └── pagamentoRota.js        # Rotas de pagamento
├── views/
│   ├── loja.ejs                # Página da loja com modal
│   └── partials/
│       └── card-loja.ejs       # Card do produto
├── public/
│   ├── CSS/
│   │   └── modal-pagamento.css # Estilos do modal
│   └── JS/
│       └── pagamento.js        # JavaScript do frontend
``` 