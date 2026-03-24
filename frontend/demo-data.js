(function () {
  const demoCardapio = [
    { id: 1, nome: 'Entradinhas', descricao: 'Para comecar', ordem: 1, ativo: 1, pratos: [
      { id: 1, categoria_id: 1, nome: 'Carpaccio a Bom Jesus', descricao: 'Carpaccio de carne de sol + molho de mostarda e mel + ruculas + alcaparras crocante + torradas de parmesao', preco: 45, foto: 'carpaccio-a-bom-jesus.jpg', disponivel: 1, ordem: 1 },
      { id: 2, categoria_id: 1, nome: 'Stick de Peixe Crocante', descricao: 'Stick de peixe crocante + mayo de bacon crocante', preco: 43, foto: 'stick-de-peixe-crocante.jpg', disponivel: 1, ordem: 2 },
      { id: 3, categoria_id: 1, nome: 'Trio Ternurinha', descricao: 'Charque desfiada crocante + bastoes de macaxeira e creme de coalho', preco: 35, foto: 'trio-ternurinha.jpg', disponivel: 1, ordem: 3 },
      { id: 4, categoria_id: 1, nome: 'Croqueta de Cupim', descricao: 'Porcao (cinco unidades)', preco: 31, foto: 'croqueta-de-cupim.jpg', disponivel: 1, ordem: 4 }
    ] },
    { id: 2, nome: 'Executivos', descricao: 'Pratos principais', ordem: 2, ativo: 1, pratos: [
      { id: 5, categoria_id: 2, nome: 'Camarao Cais do Sertao', descricao: 'Camarao e linguine ao molho pomodoro com manjericao e parmesao', preco: 34, foto: 'camarao-cais-do-sertao.jpg', disponivel: 1, ordem: 1 },
      { id: 6, categoria_id: 2, nome: 'Camarao a Imperador', descricao: 'Camarao empanado e gratinado sobre pure de batatas + arroz de brocolis', preco: 35, foto: 'camarao-a-imperador.jpg', disponivel: 1, ordem: 2 },
      { id: 7, categoria_id: 2, nome: 'Nhoque de Macaxeira Crocante', descricao: 'Nhoque recheado com queijo manteiga + creme de coalho e ragu de linguica matuta', preco: 35, foto: 'nhoque-de-macaxeira-crocante.jpg', disponivel: 1, ordem: 3 },
      { id: 8, categoria_id: 2, nome: 'Charque Brejeira', descricao: 'Charque desfiada e crocante + arroz cremoso de queijo coalho + farofa tropeira com cuscuz + vinagrete', preco: 35, foto: 'charque-brejeira.jpg', disponivel: 1, ordem: 4 },
      { id: 9, categoria_id: 2, nome: 'Maminha do Apolo', descricao: 'Maminha fatiada + picles de maxixe + pure de batata + arroz de alho crocante', preco: 32, foto: 'maminha-do-apolo.jpg', disponivel: 1, ordem: 5 },
      { id: 10, categoria_id: 2, nome: 'Carne de Sol Atoladinha', descricao: 'Cubos de carne de sol ao creme de queijo + arroz de cebolinho + bastoes de macaxeira crocante', preco: 32, foto: 'carne-de-sol-atoladinha.jpg', disponivel: 1, ordem: 6 },
      { id: 11, categoria_id: 2, nome: 'Carne a Parmeggiano', descricao: 'Contra file empanado e gratinado + linguine ao molho pomodoro + frita ou pure de batata', preco: 33, foto: 'carne-a-parmeggiano.jpg', disponivel: 1, ordem: 7 },
      { id: 12, categoria_id: 2, nome: 'Frango a Parmeggiano', descricao: 'Frango empanado e gratinado + linguine ao molho pomodoro + frita ou pure de batata', preco: 28, foto: 'frango-a-parmeggiano.jpg', disponivel: 1, ordem: 8 },
      { id: 13, categoria_id: 2, nome: 'Cupim da Guia', descricao: 'Steak de cupim + pure de macaxeira + arroz de coentro + picles de cebola roxa', preco: 34, foto: 'cupim-da-guia.jpg', disponivel: 1, ordem: 9 },
      { id: 14, categoria_id: 2, nome: 'Franguinho da Moeda', descricao: 'Coxa e sobrecoxa na manteiga de ervas e pimenta + arroz biro biro', preco: 28, foto: 'franguinho-da-moeda.jpg', disponivel: 1, ordem: 10 },
      { id: 15, categoria_id: 2, nome: 'Couve Flor Grelhada', descricao: 'Couve flor grelhada + chimichurri + pure de feijao branco', preco: 26, foto: 'couve-flor-grelhada.jpg', disponivel: 1, ordem: 11 }
    ] },
    { id: 3, nome: 'Tapiocas', descricao: 'Nordeste na mesa', ordem: 3, ativo: 1, pratos: [
      { id: 16, categoria_id: 3, nome: 'Tapioca Cais', descricao: 'Tapioca recheada com queijo coalho e frango, finalizada com creme de queijo, ervas e parmesao', preco: 19, foto: 'tapioca-cais.jpg', disponivel: 1, ordem: 1 },
      { id: 17, categoria_id: 3, nome: 'Tapioca Aurora', descricao: 'Tapioca recheada e rendada com queijo coalho + charque desfiada', preco: 21, foto: 'tapioca-aurora.jpg', disponivel: 1, ordem: 2 },
      { id: 18, categoria_id: 3, nome: 'Tapioca Leao do Norte', descricao: 'Tapioca recheada com carne de sol, cebolinho e queijo coalho + pure de jerimum', preco: 18, foto: 'tapioca-leao-do-norte.jpg', disponivel: 1, ordem: 3 }
    ] },
    { id: 4, nome: 'Cuscuz', descricao: 'Tradicao nordestina', ordem: 4, ativo: 1, pratos: [
      { id: 19, categoria_id: 4, nome: 'Cuscuz Nordestao', descricao: 'Cuscuz recheado com queijo manteiga + linguica matuta + verdura + molho tomate', preco: 19, foto: 'cuscuz-nordestao.jpg', disponivel: 1, ordem: 1 },
      { id: 20, categoria_id: 4, nome: 'Cuscuz Quarentinha', descricao: 'Cuscuz recheado com queijo coalho + verdura + ovo mexido + charque crocante', preco: 21, foto: 'cuscuz-quarentinha.jpg', disponivel: 1, ordem: 2 },
      { id: 21, categoria_id: 4, nome: 'Cuscuz Arsenal', descricao: 'Cuscuz recheado com queijo mussarela + frango desfiado + verdura + finalizacao gratinada', preco: 19, foto: 'cuscuz-arsenal.jpg', disponivel: 1, ordem: 3 }
    ] },
    { id: 5, nome: 'Salgados', descricao: 'Petiscos', ordem: 5, ativo: 1, pratos: [
      { id: 22, categoria_id: 5, nome: 'Coxinha de Frango', descricao: 'Unidade', preco: 9, foto: 'coxinha-de-frango.jpg', disponivel: 1, ordem: 1 },
      { id: 23, categoria_id: 5, nome: 'Coxinha de Camarao com Requeijao', descricao: 'Unidade', preco: 12, foto: 'coxinha-de-camarao-com-requeijao.jpg', disponivel: 1, ordem: 2 }
    ] },
    { id: 6, nome: 'Bebidas', descricao: 'Para acompanhar', ordem: 6, ativo: 1, pratos: [
      { id: 24, categoria_id: 6, nome: 'H2O Limoneto Pet 500ml', descricao: 'Garrafa 500ml', preco: 8, foto: null, disponivel: 1, ordem: 1 },
      { id: 25, categoria_id: 6, nome: 'Guarana Antartica Lata 350ml', descricao: 'Lata 350ml', preco: 7, foto: null, disponivel: 1, ordem: 2 },
      { id: 26, categoria_id: 6, nome: 'Coca Cola Lata', descricao: 'Lata', preco: 7, foto: null, disponivel: 1, ordem: 3 },
      { id: 27, categoria_id: 6, nome: 'Coca Cola Zero Lata 350ml', descricao: 'Lata 350ml', preco: 7, foto: null, disponivel: 1, ordem: 4 }
    ] }
  ];

  const demoOrders = [
    {
      id: 101, mesa_numero: 3, total: 78, forma_pagamento: 'pix', status: 'em_preparo', criado_em: '2026-03-24 09:15:00', observacao: 'Sem cebola no prato principal',
      itens: [
        { prato_id: 1, nome_prato: 'Carpaccio a Bom Jesus', quantidade: 1, subtotal: 45 },
        { prato_id: 22, nome_prato: 'Coxinha de Frango', quantidade: 1, subtotal: 9 },
        { prato_id: 24, nome_prato: 'H2O Limoneto Pet 500ml', quantidade: 3, subtotal: 24 }
      ]
    },
    {
      id: 102, mesa_numero: 5, total: 70, forma_pagamento: 'cartao', status: 'pronto', criado_em: '2026-03-24 10:02:00', observacao: '',
      itens: [
        { prato_id: 12, nome_prato: 'Frango a Parmeggiano', quantidade: 2, subtotal: 56 },
        { prato_id: 26, nome_prato: 'Coca Cola Lata', quantidade: 2, subtotal: 14 }
      ]
    },
    {
      id: 103, mesa_numero: 1, total: 53, forma_pagamento: 'pix', status: 'confirmado', criado_em: '2026-03-24 10:40:00', observacao: 'Caprichar no molho',
      itens: [
        { prato_id: 18, nome_prato: 'Tapioca Leao do Norte', quantidade: 1, subtotal: 18 },
        { prato_id: 20, nome_prato: 'Cuscuz Quarentinha', quantidade: 1, subtotal: 21 },
        { prato_id: 25, nome_prato: 'Guarana Antartica Lata 350ml', quantidade: 2, subtotal: 14 }
      ]
    },
    {
      id: 104, mesa_numero: 8, total: 109, forma_pagamento: 'cartao', status: 'entregue', criado_em: '2026-03-23 19:25:00', observacao: '',
      itens: [
        { prato_id: 6, nome_prato: 'Camarao a Imperador', quantidade: 1, subtotal: 35 },
        { prato_id: 8, nome_prato: 'Charque Brejeira', quantidade: 1, subtotal: 35 },
        { prato_id: 16, nome_prato: 'Tapioca Cais', quantidade: 1, subtotal: 19 },
        { prato_id: 24, nome_prato: 'H2O Limoneto Pet 500ml', quantidade: 1, subtotal: 8 },
        { prato_id: 25, nome_prato: 'Guarana Antartica Lata 350ml', quantidade: 1, subtotal: 7 },
        { prato_id: 26, nome_prato: 'Coca Cola Lata', quantidade: 1, subtotal: 7 }
      ]
    },
    {
      id: 105, mesa_numero: 2, total: 47, forma_pagamento: 'pix', status: 'aguardando_pagamento', criado_em: '2026-03-24 11:12:00', observacao: '',
      itens: [
        { prato_id: 17, nome_prato: 'Tapioca Aurora', quantidade: 1, subtotal: 21 },
        { prato_id: 23, nome_prato: 'Coxinha de Camarao com Requeijao', quantidade: 1, subtotal: 12 },
        { prato_id: 26, nome_prato: 'Coca Cola Lata', quantidade: 2, subtotal: 14 }
      ]
    }
  ];

  const demoEstoque = [
    { id: 1, nome: 'Carne de sol', unidade: 'kg', categoria: 'Carnes', estoque_atual: 5.2, estoque_minimo: 1.5, custo_medio: 44, ativo: 1 },
    { id: 2, nome: 'Camarao', unidade: 'kg', categoria: 'Pescados', estoque_atual: 3.8, estoque_minimo: 1.2, custo_medio: 58, ativo: 1 },
    { id: 3, nome: 'Frango', unidade: 'kg', categoria: 'Aves', estoque_atual: 4.6, estoque_minimo: 1.5, custo_medio: 21, ativo: 1 },
    { id: 4, nome: 'Macaxeira', unidade: 'kg', categoria: 'Hortifruti', estoque_atual: 8.2, estoque_minimo: 2, custo_medio: 8, ativo: 1 },
    { id: 5, nome: 'Queijo coalho', unidade: 'kg', categoria: 'Laticinios', estoque_atual: 1.4, estoque_minimo: 0.8, custo_medio: 32, ativo: 1 },
    { id: 6, nome: 'Goma de tapioca', unidade: 'kg', categoria: 'Secos', estoque_atual: 4.9, estoque_minimo: 1.5, custo_medio: 12, ativo: 1 },
    { id: 7, nome: 'Flocao de milho', unidade: 'kg', categoria: 'Secos', estoque_atual: 0.9, estoque_minimo: 1.2, custo_medio: 7, ativo: 1 },
    { id: 8, nome: 'Coca Cola lata', unidade: 'un', categoria: 'Bebidas', estoque_atual: 18, estoque_minimo: 12, custo_medio: 3.1, ativo: 1 }
  ];

  const demoFichas = [
    { prato_id: 10, prato_nome: 'Carne de Sol Atoladinha', preco: 32, insumo_id: 1, insumo_nome: 'Carne de sol', unidade: 'kg', quantidade: 0.18 },
    { prato_id: 10, prato_nome: 'Carne de Sol Atoladinha', preco: 32, insumo_id: 4, insumo_nome: 'Macaxeira', unidade: 'kg', quantidade: 0.18 },
    { prato_id: 16, prato_nome: 'Tapioca Cais', preco: 19, insumo_id: 3, insumo_nome: 'Frango', unidade: 'kg', quantidade: 0.08 },
    { prato_id: 16, prato_nome: 'Tapioca Cais', preco: 19, insumo_id: 6, insumo_nome: 'Goma de tapioca', unidade: 'kg', quantidade: 0.13 },
    { prato_id: 19, prato_nome: 'Cuscuz Nordestao', preco: 19, insumo_id: 7, insumo_nome: 'Flocao de milho', unidade: 'kg', quantidade: 0.12 },
    { prato_id: 26, prato_nome: 'Coca Cola Lata', preco: 7, insumo_id: 8, insumo_nome: 'Coca Cola lata', unidade: 'un', quantidade: 1 }
  ];

  const demoCaixas = [
    {
      id: 1,
      status: 'aberto',
      saldo_inicial: 200,
      saldo_sistema: 510,
      saldo_sistema_calculado: 510,
      aberto_em: '2026-03-24 08:00:00',
      saldo_final_informado: null,
      diferenca: 0,
      totais: { venda: 410, despesa: 40, sangria: 60, suprimento: 0, estorno: 0 }
    },
    {
      id: 2,
      status: 'fechado',
      saldo_inicial: 150,
      saldo_sistema: 392,
      saldo_sistema_calculado: 392,
      aberto_em: '2026-03-23 08:00:00',
      saldo_final_informado: 392,
      diferenca: 0,
      totais: { venda: 312, despesa: 20, sangria: 50, suprimento: 0, estorno: 0 }
    }
  ];

  const demoCaixaLancamentos = [
    { id: 1, caixa_id: 1, tipo: 'venda', descricao: 'Pedido #101 mesa 3', forma_pagamento: 'pix', valor: 78, criado_em: '2026-03-24 09:16:00' },
    { id: 2, caixa_id: 1, tipo: 'venda', descricao: 'Pedido #102 mesa 5', forma_pagamento: 'cartao', valor: 70, criado_em: '2026-03-24 10:03:00' },
    { id: 3, caixa_id: 1, tipo: 'despesa', descricao: 'Compra emergencial de gelo', forma_pagamento: 'caixa', valor: 40, criado_em: '2026-03-24 10:20:00' },
    { id: 4, caixa_id: 1, tipo: 'venda', descricao: 'Pedido #103 mesa 1', forma_pagamento: 'pix', valor: 53, criado_em: '2026-03-24 10:41:00' },
    { id: 5, caixa_id: 1, tipo: 'sangria', descricao: 'Retirada para troco externo', forma_pagamento: 'caixa', valor: 60, criado_em: '2026-03-24 11:05:00' }
  ];

  const demoFiscalConfig = {
    id: 1,
    razao_social: 'Amaro Cafe',
    cnpj: '12.345.678/0001-90',
    regime_tributario: 'Simples Nacional',
    aliquota_estimada: 6,
    ambiente: 'gerencial'
  };

  const demoFiscalLancamentos = demoOrders.map((order, index) => ({
    id: index + 1,
    pedido_id: order.id,
    caixa_id: 1,
    documento_tipo: 'gerencial',
    documento_numero: `AMR-${String(order.id).padStart(6, '0')}`,
    situacao: order.status === 'cancelado' ? 'cancelado' : 'registrado',
    base_calculo: order.total,
    aliquota: 6,
    valor_imposto: Number((order.total * 0.06).toFixed(2)),
    valor_liquido: Number((order.total * 0.94).toFixed(2)),
    mesa_numero: order.mesa_numero,
    forma_pagamento: order.forma_pagamento,
    criado_em: order.criado_em
  }));

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function frontendBase() {
    if (window.AMARO_CONFIG && window.AMARO_CONFIG.frontendBaseUrl) {
      return window.AMARO_CONFIG.frontendBaseUrl.replace(/\/+$/, '');
    }
    const parts = window.location.pathname.split('/').filter(Boolean);
    const base = /\.github\.io$/i.test(window.location.hostname) && parts[0] ? `/${parts[0]}` : '';
    return `${window.location.origin}${base}`;
  }

  function withPhotos(cardapio) {
    const uploadsBase = `${frontendBase()}/uploads`;
    return cardapio.map((categoria) => ({
      ...categoria,
      pratos: categoria.pratos.map((prato) => ({
        ...prato,
        foto_url: prato.foto ? `${uploadsBase}/${prato.foto}` : null
      }))
    }));
  }

  function buildRankings(orders) {
    const totals = {};
    orders.forEach((order) => {
      order.itens.forEach((item) => {
        totals[item.nome_prato] = (totals[item.nome_prato] || 0) + item.quantidade;
      });
    });
    return Object.entries(totals)
      .map(([nome_prato, total_vendido]) => ({ nome_prato, total_vendido }))
      .sort((a, b) => b.total_vendido - a.total_vendido);
  }

  function buildDashboard(orders) {
    const hoje = orders.filter((order) => order.criado_em.startsWith('2026-03-24'));
    const semana = orders.filter((order) => order.criado_em >= '2026-03-18');
    const totalHoje = hoje.reduce((sum, order) => sum + order.total, 0);
    const totalSemana = semana.reduce((sum, order) => sum + order.total, 0);
    const totalMes = orders.reduce((sum, order) => sum + order.total, 0);
    const ticketMedio = orders.length ? totalMes / orders.length : 0;
    const pagamentos = {};
    orders.forEach((order) => {
      pagamentos[order.forma_pagamento || 'nao informado'] = (pagamentos[order.forma_pagamento || 'nao informado'] || 0) + 1;
    });

    return {
      resumo: {
        hoje: { valor: totalHoje, pedidos: hoje.length },
        semana: { valor: totalSemana, pedidos: semana.length },
        mes: { valor: totalMes, pedidos: orders.length },
        ticket_medio: ticketMedio
      },
      rankings: {
        pratos: buildRankings(orders)
      },
      pedidos_recentes: clone(orders.slice(0, 4)),
      graficos: {
        fat_7_dias: [
          { dia: '2026-03-18', valor: 142 },
          { dia: '2026-03-19', valor: 198 },
          { dia: '2026-03-20', valor: 231 },
          { dia: '2026-03-21', valor: 276 },
          { dia: '2026-03-22', valor: 244 },
          { dia: '2026-03-23', valor: 109 },
          { dia: '2026-03-24', valor: totalHoje }
        ],
        por_pagamento: Object.entries(pagamentos).map(([forma_pagamento, quantidade]) => ({ forma_pagamento, quantidade }))
      },
      operacao: {
        estoque: {
          ativos: demoEstoque.length,
          abaixo_minimo: demoEstoque.filter((item) => item.estoque_atual <= item.estoque_minimo).length,
          zerados: demoEstoque.filter((item) => item.estoque_atual <= 0).length
        },
        caixa: clone(demoCaixas[0])
      }
    };
  }

  function categoriasFrom(cardapio) {
    return cardapio.map(({ pratos, ...categoria }) => categoria);
  }

  function pratosFrom(cardapio) {
    return cardapio.flatMap((categoria) =>
      categoria.pratos.map((prato) => ({
        ...prato,
        categoria_nome: categoria.nome
      }))
    );
  }

  const api = {
    admin: { nome: 'Administrador Demo', email: 'admin@amarocafe.com.br' },
    get cardapio() {
      return clone(withPhotos(demoCardapio));
    },
    get categorias() {
      return clone(categoriasFrom(withPhotos(demoCardapio)));
    },
    get pratos() {
      return clone(pratosFrom(withPhotos(demoCardapio)));
    },
    get mesas() {
      return Array.from({ length: 12 }, (_, index) => ({ numero: index + 1 }));
    },
    get estoqueResumo() {
      return {
        ativos: demoEstoque.length,
        abaixo_minimo: demoEstoque.filter((item) => item.estoque_atual <= item.estoque_minimo).length,
        zerados: demoEstoque.filter((item) => item.estoque_atual <= 0).length
      };
    },
    get estoqueInsumos() {
      return clone(demoEstoque);
    },
    get estoqueFichas() {
      return clone(demoFichas);
    },
    get caixaStatus() {
      return { aberto: true, caixa: clone(demoCaixas[0]) };
    },
    get caixaHistorico() {
      return clone(demoCaixas);
    },
    get caixaLancamentos() {
      return clone(demoCaixaLancamentos);
    },
    get fiscalConfig() {
      return clone(demoFiscalConfig);
    },
    get fiscalResumo() {
      return {
        resumo: {
          documentos: demoFiscalLancamentos.length,
          faturamento_bruto: demoFiscalLancamentos.reduce((sum, item) => sum + item.base_calculo, 0),
          impostos_estimados: demoFiscalLancamentos.reduce((sum, item) => sum + item.valor_imposto, 0),
          cancelados: demoFiscalLancamentos.filter((item) => item.situacao === 'cancelado').reduce((sum, item) => sum + item.base_calculo, 0)
        },
        por_pagamento: Object.entries(demoFiscalLancamentos.reduce((acc, item) => {
          const key = item.forma_pagamento || 'nao informado';
          acc[key] = acc[key] || { forma_pagamento: key, quantidade: 0, total: 0 };
          acc[key].quantidade += 1;
          acc[key].total += item.base_calculo;
          return acc;
        }, {})).map(([, value]) => value)
      };
    },
    get fiscalLancamentos() {
      return clone(demoFiscalLancamentos);
    },
    orders: clone(demoOrders),
    get dashboard() {
      return buildDashboard(this.orders);
    },
    get pedidosLista() {
      return clone(this.orders);
    },
    findPedido(id) {
      return clone(this.orders.find((order) => order.id === Number(id)));
    },
    updatePedidoStatus(id, status) {
      const pedido = this.orders.find((order) => order.id === Number(id));
      if (pedido) pedido.status = status;
      return { ok: true };
    }
  };

  window.AMARO_DEMO = api;
})();
