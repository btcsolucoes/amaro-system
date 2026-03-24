const router = require('express').Router();
const { db } = require('../db/database');
const auth = require('../middleware/auth');

router.get('/insumos', auth, (req, res) => {
  const insumos = db.prepare(`
    SELECT
      ei.*,
      COUNT(DISTINCT ft.prato_id) AS pratos_vinculados,
      MAX(em.criado_em) AS ultimo_movimento
    FROM estoque_insumos ei
    LEFT JOIN fichas_tecnicas ft ON ft.insumo_id = ei.id
    LEFT JOIN estoque_movimentos em ON em.insumo_id = ei.id
    GROUP BY ei.id
    ORDER BY ei.nome
  `).all();
  res.json(insumos);
});

router.get('/movimentos', auth, (req, res) => {
  const movimentos = db.prepare(`
    SELECT em.*, ei.nome AS insumo_nome, ei.unidade, a.nome AS admin_nome
    FROM estoque_movimentos em
    JOIN estoque_insumos ei ON ei.id = em.insumo_id
    LEFT JOIN admins a ON a.id = em.admin_id
    ORDER BY em.criado_em DESC, em.id DESC
    LIMIT 200
  `).all();
  res.json(movimentos);
});

router.post('/insumos', auth, (req, res) => {
  const { nome, unidade, categoria, estoque_atual, estoque_minimo, custo_medio } = req.body;
  if (!nome || !unidade) return res.status(400).json({ erro: 'Nome e unidade sao obrigatorios' });

  const info = db.prepare(`
    INSERT INTO estoque_insumos (nome, unidade, categoria, estoque_atual, estoque_minimo, custo_medio)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(nome, unidade, categoria || '', Number(estoque_atual || 0), Number(estoque_minimo || 0), Number(custo_medio || 0));

  res.json({ ok: true, id: info.lastInsertRowid });
});

router.put('/insumos/:id', auth, (req, res) => {
  const { nome, unidade, categoria, estoque_minimo, custo_medio, ativo } = req.body;
  db.prepare(`
    UPDATE estoque_insumos
    SET nome = ?, unidade = ?, categoria = ?, estoque_minimo = ?, custo_medio = ?, ativo = ?
    WHERE id = ?
  `).run(nome, unidade, categoria || '', Number(estoque_minimo || 0), Number(custo_medio || 0), ativo ? 1 : 0, req.params.id);

  res.json({ ok: true });
});

router.post('/movimentos', auth, (req, res) => {
  const { insumo_id, tipo, quantidade, custo_unit, observacao } = req.body;
  const tiposValidos = ['entrada', 'ajuste', 'perda', 'inventario'];
  if (!tiposValidos.includes(tipo)) return res.status(400).json({ erro: 'Tipo invalido' });

  const insumo = db.prepare('SELECT * FROM estoque_insumos WHERE id = ?').get(insumo_id);
  if (!insumo) return res.status(404).json({ erro: 'Insumo nao encontrado' });

  const qtd = Number(quantidade || 0);
  if (!qtd) return res.status(400).json({ erro: 'Quantidade invalida' });

  let delta = qtd;
  if (tipo === 'perda') delta = -Math.abs(qtd);
  if (tipo === 'entrada') delta = Math.abs(qtd);
  if (tipo === 'ajuste' || tipo === 'inventario') delta = qtd;

  db.prepare(`
    INSERT INTO estoque_movimentos (insumo_id, tipo, origem, quantidade, custo_unit, observacao, admin_id)
    VALUES (?, ?, 'manual', ?, ?, ?, ?)
  `).run(insumo_id, tipo, delta, custo_unit != null ? Number(custo_unit) : null, observacao || '', req.admin.id);

  if (tipo === 'inventario') {
    db.prepare('UPDATE estoque_insumos SET estoque_atual = ?, custo_medio = COALESCE(?, custo_medio) WHERE id = ?')
      .run(Math.max(0, qtd), custo_unit != null ? Number(custo_unit) : null, insumo_id);
  } else {
    db.prepare('UPDATE estoque_insumos SET estoque_atual = estoque_atual + ? WHERE id = ?').run(delta, insumo_id);
    if (tipo === 'entrada' && custo_unit != null) {
      db.prepare('UPDATE estoque_insumos SET custo_medio = ? WHERE id = ?').run(Number(custo_unit), insumo_id);
    }
  }

  res.json({ ok: true });
});

router.get('/fichas', auth, (req, res) => {
  const fichas = db.prepare(`
    SELECT
      pr.id AS prato_id,
      pr.nome AS prato_nome,
      pr.preco,
      ei.id AS insumo_id,
      ei.nome AS insumo_nome,
      ei.unidade,
      ft.quantidade
    FROM pratos pr
    LEFT JOIN fichas_tecnicas ft ON ft.prato_id = pr.id
    LEFT JOIN estoque_insumos ei ON ei.id = ft.insumo_id
    ORDER BY pr.nome, ei.nome
  `).all();
  res.json(fichas);
});

router.put('/fichas/:pratoId', auth, (req, res) => {
  const itens = Array.isArray(req.body.itens) ? req.body.itens : [];
  const prato = db.prepare('SELECT id FROM pratos WHERE id = ?').get(req.params.pratoId);
  if (!prato) return res.status(404).json({ erro: 'Prato nao encontrado' });

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM fichas_tecnicas WHERE prato_id = ?').run(req.params.pratoId);
    const insert = db.prepare('INSERT INTO fichas_tecnicas (prato_id, insumo_id, quantidade) VALUES (?, ?, ?)');
    itens.forEach((item) => {
      if (!item.insumo_id || !item.quantidade) return;
      insert.run(req.params.pratoId, item.insumo_id, Number(item.quantidade));
    });
  });

  tx();
  res.json({ ok: true });
});

router.get('/resumo', auth, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS total FROM estoque_insumos WHERE ativo = 1').get();
  const baixo = db.prepare(`
    SELECT COUNT(*) AS total
    FROM estoque_insumos
    WHERE ativo = 1 AND estoque_atual <= estoque_minimo
  `).get();
  const zerado = db.prepare(`
    SELECT COUNT(*) AS total
    FROM estoque_insumos
    WHERE ativo = 1 AND estoque_atual <= 0
  `).get();

  res.json({
    ativos: total.total,
    abaixo_minimo: baixo.total,
    zerados: zerado.total
  });
});

module.exports = router;
