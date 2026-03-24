const { db } = require('../db/database');

function getFiscalConfig() {
  return db.prepare('SELECT * FROM fiscal_config WHERE id = 1').get();
}

function getCaixaAberto() {
  return db.prepare("SELECT * FROM caixas WHERE status = 'aberto' ORDER BY aberto_em DESC LIMIT 1").get();
}

function abrirCaixaAutomatico(adminId = null) {
  const existente = getCaixaAberto();
  if (existente) return existente;

  const info = db.prepare(`
    INSERT INTO caixas (status, saldo_inicial, saldo_sistema, observacao_abertura, admin_abertura_id)
    VALUES ('aberto', 0, 0, 'Abertura automatica pelo sistema', ?)
  `).run(adminId);

  return db.prepare('SELECT * FROM caixas WHERE id = ?').get(info.lastInsertRowid);
}

function resumoCaixa(caixaId) {
  const caixa = db.prepare('SELECT * FROM caixas WHERE id = ?').get(caixaId);
  if (!caixa) return null;

  const lancamentos = db.prepare(`
    SELECT tipo, COALESCE(SUM(valor), 0) AS total
    FROM caixa_lancamentos
    WHERE caixa_id = ?
    GROUP BY tipo
  `).all(caixaId);

  const totais = { venda: 0, despesa: 0, sangria: 0, suprimento: 0, estorno: 0 };
  lancamentos.forEach((row) => { totais[row.tipo] = row.total; });

  const saldoSistema =
    Number(caixa.saldo_inicial || 0) +
    Number(totais.venda || 0) +
    Number(totais.suprimento || 0) +
    Number(totais.estorno || 0) -
    Number(totais.despesa || 0) -
    Number(totais.sangria || 0);

  return {
    ...caixa,
    totais,
    saldo_sistema_calculado: saldoSistema
  };
}

function consumoPorPedido(pedidoId) {
  return db.prepare(`
    SELECT
      ft.insumo_id,
      ei.nome,
      ei.unidade,
      SUM(ft.quantidade * ip.quantidade) AS quantidade_total
    FROM itens_pedido ip
    JOIN fichas_tecnicas ft ON ft.prato_id = ip.prato_id
    JOIN estoque_insumos ei ON ei.id = ft.insumo_id
    WHERE ip.pedido_id = ?
    GROUP BY ft.insumo_id, ei.nome, ei.unidade
  `).all(pedidoId);
}

function aplicarConsumoEstoque(pedidoId, adminId = null) {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
  if (!pedido || pedido.estoque_processado) return;

  const consumos = consumoPorPedido(pedidoId);
  const updateStock = db.prepare('UPDATE estoque_insumos SET estoque_atual = estoque_atual - ? WHERE id = ?');
  const insertMov = db.prepare(`
    INSERT INTO estoque_movimentos (insumo_id, tipo, origem, referencia_id, quantidade, observacao, admin_id)
    VALUES (?, 'consumo', 'pedido', ?, ?, ?, ?)
  `);

  consumos.forEach((item) => {
    updateStock.run(item.quantidade_total, item.insumo_id);
    insertMov.run(item.insumo_id, pedidoId, -1 * Number(item.quantidade_total), `Consumo do pedido #${pedidoId}`, adminId);
  });

  db.prepare('UPDATE pedidos SET estoque_processado = 1 WHERE id = ?').run(pedidoId);
}

function estornarEstoque(pedidoId, adminId = null) {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
  if (!pedido || !pedido.estoque_processado) return;

  const consumos = consumoPorPedido(pedidoId);
  const updateStock = db.prepare('UPDATE estoque_insumos SET estoque_atual = estoque_atual + ? WHERE id = ?');
  const insertMov = db.prepare(`
    INSERT INTO estoque_movimentos (insumo_id, tipo, origem, referencia_id, quantidade, observacao, admin_id)
    VALUES (?, 'estorno', 'pedido_cancelado', ?, ?, ?, ?)
  `);

  consumos.forEach((item) => {
    updateStock.run(item.quantidade_total, item.insumo_id);
    insertMov.run(item.insumo_id, pedidoId, Number(item.quantidade_total), `Estorno do pedido #${pedidoId}`, adminId);
  });

  db.prepare('UPDATE pedidos SET estoque_processado = 0 WHERE id = ?').run(pedidoId);
}

function lancarVendaNoCaixa(pedidoId, formaPagamento, adminId = null) {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
  if (!pedido || pedido.caixa_lancado) return getCaixaAberto();

  const caixa = abrirCaixaAutomatico(adminId);
  db.prepare(`
    INSERT INTO caixa_lancamentos (caixa_id, tipo, categoria, descricao, forma_pagamento, valor, pedido_id, admin_id)
    VALUES (?, 'venda', 'Pedido', ?, ?, ?, ?, ?)
  `).run(caixa.id, `Pedido #${pedidoId} mesa ${pedido.mesa_numero}`, formaPagamento || 'nao informado', pedido.total, pedidoId, adminId);

  const resumo = resumoCaixa(caixa.id);
  db.prepare('UPDATE caixas SET saldo_sistema = ? WHERE id = ?').run(resumo.saldo_sistema_calculado, caixa.id);
  db.prepare('UPDATE pedidos SET caixa_lancado = 1, caixa_id = ? WHERE id = ?').run(caixa.id, pedidoId);

  return db.prepare('SELECT * FROM caixas WHERE id = ?').get(caixa.id);
}

