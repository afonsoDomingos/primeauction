# Configuração do Sistema de Recuperação de Senha

## Visão Geral

O sistema Prime Auction já possui uma funcionalidade completa de recuperação de senha implementada. Este documento explica como configurar e usar o sistema.

## Funcionalidades Implementadas

### 1. Página "Esqueceu a Senha" (`/forgot-password`)
- ✅ Formulário para solicitar recuperação de senha
- ✅ Validação de email em tempo real
- ✅ Feedback visual durante o processo
- ✅ Modo desenvolvimento com link direto para testes
- ✅ Tratamento de erros amigável

### 2. Página "Redefinir Senha" (`/reset-password`)
- ✅ Formulário para criar nova senha
- ✅ Validação de força de senha
- ✅ Indicador visual de força da senha
- ✅ Confirmação de senha
- ✅ Validação de token de segurança
- ✅ Tratamento de links expirados/inválidos

### 3. Backend (`/api/auth/forgot-password` e `/api/auth/reset-password`)
- ✅ Geração de token seguro criptografado
- ✅ Expiração automática do token (30 minutos)
- ✅ Envio de email via Nodemailer
- ✅ Fallback para modo desenvolvimento
- ✅ Validação de token e email
- ✅ Atualização segura de senha

## Fluxo do Usuário

1. **Solicitação**: Usuário clica em "Esqueceu a senha?" na página de login
2. **Email**: Usuário insere seu email e solicita recuperação
3. **Envio**: Sistema envia email com link seguro (expira em 30 min)
4. **Redefinição**: Usuário clica no link e define nova senha
5. **Login**: Usuário faz login com a nova senha

## Configuração Necessária

### Variáveis de Ambiente (`.env`)

Adicione as seguintes variáveis ao arquivo `.env` no backend:

```env
# Email Configuration (para envio de emails de recuperação)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app

# Frontend URL (para gerar links de recuperação)
FRONTEND_URL=https://seu-dominio.com
```

### Configuração do Gmail

Para usar o Gmail para envio de emails:

1. **Ativar 2FA** na sua conta Google
2. **Gerar Senha de App**:
   - Vá para: https://myaccount.google.com/apppasswords
   - Selecione "Mail" e "Outro (nome personalizado)"
   - Clique em "Gerar"
   - Copie a senha gerada (16 caracteres)
3. **Usar a senha gerada** como `EMAIL_PASSWORD`

### Outros Provedores de Email

Para outros provedores (Outlook, Yahoo, etc.), use as configurações correspondentes:

**Outlook:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=seu_email@outlook.com
EMAIL_PASSWORD=sua_senha
```

**Yahoo:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=seu_email@yahoo.com
EMAIL_PASSWORD=sua_senha
```

## Modo Desenvolvimento

Em ambiente de desenvolvimento (`NODE_ENV=development`), o sistema retorna o link de recuperação diretamente na resposta da API se o envio de email falhar. Isso facilita testes sem configurar email real.

**Resposta de exemplo em modo dev:**
```json
{
  "success": true,
  "message": "Email não configurado. Link de recuperação (modo dev):",
  "resetUrl": "http://localhost:5173/reset-password?token=abc123&email=user@example.com"
}
```

## Segurança Implementada

1. **Tokens Criptografados**: Tokens são gerados usando `crypto.randomBytes(32)` e hash SHA-256
2. **Expiração**: Tokens expiram automaticamente após 30 minutos
3. **Uso Único**: Tokens são invalidados após uso
4. **Validação**: Verificação de email e token antes de redefinir senha
5. **Proteção contra Enumeração**: Mensagem genérica mesmo se email não existe

## Personalização do Email

O template do email pode ser personalizado no arquivo `backend/controllers/authController.js`, na função `forgotPassword`:

```javascript
html: `
  <div style="font-family: Inter, sans-serif; background: #f8fafc; padding: 40px 20px;">
    <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      <h2 style="color: #0f172a; font-size: 1.5rem; margin-bottom: 0.5rem;">🔑 Recuperar Senha</h2>
      <p style="color: #475569; margin-bottom: 1.5rem;">Olá <strong>${user.name}</strong>, recebemos um pedido de recuperação da sua senha.</p>
      <a href="${resetUrl}" style="display: inline-block; background: #1a56db; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 1rem; margin-bottom: 1.5rem;">Redefinir Senha</a>
      <p style="color: #94a3b8; font-size: 0.85rem;">Este link expira em <strong>30 minutos</strong>. Se não foi você a pedir, ignore este email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;">
      <p style="color: #cbd5e1; font-size: 0.75rem;">© Prime Auction Moçambique</p>
    </div>
  </div>
`
```

## Testes

### Teste Local (sem email configurado)

1. Vá para `/forgot-password`
2. Insira um email registrado
3. Submit o formulário
4. Copie o link retornado na resposta (modo dev)
5. Use o link para redefinir a senha

### Teste com Email Configurado

1. Configure as variáveis de ambiente de email
2. Reinicie o servidor backend
3. Vá para `/forgot-password`
4. Insira seu email
5. Verifique sua caixa de entrada
6. Clique no link do email
7. Redefina sua senha

## Solução de Problemas

### Email não chega

1. **Verifique configurações SMTP**: Confirme que `EMAIL_USER` e `EMAIL_PASSWORD` estão corretos
2. **Verifique pasta Spam**: Emails podem ir para spam
3. **Use Senha de App**: Para Gmail, use senha de app, não senha normal
4. **Verifique logs do servidor**: Mensagens de erro podem indicar problemas

### Link inválido/expirado

1. **Tempo**: Links expiram após 30 minutos
2. **Token único**: Cada token só pode ser usado uma vez
3. **Solicite novo link**: Se expirou, solicite novo link

### Erro ao redefinir senha

1. **Verifique força da senha**: Mínimo 6 caracteres
2. **Confirmação**: Senhas devem coincidir
3. **Token válido**: Use o link mais recente recebido

## Rotas API

### POST `/api/auth/forgot-password`
- **Body**: `{ "email": "user@example.com" }`
- **Response**: `{ "success": true, "message": "..." }`

### POST `/api/auth/reset-password`
- **Body**: `{ "token": "...", "email": "...", "newPassword": "..." }`
- **Response**: `{ "success": true, "token": "...", "user": {...} }`

## Melhorias Futuras

Possíveis melhorias para o sistema:

- [ ] Adicionar limitação de taxa (rate limiting)
- [ ] Suporte para SMS como alternativa
- [ ] Histórico de alterações de senha
- [ ] Notificação de alteração de senha
- [ ] Opção de revogar todas as sessões ativas
- [ ] Validação mais avançada de força de senha

## Suporte

Para problemas com a configuração de email ou funcionamento do sistema, verifique:

1. Logs do servidor backend
2. Configurações do firewall (porta 587 para SMTP)
3. Políticas de spam do provedor de email
4. Configurações de DNS (SPF, DKIM, DMARC) para melhor deliverability