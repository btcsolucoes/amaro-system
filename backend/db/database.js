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

const DEFAULT_INSUMOS = [
  { nome: 'Carpaccio bovino', unidade: 'kg', categoria: 'Carnes', estoque_atual: 3, estoque_minimo: 0.8, custo_medio: 68 },
  { nome: 'Peixe branco', unidade: 'kg', categoria: 'Pescados', estoque_atual: 5, estoque_minimo: 1.2, custo_medio: 39 },
  { nome: 'Carne de sol', unidade: 'kg', categoria: 'Carnes', estoque_atual: 6, estoque_minimo: 1.5, custo_medio: 44 },
  { nome: 'Charque', unidade: 'kg', categoria: 'Carnes', estoque_atual: 4, estoque_minimo: 1, custo_medio: 42 },
  { nome: 'Camarao', unidade: 'kg', categoria: 'Pescados', estoque_atual: 5, estoque_minimo: 1.2, custo_medio: 58 },
  { nome: 'Cupim', unidade: 'kg', categoria: 'Carnes', estoque_atual: 4, estoque_minimo: 1, custo_medio: 36 },
  { nome: 'Maminha', unidade: 'kg', categoria: 'Carnes', estoque_atual: 4, estoque_minimo: 1, custo_medio: 41 },
  { nome: 'Contra file', unidade: 'kg', categoria: 'Carnes', estoque_atual: 4, estoque_minimo: 1, custo_medio: 39 },
  { nome: 'Frango', unidade: 'kg', categoria: 'Aves', estoque_atual: 6, estoque_minimo: 1.5, custo_medio: 21 },
  { nome: 'Macaxeira', unidade: 'kg', categoria: 'Hortifruti', estoque_atual: 10, estoque_minimo: 2, custo_medio: 8 },
  { nome: 'Queijo coalho', unidade: 'kg', categoria: 'Laticinios', estoque_atual: 3, estoque_minimo: 0.8, custo_medio: 32 },
  { nome: 'Queijo manteiga', unidade: 'kg', categoria: 'Laticinios', estoque_atual: 2.5, estoque_minimo: 0.6, custo_medio: 34 },
  { nome: 'Queijo mussarela', unidade: 'kg', categoria: 'Laticinios', estoque_atual: 3, estoque_minimo: 0.8, custo_medio: 28 },
  { nome: 'Parmesao', unidade: 'kg', categoria: 'Laticinios', estoque_atual: 2, estoque_minimo: 0.5, custo_medio: 44 },
  { nome: 'Linguine', unidade: 'kg', categoria: 'Massas', estoque_atual: 4, estoque_minimo: 1, custo_medio: 14 },
  { nome: 'Goma de tapioca', unidade: 'kg', categoria: 'Secos', estoque_atual: 6, estoque_minimo: 1.5, custo_medio: 12 },
  { nome: 'Flocao de milho', unidade: 'kg', categoria: 'Secos', estoque_atual: 5, estoque_minimo: 1.2, custo_medio: 7 },
  { nome: 'Linguica matuta', unidade: 'kg', categoria: 'Carnes', estoque_atual: 3, estoque_minimo: 0.8, custo_medio: 29 },
  { nome: 'Couve flor', unidade: 'kg', categoria: 'Hortifruti', estoque_atual: 3, estoque_minimo: 0.8, custo_medio: 13 },
  { nome: 'Ovos', unidade: 'un', categoria: 'Mercearia', estoque_atual: 60, estoque_minimo: 24, custo_medio: 0.9 },
  { nome: 'H2O Limoneto 500ml', unidade: 'un', categoria: 'Bebidas', estoque_atual: 36, estoque_minimo: 12, custo_medio: 3.2 },
  { nome: 'Guarana Antarctica lata 350ml', unidade: 'un', categoria: 'Bebidas', estoque_atual: 48, estoque_minimo: 12, custo_medio: 2.8 },
  { nome: 'Coca Cola lata', unidade: 'un', categoria: 'Bebidas', estoque_atual: 48, estoque_minimo: 12, custo_medio: 3.1 },
  { nome: 'Coca Cola Zero lata 350ml', unidade: 'un', categoria: 'Bebidas', estoque_atual: 48, estoque_minimo: 12, custo_medio: 3.1 }
];

