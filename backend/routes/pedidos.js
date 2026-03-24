const router = require('express').Router();
const { db } = require('../db/database');
const auth = require('../middleware/auth');
const { enviarWhatsApp } = require('../services/whatsapp');
const { aprovarPedido, cancelarPedidoOperacao } = require('../services/operacao');

// ─────────────────────────────────────────────────
// PÚBLICO — criar pedido
// ─────────────────────────────────────────────────

// POST /api/pedidos
router.post('/', (req, res) => {
  const { mesa_numero, itens, observacao } = req.body;

  if (!mesa_numero || !itens || !itens.length)
    return res.status(400).json({ erro: 'mesa_numero e itens são obrigatórios' });

  // Calcular total
  let total = 0;
  const itensDetalhados = [];

  for (const item of itens) {
    const prato = db.prepare('SELECT * FROM pratos WHERE id = ? AND disponivel = 1').get(item.prato_id);
    if (!prato) return res.status(400).json({ erro: `Prato ${item.prato_id} não encontrado` });
    const subtotal = prato.preco * item.quantidade;
    total += subtotal;
    itensDetalhados.push({ prato, quantidade: item.quantidade, obs: item.obs || '', subtotal });
  }

  // Criar pedido
  const pedido = db.prepare(
    'INSERT INTO pedidos (mesa_numero,total,observacao,status) VALUES (?,?,?,?)'
  ).run(mesa_numero, total, observacao || '', 'aguardando_pagamento');

  const pedidoId = pedido.lastInsertRowid;

  // Inserir itens
  const insItem = db.prepare(
    'INSERT INTO itens_pedido (pedido_id,prato_id,nome_prato,preco_unit,quantidade,subtotal,obs) VALUES (?,?,?,?,?,?,?)'
  );
  for (const item of itensDetalhados) {
    insItem.run(pedidoId, item.prato.id, item.prato.nome, item.prato.preco, item.quantidade, item.subtotal, item.obs);
  }

  res.json({ pedido_id: pedidoId, total, status: 'aguardando_pagamento' });
});

// GET /api/pedidos/:id — status do pedido
router.get('/:id', (req, res) => {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

  const itens = db.prepare('SELECT * FROM itens_pedido WHERE pedido_id = ?').all(req.params.id);
  res.json({ ...pedido, itens });
});

// POST /api/pedidos/:id/confirmar — confirma após pagamento aprovado
router.post('/:id/confirmar', async (req, res) => {
  const { forma_pagamento, pagamento_id } = req.body;
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

  db.prepare(
    'UPDATE pedidos SET pagamento_id=?,atualizado_em=datetime("now","localtime") WHERE id=?'
  ).run(pagamento_id || null, req.params.id);

  aprovarPedido(req.params.id, forma_pagamento);

  const itens = db.prepare('SELECT * FROM itens_pedido WHERE pedido_id = ?').all(req.params.id);

  // Registrar pagamento
  db.prepare(
    'INSERT INTO pagamentos (pedido_id,provider,provider_id,metodo,valor,status) VALUES (?,?,?,?,?,?)'
  ).run(req.params.id, 'local', pagamento_id || 'manual', forma_pagamento, pedido.total, 'aprovado');

  // WhatsApp
  try {
    const linhas = itens.map(i => `• ${i.nome_prato} x${i.quantidade} — R$ ${i.subtotal.toFixed(2)}`).join('\n');
    const msg = `🍽️ *NOVO PEDIDO — AMARO CAFÉ*\n\n` +
      `*Mesa:* ${pedido.mesa_numero}\n` +
      `*Pedido #${req.params.id}*\n\n` +
      `${linhas}\n\n` +
      `*Total:* R$ ${pedido.total.toFixed(2)}\n` +
      `*Pagamento:* ${forma_pagamento}\n` +
      `*Status:* ✅ Pago`;
    await enviarWhatsApp(msg);
  } catch (e) {
    console.warn('WhatsApp não enviado:', e.message);
  }

  res.json({ ok: true, mensagem: 'Pedido confirmado!' });
});

// ─────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────

// GET /api/pedidos/admin/lista
router.get('/admin/lista', auth, (req, res) => {
  const { status, data, mesa } = req.query;
  let sql = 'SELECT * FROM pedidos WHERE 1=1';
  const params = [];

  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (data)   { sql += ' AND DATE(criado_em) = ?'; params.push(data); }
  if (mesa)   { sql += ' AND mesa_numero = ?'; params.push(mesa); }

  sql += ' ORDER BY criado_em DESC LIMIT 200';

  const pedidos = db.prepare(sql).all(...params);
  res.json(pedidos);
});

// GET /api/pedidos/admin/:id
router.get('/admin/:id', auth, (req, res) => {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });
  const itens = db.prepare('SELECT * FROM itens_pedido WHERE pedido_id = ?').all(req.params.id);
  res.json({ ...pedido, itens });
});

// PUT /api/pedidos/admin/:id/status
router.put('/admin/:id/status', auth, (req, res) => {
  const { status } = req.body;
  const validos = ['aguardando_pagamento','confirmado','em_preparo','pronto','entregue','cancelado'];
  if (!validos.includes(status))
    return res.status(400).json({ erro: 'Status inválido' });

  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido nÃ£o encontrado' });

  if (status === 'cancelado') {
    cancelarPedidoOperacao(req.params.id, req.admin.id);
  } else if (status === 'confirmado' && pedido.pagamento_status !== 'aprovado') {
    aprovarPedido(req.params.id, pedido.forma_pagamento || 'manual', req.admin.id);
  } else {
    db.prepare(
      'UPDATE pedidos SET status=?,atualizado_em=datetime("now","localtime") WHERE id=?'
    ).run(status, req.params.id);
  }

  res.json({ ok: true });
});

module.exports = router;
