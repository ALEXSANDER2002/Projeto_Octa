# 🧪 Informações para Testes - Mercado Pago

## 📱 PIX
Para testar PIX, use qualquer email válido. O sistema gerará um QR Code de teste que pode ser escaneado com qualquer app de banco ou PIX.

**Email para teste:**
- `test@example.com` ou seu email real
- O QR Code gerado é válido para testes no sandbox

---

## 💳 Cartão de Crédito - Dados de Teste

### 🇧🇷 Brasil (MLA)

#### ✅ Cartões APROVADOS
```
VISA: 4509 9535 6623 3704
MasterCard: 5031 7557 3453 0604
American Express: 3711 803032 57522
```

#### ❌ Cartões REJEITADOS
```
VISA: 4000 0000 0000 0002
MasterCard: 5031 7557 3453 0602
```

#### ⏳ Cartões PENDENTES
```
VISA: 4009 1749 4254 3606
MasterCard: 5031 7557 3453 0606
```

### 📝 Dados Adicionais para Teste

#### Nome do Titular
- `APRO` (aprovado)
- `CONT` (pendente) 
- `CALL` (rejeitado - call for auth)
- `FUND` (rejeitado - insufficient funds)
- `SECU` (rejeitado - invalid security code)
- `EXPI` (rejeitado - expired card)
- `FORM` (rejeitado - invalid form)
- `OTHE` (rejeitado - general error)

#### CVV
- `123` para todos os cartões de teste

#### Validade
- Qualquer mês/ano futuro (ex: `12/25`, `06/28`)

#### Documento
- **CPF**: `12345678909`
- **CNPJ**: `12345678000195`

#### Email
- Qualquer email válido (ex: `test@example.com`)

---

## 🔧 Como Testar

### PIX:
1. Acesse a loja: `http://localhost:3000/loja`
2. Clique em "Comprar" em qualquer produto
3. Selecione "PIX"
4. Digite um email válido
5. Clique em "Gerar QR Code PIX"
6. O QR Code será exibido para teste

### Cartão de Crédito:
1. Acesse a loja: `http://localhost:3000/loja`
2. Clique em "Comprar" em qualquer produto
3. Selecione "Cartão de Crédito"
4. Preencha com os dados de teste acima
5. Clique em "Pagar com Cartão"

---

## 🎯 Cenários de Teste Recomendados

### ✅ Teste de Aprovação
- **Cartão**: `4509 9535 6623 3704`
- **Nome**: `APRO`
- **CVV**: `123`
- **Validade**: `12/25`
- **CPF**: `12345678909`
- **Email**: `test@example.com`

### ❌ Teste de Rejeição (Funds)
- **Cartão**: `5031 7557 3453 0602`
- **Nome**: `FUND`
- **CVV**: `123`
- **Validade**: `12/25`
- **CPF**: `12345678909`
- **Email**: `test@example.com`

### ⏳ Teste Pendente
- **Cartão**: `4009 1749 4254 3606`
- **Nome**: `CONT`
- **CVV**: `123`
- **Validade**: `12/25`
- **CPF**: `12345678909`
- **Email**: `test@example.com`

---

## 🚀 Para Iniciar os Testes

```bash
# Inicie o servidor
npm run dev

# Acesse no navegador
http://localhost:3000/loja
```

---

## 📋 Checklist de Testes

### PIX:
- [ ] QR Code é gerado corretamente
- [ ] Email é validado
- [ ] QR Code pode ser copiado
- [ ] Interface mostra sucesso

### Cartão de Crédito:
- [ ] Formulário carrega todos os campos
- [ ] Validação de campos funciona
- [ ] Aprovação funciona com cartão válido
- [ ] Rejeição mostra erro apropriado
- [ ] Status pendente é exibido
- [ ] Modal fecha após sucesso

### Interface:
- [ ] Modal abre/fecha corretamente
- [ ] Métodos de pagamento são selecionáveis
- [ ] Loading é exibido durante processamento
- [ ] Mensagens de erro são claras
- [ ] Design responsivo funciona

---

## 🐛 Troubleshooting

Se encontrar problemas:

1. **Erro de CORS**: Verifique se as URLs do Mercado Pago estão no CSP
2. **Token inválido**: Verifique se a chave pública está correta no `.env`
3. **Formulário não carrega**: Verifique se o SDK do Mercado Pago está carregando
4. **PIX não gera**: Verifique se o email é válido e se a rota está funcionando

---

## 📞 Suporte

Em caso de dúvidas sobre a integração do Mercado Pago:
- [Documentação Oficial](https://www.mercadopago.com.br/developers)
- [GitHub do SDK](https://github.com/mercadopago/sdk-js) 