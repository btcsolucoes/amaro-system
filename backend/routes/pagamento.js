const router = require('express').Router();
const { db } = require('../db/database');

// POST /api/pagamento/pix — gera PIX
router.post('/pix', async (req, res) => {
  const { pedido_id } = req.body;
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id=?').get(pedido_id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

  const token = process.env.MP_ACCESS_TOKEN;

  // Sem token: retorna simulação para demo
  if (!token || token.includes('seu-token')) {
    return res.json({
      simulacao: true,
      pedido_id,
      total: pedido.total,
      pix_copia_cola: `00020126580014br.gov.bcb.pix0136amaro-cafe-simulacao-${pedido_id}5204000053039865802BR5913Amaro Cafe6009Recife62070503***6304DEMO`,
      qr_code_base64: null,
      mensagem: 'Modo demo — use o botão "Simular Pagamento"'
    });
  }

  try {
    const axios = require('axios');
    const resp = await axios.post(
      'https://api.mercadopago.com/v1/payments',
      {
        transaction_amount: pedido.total,
        description: `Amaro Café - Pedido #${pedido_id} Mesa ${pedido.mesa_numero}`,
        payment_method_id: 'pix',
        payer: { email: 'cliente@amarocafe.com.br' }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `amaro-pix-${pedido_id}-${Date.now()}`
        }
      }
    );

    const data = resp.data;
    db.prepare(
      'INSERT INTO pagamentos (pedido_id,provider,provider_id,metodo,valor,status) VALUES (?,?,?,?,?,?)'
    ).run(pedido_id, 'mercadopago', String(data.id), 'pix', pedido.total, 'pendente');

    res.json({
      payment_id: data.id,
      pix_copia_cola: data.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      total: pedido.total
    });
  } catch (e) {
    console.error('MP Erro:', e.response?.data || e.message);
    res.status(500).json({ erro: 'Erro ao gerar PIX', detalhe: e.response?.data });
  }
});

// POST /api/pagamento/simular — para demo sem integrações reais
router.post('/simular', (req, res) => {
  const { pedido_id, metodo } = req.body;
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id=?').get(pedido_id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

  db.prepare(
    "UPDATE pedidos SET status=?,forma_pagamento=?,pagamento_status=?,atualizado_em=datetime('now','localtime') WHERE id=?"
  ).run('confirmado', metodo || 'simulado', 'aprovado', pedido_id);

  db.prepare(
    'INSERT INTO pagamentos (pedido_id,provider,provider_id,metodo,valor,status) VALUES (?,?,?,?,?,?)'
  ).run(pedido_id, 'simulacao', `sim-${Date.now()}`, metodo || 'simulado', pedido.total, 'aprovado');

  // WhatsApp simulado
  const { enviarWhatsApp } = require('../services/whatsapp');
  const itens = db.prepare('SELECT * FROM itens_pedido WHERE pedido_id=?').all(pedido_id);
  const linhas = itens.map(i => `• ${i.nome_prato} x${i.quantidade}`).join('\n');
  enviarWhatsApp(
    `🍽️ *NOVO PEDIDO — AMARO CAFÉ*\n\n*Mesa:* ${pedido.mesa_numero}\n*Pedido #${pedido_id}*\n\n${linhas}\n\n*Total:* R$ ${pedido.total.toFixed(2)}\n*Pagamento:* ${metodo || 'Simulado'}\n*Status:* ✅ Pago`
  ).catch(() => {});

  res.json({ ok: true, mensagem: 'Pagamento simulado com sucesso!' });
});

// POST /api/pagamento/webhook — recebe notificações Mercado Pago
router.post('/webhook', (req, res) => {
  const { type, data } = req.body;
  if (type === 'payment' && data?.id) {
    const pag = db.prepare("SELECT * FROM pagamentos WHERE provider_id=?").get(String(data.id));
    if (pag) {
      db.prepare("UPDATE pagamentos SET status='aprovado' WHERE id=?").run(pag.id);
      db.prepare("UPDATE pedidos SET pagamento_status='aprovado',status='confirmado' WHERE id=?").run(pag.pedido_id);
    }
  }
  res.sendStatus(200);
});

module.exports = router;
