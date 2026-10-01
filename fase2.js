/* Fase 2: produtos e serviços, clientes, vendas, tarefas e metas.
   Carrega depois do script.js e do jornada.js; reaproveita D, V, F, T, AC, bd, dlg, commit, del, srt, st, num, $$, fq, REC, FABL, ICO. */
(() => {
const UNI = ['un', 'kg', 'g', 'L', 'ml', 'm', 'caixa', 'pacote', 'hora', 'serviço'];
const PRIO = ['Alta', 'Média', 'Baixa'];
const CATT = ['Vendas', 'Clientes', 'Finanças', 'Divulgação', 'Organização', 'Outro'];
const PRI = { Alta: '#d9531e', 'Média': '#c9a20a', Baixa: '#8b97a3' };
// margem calculada pelo sistema: (venda - custo) / venda
const MARG = p => p.preco_venda > 0 && p.preco_custo != null ? (p.preco_venda - p.preco_custo) / p.preco_venda * 100 : null;
const MGM = p => MARG(p) == null ? '-' : fq(MARG(p).toFixed(1)) + '%';
const ESQ = p => p.estoque == null ? '-' : fq(p.estoque) + ' ' + (p.unidade || 'un');
Object.assign(window, { UNI, PRIO, CATT, PRI, MARG, MGM, ESQ });

/* ---------- metas ---------- */
const TM = [['vendas', 'Vendas (nº de vendas ganhas)'], ['faturamento', 'Faturamento (R$)'], ['clientes', 'Clientes novos'],
  ['produtos', 'Produtos cadastrados'], ['divulgacao', 'Divulgação (manual)'], ['organizacao', 'Organização (manual)'], ['crescimento', 'Crescimento (manual)']];
const AUTO = ['vendas', 'faturamento', 'clientes', 'produtos'];
const tn = k => (TM.find(x => x[0] == k) || [, k])[1].replace(/ \(.*\)/, '');
const hoje = () => now().slice(0, 10);
const dentro = (d, m) => { d = (d || '').slice(0, 10); return !!d && d >= m.inicio && (!m.prazo || d <= m.prazo) };
const dtVenda = n => n.previsao_fechamento || n.atualizado_em || n.criado_em;
const atual = m => {
  if (m.tipo == 'vendas') return D.negocios.filter(n => REC.includes(n.estagio) && dentro(dtVenda(n), m)).length;
  if (m.tipo == 'faturamento') return D.negocios.filter(n => REC.includes(n.estagio) && dentro(dtVenda(n), m)).reduce((t, n) => t + (n.valor || 0), 0);
  if (m.tipo == 'clientes') return D.contatos.filter(c => dentro(c.criado_em, m)).length;
  if (m.tipo == 'produtos') return D.produtos.filter(p => dentro(p.criado_em, m)).length;
  return +m.atual || 0;
};
const pct = m => m.alvo > 0 ? Math.min(100, Math.round(atual(m) / m.alvo * 100)) : 0;
const sit = m => pct(m) >= 100 ? 'Concluída' : m.prazo && m.prazo < hoje() ? 'Atrasada' : 'Em andamento';
const CS = { 'Concluída': '#1f9d55', Atrasada: '#d9531e', 'Em andamento': '#0e9fc4' };
const vf = (m, v) => m.tipo == 'faturamento' ? $$(v) : fq(v);

const METAS = {
  title: 'Metas',
  bar: () => '<button class="b p" data-a="n">Nova meta</button>',
  list() {
    const L = srt(D.metas.slice(), { t: m => m.titulo, p: pct, pz: m => m.prazo || '', s: sit }, { k: 'pz', d: 1 });
    st(`${L.length} meta(s)`);
    return T([['Meta', 't'], 'Tipo', ['Progresso', 'p'], ['Prazo', 'pz'], ['Situação', 's'], ''],
      L.map(m => { const p = pct(m); return [`<b>${h(m.titulo)}</b>`, h(tn(m.tipo)),
        `<div class="mp"><i><u style="width:${p}%"></u></i><small>${vf(m, atual(m))} de ${vf(m, m.alvo)} · ${p}%</small></div>`,
        fdt(m.prazo), bd(sit(m), CS[sit(m)]), AC([['e', 'Editar'], ['x', 'Excluir']], m.id)]; }),
      'Nenhuma meta ainda. Exemplo: “Conquistar 20 clientes este mês”.', [], () => '', 'tc');
  },
  n() { this.form() },
  e(id) { this.form(g('metas', id)) },
  form(m) {
    const v = m || { tipo: 'clientes', inicio: hoje() };
    dlg(m ? 'Editar meta' : 'Nova meta',
      F('Meta (ex: Conquistar 20 clientes este mês)', 'titulo', v.titulo, 'text', 'required', 1) + F('Tipo', 'tipo', v.tipo, 'select', TM) +
      F('Valor da meta', 'alvo', v.alvo ?? '', 'text', 'required inputmode="decimal"') + F('Início', 'inicio', v.inicio, 'date') +
      F('Prazo', 'prazo', v.prazo, 'date', 'required') +
      F('Progresso atual (só para tipos manuais)', 'atual', v.atual ?? '', 'text', 'inputmode="decimal"') +
      '<p class="hint w">Vendas, faturamento, clientes e produtos são contados automaticamente a partir da data de início.</p>' +
      F('Observações', 'observacoes', v.observacoes, 'area', '', 1), f => {
        const d = fd(f), alvo = num(d.alvo), at = num(d.atual);
        if (alvo == null || isNaN(alvo) || alvo <= 0) return ferr(f.alvo, 'Informe um valor maior que zero.');
        if (isNaN(at)) return ferr(f.atual, 'Use apenas números.');
        if (d.prazo < d.inicio) return ferr(f.prazo, 'O prazo deve ser depois do início.');
        const o = { titulo: d.titulo.trim(), tipo: d.tipo, alvo, inicio: d.inicio, prazo: d.prazo, atual: AUTO.includes(d.tipo) ? null : (at || 0), observacoes: d.observacoes.trim() };
        if (m) Object.assign(m, o); else D.metas.push({ id: nid('metas'), ...o, criado_em: now() });
        commit('Meta salva.');
      });
  },
  x(id) { const m = g('metas', id); del(`Meta “${m?.titulo || ''}” excluída.`, ['metas'], () => { D.metas = D.metas.filter(m => m.id != id) }) }
};

/* ---------- clientes: resumo por tipo ---------- */
const bar0 = V.contatos.bar;
V.contatos.bar = () => {
  const c = s => D.contatos.filter(x => x.status == s).length,
    rec = new Set(D.negocios.filter(n => n.estagio == 'Cliente Recorrente' && n.contato_id != null).map(n => n.contato_id)).size;
  return `<span class="jres"><b>${c('Cliente')}</b> ativos · <b>${c('Inativo')}</b> inativos · <b>${c('Lead')}</b> leads · <b>${c('Prospect')}</b> prospects · <b>${rec}</b> recorrentes</span>` + bar0();
};

/* ---------- títulos novos, menu e botão + ---------- */
V.contatos.title = 'Clientes'; V.negocios.title = 'Vendas'; V.produtos.title = 'Produtos e serviços';
const ordem = Object.entries(V);
ordem.splice(ordem.findIndex(([k]) => k == 'tarefas') + 1, 0, ['metas', METAS]);
Object.keys(V).forEach(k => delete V[k]);
Object.assign(V, Object.fromEntries(ordem));
ICO.metas = '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>';
FABL.contatos = 'Novo cliente'; FABL.negocios = 'Nova venda'; FABL.metas = 'Nova meta';
D.metas = D.metas || [];
})();