const DEFAULT_FICHAS = {
  'Carpaccio Ã  Bom Jesus': [
    { insumo: 'Carpaccio bovino', quantidade: 0.18 },
    { insumo: 'Parmesao', quantidade: 0.03 }
  ],
  'Stick de Peixe Crocante': [
    { insumo: 'Peixe branco', quantidade: 0.22 }
  ],
  'Trio Ternurinha': [
    { insumo: 'Charque', quantidade: 0.12 },
    { insumo: 'Macaxeira', quantidade: 0.2 },
    { insumo: 'Queijo coalho', quantidade: 0.05 }
  ],
  'Croqueta de Cupim': [
    { insumo: 'Cupim', quantidade: 0.15 }
  ],
  'CamarÃ£o Cais do SertÃ£o': [
    { insumo: 'Camarao', quantidade: 0.18 },
    { insumo: 'Linguine', quantidade: 0.12 },
    { insumo: 'Parmesao', quantidade: 0.02 }
  ],
  'CamarÃ£o Ã  Imperador': [
    { insumo: 'Camarao', quantidade: 0.2 },
    { insumo: 'Macaxeira', quantidade: 0.15 }
  ],
  'Nhoque de Macaxeira Crocante': [
    { insumo: 'Macaxeira', quantidade: 0.22 },
    { insumo: 'Queijo manteiga', quantidade: 0.05 },
    { insumo: 'Linguica matuta', quantidade: 0.08 }
  ],
  'Charque Brejeira': [
    { insumo: 'Charque', quantidade: 0.16 },
    { insumo: 'Queijo coalho', quantidade: 0.04 },
    { insumo: 'Flocao de milho', quantidade: 0.08 }
  ],
  'Maminha do Apolo': [
    { insumo: 'Maminha', quantidade: 0.2 }
  ],
  'Carne de Sol Atoladinha': [
    { insumo: 'Carne de sol', quantidade: 0.18 },
    { insumo: 'Macaxeira', quantidade: 0.18 },
    { insumo: 'Queijo coalho', quantidade: 0.03 }
  ],
  'Carne a Parmeggiano': [
    { insumo: 'Contra file', quantidade: 0.2 },
    { insumo: 'Linguine', quantidade: 0.1 },
    { insumo: 'Queijo mussarela', quantidade: 0.04 }
  ],
  'Frango Ã  Parmeggiano': [
    { insumo: 'Frango', quantidade: 0.22 },
    { insumo: 'Linguine', quantidade: 0.1 },
    { insumo: 'Queijo mussarela', quantidade: 0.04 }
  ],
  'Cupim da Guia': [
    { insumo: 'Cupim', quantidade: 0.2 },
    { insumo: 'Macaxeira', quantidade: 0.14 }
  ],
  'Franguinho da Moeda': [
    { insumo: 'Frango', quantidade: 0.22 },
    { insumo: 'Ovos', quantidade: 1 }
  ],
  'Couve Flor Grelhada': [
    { insumo: 'Couve flor', quantidade: 0.26 }
  ],
  'Tapioca Cais': [
    { insumo: 'Goma de tapioca', quantidade: 0.13 },
    { insumo: 'Frango', quantidade: 0.08 },
    { insumo: 'Queijo coalho', quantidade: 0.05 },
    { insumo: 'Parmesao', quantidade: 0.01 }
  ],
  'Tapioca Aurora': [
    { insumo: 'Goma de tapioca', quantidade: 0.13 },
    { insumo: 'Queijo coalho', quantidade: 0.05 },
    { insumo: 'Charque', quantidade: 0.07 }
  ],
  'Tapioca LeÃ£o do Norte': [
    { insumo: 'Goma de tapioca', quantidade: 0.13 },
    { insumo: 'Carne de sol', quantidade: 0.08 },
    { insumo: 'Queijo coalho', quantidade: 0.04 }
  ],
  'Cuscuz NordestÃ£o': [
    { insumo: 'Flocao de milho', quantidade: 0.12 },
    { insumo: 'Queijo manteiga', quantidade: 0.04 },
    { insumo: 'Linguica matuta', quantidade: 0.07 }
  ],
  'Cuscuz Quarentinha': [
    { insumo: 'Flocao de milho', quantidade: 0.12 },
    { insumo: 'Queijo coalho', quantidade: 0.04 },
    { insumo: 'Ovos', quantidade: 1 },
    { insumo: 'Charque', quantidade: 0.06 }
  ],
  'Cuscuz Arsenal': [
    { insumo: 'Flocao de milho', quantidade: 0.12 },
    { insumo: 'Queijo mussarela', quantidade: 0.04 },
    { insumo: 'Frango', quantidade: 0.08 }
  ],
  'Coxinha de Frango': [
    { insumo: 'Frango', quantidade: 0.06 }
  ],
  'Coxinha de CamarÃ£o com RequeijÃ£o': [
    { insumo: 'Camarao', quantidade: 0.05 },
    { insumo: 'Queijo manteiga', quantidade: 0.02 }
  ],
  'H2O Limoneto Pet 500ml': [
    { insumo: 'H2O Limoneto 500ml', quantidade: 1 }
  ],
  'GuaranÃ¡ Antartica Lata 350ml': [
    { insumo: 'Guarana Antarctica lata 350ml', quantidade: 1 }
  ],
  'Coca Cola Lata': [
    { insumo: 'Coca Cola lata', quantidade: 1 }
  ],
  'Coca Cola Zero Lata 350ml': [
    { insumo: 'Coca Cola Zero lata 350ml', quantidade: 1 }
  ]
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

    CREATE TABLE IF NOT EXISTS estoque_insumos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      nome          TEXT NOT NULL UNIQUE,
      unidade       TEXT NOT NULL DEFAULT 'un',
      categoria     TEXT,
      estoque_atual REAL NOT NULL DEFAULT 0,
      estoque_minimo REAL NOT NULL DEFAULT 0,
      custo_medio   REAL NOT NULL DEFAULT 0,
      ativo         INTEGER DEFAULT 1,
      criado_em     TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS fichas_tecnicas (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      prato_id   INTEGER NOT NULL REFERENCES pratos(id) ON DELETE CASCADE,
      insumo_id  INTEGER NOT NULL REFERENCES estoque_insumos(id) ON DELETE CASCADE,
      quantidade REAL NOT NULL,
      UNIQUE(prato_id, insumo_id)
    );

    CREATE TABLE IF NOT EXISTS estoque_movimentos (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      insumo_id     INTEGER NOT NULL REFERENCES estoque_insumos(id),
      tipo          TEXT NOT NULL,
      origem        TEXT,
      referencia_id INTEGER,
      quantidade    REAL NOT NULL,
      custo_unit    REAL,
      observacao    TEXT,
      admin_id      INTEGER REFERENCES admins(id),
      criado_em     TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS caixas (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      status                TEXT DEFAULT 'aberto',
      saldo_inicial         REAL NOT NULL DEFAULT 0,
      saldo_sistema         REAL NOT NULL DEFAULT 0,
      saldo_final_informado REAL,
      diferenca             REAL DEFAULT 0,
      observacao_abertura   TEXT,
      observacao_fechamento TEXT,
      aberto_em             TEXT DEFAULT (datetime('now','localtime')),
      fechado_em            TEXT,
      admin_abertura_id     INTEGER REFERENCES admins(id),
      admin_fechamento_id   INTEGER REFERENCES admins(id)
    );

    CREATE TABLE IF NOT EXISTS caixa_lancamentos (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      caixa_id       INTEGER NOT NULL REFERENCES caixas(id),
      tipo           TEXT NOT NULL,
      categoria      TEXT,
      descricao      TEXT,
      forma_pagamento TEXT,
      valor          REAL NOT NULL,
      pedido_id      INTEGER REFERENCES pedidos(id),
      admin_id       INTEGER REFERENCES admins(id),
      criado_em      TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS fiscal_config (
      id                INTEGER PRIMARY KEY CHECK (id = 1),
      razao_social      TEXT,
      cnpj              TEXT,
      regime_tributario TEXT DEFAULT 'Simples Nacional',
      aliquota_estimada REAL DEFAULT 6,
      ambiente          TEXT DEFAULT 'gerencial',
      atualizado_em     TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS fiscal_lancamentos (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id      INTEGER UNIQUE REFERENCES pedidos(id),
      caixa_id       INTEGER REFERENCES caixas(id),
      documento_tipo TEXT DEFAULT 'gerencial',
      documento_numero TEXT,
      situacao       TEXT DEFAULT 'registrado',
      base_calculo   REAL NOT NULL,
      aliquota       REAL NOT NULL,
      valor_imposto  REAL NOT NULL,
      valor_liquido  REAL NOT NULL,
      observacao     TEXT,
      criado_em      TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  ensureColumn('pedidos', 'caixa_id', 'INTEGER REFERENCES caixas(id)');
  ensureColumn('pedidos', 'estoque_processado', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('pedidos', 'caixa_lancado', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('pedidos', 'fiscal_lancado', 'INTEGER NOT NULL DEFAULT 0');

  seed();
  backfillPhotos();
  seedOperacao();
}

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function ensureColumn(table, columnName, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((col) => col.name === columnName)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${columnName} ${definition}`);
  }
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

function seedOperacao() {
  const insertInsumo = db.prepare(`
    INSERT OR IGNORE INTO estoque_insumos (nome, unidade, categoria, estoque_atual, estoque_minimo, custo_medio)
    VALUES (@nome, @unidade, @categoria, @estoque_atual, @estoque_minimo, @custo_medio)
  `);

  const upsertFicha = db.prepare(`
    INSERT INTO fichas_tecnicas (prato_id, insumo_id, quantidade)
    VALUES (?, ?, ?)
    ON CONFLICT(prato_id, insumo_id) DO UPDATE SET quantidade = excluded.quantidade
  `);

  const tx = db.transaction(() => {
    DEFAULT_INSUMOS.forEach((insumo) => insertInsumo.run(insumo));

    Object.entries(DEFAULT_FICHAS).forEach(([nomePrato, itens]) => {
      const prato = db.prepare('SELECT id FROM pratos WHERE nome = ?').get(nomePrato);
      if (!prato) return;
      itens.forEach((item) => {
        const insumo = db.prepare('SELECT id FROM estoque_insumos WHERE nome = ?').get(item.insumo);
        if (!insumo) return;
        upsertFicha.run(prato.id, insumo.id, item.quantidade);
      });
    });

    db.prepare(`
      INSERT OR IGNORE INTO fiscal_config (id, razao_social, cnpj, regime_tributario, aliquota_estimada, ambiente)
      VALUES (1, 'Amaro Cafe', '', 'Simples Nacional', 6, 'gerencial')
    `).run();
  });

  tx();
}

module.exports = { db, init };
