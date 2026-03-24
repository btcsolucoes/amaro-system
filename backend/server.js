require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { init } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

init();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/cardapio', require('./routes/cardapio'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/pagamento', require('./routes/pagamento'));

// Keep health before the frontend catch-all.
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

const frontDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontDir));

app.get('/admin*', (req, res) => res.sendFile(path.join(frontDir, 'admin', 'index.html')));
app.get('/cliente*', (req, res) => res.sendFile(path.join(frontDir, 'cliente', 'index.html')));
app.get('*', (req, res) => res.sendFile(path.join(frontDir, 'index.html')));

app.listen(PORT, () => {
  console.log('\nAmaro Cafe - Sistema rodando!');
  console.log(`\n   Cliente:   http://localhost:${PORT}/cliente`);
  console.log(`   Admin:     http://localhost:${PORT}/admin`);
  console.log(`   API:       http://localhost:${PORT}/api`);
  console.log('\n   Login:     admin@amarocafe.com.br');
  console.log('   Senha:     amaro@2024\n');
});
