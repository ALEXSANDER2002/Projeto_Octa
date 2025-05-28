# 🚀 Deploy na Vercel - Guia Completo

## 📋 Pré-requisitos

1. **Conta na Vercel**: [vercel.com](https://vercel.com)
2. **Conta no GitHub**: Para conectar o repositório
3. **Projeto no GitHub**: Código deve estar em um repositório

## 🔧 Preparação do Projeto

### 1. Arquivos de Configuração Criados
- ✅ `vercel.json` - Configuração da Vercel
- ✅ `package.json` - Atualizado com scripts
- ✅ `.gitignore` - Arquivos a ignorar
- ✅ `server.js` - Adaptado para serverless

### 2. Estrutura do Projeto
```
projeto-octa/
├── src/
│   ├── public/          # Arquivos estáticos
│   ├── views/           # Templates EJS
│   ├── routes/          # Rotas da aplicação
│   └── services/        # Serviços (email, pagamento)
├── server.js            # Servidor principal
├── vercel.json          # Configuração Vercel
├── package.json         # Dependências
└── .env                 # Variáveis de ambiente (não commitado)
```

## 🌐 Passos para Deploy

### 1. Preparar Repositório GitHub
```bash
# Inicializar git (se não feito)
git init

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "Preparação para deploy na Vercel"

# Conectar ao GitHub
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# Enviar para GitHub
git push -u origin main
```

### 2. Deploy na Vercel

#### Opção A: Via Dashboard Web
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione seu repositório
5. Configure as variáveis de ambiente
6. Clique em "Deploy"

#### Opção B: Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login na Vercel
vercel login

# Deploy
vercel

# Para production
vercel --prod
```

### 3. Configurar Variáveis de Ambiente

Na dashboard da Vercel, vá em **Settings > Environment Variables** e adicione:

```env
# Abacate Pay
ABACATEPAY_API_KEY=abc_dev_1APtXaHDdeNeaFnQaga6aXmT
ABACATEPAY_BASE_URL=https://api.abacatepay.com/v1
ABACATEPAY_WEBHOOK_SECRET=webhook_secret_123

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
EMAIL_FROM_NAME=Loja Online

# Ambiente
NODE_ENV=production
```

## 🔧 Configurações Específicas da Vercel

### vercel.json Explicado
```json
{
  "version": 2,                    // Versão da API Vercel
  "builds": [
    {
      "src": "server.js",          // Arquivo principal
      "use": "@vercel/node"        // Runtime Node.js
    }
  ],
  "routes": [
    {
      "src": "/(.*)",              // Todas as rotas
      "dest": "/server.js"         // Direcionadas para server.js
    }
  ],
  "functions": {
    "server.js": {
      "maxDuration": 30            // Timeout de 30 segundos
    }
  }
}
```

### Adaptações Serverless
- ✅ **Armazenamento**: PixDataStore adaptado para serverless
- ✅ **Servidor**: Exporta app em vez de listen()
- ✅ **Limpeza**: Automática a cada requisição em produção
- ✅ **Timeouts**: Configurados para 30 segundos

## 🌍 URLs e Domínios

### URLs Automáticas
- **Preview**: `https://projeto-octa-xxx.vercel.app`
- **Production**: `https://projeto-octa.vercel.app`

### Domínio Personalizado (Opcional)
1. Vá em **Settings > Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções

## 🧪 Testando o Deploy

### 1. Verificar Funcionalidades
- ✅ Página inicial: `https://seu-app.vercel.app`
- ✅ Loja: `https://seu-app.vercel.app/loja`
- ✅ Criação de PIX
- ✅ Envio de emails
- ✅ Simulação de pagamento

### 2. Logs e Debugging
- **Dashboard Vercel**: Functions > View Function Logs
- **Real-time**: `vercel logs --follow`

## ⚠️ Limitações Serverless

### Armazenamento
- **Problema**: Dados em memória são perdidos entre requisições
- **Solução Atual**: Limpeza automática a cada requisição
- **Recomendação**: Usar banco de dados (MongoDB, PostgreSQL)

### Sessões
- **Problema**: Não há estado persistente
- **Solução**: Usar banco de dados ou Redis para sessões

### Arquivos
- **Problema**: Sistema de arquivos é read-only
- **Solução**: Usar serviços de storage (AWS S3, Cloudinary)

## 🔄 Atualizações

### Deploy Automático
- Cada push para `main` faz deploy automático
- Branches criam preview deployments

### Deploy Manual
```bash
# Atualizar código
git add .
git commit -m "Atualização"
git push

# Ou via CLI
vercel --prod
```

## 🚨 Solução de Problemas

### Build Errors
- Verificar `package.json` e dependências
- Checar logs no dashboard Vercel

### Runtime Errors
- Verificar variáveis de ambiente
- Checar logs das functions

### Email não funciona
- Verificar credenciais nas env vars
- Testar conexão SMTP

### PIX não cria
- Verificar API key do Abacate Pay
- Checar logs da API

## 📞 Suporte

### Recursos Úteis
- [Documentação Vercel](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Node.js Runtime](https://vercel.com/docs/runtimes#official-runtimes/node-js)

### Comandos Úteis
```bash
# Ver logs em tempo real
vercel logs --follow

# Informações do projeto
vercel ls

# Remover projeto
vercel remove
```

---

## ✅ Checklist Final

- [ ] Código no GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Loja funcionando online
- [ ] PIX sendo criado
- [ ] Emails sendo enviados
- [ ] Simulação funcionando

**🎉 Parabéns! Sua loja está online na Vercel!** 