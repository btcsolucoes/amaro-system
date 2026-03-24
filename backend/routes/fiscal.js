const router = require('express').Router();
const { db } = require('../db/database');
const auth = require('../middleware/auth');

router.get('/config', auth, (req, res) => {
  const config = db.prepare('SELECT * FROM fiscal_config WHERE id = 1').get();
  res.json(config || null);
});

router.put('/config', auth, (req, res) => {
  const { razao_social, cnpj, regime_tributario, aliquota_estimada, ambiente } = req.body;
  db.prepare(`
    INSERT INTO fiscal_config (id, razao_social, cnpj, regime_tributario, aliquota_estimada, ambiente, atualizado_em)
    VALUES (1, ?, ?, ?, ?, ?, datetime('now','localtime'))
    ON CONFLICT(id) DO UPDATE SET
      razao_social = excluded.razao_social,
      cnpj = excluded.cnpj,
      regime_tributario = excluded.regime_tributario,
      aliquota_estimada = excluded.aliquota_estimada,
      ambiente = excluded.ambiente,
      atualizado_em = datetime('now','localtime')
  `).run(razao_social || '', cnpj || '', regime_tributario || 'Simples Nacional', Number(aliquota_estimada || 0), ambiente || 'gerencial');
  res.json({ ok: true });
});

router.get('/lancamentos', auth, (req, res) => {
  const { data_inicial, data_final } = req.query;
  let sql = `
    SELECT fl.*, p.mesa_numero, p.forma_pagamento, p.status
    FROM fiscal_lancamentos fl
    JOIN pedidos p ON p.id = fl.pedido_id
    WHERE 1 = 1
  `;
  const params = [];

  if (data_inicial) {
    sql += ' AND DATE(fl.criado_em) >= ?';
    params.push(data_inicial);
  }
  if (data_final) {
    sql += ' AND DATE(fl.criado_em) <= ?';
    params.push(data_final);
  }

  sql += ' ORDER BY fl.criado_em DESC, fl.id DESC LIMIT 300';
  res.json(db.prepare(sql).all(...params));
});

router.get('/resumo', auth, (req, res) => {
  const { data_inicial, data_final } = req.query;
  let filtro = ' WHERE 1 = 1 ';
  const params = [];

  if (data_inicial) {
    filtro += ' AND DATE(fl.criado_em) >= ?';
    params.push(data_inicial);
  }
  if (data_final) {
    filtro += ' AND DATE(fl.criado_em) <= ?';
    params.push(data_final);
  }

  const resumo = db.prepare(`
    SELECT
      COUNT(*) AS documentos,
      COALESCE(SUM(CASE WHEN fl.situacao <> 'cancelado' THEN fl.base_calculo ELSE 0 END), 0) AS faturamento_bruto,
      COALESCE(SUM(CASE WHEN fl.situacao <> 'cancelado' THEN fl.valor_imposto ELSE 0 END), 0) AS impostos_estimados,
      COALESCE(SUM(CASE WHEN fl.situacao = 'cancelado' THEN fl.base_calculo ELSE 0 END), 0) AS cancelados
    FROM fiscal_lancamentos fl
    ${filtro}
  `).get(...params);

  const porPagamento = db.prepare(`
    SELECT p.forma_pagamento, COUNT(*) AS quantidade, COALESCE(SUM(fl.base_calculo), 0) AS total
    FROM fiscal_lancamentos fl
    JOIN pedidos p ON p.id = fl.pedido_id
    ${filtro}
    GROUP BY p.forma_pagamento
    ORDER BY total DESC
  `).all(...params);

  res.json({ resumo, por_pagamento: porPagamento });
});

module.exports = router;
