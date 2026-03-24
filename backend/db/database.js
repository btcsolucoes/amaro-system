const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'amaro.db');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const db = new Database(DB_PATH);

const PHOTO_BY_PRATO = {
  'Carpaccio à Bom Jesus': 'carpaccio-a-bom-jesus.jpg',
  'Stick de Peixe Crocante': 'stick-de-peixe-crocante.jpg',
  'Trio Ternurinha': 'trio-ternurinha.jpg',
  'Croqueta de Cupim': 'croqueta-de-cupim.jpg',
  'Camarão Cais do Sertão': 'camarao-cais-do-sertao.jpg',
  'Camarão à Imperador': 'camarao-a-imperador.jpg',
  'Nhoque de Macaxeira Crocante': 'nhoque-de-macaxeira-crocante.jpg',
  'Charque Brejeira': 'charque-brejeira.jpg',
  'Maminha do Apolo': 'maminha-do-apolo.jpg',
  'Carne de Sol Atoladinha': 'carne-de-sol-atoladinha.jpg',
  'Carne a Parmeggiano': 'carne-a-parmeggiano.jpg',
  'Frango à Parmeggiano': 'frango-a-parmeggiano.jpg',
  'Cupim da Guia': 'cupim-da-guia.jpg',
  'Franguinho da Moeda': 'franguinho-da-moeda.jpg',
  'Couve Flor Grelhada': 'couve-flor-grelhada.jpg',
  'Tapioca Cais': 'tapioca-cais.jpg',
  'Tapioca Aurora': 'tapioca-aurora.jpg',
  'Tapioca Leão do Norte': 'tapioca-leao-do-norte.jpg',
  'Cuscuz Nordestão': 'cuscuz-nordestao.jpg',
  'Cuscuz Quarentinha': 'cuscuz-quarentinha.jpg',
  'Cuscuz Arsenal': 'cuscuz-arsenal.jpg',
  'Coxinha de Frango': 'coxinha-de-frango.jpg',
  'Coxinha de Camarão com Requeijão': 'coxinha-de-camarao-com-requeijao.jpg'
};

// Performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function init() {
  ensureUploadsDir();

  db.exec(`
    -- ─── CATEGORIAS ───────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS categorias (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      descricao TEXT,
      ordem     INTEGER DEFAULT 0,
      ativo     INTEGER DEFAULT 1,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    -- ─── PRATOS ───────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS pratos (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria_id INTEGER NOT NULL REFERENCES categorias(id),
      nome         TEXT NOT NULL,
      descricao    TEXT,
      preco        REAL NOT NULL,
      foto         TEXT,
      disponivel   INTEGER DEFAULT 1,
      ordem        INTEGER DEFAULT 0,
      criado_em    TEXT DEFAULT (datetime('now','localtime'))
    );

    -- ─── MESAS ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS mesas (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      numero    INTEGER UNIQUE NOT NULL,
      ativa     INTEGER DEFAULT 1,
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    -- ─── PEDIDOS ──────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS pedidos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      mesa_id         INTEGER REFERENCES mesas(id),
      mesa_numero     INTEGER,
      status          TEXT DEFAULT 'pendente',
      total           REAL NOT NULL DEFAULT 0,
      forma_pagamento TEXT,
      pagamento_id    TEXT,
      pagamento_status TEXT DEFAULT 'pendente',
      observacao      TEXT,
      criado_em       TEXT DEFAULT (datetime('now','localtime')),
      atualizado_em   TEXT DEFAULT (datetime('now','localtime'))
    );

    -- ─── ITENS DO PEDIDO ──────────────────────────────────────
    CREATE TABLE IF NOT EXISTS itens_pedido (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id  INTEGER NOT NULL REFERENCES pedidos(id),
      prato_id   INTEGER NOT NULL REFERENCES pratos(id),
      nome_prato TEXT NOT NULL,
      preco_unit REAL NOT NULL,
      quantidade INTEGER NOT NULL DEFAULT 1,
      subtotal   REAL NOT NULL,
      obs        TEXT
    );

    -- ─── USUÁRIOS ADMIN ───────────────────────────────────────
    CREATE TABLE IF NOT EXISTS admins (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      email     TEXT UNIQUE NOT NULL,
      senha     TEXT NOT NULL,
      role      TEXT DEFAULT 'admin',
      criado_em TEXT DEFAULT (datetime('now','localtime'))
    );

    -- ─── PAGAMENTOS LOG ───────────────────────────────────────
    CREATE TABLE IF NOT EXISTS pagamentos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id     INTEGER REFERENCES pedidos(id),
      provider      TEXT NOT NULL,
      provider_id   TEXT,
      metodo        TEXT,
      valor         REAL NOT NULL,
      status        TEXT DEFAULT 'pendente',
      payload       TEXT,
      criado_em     TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  seed();
  backfillPhotos();
}

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function seed() {
  const jaTemCategoria = db.prepare('SELECT id FROM categorias LIMIT 1').get();
  if (jaTemCategoria) return;

  console.log('🌱 Populando banco de dados...');

  // Categorias
  const cats = db.prepare('INSERT INTO categorias (nome, descricao, ordem) VALUES (?,?,?)');
  const c1 = cats.run('Entradinhas', 'Para começar', 1).lastInsertRowid;
  const c2 = cats.run('Executivos', 'Pratos principais', 2).lastInsertRowid;
  const c3 = cats.run('Tapiocas', 'Nordeste na mesa', 3).lastInsertRowid;
  const c4 = cats.run('Cuscuz', 'Tradição nordestina', 4).lastInsertRowid;
  const c5 = cats.run('Salgados', 'Petiscos', 5).lastInsertRowid;
  const c6 = cats.run('Bebidas', 'Para acompanhar', 6).lastInsertRowid;

  // Pratos
  const p = db.prepare('INSERT INTO pratos (categoria_id,nome,descricao,preco,ordem) VALUES (?,?,?,?,?)');

  // Entradinhas
  p.run(c1,'Carpaccio à Bom Jesus','Carpaccio de carne de sol + molho de mostarda e mel + rúculas + alcaparras crocante + torradas de parmesão',45.00,1);
  p.run(c1,'Stick de Peixe Crocante','Stick de peixe crocante + mayo de bacon crocante',43.00,2);
  p.run(c1,'Trio Ternurinha','Charque desfiada crocante + bastões de macaxeira e creme de coalho',35.00,3);
  p.run(c1,'Croqueta de Cupim','Porção (cinco unidades)',31.00,4);

  // Executivos
  p.run(c2,'Camarão Cais do Sertão','Camarão e linguine envolvido ao molho pomodoro é manjericão finalizado com parmesão',34.00,1);
  p.run(c2,'Camarão à Imperador','Camarão empanado e gratinado, montado sobre purê de batatas + arroz de brócolis',35.00,2);
  p.run(c2,'Nhoque de Macaxeira Crocante','Nhoque recheado com queijo manteiga e frito + creme de coalho e ragu de linguiça matuta',35.00,3);
  p.run(c2,'Charque Brejeira','Charque desfiada e crocante + arroz cremoso de queijo coalho + farofa tropeira com cuscuz + vinagrete',35.00,4);
  p.run(c2,'Maminha do Apolo','Maminha fatiada + picles de maxixe + purê de batata + arroz de alho crocante',32.00,5);
  p.run(c2,'Carne de Sol Atoladinha','Cubos de carne de sol ao creme de queijo + arroz de cebolinho + bastões de macaxeira crocante',32.00,6);
  p.run(c2,'Carne a Parmeggiano','Carne contra filé empanado e gratinado + linguine ao molho pomodoro + frita ou purê de batata',33.00,7);
  p.run(c2,'Frango à Parmeggiano','Frango empanado e gratinado + linguine ao molho pomodoro + frita ou purê de batata',28.00,8);
  p.run(c2,'Cupim da Guia','Steak de cupim cozido em baixa temperatura + purê de macaxeira + arroz de coentro + picles de cebola roxa',34.00,9);
  p.run(c2,'Franguinho da Moeda','Coxa e sobrecoxa na manteiga de ervas e pimenta + arroz biro biro',28.00,10);
  p.run(c2,'Couve Flor Grelhada','Couve flor grelhada + chimichurri + purê de feijão branco',26.00,11);

  // Tapiocas
  p.run(c3,'Tapioca Cais','Tapioca recheada com queijo coalho e frango, finalizada com creme de queijo, ervas e rendada com parmesão',19.00,1);
  p.run(c3,'Tapioca Aurora','Tapioca recheada e rendada com queijo coalho + charque desfiada',21.00,2);
  p.run(c3,'Tapioca Leão do Norte','Tapioca recheada com carne de sol com cebolinho e queijo coalho + finalização com purê de jerimum',18.00,3);

  // Cuscuz
  p.run(c4,'Cuscuz Nordestão','Cuscuz recheado com queijo manteiga + linguiça matuta + verdura + montagem sobre molho tomate',19.00,1);
  p.run(c4,'Cuscuz Quarentinha','Cuscuz recheado com queijo coalho + verdura + ovo mexido + finalizado com charque crocante',21.00,2);
  p.run(c4,'Cuscuz Arsenal','Cuscuz recheado com queijo mussarela + frango desfiado + verdura + finalização gratinada',19.00,3);

  // Salgados
  p.run(c5,'Coxinha de Frango','Unidade',9.00,1);
  p.run(c5,'Coxinha de Camarão com Requeijão','Unidade',12.00,2);

  // Bebidas
  p.run(c6,'H2O Limoneto Pet 500ml','Garrafa 500ml',8.00,1);
  p.run(c6,'Guaraná Antartica Lata 350ml','Lata 350ml',7.00,2);
  p.run(c6,'Coca Cola Lata','Lata',7.00,3);
  p.run(c6,'Coca Cola Zero Lata 350ml','Lata 350ml',7.00,4);

  // Mesas
  const mesa = db.prepare('INSERT INTO mesas (numero) VALUES (?)');
  for (let i = 1; i <= 20; i++) mesa.run(i);

  // Admin padrão
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'amaro@2024', 10);
  db.prepare('INSERT INTO admins (nome,email,senha,role) VALUES (?,?,?,?)').run(
    'Administrador',
    process.env.ADMIN_EMAIL || 'admin@amarocafe.com.br',
    hash,
    'superadmin'
  );

  console.log('✅ Banco populado com sucesso!');
}

function backfillPhotos() {
  const updatePhoto = db.prepare(`
    UPDATE pratos
    SET foto = ?
    WHERE nome = ? AND (foto IS NULL OR foto = '')
  `);

  const applyPhotos = db.transaction(() => {
    for (const [nome, foto] of Object.entries(PHOTO_BY_PRATO)) {
      if (!fs.existsSync(path.join(UPLOAD_DIR, foto))) continue;
      updatePhoto.run(foto, nome);
    }
  });

  applyPhotos();
}

module.exports = { db, init };
