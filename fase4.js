/* Fase 4: divulgação, aprenda e formalização. Conteúdo educativo; a geração de textos pela IA entra na Fase 5. */
(() => {
D.campanhas = D.campanhas || [];
const J = () => D.jornada = D.jornada || { perfil: {}, ideia: {}, planejamento: {} };
const hoje = () => now().slice(0, 10);
const negocio = () => J().perfil.negocio || D.empresa?.nome || '[seu negócio]';

/* ---------- divulgação ---------- */
const CANAIS = ['Instagram', 'WhatsApp', 'Facebook', 'TikTok', 'Anúncios', 'Panfletos', 'Outros'];
const SCAMP = ['Planejada', 'Publicada', 'Concluída'];
const CCAMP = { Planejada: '#8b97a3', Publicada: '#0e9fc4', 'Concluída': '#1f9d55' };
const MOD = [
  ['Legenda de post (Instagram, Facebook, TikTok)', p => `✨ ${p.produto} ✨\n\n${p.desc || 'Feito com cuidado para você.'}\n\nValor: ${p.preco}\n\n👉 Chame no WhatsApp e faça seu pedido!\n${p.negocio}`],
  ['Mensagem de divulgação (WhatsApp)', p => `Olá! 😊 Aqui é da ${p.negocio}.\nEstou com ${p.produto} disponível por ${p.preco}.\nQuer fazer o seu pedido? É só me responder por aqui!`],
  ['Mensagem de promoção', p => `🔥 PROMOÇÃO ${p.negocio}!\n${p.produto} por ${p.preco}, por tempo limitado.\nGaranta o seu respondendo esta mensagem!`],
  ['Mensagem de pós-venda', p => `Olá! Aqui é da ${p.negocio}. 😊\nComo foi sua experiência com ${p.produto}? Sua opinião ajuda muito a gente a melhorar!\nSe gostou, indique para um amigo. Obrigado!`],
  ['Mensagem para reativar cliente', p => `Olá! Faz um tempinho que não conversamos. 😊\nA ${p.negocio} tem novidades, e ${p.produto} está por ${p.preco}.\nQuer dar uma olhada?`]];
const gera = (mi, pid) => {
  const pr = pid ? g('produtos', +pid) : null;
  return MOD[mi][1]({ produto: pr?.nome || '[seu produto]', preco: pr?.preco_venda != null ? $$(pr.preco_venda) : '[preço]', desc: pr?.descricao || '', negocio: negocio() });
};
const campanha = (c, texto) => {
  const v = c || { canal: 'Instagram', status: 'Planejada', data: hoje(), texto };
  dlg(c ? 'Editar campanha' : 'Nova campanha',
    F('Nome da campanha', 'titulo', v.titulo, 'text', 'required', 1) + F('Canal', 'canal', v.canal, 'select', CANAIS) +
    F('Produto', 'produto_id', v.produto_id, 'select', [['', '(nenhum)'], ...D.produtos.map(p => [p.id, p.nome])]) +
    F('Data', 'data', v.data, 'date') + F('Situação', 'status', v.status, 'select', SCAMP) +
    F('Texto da divulgação', 'texto', v.texto, 'area', '', 1) + F('Resultado / observações', 'resultado', v.resultado, 'area', '', 1), f => {
      const d = fd(f), o = { ...d, titulo: d.titulo.trim(), produto_id: d.produto_id ? +d.produto_id : null };
      if (c) Object.assign(c, o); else D.campanhas.push({ id: nid('campanhas'), ...o, criado_em: now() });
      commit('Campanha salva.');
    });
};
const DIV = {
  title: 'Divulgação', bar: () => '<button class="b p" data-a="n">Nova campanha</button>',
  list() {
    const L = D.campanhas.slice().sort((a, b) => (b.data || '').localeCompare(a.data || ''));
    st(`${L.length} campanha(s)`);
    return `<div class="cd" id="dv"><h3>Modelos de texto</h3><p class="hint">Escolha o modelo e o produto. O texto é preenchido com o nome e o preço cadastrados. Ajuste do seu jeito antes de usar.</p>
<div class="jf"><label>Modelo<select id="dv-mod">${MOD.map((m, i) => `<option value="${i}">${h(m[0])}</option>`).join('')}</select></label>
<label>Produto<select id="dv-prod"><option value="">—</option>${D.produtos.map(p => `<option value="${p.id}">${h(p.nome)}</option>`).join('')}</select></label>
<label>Texto<textarea id="dv-txt" rows="6">${h(gera(0, ''))}</textarea></label></div>
<div class="fa"><button type="button" class="b" data-a="copiar">Copiar texto</button><button type="button" class="b p" data-a="usar">Salvar como campanha</button></div></div>
<h2>Minhas campanhas</h2>` +
      T(['Campanha', 'Canal', 'Produto', 'Data', 'Situação', ''], L.map(c => [`<b>${h(c.titulo)}</b>`, h(c.canal), h(g('produtos', c.produto_id)?.nome || '-'), fdt(c.data),
        bd(c.status, CCAMP[c.status]), AC([['e', 'Editar'], ['x', 'Excluir']], c.id)]), 'Nenhuma campanha ainda. Crie a primeira a partir de um modelo acima.', [], () => '', 'tc');
  },
  n() { campanha() }, e(id) { campanha(g('campanhas', id)) },
  usar() { campanha(null, document.getElementById('dv-txt').value) },
  copiar() { navigator.clipboard?.writeText(document.getElementById('dv-txt').value).then(() => toast('Texto copiado!'), () => toast('Não foi possível copiar. Selecione o texto e copie manualmente.', { err: 1 })) },
  x(id) { const c = g('campanhas', id); del(`Campanha “${c?.titulo || ''}” excluída.`, ['campanhas'], () => { D.campanhas = D.campanhas.filter(c => c.id != id) }) }
};
document.addEventListener('change', e => {
  if (e.target.id == 'dv-mod' || e.target.id == 'dv-prod')
    document.getElementById('dv-txt').value = gera(+document.getElementById('dv-mod').value, document.getElementById('dv-prod').value);
});

/* ---------- checklists (salvos em D.jornada) ---------- */
const marcados = (bk, id) => new Set((J()[bk] || {})[id] || []);
const lista = (bk, id, itens) => { const m = marcados(bk, id); return `<ul class="ck">${itens.map((t, i) => `<li><label><input type="checkbox" data-ck="${bk}|${id}|${i}" ${m.has(i) ? 'checked' : ''}> ${h(t)}</label></li>`).join('')}</ul>` };
document.addEventListener('change', e => {
  const c = e.target.closest?.('[data-ck]'); if (!c) return;
  const [bk, id, i] = c.dataset.ck.split('|'), o = (J()[bk] ??= {}), a = new Set(o[id] || []);
  c.checked ? a.add(+i) : a.delete(+i); o[id] = [...a]; save();
  const d = c.closest('details'), ct = d?.querySelector('.ct');
  if (ct) ct.textContent = `${a.size}/${d.querySelectorAll('[data-ck]').length}`;
});

/* ---------- aprenda ---------- */
const LICOES = [
  ['comecando', 'Começando um negócio', 'Do primeiro passo ao primeiro cliente', 'Comece pequeno: defina para quem você vende, o que vende e por quanto. Teste com poucos clientes antes de investir dinheiro em estrutura.', 'Maria faz bolos. Antes de comprar embalagens personalizadas, ela vendeu para 5 conhecidas e perguntou o que podia melhorar.', ['Defini quem é meu cliente', 'Escolhi 1 ou 2 produtos para começar', 'Defini meu preço', 'Fiz minha primeira venda']],
  ['financas', 'Finanças', 'Separe o dinheiro do negócio do seu', 'Misturar contas faz você nunca saber se o negócio dá lucro. Anote toda entrada e toda saída e retire um valor fixo para você.', 'Se entraram R$ 2.000 e saíram R$ 1.200 em compras e gastos, o lucro foi R$ 800, e não R$ 2.000.', ['Anoto toda venda e toda despesa', 'Separei o dinheiro do negócio do pessoal', 'Defini quanto retiro para mim por mês', 'Guardo uma reserva para imprevistos']],
  ['marketing', 'Marketing', 'Divulgar sem gastar muito', 'Mostre o produto real com boa foto, fale com as pessoas onde elas já estão (WhatsApp, Instagram) e peça indicações a quem já comprou.', 'Postar 3 vezes por semana fotos do produto pronto e responder cada mensagem no mesmo dia já traz pedidos.', ['Tirei boas fotos dos meus produtos', 'Criei meu perfil no Instagram ou WhatsApp Business', 'Fiz minha primeira publicação', 'Pedi indicação a 3 clientes']],
  ['vendas', 'Vendas', 'Do primeiro contato ao fechamento', 'Vender é acompanhar: responda rápido, envie a proposta clara e volte a falar com quem não respondeu. Registre cada contato para não esquecer ninguém.', 'Um cliente pediu orçamento e sumiu. Uma mensagem educada 2 dias depois fechou a venda.', ['Registro cada cliente interessado', 'Respondo em até 1 dia', 'Faço acompanhamento depois da proposta', 'Anoto por que perdi uma venda']],
  ['atendimento', 'Atendimento', 'Atender bem e fazer o cliente voltar', 'Clientes voltam por causa do atendimento. Seja claro sobre prazo e preço, cumpra o combinado e pergunte depois da compra se deu tudo certo.', 'Avisar que o pedido atrasou 1 hora gera mais confiança do que deixar o cliente esperando sem resposta.', ['Informo prazo e preço antes de fechar', 'Cumpro o que combinei', 'Faço pós-venda com cada cliente', 'Resolvo reclamações com calma']],
  ['precificacao', 'Precificação', 'Como chegar no preço certo', 'Some todos os custos (produto, embalagem, entrega, taxas) e acrescente a margem de lucro. Copiar o concorrente sem saber seus custos pode dar prejuízo. Use a Calculadora de preço.', 'Custo total de R$ 12, taxa de 5% e margem de 30%: o preço sugerido fica perto de R$ 18,46.', ['Listei todos os custos de cada produto', 'Usei a calculadora de preço', 'Conferi a margem de cada produto', 'Revisei os preços no último trimestre']],
  ['organizacao', 'Organização', 'Uma rotina simples de organização', 'Reserve 15 minutos por dia para anotar vendas, responder clientes e ver as tarefas. Rotina curta e constante vale mais do que uma faxina grande de vez em quando.', 'Toda sexta, olhar as tarefas atrasadas e planejar a semana seguinte.', ['Defini um horário fixo para me organizar', 'Uso a lista de tarefas do sistema', 'Reviso minha semana toda sexta', 'Guardo comprovantes e notas']],
  ['formalizacao', 'Formalização', 'Por que e quando se formalizar', 'Formalizar dá CNPJ, permite emitir nota e dá acesso a benefícios previdenciários. Cada caso depende da atividade e do faturamento: veja a área Formalização e confirme nas fontes oficiais.', 'Quem quer vender para empresas ou abrir conta PJ costuma precisar de CNPJ.', ['Li a área Formalização', 'Conferi se minha atividade pode ser MEI', 'Decidi se vou me formalizar agora ou depois']],
  ['crescimento', 'Crescimento', 'Como crescer com segurança', 'Cresça por etapas: defina uma meta, aumente as vendas com o que já funciona e só então invista em mais estoque ou estrutura. Acompanhe o lucro, não só o faturamento.', 'Vender 20% mais para os mesmos clientes costuma ser mais barato do que conquistar clientes novos.', ['Defini uma meta de crescimento', 'Sei qual produto me dá mais lucro', 'Acompanho meu lucro todo mês', 'Tenho um plano para os próximos 3 meses']]];
const APR = {
  title: 'Aprenda', bar: () => `<select data-s="acat" aria-label="Categoria">${['Todas', ...LICOES.map(l => l[1])].map(c => op(c, S.acat || 'Todas')).join('')}</select>`,
  list() {
    const L = LICOES.filter(l => !S.acat || S.acat == 'Todas' || l[1] == S.acat), tot = LICOES.reduce((t, l) => t + l[5].length, 0),
      feitos = LICOES.reduce((t, l) => t + marcados('aprendizado', l[0]).size, 0);
    st(`${L.length} lição(ões)`);
    return `<div class="jh"><p>Seu progresso: <strong>${Math.round(feitos / tot * 100)}%</strong> dos itens marcados.</p></div>` + L.map(l =>
      `<details class="cd les"><summary><b>${h(l[2])}</b><small>${h(l[1])}</small><span class="ct">${marcados('aprendizado', l[0]).size}/${l[5].length}</span></summary>
<p>${h(l[3])}</p><p class="hint"><strong>Exemplo:</strong> ${h(l[4])}</p><h3>Checklist</h3>${lista('aprendizado', l[0], l[5])}</details>`).join('');
  }
};

/* ---------- formalização ---------- */
// Valores de 2026 reunidos em um só lugar para facilitar a atualização. Conferir sempre nas fontes oficiais.
const MEI = { ano: 2026, limite: 81000, sm: 1621, inss: 81.05, icms: 1, iss: 5 };
const ano = () => hoje().slice(0, 4);
const fatAno = () => D.negocios.filter(n => REC.includes(n.estagio) && (n.previsao_fechamento || n.atualizado_em || n.criado_em || '').slice(0, 4) == ano()).reduce((t, n) => t + (n.valor || 0), 0)
  + D.receitas.filter(r => (r.data || '').slice(0, 4) == ano()).reduce((t, r) => t + (r.valor || 0), 0);
const FCK = ['Conferi no Portal do Empreendedor se minha atividade pode ser MEI', 'Criei ou atualizei minha conta gov.br', 'Fiz meu cadastro como MEI (é gratuito)', 'Guardei meu CNPJ e o certificado de MEI',
  'Programei pagar o DAS todo mês (vence dia 20)', 'Anotei a data da declaração anual (31 de maio)'];
const sec = (t, html) => `<details class="cd les"><summary><b>${t}</b></summary>${html}</details>`;
const FOR = {
  title: 'Formalização', bar: () => '',
  list() {
    const fat = fatAno(), p = Math.min(100, Math.round(fat / MEI.limite * 100));
    return `<div class="cd aviso"><strong>Conteúdo educativo.</strong> Isto não é orientação jurídica ou contábil e não diz se você é obrigado a algo. Confirme sempre nas fontes oficiais:
<a href="https://www.gov.br/mei" target="_blank" rel="noopener">Portal do Empreendedor</a> e, para notas de serviço, <a href="https://www.gov.br/nfse" target="_blank" rel="noopener">gov.br/nfse</a>.</div>
<div class="cd"><h3>Seu faturamento em ${ano()} comparado ao teto do MEI</h3><p>${$$(fat)} de ${$$(MEI.limite)} (${p}%). Calculado pelo sistema com suas vendas ganhas e receitas do ano.</p>
<div class="pgb" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div>
${p >= 75 ? '<p><strong>Atenção:</strong> você já usou boa parte do limite anual. Se abriu o MEI neste ano, o limite é proporcional aos meses de atividade. Confirme no Portal.</p>' : ''}</div>
<h2>Entenda</h2>` +
      sec('O que é o MEI', '<p>É um jeito simples de ter CNPJ para quem trabalha por conta própria e fatura até o limite anual. A inscrição é gratuita, pelo Portal do Empreendedor, com conta gov.br. Nem todas as atividades podem ser MEI: existe uma lista oficial de ocupações permitidas.</p>') +
      sec('Quanto custa (valores de ' + MEI.ano + ')', `<p>O MEI paga uma guia mensal fixa (DAS), que não muda com o faturamento. Em ${MEI.ano}, com salário mínimo de ${$$(MEI.sm)}: INSS de ${$$(MEI.inss)} (5% do salário mínimo) mais ${$$(MEI.icms)} de ICMS (comércio e indústria) ou ${$$(MEI.iss)} de ISS (serviços). Vence todo dia 20 do mês seguinte.</p><p class="hint">Valores reunidos de fontes de informação em ${MEI.ano}; confirme o valor da sua guia no portal oficial.</p>`) +
      sec('Obrigações básicas', '<p>Pagar o DAS todo mês, entregar a declaração anual de faturamento (DASN-SIMEI, até 31 de maio) e guardar as notas de compras e vendas. Atrasos geram multa e juros e, se longos, podem levar ao cancelamento do CNPJ.</p>') +
      sec('Documentos e CNPJ', '<p>Para o cadastro você usa seus dados pessoais, o endereço do negócio e uma conta gov.br. O próprio portal informa o que mais for necessário no seu caso. Depois do cadastro, guarde o CNPJ e o certificado de MEI.</p>') +
      sec('Emissão de nota fiscal', '<p>As regras variam conforme a atividade e a cidade. Para serviços, existe o emissor nacional (gov.br/nfse); confirme com a sua prefeitura como funciona onde você atua. Vendas para empresas costumam exigir nota.</p>') +
      sec('Cuidados básicos', '<p>Não misture o dinheiro do negócio com o pessoal, acompanhe o faturamento mês a mês e fique atento ao limite anual: ultrapassar o teto exige mudar de enquadramento, e as regras dependem de quanto foi o excesso.</p>') +
      `<h2>Meu passo a passo</h2><details class="cd les" open><summary><b>Checklist de formalização</b><span class="ct">${marcados('formalizacao', 'mei').size}/${FCK.length}</span></summary>${lista('formalizacao', 'mei', FCK)}</details>`;
  }
};

/* ---------- menu: depois de Relatórios ---------- */
const ordem = Object.entries(V);
ordem.splice(ordem.findIndex(([k]) => k == 'relatorios') + 1, 0, ['divulgacao', DIV], ['aprenda', APR], ['formalizacao', FOR]);
Object.keys(V).forEach(k => delete V[k]);
Object.assign(V, Object.fromEntries(ordem));
ICO.divulgacao = '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1zM16 9a4 4 0 0 1 0 6"/>';
ICO.aprenda = '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13"/>';
ICO.formalizacao = '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4"/>';
FABL.divulgacao = 'Nova campanha';
})();
