/* Jornada do Empreendedor – Fase 1.
   Carrega depois do script.js e reaproveita D, V, h, $, go, save, toast, ic, modal, ICO, MAIN, DO.
   Os dados ficam em D.jornada = {perfil, ideia, planejamento}, gravados na tabela meta. */
(() => {
const J = () => D.jornada = D.jornada || { perfil: {}, ideia: {}, planejamento: {} };
const cheios = (o, ks) => ks.filter(k => String(o?.[k] || '').trim()).length;

const PERFIL = [['nome', 'Seu nome'], ['negocio', 'Nome do negócio'], ['vende', 'Segmento / o que você vende'], ['area', 'Área de atuação'],
  ['cidade', 'Cidade / região'], ['publico', 'Público'], ['objetivo', 'Objetivo principal'], ['estagio', 'Estágio (ideia, começando, funcionando…)'],
  ['canais_venda', 'Canais de venda'], ['canais_div', 'Canais de divulgação']];
const IDEIA = [['nome', 'Nome da ideia', 'Ex.: Bolos caseiros da Maria'], ['problema', 'Que problema você quer resolver?'],
  ['publico', 'Para quem é? (seu público)'], ['oferta', 'O que você vai vender? (produto ou serviço)'],
  ['diferencial', 'O que te diferencia dos outros?'], ['objetivo', 'Qual é o seu objetivo?'], ['local', 'Onde você vai atuar? (bairro, cidade, online)']];
const PLANO = [['objetivo', 'Objetivo do negócio'], ['publico', 'Público-alvo'], ['proposta', 'Proposta de valor (por que escolher você?)'],
  ['canais', 'Canais de venda'], ['concorrentes', 'Concorrentes'], ['diferenciais', 'Diferenciais'], ['metas', 'Metas iniciais'], ['acoes', 'Plano de ação (primeiros passos)']];

/* Progresso calculado pelo sistema (a IA nunca decide o percentual).
   [tela, emoji, nome, concluída?, em breve?, texto do próximo passo] */
const etapas = () => [
  ['ideia', '💡', 'Minha ideia', cheios(J().ideia, ['nome', 'problema', 'publico']) == 3, 0, 'Comece contando sua ideia: o que é, para quem e que problema resolve.'],
  ['planejamento', '📋', 'Planejamento', cheios(J().planejamento, PLANO.map(x => x[0])) >= 5, 0, 'Monte seu planejamento: objetivo, proposta de valor, canais e metas.'],
  ['produtos', '📦', 'Produtos e serviços', D.produtos.length > 0, 0, 'Cadastre seu primeiro produto ou serviço.'],
  ['contatos', '👥', 'Clientes', D.contatos.length > 0, 0, 'Cadastre seu primeiro cliente.'],
  ['financas', '💰', 'Finanças', false, 1], ['divulgacao', '📣', 'Divulgação', false, 1],
  ['formalizacao', '🏢', 'Formalização', false, 1], ['crescimento', '🚀', 'Crescimento', false, 1]];
window.JORNADA = { etapas, percentual: () => { const e = etapas(); return Math.round(e.filter(x => x[3]).length / e.length * 100) } };

const form = (campos, dados, dica) => `<p class="hint">${dica}</p><div class="jf">${campos.map(([n, l, ph]) =>
  `<label>${l}<textarea name="${n}" rows="2" placeholder="${h(ph || '')}">${h(dados[n])}</textarea></label>`).join('')}</div>
  <div class="fa"><button type="button" class="b p" data-a="sv">Salvar</button></div>`;
const gravar = chave => {
  const o = {};
  document.querySelectorAll('#view textarea[name]').forEach(t => o[t.name] = t.value.trim());
  J()[chave] = chave == 'perfil' ? { ...J().perfil, ...o } : o;
  save(); toast('Salvo! Veja seu progresso na tela Início.');
};

const NV = {
  inicio: { title: 'Início', bar: () => '', list() {
    const p = J().perfil, e = etapas(), ok = e.filter(x => x[3]).length, pc = Math.round(ok / e.length * 100),
      pr = e.find(x => !x[3] && !x[4]), atual = e.find(x => !x[3]);
    return `<div class="jh"><h2>Olá, ${h(p.nome || 'empreendedor(a)')}! 👋</h2>
<p>${h(p.negocio || 'Seu negócio')} está <strong>${pc}% organizado</strong>.${atual ? ` Etapa atual: ${atual[1]} ${atual[2]}.` : ''}</p>
<div class="pgb" role="progressbar" aria-valuenow="${pc}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pc}%"></i></div></div>
<div class="cd jp"><h3>Seu próximo passo</h3>${pr ? `<p>${h(pr[5])}</p><button type="button" class="b p" data-go="${pr[0]}">Começar agora</button>`
      : '<p>Você concluiu tudo o que está disponível por enquanto. Finanças, divulgação e formalização chegam nas próximas fases.</p>'}</div>
<h2>Minha jornada</h2><div class="cd jl">${e.map(x => {
      const c = x[3] ? 'ok' : x === pr ? 'nx' : '', m = x[3] ? '✓' : x === pr ? '→' : '○';
      return x[4] ? `<div class="jr em"><span class="ji">${m}</span>${x[1]} ${x[2]}<small>em breve</small></div>`
        : `<button type="button" class="jr ${c}" data-go="${x[0]}"><span class="ji">${m}</span>${x[1]} ${x[2]}</button>`;
    }).join('')}</div>`;
  } },
  ideia: { title: 'Minha ideia', bar: () => '', list: () => form(IDEIA, J().ideia, 'Escreva do seu jeito. Não precisa estar perfeito: você pode melhorar depois.'), sv: () => gravar('ideia') },
  planejamento: { title: 'Planejamento', bar: () => '', list: () => form(PLANO, J().planejamento, 'Preencha pelo menos 5 campos para concluir esta etapa.'), sv: () => gravar('planejamento') },
  perfil: { title: 'Perfil do negócio', bar: () => '', list: () => form(PERFIL, J().perfil, 'Estas informações personalizam a sua experiência.'), sv: () => gravar('perfil') }
};
// novas telas primeiro no menu; o CRM existente continua inteiro logo abaixo
const resto = { ...V };
Object.keys(V).forEach(k => delete V[k]);
Object.assign(V, NV, resto);
V.dashboard.title = 'Painel de vendas';
ICO.inicio = ICO.dashboard; ICO.planejamento = ICO.tarefas; ICO.perfil = ICO.empresa;
ICO.ideia = '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>';
MAIN.splice(0, 1, 'inicio');
DO.more = () => modal('Mais', `<div class="w sh">${['ideia', 'planejamento', 'perfil', 'metas', 'dashboard', 'produtos', 'top', 'empresa', 'backup'].map(k =>
  `<button type="button" class="b" data-go="${k}">${ic(k)}${V[k].title}</button>`).join('')}<button type="button" class="b" data-do="tema">${themeLbl()}</button></div>`, []);

/* ---------- onboarding (primeiro acesso) ---------- */
const onboarding = () => {
  document.body.insertAdjacentHTML('beforeend', `<dialog id="onb"><form class="onb"><h2>Vamos começar! 👋</h2>
<p class="hint">6 perguntas rápidas. Você pode mudar tudo depois.</p>
<label>1. Qual é o seu nome?<input name="nome" required autocomplete="given-name"></label>
<label>2. Você já possui um negócio?<select name="tem"><option>Sim, já tenho</option><option>Ainda não, tenho uma ideia</option></select></label>
<label>3. Qual é o nome do negócio?<input name="negocio" value="${h(D.empresa?.nome || '')}" placeholder="Se ainda não tem, pode deixar em branco"></label>
<label>4. O que você vende?<input name="vende" required></label>
<label>5. Em qual área atua?<input name="area" placeholder="Ex.: alimentação, beleza, gráfica"></label>
<label>6. Qual é o seu principal objetivo?<input name="objetivo" required></label>
<div class="fa"><button class="b p">Começar</button></div></form></dialog>`);
  const d = $('#onb');
  d.addEventListener('cancel', e => e.preventDefault());
  d.querySelector('form').onsubmit = e => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(e.target).entries());
    Object.keys(o).forEach(k => o[k] = o[k].trim());
    J().perfil = { ...o, estagio: o.tem.startsWith('Sim') ? 'Negócio funcionando' : 'Ideia' };
    if (!D.empresa?.nome && o.negocio) D.empresa = { ...D.empresa, nome: o.negocio };
    if (!cheios(J().ideia, IDEIA.map(x => x[0]))) J().ideia = { oferta: o.vende, objetivo: o.objetivo };
    save(); d.close(); d.remove(); go('inicio');
    toast('Ótimo! Já tenho uma ideia de onde você está. Vamos organizar seu negócio passo a passo.');
  };
  d.showModal();
};

const boot0 = window.boot;
window.boot = async () => {
  await boot0();
  if (!window.FB?.carregado) return; // falha ao carregar: o script.js já mostrou o aviso
  if (!J().perfil.nome) { go('inicio'); onboarding(); } else go('inicio');
};
})();
