const router = require('express').Router();
const { db } = require('../db/database');
const auth = require('../middleware/auth');
const { abrirCaixaAutomatico, getCaixaAberto, resumoCaixa } = require('../services/operacao');

router.get('/status', auth, (req, res) => {
  const caixa = getCaixaAberto();
  if (!caixa) return res.json({ aberto: false, caixa: null });
  res.json({ aberto: true, caixa: resumoCaixa(caixa.id) });
});

router.get('/historico', auth, (req, res) => {
  const caixas = db.prepare(`
    SELECT *
    FROM caixas
    ORDER BY COALESCE(fechado_em, aberto_em) DESC
    LIMIT 30
  `).all();
  res.json(caixas.map((caixa) => resumoCaixa(caixa.id)));
});

router.post('/abrir', auth, (req, res) => {
  const aberto = getCaixaAberto();
  if (aberto) return res.status(400).json({ erro: 'Ja existe um caixa aberto' });

  const { saldo_inicial, observacao } = req.body;
  const info = db.prepare(`
    INSERT INTO caixas (status, saldo_inicial, saldo_sistema, observacao_abertura, admin_abertura_id)
    VALUES ('aberto', ?, ?, ?, ?)
  `).run(Number(saldo_inicial || 0), Number(saldo_inicial || 0), observacao || '', req.admin.id);

  res.json({ ok: true, caixa: resumoCaixa(info.lastInsertRowid) });
});

router.post('/lancamentos', auth, (req, res) => {
  const { tipo, categoria, descricao, valor, forma_pagamento } = req.body;
  const tiposValidos = ['despesa', 'sangria', 'suprimento'];
  if (!tiposValidos.includes(tipo)) return res.status(400).json({ erro: 'Tipo invalido' });

  const caixa = abrirCaixaAutomatico(req.admin.id);
  const valorNumerico = Math.abs(Number(valor || 0));
  if (!valorNumerico) return res.status(400).json({ erro: 'Valor invalido' });

  db.prepare(`
    INSERT INTO caixa_lancamentos (caixa_id, tipo, categoria, descricao, forma_pagamento, valor, admin_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    caixa.id,
    tipo,
    categoria || '',
    descricao || '',
    forma_pagamento || 'caixa',
    valorNumerico,
    req.admin.id
  );

  const resumo = resumoCaixa(caixa.id);
  db.prepare('UPDATE caixas SET saldo_sistema = ? WHERE id = ?').run(resumo.saldo_sistema_calculado, caixa.id);
  res.json({ ok: true, caixa: resumoCaixa(caixa.id) });
});

router.post('/fechar', auth, (req, res) => {
  const caixa = getCaixaAberto();
  if (!caixa) return res.status(400).json({ erro: 'Nao ha caixa aberto' });

  const { saldo_final_informado, observacao } = req.body;
  const resumo = resumoCaixa(caixa.id);
  const saldoInformado = Number(saldo_final_informado || 0);
  const diferenca = Number((saldoInformado - resumo.saldo_sistema_calculado).toFixed(2));

  db.prepare(`
    UPDATE caixas
    SET status = 'fechado',
        saldo_sistema = ?,
        saldo_final_informado = ?,
        diferenca = ?,
        observacao_fechamento = ?,
        fechado_em = datetime('now','localtime'),
        admin_fechamento_id = ?
    WHERE id = ?
  `).run(resumo.saldo_sistema_calculado, saldoInformado, diferenca, observacao || '', req.admin.id, caixa.id);

  res.json({ ok: true, caixa: resumoCaixa(caixa.id) });
});

router.get('/lancamentos', auth, (req, res) => {
  const caixa = getCaixaAberto();
  if (!caixa) return res.json([]);
  const itens = db.prepare(`
    SELECT cl.*, a.nome AS admin_nome
    FROM caixa_lancamentos cl
    LEFT JOIN admins a ON a.id = cl.admin_id
    WHERE cl.caixa_id = ?
    ORDER BY cl.criado_em DESC, cl.id DESC
  `).all(caixa.id);
  res.json(itens);
});

module.exports = router;
