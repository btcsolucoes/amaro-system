# 🍽️ Amaro Café — Sistema Completo

Sistema de pedidos digitais com cardápio, carrinho, pagamento e painel admin.

---

## ⚡ RODAR HOJE (5 minutos)

### Pré-requisitos
- Node.js instalado (https://nodejs.org — versão 18+)
- VSCode com terminal integrado

### Passo a passo

```bash
# 1. Abra o terminal no VSCode (Ctrl + `)

# 2. Entre na pasta do backend
cd backend

# 3. Copie o .env
cp .env.example .env

# 4. Instale as dependências
npm install

# 5. Inicie o servidor
npm run dev
```

O terminal mostrará:

```
🍽️  Amaro Café — Sistema rodando!

   Cliente:   http://localhost:3001/cliente
   Admin:     http://localhost:3001/admin
   API:       http://localhost:3001/api
```

### Acesse no navegador

| URL | O que é |
|-----|---------|
| http://localhost:3001 | Página inicial |
| http://localhost:3001/cliente?mesa=1 | Cardápio do cliente (mesa 1) |
| http://localhost:3001/cliente?mesa=5 | Cardápio do cliente (mesa 5) |
| http://localhost:3001/admin | Painel administrativo |

### Login admin
- **Email:** admin@amarocafe.com.br
- **Senha:** amaro@2024

---

## 📱 Fluxo do Cliente

1. Cliente escaneia QR Code da mesa
2. Vê o cardápio completo com fotos
3. Adiciona itens ao carrinho
4. Clica em "Ir para Pagamento"
5. Escolhe PIX ou Cartão
6. Para demo: clica **"Simular Pagamento"**
7. Recebe confirmação na tela

---

## 🖥️ Painel Admin

### Dashboard
- KPIs: faturamento hoje, semana, mês, ticket médio
- Gráfico de faturamento 7 dias
- Gráfico por forma de pagamento
- Ranking de pratos mais vendidos
- Pedidos recentes

### Pedidos
- Lista com filtro por status, data e mesa
- Atualização de status em tempo real
- Visualização detalhada de cada pedido

### Cardápio
- Adicionar/editar/remover pratos
- Upload de fotos
- Controle de disponibilidade por prato

### Mesas & QR Code
- QR Code único por mesa
- Botão de imprimir para cada mesa

---

## 🌐 Para acessar pela internet durante a demo

Use **ngrok** (gratuito, sem cadastro):

```bash
# Terminal 2 (com o servidor já rodando)
npx ngrok http 3001
```

Ele gera uma URL pública tipo:
`https://abc123.ngrok-free.app`

Compartilhe essa URL — qualquer pessoa com internet acessa o sistema ao vivo.

---

## 💳 Pagamentos Reais (após a demo)

### PIX com Mercado Pago
1. Crie conta em mercadopago.com.br/developers
2. Pegue o `Access Token` do ambiente de testes
3. Coloque no `.env`:
   ```
   MP_ACCESS_TOKEN=TEST-seu-token-aqui
   ```

### WhatsApp (Evolution API)
```bash
docker run -d -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=minha-chave \
  atendai/evolution-api:latest
```
Configure no `.env`:
```
WHATSAPP_API_URL=http://localhost:8080
WHATSAPP_API_KEY=minha-chave
WHATSAPP_INSTANCE=amaro-cafe
WHATSAPP_NUMERO=5581988027081
```

---

## 🚀 Deploy em Produção

### Railway (mais fácil)
1. Crie conta em railway.app
2. Conecte seu GitHub com este projeto
3. Configure as variáveis de ambiente
4. Deploy automático

### Render
1. Crie conta em render.com
2. New Web Service → conecte o repositório
3. Build Command: `cd backend && npm install`
4. Start Command: `cd backend && npm start`

---

## 📁 Estrutura

```
amaro-system/
├── backend/
│   ├── db/
│   │   └── database.js      # SQLite + seed com todos os pratos
│   ├── middleware/
│   │   └── auth.js          # JWT
│   ├── routes/
│   │   ├── auth.js          # Login/logout
│   │   ├── cardapio.js      # CRUD cardápio
│   │   ├── pedidos.js       # Criar/gerenciar pedidos
│   │   ├── dashboard.js     # Analytics
│   │   └── pagamento.js     # PIX + simulação
│   ├── services/
│   │   └── whatsapp.js      # Envio WhatsApp
│   ├── uploads/             # Fotos dos pratos (criado automaticamente)
│   ├── server.js            # Servidor Express
│   ├── .env.example         # Variáveis de ambiente
│   └── package.json
│
└── frontend/
    ├── index.html           # Página inicial
    ├── cliente/
    │   └── index.html       # Cardápio + carrinho + pagamento
    └── admin/
        └── index.html       # Painel admin completo
```

---

## ❓ Problemas comuns

**"Cannot find module 'better-sqlite3'"**
```bash
cd backend && npm install
```

**Porta 3001 já em uso**
```bash
# Mude no .env:
PORT=3002
```

**Banco corrompido (reset)**
```bash
rm backend/amaro.db
npm run dev  # recria automaticamente
```
