/* Fase 3: finanças, calculadora de preço e relatórios.
   Todos os valores são calculados aqui (JavaScript). A IA, nas próximas fases, só interpreta. */
(() => {
D.receitas = D.receitas || []; D.despesas = D.despesas || [];
const CATR = ['Venda', 'Serviço', 'Encomenda', 'Outra receita'];
const CATD = ['Estoque / matéria-prima', 'Aluguel', 'Água, luz e internet', 'Transporte', 'Marketing', 'Ajudantes / salários', 'Impostos e taxas', 'Equipamentos', 'Outras'];
const FORMAS = ['Pix', 'Dinheiro', 'Cartão de débito', 'Cartão de crédito', 'Boleto', 'Transferência', 'Outra'];
const hoje = () => now().slice(0, 10);
const soma = L => L.reduce((t, x) => t + (x.valor || 0), 0);
const dtVenda = n => (n.previsao_fechamento || n.atualizado_em || n.criado_em || '').slice(0, 10);
const per = () => S.fmes || hoje().slice(0, 7);
const noPer = d => per() == 'todos' || (d || '').slice(0, 7) == per();

// vendas ganhas entram sozinhas como receita; receitas manuais somam a elas
const vendas = () => D.negocios.filter(n => REC.includes(n.estagio) && n.valor > 0).map(n => ({ auto: 1, data: dtVenda(n), descricao: n.titulo, valor: n.valor, categoria: 'Venda', forma: '-', contato_id: n.contato_id }));
const receitas = () => [...vendas(), ...D.receitas.map(r => ({ ...r, auto: 0 }))];

const meses = () => { const a = [], d = new Date(); for (let i = 0; i < 12; i++) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); a.push(x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0')) } return a };
const ml = k => { const [y, m] = k.split('-'); return new Date(+y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) };
const perSel = () => `<select data-s="fmes" aria-label="Período">${[['todos', 'Todo o período'], ...meses().map(k => [k, ml(k)])].map(x => op(x, per())).join('')}</select>`;
const perTxt = () => per() == 'todos' ? 'todo o período' : ml(per());
const cards = L => `<div class="fgrid">${L.map(([t, v, c]) => `<div class="cd"><span>${t}</span><b${c ? ` style="color:${c}"` : ''}>${v}</b></div>`).join('')}</div>`;
const cor = v => v < 0 ? '#d9531e' : '#1f9d55';

/* ---------- finanças ---------- */
const chart = () => {
  const R = receitas(), ms = meses().slice(0, 6).reverse(),
    dat = ms.map(k => ({ k, r: soma(R.filter(x => (x.data || '').slice(0, 7) == k)), d: soma(D.despesas.filter(x => (x.data || '').slice(0, 7) == k)) })),
    mx = Math.max(1, ...dat.flatMap(x => [x.r, x.d]));
  return `<div class="cd"><h3>Evolução dos últimos 6 meses</h3><div class="fch" role="img" aria-label="Receitas e despesas por mês: ${dat.map(x => `${ml(x.k)}, receitas ${$$(x.r)}, despesas ${$$(x.d)}`).join('; ')}">${dat.map(x =>
    `<div class="fm"><div class="fb2"><i class="r" style="height:${x.r / mx * 100}%" title="Receitas ${$$(x.r)}"></i><i class="d" style="height:${x.d / mx * 100}%" title="Despesas ${$$(x.d)}"></i></div><small>${ml(x.k)}</small></div>`).join('')}</div>
    <p class="leg"><span class="r"></span> Receitas &nbsp; <span class="d"></span> Despesas</p></div>`;
};

const lanc = (m, tipo) => {
  const v = m || (tipo == 'r' ? { categoria: 'Venda', forma: 'Pix' } : { categoria: CATD[0], tipo: 'Variável' }), r = tipo == 'r';
  dlg(m ? (r ? 'Editar receita' : 'Editar despesa') : (r ? 'Nova receita' : 'Nova despesa'),
    F('Descrição', 'descricao', v.descricao, 'text', 'required', 1) +
    F('Valor (R$)', 'valor', v.valor != null ? mny(v.valor) : '', 'text', 'required inputmode="decimal" data-m="brl" placeholder="0,00"') +
    F('Data', 'data', v.data || hoje(), 'date', 'required') +
    F('Categoria', 'categoria', v.categoria, 'select', r ? CATR : CATD) +
    (r ? F('Forma de pagamento', 'forma', v.forma, 'select', FORMAS) + CB('Cliente (opcional)', 'contato_id', v.contato_id)
      : F('Tipo', 'tipo', v.tipo, 'select', ['Fixa', 'Variável']) + F('Fornecedor (opcional)', 'fornecedor', v.fornecedor)), f => {
      const d = fd(f), val = num(d.valor);
      if (val == null || isNaN(val) || val <= 0) return ferr(f.valor, 'Informe um valor maior que zero (ex: 49,90).');
      const o = { ...d, descricao: d.descricao.trim(), valor: val };
      if (r) o.contato_id = d.contato_id ? +d.contato_id : null; else o.fornecedor = (d.fornecedor || '').trim();
      const t = r ? 'receitas' : 'despesas';
      if (m) Object.assign(m, o); else D[t].push({ id: nid(t), ...o, criado_em: now() });
      commit(r ? 'Receita salva.' : 'Despesa salva.');
    });
};

const FIN = {
  title: 'Finanças',
  bar: () => `${perSel()}<button class="b p" data-a="nr">Nova receita</button><button class="b" data-a="nd">Nova despesa</button>`,
  list() {
    const R = receitas().filter(x => noPer(x.data)).sort((a, b) => (b.data || '').localeCompare(a.data || '')),
      Dp = D.despesas.filter(x => noPer(x.data)).sort((a, b) => (b.data || '').localeCompare(a.data || '')),
      fat = soma(R), des = soma(Dp), lucro = fat - des, saldo = soma(receitas()) - soma(D.despesas);
    st(`${R.length} receita(s) e ${Dp.length} despesa(s) em ${perTxt()}`);
    return cards([['Faturamento', $$(fat)], ['Despesas', $$(des)], ['Lucro do período', $$(lucro), cor(lucro)],
      ['Saldo acumulado', $$(saldo), cor(saldo)], ['Ticket médio', R.length ? $$(fat / R.length) : '-']]) + chart() +
      '<h2>Receitas</h2><p class="hint">As vendas ganhas entram aqui automaticamente. Para alterá-las, edite a venda em Vendas.</p>' +
      T(['Data', 'Descrição', 'Categoria', 'Pagamento', 'Valor', ''], R.map(x => [fdt(x.data), h(x.descricao), h(x.categoria), h(x.forma),
        $$(x.valor), x.auto ? '<small>automática</small>' : AC([['er', 'Editar'], ['xr', 'Excluir']], x.id)]), 'Nenhuma receita neste período.', [4], () => '', 'tc') +
      '<h2>Despesas</h2>' +
      T(['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', ''], Dp.map(x => [fdt(x.data), h(x.descricao), h(x.categoria), h(x.tipo),
        $$(x.valor), AC([['ed', 'Editar'], ['xd', 'Excluir']], x.id)]), 'Nenhuma despesa neste período.', [4], () => '', 'tc');
  },
  nr() { lanc(null, 'r') }, nd() { lanc(null, 'd') },
  er(id) { lanc(g('receitas', id), 'r') }, ed(id) { lanc(g('despesas', id), 'd') },
  xr(id) { const x = g('receitas', id); del(`Receita “${x?.descricao || ''}” excluída.`, ['receitas'], () => { D.receitas = D.receitas.filter(r => r.id != id) }) },
  xd(id) { const x = g('despesas', id); del(`Despesa “${x?.descricao || ''}” excluída.`, ['despesas'], () => { D.despesas = D.despesas.filter(r => r.id != id) }) },
  n() { this.nr() }
};

/* ---------- calculadora de preço ---------- */
const CALC = {
  title: 'Calculadora de preço', bar: () => '',
  list() {
    return `<div class="cd" id="calc"><p class="hint">Descubra por quanto vender para ter lucro. Os cálculos são feitos pelo sistema.</p><div class="jf">
<label>Usar o custo de um produto cadastrado (opcional)<select id="cp"><option value="">—</option>${D.produtos.filter(p => p.preco_custo != null).map(p => `<option value="${p.id}">${h(p.nome)}</option>`).join('')}</select></label>
<label>Custo do produto (R$)<input id="c1" data-m="brl" inputmode="decimal" placeholder="0,00"></label>
<label>Custos adicionais por unidade (R$), como embalagem e entrega<input id="c2" data-m="brl" inputmode="decimal" placeholder="0,00"></label>
<label>Impostos e taxas sobre a venda (%), como taxa da maquininha<input id="c3" inputmode="decimal" placeholder="0"></label>
<label>Margem de lucro desejada (%)<input id="c4" inputmode="decimal" placeholder="30"></label>
<label>Preço que você pretende cobrar (R$), opcional<input id="c5" data-m="brl" inputmode="decimal" placeholder="0,00"></label></div></div>
<div class="cd" id="cr" aria-live="polite"><p>Preencha o custo do produto para ver o preço sugerido.</p></div>`;
  }
};
const calc = () => {
  const q = i => document.getElementById(i);
  if (!q('cr')) return;
  const v = i => { const x = num(q(i).value); return x == null || isNaN(x) ? 0 : x };
  const c = v('c1') + v('c2'), t = v('c3'), m = v('c4'), p5 = v('c5'), out = q('cr');
  if (!c) { out.innerHTML = '<p>Preencha o custo do produto para ver o preço sugerido.</p>'; return; }
  if (t + m >= 100) { out.innerHTML = '<p>Impostos/taxas e margem somam 100% ou mais. Reduza um deles.</p>'; return; }
  const preco = c / (1 - (t + m) / 100), lucro = preco * (1 - t / 100) - c;
  let html = cards([['Custo total', $$(c)], ['Preço sugerido', $$(preco)], ['Lucro por unidade', $$(lucro), cor(lucro)], ['Margem', fq(m.toFixed(1)) + '%']]) +
    `<p>Se você vender por <strong>${$$(preco)}</strong>, terá aproximadamente <strong>${$$(lucro)}</strong> de lucro por unidade.</p>`;
  if (p5 > 0) {
    const l5 = p5 * (1 - t / 100) - c;
    html += `<p>Cobrando <strong>${$$(p5)}</strong>, o lucro é de aproximadamente <strong style="color:${cor(l5)}">${$$(l5)}</strong> por unidade (margem de ${fq((l5 / p5 * 100).toFixed(1))}%).${l5 < 0 ? ' Você teria prejuízo nesse preço.' : ''}</p>`;
  }
  out.innerHTML = html;
};
document.addEventListener('input', e => { if (e.target.closest('#calc')) calc() });
document.addEventListener('change', e => {
  if (e.target.id != 'cp') return;
  const p = g('produtos', +e.target.value);
  document.getElementById('c1').value = p ? mny(p.preco_custo) : '';
  calc();
});

/* ---------- relatórios ---------- */
const agrupa = (L, k) => { const m = {}; L.forEach(x => { const c = x[k] || 'Sem categoria'; (m[c] ??= { q: 0, v: 0 }); m[c].q++; m[c].v += x.valor || 0 }); return Object.entries(m).sort((a, b) => b[1].v - a[1].v) };
const REL = {
  title: 'Relatórios', bar: () => perSel(),
  list() {
    const R = receitas().filter(x => noPer(x.data)), Dp = D.despesas.filter(x => noPer(x.data)),
      ne = D.negocios.filter(n => noPer(dtVenda(n)) || per() == 'todos'),
      novos = D.contatos.filter(c => per() == 'todos' || (c.criado_em || '').slice(0, 7) == per()),
      etapas = {}; D.negocios.forEach(n => { (etapas[n.estagio] ??= { q: 0, v: 0 }); etapas[n.estagio].q++; etapas[n.estagio].v += n.valor || 0 });
    const gan = D.negocios.filter(n => REC.includes(n.estagio) && noPer(dtVenda(n)));
    st(`Relatório de ${perTxt()}`);
    const tb = (cab, L, vazio) => T(cab, L, vazio, [1, 2], () => '', 'tc');
    return `<h2>Resumo de ${h(perTxt())}</h2>` +
      cards([['Vendas ganhas', gan.length], ['Valor vendido', $$(soma(gan))], ['Clientes novos', novos.length], ['Lucro', $$(soma(R) - soma(Dp)), cor(soma(R) - soma(Dp))]]) +
      '<h2>Receitas por categoria</h2>' + tb(['Categoria', 'Lançamentos', 'Total'], agrupa(R, 'categoria').map(([c, o]) => [h(c), o.q, $$(o.v)]), 'Sem receitas no período.') +
      '<h2>Despesas por categoria</h2>' + tb(['Categoria', 'Lançamentos', 'Total'], agrupa(Dp, 'categoria').map(([c, o]) => [h(c), o.q, $$(o.v)]), 'Sem despesas no período.') +
      '<h2>Vendas por etapa (todas as vendas cadastradas)</h2>' + tb(['Etapa', 'Quantidade', 'Valor'], Object.entries(etapas).map(([c, o]) => [h(c), o.q, $$(o.v)]), 'Nenhuma venda cadastrada.');
  }
};

/* ---------- menu: depois de Metas ---------- */
const ordem = Object.entries(V);
ordem.splice(ordem.findIndex(([k]) => k == 'metas') + 1, 0, ['financas', FIN], ['calculadora', CALC], ['relatorios', REL]);
Object.keys(V).forEach(k => delete V[k]);
Object.assign(V, Object.fromEntries(ordem));
ICO.financas = '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5V8m0 8v1.5"/>';
ICO.calculadora = '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>';
ICO.relatorios = '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>';
FABL.financas = 'Nova receita';
})();