function estornarVendaNoCaixa(pedidoId, adminId = null) {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
  if (!pedido || !pedido.caixa_lancado || !pedido.caixa_id) return;

  const jaEstornado = db.prepare(`
    SELECT id FROM caixa_lancamentos
    WHERE caixa_id = ? AND pedido_id = ? AND tipo = 'estorno'
  `).get(pedido.caixa_id, pedidoId);

  if (!jaEstornado) {
    db.prepare(`
      INSERT INTO caixa_lancamentos (caixa_id, tipo, categoria, descricao, forma_pagamento, valor, pedido_id, admin_id)
      VALUES (?, 'estorno', 'Pedido cancelado', ?, ?, ?, ?, ?)
    `).run(
      pedido.caixa_id,
      `Estorno do pedido #${pedidoId}`,
      pedido.forma_pagamento || 'nao informado',
      -1 * Number(pedido.total),
      pedidoId,
      adminId
    );
  }

  const resumo = resumoCaixa(pedido.caixa_id);
  db.prepare('UPDATE caixas SET saldo_sistema = ? WHERE id = ?').run(resumo.saldo_sistema_calculado, pedido.caixa_id);
  db.prepare('UPDATE pedidos SET caixa_lancado = 0 WHERE id = ?').run(pedidoId);
}

function registrarFiscal(pedidoId) {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
  if (!pedido || pedido.fiscal_lancado) return;

  const config = getFiscalConfig();
  const aliquota = Number(config?.aliquota_estimada || 0);
  const imposto = Number((pedido.total * aliquota / 100).toFixed(2));
  const liquido = Number((pedido.total - imposto).toFixed(2));

  db.prepare(`
    INSERT INTO fiscal_lancamentos (pedido_id, caixa_id, documento_tipo, documento_numero, situacao, base_calculo, aliquota, valor_imposto, valor_liquido, observacao)
    VALUES (?, ?, 'gerencial', ?, 'registrado', ?, ?, ?, ?, ?)
    ON CONFLICT(pedido_id) DO UPDATE SET
      caixa_id = excluded.caixa_id,
      documento_numero = excluded.documento_numero,
      situacao = excluded.situacao,
      base_calculo = excluded.base_calculo,
      aliquota = excluded.aliquota,
      valor_imposto = excluded.valor_imposto,
      valor_liquido = excluded.valor_liquido,
      observacao = excluded.observacao
  `).run(
    pedidoId,
    pedido.caixa_id || null,
    `AMR-${String(pedidoId).padStart(6, '0')}`,
    pedido.total,
    aliquota,
    imposto,
    liquido,
    config?.ambiente === 'gerencial' ? 'Lancamento gerencial sem emissao fiscal automatica' : ''
  );

  db.prepare('UPDATE pedidos SET fiscal_lancado = 1 WHERE id = ?').run(pedidoId);
}

function cancelarFiscal(pedidoId) {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
  if (!pedido || !pedido.fiscal_lancado) return;

  db.prepare(`
    UPDATE fiscal_lancamentos
    SET situacao = 'cancelado', observacao = 'Pedido cancelado'
    WHERE pedido_id = ?
  `).run(pedidoId);

  db.prepare('UPDATE pedidos SET fiscal_lancado = 0 WHERE id = ?').run(pedidoId);
}

function aprovarPedido(pedidoId, formaPagamento, adminId = null) {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
  if (!pedido) throw new Error('Pedido nao encontrado');

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE pedidos
      SET status = ?, forma_pagamento = ?, pagamento_status = ?, atualizado_em = datetime('now','localtime')
      WHERE id = ?
    `).run('confirmado', formaPagamento || pedido.forma_pagamento || 'nao informado', 'aprovado', pedidoId);

    aplicarConsumoEstoque(pedidoId, adminId);
    lancarVendaNoCaixa(pedidoId, formaPagamento || pedido.forma_pagamento, adminId);
    registrarFiscal(pedidoId);
  });

  tx();
  return db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
}

function cancelarPedidoOperacao(pedidoId, adminId = null) {
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
  if (!pedido) throw new Error('Pedido nao encontrado');

  const tx = db.transaction(() => {
    estornarEstoque(pedidoId, adminId);
    estornarVendaNoCaixa(pedidoId, adminId);
    cancelarFiscal(pedidoId);
    db.prepare(`
      UPDATE pedidos
      SET status = 'cancelado', pagamento_status = CASE
        WHEN pagamento_status = 'aprovado' THEN 'estornado'
        ELSE pagamento_status
      END, atualizado_em = datetime('now','localtime')
      WHERE id = ?
    `).run(pedidoId);
  });

  tx();
  return db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
}

module.exports = {
  abrirCaixaAutomatico,
  aprovarPedido,
  cancelarPedidoOperacao,
  consumoPorPedido,
  getCaixaAberto,
  getFiscalConfig,
  resumoCaixa
};
