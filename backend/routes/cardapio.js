const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db/database');
const auth = require('../middleware/auth');

const getPublicBaseUrl = (req) =>
  (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');

const buildFotoUrl = (req, foto) =>
  foto ? `${getPublicBaseUrl(req)}/uploads/${foto}` : null;

// Upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `prato_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─────────────────────────────────────────────────
// PÚBLICO
// ─────────────────────────────────────────────────

// GET /api/cardapio — cardápio completo agrupado
router.get('/', (req, res) => {
  const categorias = db.prepare(
    'SELECT * FROM categorias WHERE ativo = 1 ORDER BY ordem'
  ).all();

  const pratos = db.prepare(
    'SELECT * FROM pratos WHERE disponivel = 1 ORDER BY ordem'
  ).all();

  const result = categorias.map(cat => ({
    ...cat,
    pratos: pratos
      .filter(p => p.categoria_id === cat.id)
      .map(p => ({ ...p, foto_url: buildFotoUrl(req, p.foto) }))
  }));

  res.json(result);
});

// GET /api/cardapio/pratos/:id
router.get('/pratos/:id', (req, res) => {
  const prato = db.prepare('SELECT * FROM pratos WHERE id = ?').get(req.params.id);
  if (!prato) return res.status(404).json({ erro: 'Prato não encontrado' });
  res.json({ ...prato, foto_url: buildFotoUrl(req, prato.foto) });
});

// ─────────────────────────────────────────────────
// ADMIN — CATEGORIAS
// ─────────────────────────────────────────────────

router.get('/admin/categorias', auth, (req, res) => {
  const cats = db.prepare('SELECT * FROM categorias ORDER BY ordem').all();
  res.json(cats);
});

router.post('/admin/categorias', auth, (req, res) => {
  const { nome, descricao, ordem } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome obrigatório' });
  const r = db.prepare(
    'INSERT INTO categorias (nome,descricao,ordem) VALUES (?,?,?)'
  ).run(nome, descricao || '', ordem || 0);
  res.json({ id: r.lastInsertRowid, nome, descricao, ordem });
});

router.put('/admin/categorias/:id', auth, (req, res) => {
  const { nome, descricao, ordem, ativo } = req.body;
  db.prepare(
    'UPDATE categorias SET nome=?,descricao=?,ordem=?,ativo=? WHERE id=?'
  ).run(nome, descricao, ordem, ativo ?? 1, req.params.id);
  res.json({ ok: true });
});

router.delete('/admin/categorias/:id', auth, (req, res) => {
  db.prepare('UPDATE categorias SET ativo=0 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────
// ADMIN — PRATOS
// ─────────────────────────────────────────────────

router.get('/admin/pratos', auth, (req, res) => {
  const pratos = db.prepare(`
    SELECT p.*, c.nome as categoria_nome
    FROM pratos p
    JOIN categorias c ON c.id = p.categoria_id
    ORDER BY p.categoria_id, p.ordem
  `).all();
  res.json(pratos.map(p => ({ ...p, foto_url: buildFotoUrl(req, p.foto) })));
});

router.post('/admin/pratos', auth, upload.single('foto'), (req, res) => {
  const { categoria_id, nome, descricao, preco, ordem } = req.body;
  if (!nome || !preco || !categoria_id)
    return res.status(400).json({ erro: 'categoria_id, nome e preco são obrigatórios' });

  const foto = req.file ? req.file.filename : null;
  const r = db.prepare(
    'INSERT INTO pratos (categoria_id,nome,descricao,preco,foto,ordem) VALUES (?,?,?,?,?,?)'
  ).run(categoria_id, nome, descricao || '', parseFloat(preco), foto, ordem || 0);

  res.json({ id: r.lastInsertRowid, nome, preco, foto_url: buildFotoUrl(req, foto) });
});

router.put('/admin/pratos/:id', auth, upload.single('foto'), (req, res) => {
  const { categoria_id, nome, descricao, preco, disponivel, ordem } = req.body;
  const atual = db.prepare('SELECT * FROM pratos WHERE id=?').get(req.params.id);
  if (!atual) return res.status(404).json({ erro: 'Prato não encontrado' });

  const foto = req.file ? req.file.filename : atual.foto;

  db.prepare(`
    UPDATE pratos SET categoria_id=?,nome=?,descricao=?,preco=?,foto=?,disponivel=?,ordem=?
    WHERE id=?
  `).run(
    categoria_id || atual.categoria_id,
    nome || atual.nome,
    descricao ?? atual.descricao,
    preco ? parseFloat(preco) : atual.preco,
    foto,
    disponivel ?? atual.disponivel,
    ordem ?? atual.ordem,
    req.params.id
  );

  res.json({ ok: true, foto_url: buildFotoUrl(req, foto) });
});

router.delete('/admin/pratos/:id', auth, (req, res) => {
  db.prepare('UPDATE pratos SET disponivel=0 WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
