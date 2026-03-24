# Deploy para GitHub Pages

O GitHub Pages hospeda apenas arquivos estaticos. Para este projeto:

- `frontend/` vai para o GitHub Pages
- `backend/` precisa subir em outro servico, como Render ou Railway

## 1. Publicar o backend

Suba a pasta `backend` em um servico Node.js e configure:

- `PORT`
- `PUBLIC_BASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Exemplo:

```env
PORT=3001
PUBLIC_BASE_URL=https://seu-backend.onrender.com
JWT_SECRET=troque-isto
ADMIN_EMAIL=admin@amarocafe.com.br
ADMIN_PASSWORD=amaro@2024
```

## 2. Configurar o frontend para o GitHub Pages

Edite [site-config.js](./frontend/site-config.js):

```js
window.AMARO_SETTINGS = {
  backendBase: 'https://seu-backend.onrender.com',
  appBase: '/amaro-system',
  frontendBaseUrl: 'https://seuusuario.github.io/amaro-system'
};
```

Se usar um dominio proprio no Pages, `appBase` normalmente fica vazio:

```js
window.AMARO_SETTINGS = {
  backendBase: 'https://seu-backend.onrender.com',
  appBase: '',
  frontendBaseUrl: 'https://cardapio.seudominio.com'
};
```

## 3. Enviar para o GitHub

Na raiz do projeto:

```bash
git init
git add .
git commit -m "Preparar deploy GitHub Pages"
git branch -M main
git remote add origin https://github.com/SEUUSUARIO/amaro-system.git
git push -u origin main
```

## 4. Ativar o GitHub Pages

No repositório do GitHub:

1. `Settings`
2. `Pages`
3. `Build and deployment`
4. `Deploy from a branch`
5. Branch `main`
6. Pasta `/frontend`

## 5. URLs finais

- Home: `https://seuusuario.github.io/amaro-system/`
- Cliente: `https://seuusuario.github.io/amaro-system/cliente/?mesa=1`
- Admin: `https://seuusuario.github.io/amaro-system/admin/`
