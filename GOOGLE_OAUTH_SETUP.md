# Configuração do Google OAuth

O login via Google OAuth foi implementado com sucesso! Siga os passos abaixo para configurar:

## 1. Criar projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative a API "Google+ API" em "APIs & Services" > "Library"

## 2. Configurar credenciais OAuth 2.0

1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "OAuth client ID"
3. Configure:
   - **Application type**: Web application
   - **Name**: Prime Auction (ou outro nome)
   - **Authorized redirect URIs**: 
     - Desenvolvimento: `http://localhost:5000/api/auth/google/callback`
     - Produção: `https://seu-dominio.com/api/auth/google/callback`
4. Clique em "Create"
5. Copie o **Client ID** e **Client Secret**

## 3. Configurar variáveis de ambiente

### Backend (.env)

Crie o arquivo `backend/.env` com as seguintes variáveis:

```env
# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL (para callback do Google)
FRONTEND_URL=http://localhost:5173

# Outras variáveis necessárias
MONGODB_URI=mongodb://localhost:27017/primeauction
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
PORT=5000
```

### Frontend (.env)

Crie o arquivo `frontend/.env` com as seguintes variáveis:

```env
VITE_API_URL=http://localhost:5000
VITE_BACKEND_URL=http://localhost:5000
```

## 4. Funcionalidades implementadas

### Backend
- ✅ Configuração do Passport com Google Strategy
- ✅ Rotas OAuth: `/api/auth/google` e `/api/auth/google/callback`
- ✅ Integração com modelo User (campos `googleId` e `provider`)
- ✅ Login/registro automático via Google
- ✅ Sincronização de foto de perfil do Google

### Frontend
- ✅ Botão "Continuar com Google" na página de Login
- ✅ Botão "Continuar com Google" na página de Registro
- ✅ Tratamento automático do callback OAuth
- ✅ Redirecionamento inteligente após login
- ✅ Interface estilizada com logo do Google

## 5. Como funciona

1. Usuário clica no botão "Continuar com Google"
2. Redirecionado para página de consentimento do Google
3. Após autorização, Google redireciona para o callback
4. Backend:
   - Verifica se usuário já existe (por email ou googleId)
   - Se não existe, cria nova conta automaticamente
   - Atualiza perfil com foto do Google
   - Gera token JWT
5. Redireciona para frontend com token
6. Frontend salva token e busca dados do usuário
7. Usuário é autenticado e redirecionado para dashboard

## 6. Teste

1. Configure as variáveis de ambiente
2. Reinicie o servidor backend
3. Reinicie o servidor frontend
4. Acesse `http://localhost:5173/login`
5. Clique em "Continuar com Google"
6. Autorize o acesso
7. Deve ser redirecionado e autenticado automaticamente

## 7. Deploy em produção

Para produção, atualize as variáveis de ambiente:

```env
# Backend (.env.production)
GOOGLE_CALLBACK_URL=https://seu-dominio.com/api/auth/google/callback
FRONTEND_URL=https://seu-dominio.com
NODE_ENV=production
```

Adicione o domínio de produção nas "Authorized redirect URIs" no Google Cloud Console.

## 8. Solução de problemas

### Erro "redirect_uri_mismatch"
- Verifique se a URL de callback está exatamente igual no Google Console
- Certifique-se de usar http:// para localhost e https:// para produção

### Erro "invalid_client"
- Verifique se o CLIENT_ID está correto no .env
- Verifique se a API Google+ está ativada

### Usuário não é redirecionado
- Verifique se o frontend está usando a URL correta do backend
- Verifique se as rotas do Passport estão configuradas

---

A implementação está completa e pronta para uso! 🚀