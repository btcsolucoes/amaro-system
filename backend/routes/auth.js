const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });

  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
  if (!admin || !bcrypt.compareSync(senha, admin.senha))
    return res.status(401).json({ erro: 'Credenciais inválidas' });

  const token = jwt.sign(
    { id: admin.id, email: admin.email, nome: admin.nome, role: admin.role },
    process.env.JWT_SECRET || 'amaro_secret',
    { expiresIn: '12h' }
  );

  res.json({ token, admin: { id: admin.id, nome: admin.nome, email: admin.email, role: admin.role } });
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), (req, res) => {
  res.json({ admin: req.admin });
});

// POST /api/auth/alterar-senha
router.post('/alterar-senha', require('../middleware/auth'), (req, res) => {
  const { senha_atual, nova_senha } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.id);
  if (!bcrypt.compareSync(senha_atual, admin.senha))
    return res.status(401).json({ erro: 'Senha atual incorreta' });
  const hash = bcrypt.hashSync(nova_senha, 10);
  db.prepare('UPDATE admins SET senha = ? WHERE id = ?').run(hash, req.admin.id);
  res.json({ ok: true });
});

module.exports = router;
