const router = require('express').Router();
const { db } = require('../db/database');
const auth = require('../middleware/auth');

// GET /api/dashboard — todos os dados do dashboard
router.get('/', auth, (req, res) => {
  const hoje = new Date().toISOString().split('T')[0];

  // Faturamento hoje
  const fatHoje = db.prepare(`
    SELECT COALESCE(SUM(total),0) as valor, COUNT(*) as pedidos
    FROM pedidos WHERE DATE(criado_em)=? AND pagamento_status='aprovado'
  `).get(hoje);

  // Faturamento semana
  const fatSemana = db.prepare(`
    SELECT COALESCE(SUM(total),0) as valor, COUNT(*) as pedidos
    FROM pedidos WHERE DATE(criado_em) >= DATE('now','-7 days') AND pagamento_status='aprovado'
  `).get();

  // Faturamento mês
  const fatMes = db.prepare(`
    SELECT COALESCE(SUM(total),0) as valor, COUNT(*) as pedidos
    FROM pedidos WHERE strftime('%Y-%m',criado_em)=strftime('%Y-%m','now') AND pagamento_status='aprovado'
  `).get();

  // Ticket médio
  const ticketMedio = db.prepare(`
    SELECT COALESCE(AVG(total),0) as valor FROM pedidos WHERE pagamento_status='aprovado'
  `).get();

  // Pratos mais vendidos (top 10)
  const maisVendidos = db.prepare(`
    SELECT ip.nome_prato, SUM(ip.quantidade) as total_vendido, SUM(ip.subtotal) as receita
    FROM itens_pedido ip
    JOIN pedidos p ON p.id = ip.pedido_id
    WHERE p.pagamento_status = 'aprovado'
    GROUP BY ip.nome_prato
    ORDER BY total_vendido DESC
    LIMIT 10
  `).all();

  // Categorias mais vendidas
  const catMaisVendidas = db.prepare(`
    SELECT c.nome, SUM(ip.quantidade) as total_vendido, SUM(ip.subtotal) as receita
    FROM itens_pedido ip
    JOIN pratos pr ON pr.id = ip.prato_id
    JOIN categorias c ON c.id = pr.categoria_id
    JOIN pedidos p ON p.id = ip.pedido_id
    WHERE p.pagamento_status = 'aprovado'
    GROUP BY c.nome
    ORDER BY total_vendido DESC
  `).all();

  // Faturamento últimos 7 dias (gráfico)
  const fat7dias = db.prepare(`
    SELECT DATE(criado_em) as dia, COALESCE(SUM(total),0) as valor, COUNT(*) as pedidos
    FROM pedidos WHERE DATE(criado_em) >= DATE('now','-6 days') AND pagamento_status='aprovado'
    GROUP BY dia ORDER BY dia
  `).all();

  // Pedidos por forma de pagamento
  const porPagamento = db.prepare(`
    SELECT forma_pagamento, COUNT(*) as quantidade, SUM(total) as total
    FROM pedidos WHERE pagamento_status='aprovado' AND forma_pagamento IS NOT NULL
    GROUP BY forma_pagamento
  `).all();

  // Horários de pico
  const horariosPico = db.prepare(`
    SELECT strftime('%H',criado_em) as hora, COUNT(*) as pedidos
    FROM pedidos WHERE pagamento_status='aprovado'
    GROUP BY hora ORDER BY pedidos DESC LIMIT 24
  `).all();

  // Pedidos recentes
  const recentes = db.prepare(`
    SELECT * FROM pedidos ORDER BY criado_em DESC LIMIT 10
  `).all();

  // Status dos pedidos ativos
  const statusAtivos = db.prepare(`
    SELECT status, COUNT(*) as qtd FROM pedidos
    WHERE status NOT IN ('entregue','cancelado')
    GROUP BY status
  `).all();

  res.json({
    resumo: {
      hoje: fatHoje,
      semana: fatSemana,
      mes: fatMes,
      ticket_medio: ticketMedio.valor
    },
    graficos: {
      fat_7_dias: fat7dias,
      por_pagamento: porPagamento,
      horarios_pico: horariosPico
    },
    rankings: {
      pratos: maisVendidos,
      categorias: catMaisVendidas
    },
    pedidos_recentes: recentes,
    status_ativos: statusAtivos
  });
});

// GET /api/dashboard/mesas
router.get('/mesas', auth, (req, res) => {
  const mesas = db.prepare('SELECT * FROM mesas ORDER BY numero').all();
  res.json(mesas);
});

// PUT /api/dashboard/mesas/:numero/toggle
router.put('/mesas/:numero/toggle', auth, (req, res) => {
  const mesa = db.prepare('SELECT * FROM mesas WHERE numero=?').get(req.params.numero);
  if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });
  db.prepare('UPDATE mesas SET ativa=? WHERE numero=?').run(mesa.ativa ? 0 : 1, req.params.numero);
  res.json({ ok: true, ativa: !mesa.ativa });
});

module.exports = router;
