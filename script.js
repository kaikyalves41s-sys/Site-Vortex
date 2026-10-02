const STG=["Novo","Contato Feito","Proposta Enviada","Em Negociação","Ganho","Cliente Recorrente","Perdido"],
COR=["#0e9fc4","#3b6fd8","#c9a20a","#d9531e","#1f9d55","#0b7a62","#8b97a3"],REC=["Ganho","Cliente Recorrente"],
SCT=["Lead","Prospect","Cliente","Inativo"],TIP=["Ligação","Reunião","E-mail","Follow-up","Outro"],
FPG=["Dinheiro","Pix","Cartão de Crédito","Cartão de Débito","Boleto","Transferência","Outro"],
STT=["Pendente","Concluída","Cancelada"],ALL="Todas as categorias",SEM="(Sem categoria)",VER="2.1.0-html",APP="CRM Vorax",
CST={Lead:"#0e9fc4",Prospect:"#c9a20a",Cliente:"#1f9d55",Inativo:"#8b97a3"},CTS={Pendente:"#c9a20a","Concluída":"#1f9d55",Cancelada:"#8b97a3"},
MAIN=["dashboard","contatos","negocios","tarefas"],
ICO={dashboard:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
contatos:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
negocios:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
produtos:'<path d="M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>',
top:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
tarefas:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12l3 3 5-6"/>',
empresa:'<path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 10h5a1 1 0 0 1 1 1v10M2 21h20M8 8h2M8 12h2M8 16h2"/>',
backup:'<path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v3h16v-3"/>',
mais:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
sol:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
lua:'<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>'},
FABL={dashboard:"Criar novo",contatos:"Novo contato",negocios:"Novo negócio",tarefas:"Nova tarefa",produtos:"Novo produto"};
let D={contatos:[],negocios:[],tarefas:[],interacoes:[],produtos:[],negocio_produtos:[],metas:[],receitas:[],despesas:[],empresa:{}},S={},tm,pend=0,bad=0;
const $=s=>document.querySelector(s),
ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch{}},
h=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),
RF=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}),
RC=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact',maximumFractionDigits:1}),
$$=v=>v==null||v===''?'-':RF.format(v),
num=s=>{s=String(s??'').trim();if(!s)return null;if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');const n=Number(s);return isNaN(n)?NaN:n},
fq=q=>String(q).replace('.',','),now=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,19).replace('T',' '),
fdt=s=>/^\d{4}-\d\d-\d\d/.test(s||'')?s.slice(8,10)+'/'+s.slice(5,7)+'/'+s.slice(0,4):s||'',
g=(t,id)=>D[t].find(x=>x.id==id),nid=t=>Math.max(0,...D[t].map(x=>x.id))+1,fd=f=>Object.fromEntries(new FormData(f)),
pt=(a,b)=>(a||'').localeCompare(b||'','pt'),st=m=>$('#st').textContent=m,sum=L=>L.reduce((t,n)=>t+(n.valor||0),0),
cats=()=>[...new Map(D.produtos.map(p=>(p.categoria||'').trim()).filter(Boolean).map(c=>[c.toLowerCase(),c])).values()].sort(pt),
catOpts=()=>[ALL,...cats(),...(D.produtos.some(p=>!(p.categoria||'').trim())?[SEM]:[])],
dt=n=>!n.desconto?'-':n.tipo_desconto=='percentual'?n.desconto.toFixed(2).replace('.',',')+'%':$$(n.desconto),
bd=(t,c)=>t?`<span class="bd" style="--c:${c||'#8b97a3'}">${h(t)}</span>`:'-',
pill=s=>bd(s,COR[STG.indexOf(s)]),
prods=(q='',cat=ALL)=>{q=q.toLowerCase();return D.produtos.filter(p=>{const k=(p.categoria||'').trim();return(cat==ALL||(cat==SEM?!k:k.toLowerCase()==cat.toLowerCase()))&&(!q||`${p.nome} ${p.descricao||''} ${k}`.toLowerCase().includes(q))}).sort((a,b)=>{const x=(a.categoria||'').trim(),y=(b.categoria||'').trim();return(!x-!y)||pt(x,y)||pt(a.nome,b.nome)})},
op=(x,v)=>{const[a,b]=Array.isArray(x)?x:[x,x];return`<option value="${h(a)}"${a==(v??'')?' selected':''}>${h(b)}</option>`},
/* campo de formulário; "required" (ou " *" no fim do rótulo) marca o campo como obrigatório */
F=(l,n,v,t='text',o='',w)=>{const rq=(typeof o=='string'&&/\brequired\b/.test(o))||/ \*$/.test(l);l=l.replace(/ \*$/,'');return`<label class="${w?'w':''}">${l}${rq?'<span class="rq" aria-hidden="true"> *</span>':''}${t=='select'?`<select name="${n}">${o.map(x=>op(x,v)).join('')}</select>`:t=='area'?`<textarea name="${n}" rows="3">${h(v)}</textarea>`:`<input name="${n}" type="${t}" value="${h(v)}" ${o}>`}</label>`},
/* tabela: hd = texto ou [texto, chaveDeOrdenação]; wc = classe extra; at = atributos extras da linha */
T=(hd,rows,emp,right=[],cls=()=>'',wc='',at=()=>'')=>{const L=x=>Array.isArray(x)?x[0]:x,A=S.act||{};return`<div class="tw ${wc}"><table><thead><tr>${hd.map((x,i)=>{const k=Array.isArray(x)?x[1]:'';return`<th class="${right.includes(i)?'r':''}"${k&&A.k==k?` aria-sort="${A.d>0?'ascending':'descending'}"`:''}>${k?`<button type="button" class="sb" data-sort="${k}">${L(x)}<i>${A.k==k?(A.d>0?'▲':'▼'):''}</i></button>`:L(x)}</th>`}).join('')}</tr></thead><tbody>${rows.length?rows.map((r,j)=>`<tr class="${cls(j)}" ${at(j)}>${r.map((c,i)=>`<td class="${right.includes(i)?'r':''}" data-l="${L(hd[i])}">${c??''}</td>`).join('')}</tr>`).join(''):`<tr><td class="em" colspan="${hd.length}">${emp}</td></tr>`}</tbody></table></div>`},
srt=(L,acc,def)=>{const o=acc[S.so?.k]?S.so:def;S.act=o;const f=acc[o.k];return L.slice().sort((a,b)=>{const x=f(a),y=f(b);return o.d*(typeof x=='number'&&typeof y=='number'?x-y:pt(String(x??''),String(y??'')))})},
AC=(a,id)=>`<span class="ac">${a.map(([k,l])=>`<button type="button" data-a="${k}" data-id="${id}" class="${k=='x'?'x':k=='i'?'pi':''}">${l}</button>`).join('')}</span>`,
ic=k=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICO[k]||''}</svg>`;

/* ---------- máscaras e links de contato ---------- */
const dg=t=>String(t||'').replace(/\D/g,''),
mtel=v=>{if(/^\s*\+/.test(v))return'+'+dg(v).slice(0,15);const d=dg(v).slice(0,11);return!d?'':d.length<3?`(${d}`:d.length<7?`(${d.slice(0,2)}) ${d.slice(2)}`:d.length<11?`(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`:`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`},
mbrl=v=>{const d=String(v).replace(/\D/g,'').replace(/^0+(?=\d)/,'');if(!d)return'';const c=d.padStart(3,'0');return c.slice(0,-2).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+','+c.slice(-2)},
mcnpj=v=>dg(v).slice(0,14).replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2'),
MK={tel:mtel,brl:mbrl,cnpj:mcnpj},
mny=n=>n==null||isNaN(n)?'':mbrl(String(Math.round(n*100))),
ftel=t=>{t=String(t||'').trim();if(!t)return'';const p=t.startsWith('+'),d=dg(t);let n=d;if(p&&d.startsWith('55')&&d.length>=12)n=d.slice(2);else if(p)return t;return n.length==11?mtel(n):n.length==10?mtel(n):t},
wa=t=>{const d=dg(t);return d?'https://wa.me/'+(String(t).trim().startsWith('+')||d.length>11?d:'55'+d):''},
telH=t=>String(t||'').trim().startsWith('+')?'+'+dg(t):dg(t),
tel=t=>{t=String(t||'').trim();return!t?'-':`<a href="tel:${telH(t)}">${h(ftel(t))}</a>${dg(t)?` <a class="wa" href="${wa(t)}" target="_blank" rel="noopener">WhatsApp</a>`:''}`},
mail=e=>e?`<a href="mailto:${h(e)}">${h(e)}</a>`:'-',
qa=c=>[c.telefone&&dg(c.telefone)&&`<a class="b" href="tel:${telH(c.telefone)}">Ligar</a>`,c.telefone&&dg(c.telefone)&&`<a class="b" href="${wa(c.telefone)}" target="_blank" rel="noopener">WhatsApp</a>`,c.email&&`<a class="b" href="mailto:${h(c.email)}">E-mail</a>`].filter(Boolean).join(' ');

/* ---------- avisos (toast), erros de campo e status de sincronização ---------- */
function toast(m,o={}){let b=$('#ts');if(!b){b=document.createElement('div');b.id='ts';b.setAttribute('popover','manual');b.setAttribute('aria-live','polite');document.body.append(b)}
const t=document.createElement('div');t.className='ti'+(o.err?' te':'');const s=document.createElement('span');s.textContent=m;t.append(s);
if(o.undo){const u=document.createElement('button');u.type='button';u.textContent='Desfazer';u.onclick=()=>{t.remove();o.undo()};t.append(u)}
b.append(t);try{b.hidePopover();b.showPopover()}catch{}
setTimeout(()=>{t.remove();if(!b.children.length)try{b.hidePopover()}catch{}},o.undo?8e3:o.err?7e3:3500)}
const clr=el=>{el.removeAttribute?.('aria-invalid');(el.closest?.('label,.cbx')||el.parentNode)?.querySelectorAll(':scope>.er').forEach(x=>x.remove())},
ferr=(el,m,f=true)=>{clr(el);el.setAttribute('aria-invalid','true');const s=document.createElement('small');s.className='er';s.textContent=m;(el.closest('label,.cbx')||el.parentNode).append(s);f&&el.focus();return false},
sync=()=>{const e=$('#sy');if(!e)return;const off=!navigator.onLine;e.className='sy '+(off?'off':bad?'off':pend?'wt':'ok');e.textContent=off?(pend?'Sem conexão — será enviado ao reconectar':'Sem conexão — modo offline'):bad?'Erro ao salvar — tente de novo':pend?'Salvando…':'Salvo na nuvem'};
addEventListener('online',sync);addEventListener('offline',sync);
addEventListener('beforeunload',e=>{if(pend){e.preventDefault();e.returnValue=''}});

/* ---------- persistência ---------- */
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('crm_offline',1);r.onupgradeneeded=()=>r.result.createObjectStore('k');r.onsuccess=()=>ok(r.result);r.onerror=no});
const loadLocal=async()=>{try{const d=await idb();return await new Promise(ok=>{const q=d.transaction('k').objectStore('k').get('db');q.onsuccess=()=>ok(q.result);q.onerror=()=>ok()})}catch{}};
const save=()=>{clearTimeout(tm);pend++;sync();tm=setTimeout(async()=>{const n=pend;try{await window.FB.save(D);bad=0}catch(e){console.error(e);bad=1;toast('Não foi possível gravar na nuvem. Verifique a conexão e faça um backup agora.',{err:1})}pend-=n;sync()},50)};
const dl=(n,t,m)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:m}));a.download=n;a.click()};
const stamp=()=>now().replace(/\D/g,'').replace(/^(\d{8})/,'$1_');

/* ---------- janelas, impressão e desfazer ---------- */
function dlg(title,body,ok){const d=$('#dlg');d.oninput=null;d.innerHTML=`<form novalidate><h2>${title}</h2><div class="fb">${body}${/class="rq"/.test(body)?'<p class="w hint">* campo obrigatório</p>':''}</div><div class="fa"><button type="button" class="b" id="cx">Cancelar</button><button class="b p">Salvar</button></div></form>`;d.showModal();$('#cx').onclick=()=>d.close();
d.querySelector('form').onsubmit=e=>{e.preventDefault();const f=e.target;f.querySelectorAll('.er').forEach(x=>x.remove());f.querySelectorAll('[aria-invalid]').forEach(x=>x.removeAttribute('aria-invalid'));
const bd=[...f.elements].filter(x=>x.willValidate&&!x.checkValidity());if(bd.length){bd.forEach((x,i)=>ferr(x,x.validity.valueMissing?'Campo obrigatório.':x.validity.typeMismatch?'Informe um valor válido.':x.validationMessage,!i));return}
if(ok(f)!==false)d.close()}}
function modal(title,body,acts,id){const d=$('#dlg');d.oninput=null;d.innerHTML=`<h2>${title}</h2><div class="fb">${body}</div><div class="fa"><button type="button" class="b" id="cx">Fechar</button>${acts.map(([k,l])=>`<button type="button" class="b ${k=='x'?'dz':k=='e'?'p':''}" data-a="${k}" data-id="${id}">${l}</button>`).join('')}</div>`;d.showModal();$('#cx').onclick=()=>d.close()}
const commit=(m,u)=>{save();render();m&&toast(m,u?{undo:u}:{})};
/* exclui com opção de desfazer: guarda uma cópia só das coleções afetadas */
const del=(m,keys,fn)=>{const bk=Object.fromEntries(keys.map(k=>[k,structuredClone(D[k])]));fn();commit(m,()=>{Object.assign(D,bk);commit('Exclusão desfeita.')})};
const cab=()=>{const e=D.empresa||{};return`<div class="cab">${e.logo?`<img src="${e.logo}">`:''}<div><h1>${h(e.nome||'(Nome da empresa não configurado)')}</h1><p>${h(e.endereco)}</p>${e.cnpj?`<p>CNPJ: ${h(e.cnpj)}</p>`:''}${e.contato?`<p>Contato: ${h(e.contato)}</p>`:''}</div></div>`};
const PCSS=`body{font:13px Arial,sans-serif;color:#222;margin:30px}.cab{display:flex;align-items:center;gap:20px;border-bottom:3px solid #333;padding-bottom:14px;margin-bottom:18px}.cab img{max-height:90px;max-width:180px;object-fit:contain}h1{margin:0 0 6px;font-size:22px}p{margin:2px 0}h2{font-size:16px;margin:20px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 9px;text-align:left}th{background:#f0f0f0}.r{text-align:right;white-space:nowrap}tr.g td{background:#e4e4e4;font-weight:bold}.ft{margin-top:22px;font-size:11px;color:#888;text-align:right}.np{position:fixed;top:10px;right:10px;padding:8px 14px}@media print{.np{display:none}body{margin:10mm}}`;
function doc(title,body){const w=window.open('','_blank');if(!w)return toast('Permita pop-ups para este site e tente de novo.',{err:1});w.document.write(`<!DOCTYPE html><html lang="pt-BR"><meta charset="utf-8"><title>${h(title)}</title><style>${PCSS}</style><button class="np" onclick="print()">Imprimir / Salvar PDF</button>${cab()}${body}<div class="ft">Gerado por ${APP} em ${new Date().toLocaleString('pt-BR')}</div>`);w.document.close()}
const semEmpresa=()=>{if(!(D.empresa?.nome||'').trim())toast('Dica: configure os dados da empresa na aba Empresa para deixar a impressão mais profissional.')};

/* ---------- regras de negócio auxiliares ---------- */
let DIAS=+ls('crm_dias')||30;
const hoje=()=>now().slice(0,10),
atras=t=>t.status=='Pendente'&&t.data_prevista&&t.data_prevista<hoje(),
ab=n=>!REC.includes(n.estagio)&&n.estagio!='Perdido',
dias=n=>{const t=Date.parse(String(n.atualizado_em||n.criado_em||'').replace(' ','T'));return isNaN(t)?0:Math.floor((Date.now()-t)/864e5)},
parado=n=>ab(n)&&dias(n)>=DIAS,
filt=(n,e)=>e=='Todos'||(e=='Em aberto'?ab(n):e=='Ganhos'?REC.includes(n.estagio):e=='Parados'?parado(n):n.estagio==e),
cnome=id=>g('contatos',id)?.nome||'',
pnomes=n=>D.negocio_produtos.filter(x=>x.negocio_id==n.id).map(x=>(x.nome_produto||'Produto removido')+(x.quantidade!=1?` (x${fq(x.quantidade)})`:'')).join(', '),
csv=t=>{const r=[];let a=[''],q=0;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c=='"'){if(t[i+1]=='"'){a[a.length-1]+='"';i++}else q=0}else a[a.length-1]+=c}else if(c=='"')q=1;else if(c==','||c==';')a.push('');else if(c=='\n'){r.push(a);a=['']}else if(c!='\r')a[a.length-1]+=c}r.push(a);return r},
mover=(id,est)=>{const n=g('negocios',id);if(!n||n.estagio==est||!STG.includes(est))return;const o=n.estagio,u=n.atualizado_em;n.estagio=est;n.atualizado_em=now();commit(`“${n.titulo}” movido para ${est}.`,()=>{const x=g('negocios',id);if(x){x.estagio=o;x.atualizado_em=u;commit('Movimentação desfeita.')}})};

/* campo de contato com busca e sugestões */
const CB=(l,n,v,w)=>{const c=g('contatos',v);return`<div class="cbx ${w?'w':''}"><label for="cb_${n}">${l}</label><input id="cb_${n}" data-cb type="search" autocomplete="off" placeholder="Digite para buscar (nome, empresa ou telefone)" value="${h(c?c.nome:'')}" role="combobox" aria-expanded="false"><input type="hidden" name="${n}" value="${h(c?c.id:'')}"><ul class="cl" role="listbox" hidden></ul></div>`},
cbl=q=>{q=q.toLowerCase();return D.contatos.filter(c=>!q||[c.nome,c.empresa,c.telefone].some(v=>(v||'').toLowerCase().includes(q))).sort((a,b)=>pt(a.nome,b.nome)).slice(0,8)},
cbHide=w=>{w.querySelector('.cl').hidden=true;w.querySelector('[data-cb]').setAttribute('aria-expanded','false')},
cbShow=i=>{const w=i.closest('.cbx'),u=w.querySelector('.cl'),L=cbl(i.value.trim());u.innerHTML=L.length?L.map(c=>`<li role="option" tabindex="-1" data-id="${c.id}"><b>${h(c.nome)}</b><small>${h([c.empresa,ftel(c.telefone)].filter(Boolean).join(' · '))}</small></li>`).join(''):'<li class="no">Nenhum contato encontrado</li>';u.hidden=false;i.setAttribute('aria-expanded','true')},
cbPick=(w,id)=>{const c=g('contatos',id);w.querySelector('[data-cb]').value=c?c.nome:'';w.querySelector('[type=hidden]').value=c?c.id:'';cbHide(w)};

/* ---------- abas ---------- */
const V={
dashboard:{title:'Dashboard',bar:()=>`<label>Considerar negócio parado após <select data-s="dias">${[7,15,30,60,90].map(x=>op([x,x+' dias'],S.dias)).join('')}</select></label>`,list(){
 const N=D.negocios,s=a=>a.reduce((t,x)=>t+(x.valor||0),0);
 if(!D.contatos.length&&!N.length&&!D.produtos.length)return`<div class="cd"><b>Nenhum dado ainda</b><p>Importe seus dados na aba Backup (por exemplo, o arquivo crm_dados.json) ou comece cadastrando contatos e produtos.</p><button class="b p" data-go="backup">Ir para Backup</button></div>`;
 const atr=D.tarefas.filter(atras),par=N.filter(parado),
 K=[['Contatos',D.contatos.length,'contatos'],['Negócios',N.length,'negocios'],['Pipeline em aberto',$$(s(N.filter(ab))),'negocios',{est:'Em aberto'}],['Total ganho',$$(s(N.filter(x=>REC.includes(x.estagio)))),'negocios',{est:'Ganhos'}],['Clientes recorrentes',new Set(N.filter(x=>x.estagio=='Cliente Recorrente'&&x.contato_id).map(x=>x.contato_id)).size,'negocios',{est:'Cliente Recorrente'}],['Tarefas pendentes',D.tarefas.filter(x=>x.status=='Pendente').length,'tarefas',{stt:'Pendente'}],['Tarefas atrasadas',atr.length,'tarefas',{stt:'Atrasadas'},atr.length?'al':''],[`Negócios parados (+${DIAS} dias)`,par.length,'negocios',{est:'Parados'},par.length?'al':'']],
 M=[];for(let i=5;i>=0;i--){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-i);M.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'))}
 const gm=Object.fromEntries(M.map(m=>[m,0]));N.filter(x=>REC.includes(x.estagio)).forEach(x=>{const m=(x.previsao_fechamento||x.atualizado_em||x.criado_em||'').slice(0,7);if(m in gm)gm[m]+=x.valor||0});
 const mx=Math.max(...Object.values(gm)),lbl=m=>new Date(+m.slice(0,4),+m.slice(5)-1,1).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')+'/'+m.slice(2,4),
 ta=atr.slice().sort((a,b)=>a.data_prevista.localeCompare(b.data_prevista)).slice(0,5),np=par.slice().sort((a,b)=>dias(b)-dias(a)).slice(0,5);
 return`<div class="cards">${K.map(([l,v,t,p,c])=>`<button type="button" class="cd ${c||''}" data-go="${t}"${p?` data-set="${h(JSON.stringify(p))}"`:''}><b>${v}</b><span>${l}</span></button>`).join('')}</div>
<div class="two"><div class="cd"><h3>Tarefas atrasadas</h3>${ta.length?ta.map(t=>`<button type="button" class="li" data-a="et" data-id="${t.id}"><span>${h(t.titulo)}<small>${h(cnome(t.contato_id)||'Sem contato')}</small></span><em>${fdt(t.data_prevista)}</em></button>`).join('')+(atr.length>5?`<button type="button" class="b" data-go="tarefas" data-set="${h(JSON.stringify({stt:'Atrasadas'}))}">Ver todas (${atr.length})</button>`:''):'<p class="em">Nenhuma tarefa atrasada.</p>'}</div>
<div class="cd"><h3>Negócios parados há +${DIAS} dias</h3>${np.length?np.map(n=>`<button type="button" class="li" data-a="dn" data-id="${n.id}"><span>${h(n.titulo)}<small>${h(cnome(n.contato_id)||'Sem contato')} · ${$$(n.valor)}</small></span><em>${dias(n)} dias</em></button>`).join('')+(par.length>5?`<button type="button" class="b" data-go="negocios" data-set="${h(JSON.stringify({est:'Parados'}))}">Ver todos (${par.length})</button>`:''):'<p class="em">Nenhum negócio parado.</p>'}</div></div>
<h2>Ganhos por mês</h2><div class="cd">${mx>0?`<div class="gm">${M.map(m=>`<div title="${h($$(gm[m]))}"><em>${gm[m]?RC.format(gm[m]):''}</em><i style="height:${Math.max(gm[m]/mx*120,gm[m]?4:1)}px"></i><small>${lbl(m)}</small></div>`).join('')}</div><p class="nt">Últimos 6 meses (negócios Ganhos e Clientes Recorrentes, pela data de previsão de fechamento ou da última atualização).</p>`:'<p class="em">Nenhum negócio ganho nos últimos 6 meses.</p>'}</div>
<h2>Negócios por estágio</h2><div class="cd">${STG.map((e,i)=>{const q=N.filter(x=>x.estagio==e).length;return`<button type="button" class="sg" data-go="negocios" data-set="${h(JSON.stringify({est:e}))}"><span>${e}</span><i><u style="width:${q/Math.max(N.length,1)*100}%;background:${COR[i]}"></u></i><em>${q}</em></button>`}).join('')}</div>`},
et(id){V.tarefas.e(id)},dn(id){V.negocios.d(id)}},

contatos:{title:'Contatos',
bar:()=>`<input data-s="q" type="search" placeholder="Buscar nome, empresa, telefone ou e-mail" value="${h(S.q)}" aria-label="Buscar"><button class="b p" data-a="n">Novo contato</button><button class="b" data-a="imp">Importar CSV</button><button class="b" data-a="exp">Exportar CSV</button><select class="wsel" data-wa aria-label="Ao clicar em WhatsApp">${[['web','WhatsApp: abrir no navegador'],['app','WhatsApp: abrir app do computador'],['copiar','WhatsApp: só copiar o número']].map(x=>op(x,ls('crm_wa')||'web')).join('')}</select>`,
list(){const q=S.q.toLowerCase(),qd=dg(q),L=srt(D.contatos.filter(c=>!q||[c.nome,c.empresa,c.telefone,c.email].some(v=>(v||'').toLowerCase().includes(q))||(qd&&dg(c.telefone).includes(qd))),{n:c=>c.nome,e:c=>c.empresa,s:c=>c.status},{k:'n',d:1});st(`${L.length} contato(s) exibido(s)`);
 return T([['Nome','n'],['Empresa','e'],'Telefone','E-mail',['Status','s'],''],L.map(c=>[`<b>${h(c.nome)}</b>`,h(c.empresa),tel(c.telefone),mail(c.email),bd(c.status,CST[c.status]),AC([['i','Nova interação'],['e','Editar'],['x','Excluir']],c.id)]),'Nenhum contato encontrado.',[],()=>'','tc')},
form(c){const v=c||{status:'Lead'};dlg(c?'Editar contato':'Novo contato',F('Nome','nome',v.nome,'text','required',1)+F('Empresa','empresa',v.empresa)+F('Telefone','telefone',ftel(v.telefone),'tel','data-m="tel" autocomplete="off" inputmode="tel" placeholder="(00) 00000-0000"')+F('E-mail','email',v.email,'email')+F('WhatsApp (se for diferente do telefone)','whatsapp',ftel(v.whatsapp),'tel','data-m="tel" autocomplete="off" inputmode="tel" placeholder="(00) 00000-0000"')+F('Segmento (ex: Restaurante, Escola)','segmento',v.segmento)+F('Origem (ex: Indicação, Site)','origem',v.origem)+F('Status','status',v.status,'select',SCT)+F('Endereço','endereco',v.endereco,'text','',1)+F('Tags (separadas por vírgula)','tags',v.tags,'text','',1)+F('Observações','observacoes',v.observacoes,'area','',1),f=>{const d=fd(f);d.nome=d.nome.trim();if(c)Object.assign(c,d,{atualizado_em:now()});else D.contatos.push({id:nid('contatos'),...d,criado_em:now(),atualizado_em:now()});commit('Contato salvo.')})},
n(){this.form()},e(id){this.form(g('contatos',id))},
x(id){const c=g('contatos',id);del(`Contato “${c?.nome||''}” excluído. Negócios e tarefas dele ficaram sem contato.`,['contatos','interacoes','negocios','tarefas'],()=>{D.contatos=D.contatos.filter(c=>c.id!=id);D.interacoes=D.interacoes.filter(x=>x.contato_id!=id);[...D.negocios,...D.tarefas].forEach(x=>x.contato_id==id&&(x.contato_id=null))})},
i(id){const hist=D.interacoes.filter(x=>x.contato_id==id).sort((a,b)=>b.data.localeCompare(a.data)),c=g('contatos',id);dlg('Nova interação — '+h(cnome(id)),(c&&qa(c)?`<div class="w qa">${qa(c)}</div>`:'')+`<label class="w">Descreva o contato realizado (ligação, e-mail, reunião...)<span class="rq" aria-hidden="true"> *</span><textarea name="texto" rows="3" required></textarea></label><div class="w">${hist.length?hist.map(x=>`<p><small>${h(x.data)}</small><br>${h(x.texto)}</p>`).join(''):'<p class="em">Nenhuma interação registrada.</p>'}</div>`,f=>{const t=fd(f).texto.trim();if(!t)return ferr(f.texto,'Campo obrigatório.');D.interacoes.push({id:nid('interacoes'),contato_id:id,texto:t,data:now()});commit('Interação registrada no histórico do contato.')})},
imp(){const i=document.createElement('input');i.type='file';i.accept='.csv,.txt';i.onchange=async()=>{const rows=csv((await i.files[0].text()).replace(/^\uFEFF/,''));let ok=0,bad=[];rows.forEach((r,n)=>{if(!r[0]?.trim())return;let t=(r[1]||'').trim();t=(t.startsWith('+')?'+':'')+t.replace(/\D/g,'');const dg=t.replace('+','');if(t&&!(dg.length>=8&&dg.length<=15)){bad.push(`Linha ${n+1}: '${r[1]}'`);return}D.contatos.push({id:nid('contatos'),nome:r[0].trim(),telefone:t,email:(r[2]||'').trim(),empresa:(r[3]||'').trim(),status:'Lead',criado_em:now(),atualizado_em:now()});ok++});commit();
 modal('Importação concluída',`<div class="w"><p><b>${ok}</b> contato(s) importado(s) com sucesso.</p>${bad.length?`<p>${bad.length} número(s) inválido(s) ignorados:</p><p>${bad.slice(0,20).map(h).join('<br>')}</p>`:''}</div>`,[],0)};i.click()},
exp(){const R=[['nome','telefone','email','empresa','status','origem','observacoes'],...D.contatos.slice().sort((a,b)=>pt(a.nome,b.nome)).map(c=>[c.nome,c.telefone,c.email,c.empresa,c.status,c.origem,c.observacoes])];dl('contatos.csv','\uFEFF'+R.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(',')).join('\r\n'),'text/csv');toast('Contatos exportados para CSV.')}},

negocios:{title:'Negócios',
bar:()=>`<input data-s="q" type="search" placeholder="Buscar negócio, contato ou produto" value="${h(S.q)}" aria-label="Buscar">${S.vw=='quadro'?'':`<select data-s="est" aria-label="Estágio">${[['Todos','Todos os estágios'],['Em aberto','Em aberto'],['Ganhos','Ganhos e recorrentes'],['Parados',`Parados há +${DIAS} dias`],...STG].map(x=>op(x,S.est)).join('')}</select>`}<span class="seg"><button type="button" class="b ${S.vw!='quadro'?'on':''}" data-a="vw" data-v="lista">Lista</button><button type="button" class="b ${S.vw=='quadro'?'on':''}" data-a="vw" data-v="quadro">Quadro</button></span><button class="b p" data-a="n">Novo negócio</button>`,
vw(_,b){S.vw=b.dataset.v;ls('crm_vw',S.vw);render()},
list(){return S.vw=='quadro'?this.quadro():this.tabela()},
busca(n){const q=(S.q||'').toLowerCase();return!q||[n.titulo,cnome(n.contato_id),pnomes(n)].some(v=>(v||'').toLowerCase().includes(q))},
tabela(){const L=srt(D.negocios.filter(n=>filt(n,S.est)&&this.busca(n)),{t:n=>n.titulo,v:n=>n.valor||0,s:n=>STG.indexOf(n.estagio),p:n=>n.previsao_fechamento||'',c:n=>n.criado_em||''},{k:'c',d:-1});st(`${L.length} negócio(s) - Total: ${$$(sum(L))}`);
 return T([['Título','t'],['Valor','v'],['Estágio','s'],['Previsão','p'],''],L.map(n=>[`<div class="tt"><b>${h(n.titulo)}</b><small>${h(cnome(n.contato_id)||'Sem contato')}</small></div>`,$$(n.valor),pill(n.estagio),fdt(n.previsao_fechamento)||'-',AC([['e','Editar'],['x','Excluir']],n.id)]),'Nenhum negócio encontrado.',[1],()=>'','nb tc',j=>`data-open data-id="${L[j].id}"`)},
quadro(){const L=D.negocios.filter(n=>this.busca(n));st(`${L.length} negócio(s) - Total: ${$$(sum(L))} — arraste os cartões entre as colunas`);
 return`<div class="kb">${STG.map((e,i)=>{const C=L.filter(n=>n.estagio==e).sort((a,b)=>(b.criado_em||'').localeCompare(a.criado_em||''));return`<section class="kcol" data-e="${h(e)}" style="--c:${COR[i]}"><div class="kh"><b>${e}</b><span>${C.length}</span><small>${$$(sum(C))}</small></div><div class="kl">${C.map(n=>`<article class="kc" draggable="true" data-open data-id="${n.id}"><b>${h(n.titulo)}</b><span>${h(cnome(n.contato_id)||'Sem contato')}</span><div><strong>${$$(n.valor)}</strong><small>${fdt(n.previsao_fechamento)}</small></div><select class="mv" data-mv="${n.id}" aria-label="Mover para o estágio">${STG.map(x=>op(x,n.estagio)).join('')}</select></article>`).join('')||'<p class="em">Vazio</p>'}</div></section>`}).join('')}</div>`},
n(){this.form()},e(id){this.form(g('negocios',id))},
x(id){const n=g('negocios',id);del(`Negócio “${n?.titulo||''}” excluído.`,['negocios','negocio_produtos','tarefas'],()=>{D.negocios=D.negocios.filter(n=>n.id!=id);D.negocio_produtos=D.negocio_produtos.filter(x=>x.negocio_id!=id);D.tarefas.forEach(t=>t.negocio_id==id&&(t.negocio_id=null))})},
d(id){const n=g('negocios',id);if(!n)return;const c=g('contatos',n.contato_id),it=D.negocio_produtos.filter(x=>x.negocio_id==id),r=(a,b)=>b?`<div class="dr"><span>${a}</span><b>${b}</b></div>`:'';
 modal(h(n.titulo),`<div class="w dd">${r('Estágio',pill(n.estagio))+r('Valor final',$$(n.valor))+r('Valor dos produtos',n.valor_bruto?$$(n.valor_bruto):'')+r('Desconto',n.desconto?dt(n):'')+r('Pagamento',h(n.forma_pagamento))+r('Vendedor',h(n.vendedor))+r('Previsão de fechamento',fdt(n.previsao_fechamento))+r('Criado em',fdt(n.criado_em))}</div>`+
 `<div class="w"><b>Contato</b>${c?`<p>${h(c.nome)}${c.empresa?' — '+h(c.empresa):''}</p><div class="qa">${qa(c)}</div>`:'<p class="mu">Nenhum contato vinculado.</p>'}</div>`+
 `<div class="w"><b>Produtos</b>${it.length?`<table class="dpt">${it.map(x=>`<tr><td>${h(x.nome_produto||'Produto removido')}</td><td>${fq(x.quantidade)} × ${$$(x.preco_unitario)}</td><td class="r">${$$((x.quantidade||0)*(x.preco_unitario||0))}</td></tr>`).join('')}</table>`:'<p class="mu">Nenhum produto vinculado.</p>'}</div>`+
 (n.observacoes?`<div class="w"><b>Observações</b><p style="white-space:pre-wrap;margin:4px 0 0">${h(n.observacoes)}</p></div>`:''),[['x','Excluir'],['p','Imprimir'],['e','Editar']],id)},
form(n){const v=n||{estagio:STG[0],forma_pagamento:FPG[0],tipo_desconto:'valor'};let it=n?D.negocio_produtos.filter(x=>x.negocio_id==n.id).map(x=>({...x})):[];
 dlg(n?'Editar negócio':'Novo negócio',F('Título do negócio','titulo',v.titulo,'text','required',1)+CB('Contato vinculado','contato_id',v.contato_id,1)+
 `<div class="w pb"><b>Produtos</b><div class="bar"><input id="pq" type="search" placeholder="Buscar produto"><select id="pc">${catOpts().map(c=>op(c)).join('')}</select></div><div class="bar"><select id="ps"></select><input id="pn" type="number" min="0.01" step="any" value="1" style="width:80px" aria-label="Quantidade"><button type="button" class="b" id="pa">+ Adicionar</button></div><table><tbody id="it"></tbody></table></div>`+
 F('Valor dos produtos (R$)','valor_bruto',v.valor_bruto?mny(v.valor_bruto):'','text','inputmode="decimal" data-m="brl" placeholder="0,00"')+F('Forma de pagamento','forma_pagamento',v.forma_pagamento,'select',FPG)+F('Tipo de desconto','tipo_desconto',v.tipo_desconto,'select',[['valor','Valor (R$)'],['percentual','Percentual (%)']])+F('Desconto (0 se não houver)','desconto',v.desconto?mny(v.desconto):'','text','inputmode="decimal" data-m="brl" placeholder="0,00"')+F('Vendedor responsável','vendedor',v.vendedor)+F('Estágio','estagio',v.estagio,'select',STG)+F('Previsão de fechamento','previsao_fechamento',v.previsao_fechamento,'date')+F('Observações','observacoes',v.observacoes,'area','',1)+'<div class="w tot" id="vf"></div>',
 f=>{const d=fd(f),b=num(d.valor_bruto),ds=num(d.desconto);if(isNaN(b))return ferr(f.valor_bruto,'Valor inválido.');if(isNaN(ds))return ferr(f.desconto,'Desconto inválido.');const B=b||0,X=ds||0,id=n?n.id:nid('negocios'),
  o={titulo:d.titulo.trim(),contato_id:d.contato_id?+d.contato_id:null,valor_bruto:B,desconto:X,tipo_desconto:d.tipo_desconto,valor:Math.max(B-(d.tipo_desconto=='percentual'?B*X/100:X),0),forma_pagamento:d.forma_pagamento,vendedor:d.vendedor.trim(),estagio:d.estagio,previsao_fechamento:d.previsao_fechamento,observacoes:d.observacoes.trim(),atualizado_em:now()};
  if(n)Object.assign(n,o);else D.negocios.push({id,...o,criado_em:now()});
  D.negocio_produtos=D.negocio_produtos.filter(x=>x.negocio_id!=id);let k=nid('negocio_produtos');it.forEach(x=>D.negocio_produtos.push({id:k++,negocio_id:id,produto_id:x.produto_id,nome_produto:x.nome_produto,quantidade:x.quantidade,preco_unitario:x.preco_unitario}));commit('Negócio salvo.')});
 const d=$('#dlg'),q=s=>d.querySelector(s),
 calc=()=>{const b=num(q('[name=valor_bruto]').value)||0,x=num(q('[name=desconto]').value)||0;q('#vf').textContent='Valor final: '+$$(Math.max(b-(q('[name=tipo_desconto]').value=='percentual'?b*x/100:x),0))},
 rec=()=>{q('[name=valor_bruto]').value=mny(it.reduce((s,x)=>s+x.quantidade*x.preco_unitario,0));calc()},
 draw=()=>q('#it').innerHTML=it.length?it.map((x,i)=>`<tr><td>${h(x.nome_produto)}</td><td>${fq(x.quantidade)}</td><td class="r">${$$(x.preco_unitario)}</td><td class="r">${$$(x.quantidade*x.preco_unitario)}</td><td><button type="button" class="b" data-r="${i}" aria-label="Remover">×</button></td></tr>`).join(''):'<tr><td class="em">Nenhum produto adicionado.</td></tr>',
 fil=()=>{const L=prods(q('#pq').value,q('#pc').value);q('#ps').innerHTML=L.map(p=>`<option value="${p.id}">${h(p.nome)} (${$$(p.preco_venda)})</option>`).join('')||'<option value="">Nenhum produto</option>'};
 q('#pq').oninput=q('#pc').onchange=fil;
 q('#pa').onclick=()=>{const p=g('produtos',q('#ps').value),k=num(q('#pn').value);if(!p)return toast('Escolha um produto cadastrado para adicionar.',{err:1});if(!k||k<=0)return toast('Quantidade inválida. Informe um número maior que zero.',{err:1});it.push({produto_id:p.id,nome_produto:p.nome,quantidade:k,preco_unitario:p.preco_venda||0});q('#pn').value=1;draw();rec()};
 q('#it').onclick=e=>{const i=e.target.dataset.r;if(i!=null){it.splice(i,1);draw();rec()}};
 d.oninput=calc;fil();draw();v.valor_bruto?calc():rec()},
p(id){semEmpresa();const n=g('negocios',id),c=g('contatos',n.contato_id)||{},it=D.negocio_produtos.filter(x=>x.negocio_id==id),kv=(a,b)=>b&&b!='-'?`<tr><th style="width:220px">${a}</th><td>${b}</td></tr>`:'';
 doc('Negócio #'+id,`<p><b style="font-size:19px">Negócio #${n.id}: ${h(n.titulo)}</b></p><p style="color:#777">Criado em ${h(n.criado_em)}</p><h2>Dados do contato / cliente</h2><table>${kv('Nome',h(c.nome))+kv('Empresa',h(c.empresa))+kv('Telefone',h(c.telefone))+kv('E-mail',h(c.email))+kv('Endereço',h(c.endereco))||'<tr><td>Nenhum contato vinculado.</td></tr>'}</table><h2>Produtos</h2><table><tr><th>Produto</th><th>Qtd.</th><th class="r">Preço unit.</th><th class="r">Subtotal</th></tr>${it.map(x=>`<tr><td>${h(x.nome_produto||'Produto removido')}</td><td>${fq(x.quantidade)}</td><td class="r">${$$(x.preco_unitario)}</td><td class="r">${$$((x.quantidade||0)*(x.preco_unitario||0))}</td></tr>`).join('')||'<tr><td colspan="4">Nenhum produto vinculado a este negócio.</td></tr>'}</table><h2>Dados do negócio</h2><table>${kv('Valor do(s) produto(s)',$$(n.valor_bruto))+kv('Desconto',dt(n))+kv('Valor final',`<b>${$$(n.valor)}</b>`)+kv('Forma de pagamento',h(n.forma_pagamento))+kv('Vendedor responsável',h(n.vendedor))+kv('Estágio',h(n.estagio))+kv('Previsão de fechamento',fdt(n.previsao_fechamento))}</table>${n.observacoes?`<h2>Observações</h2><p style="white-space:pre-wrap">${h(n.observacoes)}</p>`:''}`)}},

produtos:{title:'Produtos',
bar:()=>`<input data-s="q" type="search" placeholder="Buscar produto" value="${h(S.q)}" aria-label="Buscar"><select data-s="cat" aria-label="Categoria">${catOpts().map(c=>op(c,S.cat)).join('')}</select><button class="b p" data-a="n">Novo produto</button><button class="b" data-a="imp">Imprimir lista</button>`,
list(){const L=srt(prods(S.q,S.cat),{n:p=>p.nome,c:p=>p.categoria||'',d:p=>p.descricao||'',pc:p=>p.preco_custo??-1,pv:p=>p.preco_venda??-1,mg:p=>MARG(p)??-1,es:p=>p.estoque??-1,g:p=>((p.categoria||'').trim()?'a':'z')+(p.categoria||'').trim()+'|'+p.nome},{k:'g',d:1});st(`${L.length} produto(s) exibido(s)`);return T([['Produto','n'],['Categoria','c'],['Descrição','d'],['Preço de custo','pc'],['Preço de venda','pv'],['Margem','mg'],['Estoque','es'],''],L.map(p=>[`<b>${h(p.nome)}</b>`,h(p.categoria),h(p.descricao),$$(p.preco_custo),$$(p.preco_venda),MGM(p),ESQ(p),AC([['e','Editar'],['x','Excluir']],p.id)]),'Nenhum produto encontrado.',[3,4,5,6],()=>'','tc')},
n(){this.form()},e(id){this.form(g('produtos',id))},
form(p){const v=p||{};dlg(p?'Editar produto':'Novo produto',F('Nome do produto','nome',v.nome,'text','required',1)+F('Descrição','descricao',v.descricao,'area','',1)+F('Categoria (escolha ou digite uma nova)','categoria',v.categoria,'text','list="cl"',1)+`<datalist id="cl">${cats().map(c=>`<option value="${h(c)}">`).join('')}</datalist>`+F('Preço de venda (R$)','preco_venda',v.preco_venda!=null?mny(v.preco_venda):'','text','required inputmode="decimal" data-m="brl" placeholder="0,00"')+F('Preço de custo (R$) — opcional','preco_custo',v.preco_custo!=null?mny(v.preco_custo):'','text','inputmode="decimal" data-m="brl" placeholder="0,00"')+F('Unidade','unidade',v.unidade||'un','select',UNI)+F('Estoque (opcional)','estoque',v.estoque??'','text','inputmode="decimal" placeholder="0"')+F('Fornecedor (opcional)','fornecedor',v.fornecedor,'text','',1),f=>{const d=fd(f),pv=num(d.preco_venda),pc=num(d.preco_custo);if(pv==null||isNaN(pv))return ferr(f.preco_venda,'Preço de venda inválido. Use apenas números (ex: 49,90).');if(isNaN(pc))return ferr(f.preco_custo,'Preço de custo inválido. Deixe em branco ou use apenas números.');
 const es=num(d.estoque);if(isNaN(es))return ferr(f.estoque,'Estoque inválido. Use apenas números.');const o={nome:d.nome.trim(),descricao:d.descricao.trim(),categoria:d.categoria.trim()||null,preco_venda:pv,preco_custo:pc,unidade:d.unidade,estoque:es,fornecedor:d.fornecedor.trim()||null,atualizado_em:now()};if(p)Object.assign(p,o);else D.produtos.push({id:nid('produtos'),...o,criado_em:now()});S.cat=ALL;commit('Produto salvo.')})},
x(id){const p=g('produtos',id);del(`Produto “${p?.nome||''}” excluído. Negócios que já o usam continuam mostrando o nome dele.`,['produtos','negocio_produtos'],()=>{D.produtos=D.produtos.filter(p=>p.id!=id);D.negocio_produtos.forEach(x=>x.produto_id==id&&(x.produto_id=null))})},
imp(){const L=prods('',S.cat);if(!L.length)return toast('Não há produtos cadastrados para imprimir.',{err:1});const cs=confirm('Incluir o preço de custo na impressão?\n\n(Em listas de preços para clientes costuma-se mostrar só o preço de venda.)');semEmpresa();
 const any=L.some(p=>(p.categoria||'').trim());let g0=null;const rows=L.map(p=>{const k=(p.categoria||'').trim();let r='';if(any&&k.toLowerCase()!==g0){g0=k.toLowerCase();r=`<tr class="g"><td colspan="${cs?4:3}">${h(k||SEM)}</td></tr>`}return r+`<tr><td>${h(p.nome)}</td><td>${h(p.descricao).replace(/\n/g,'<br>')}</td>${cs?`<td class="r">${$$(p.preco_custo)}</td>`:''}<td class="r">${$$(p.preco_venda)}</td></tr>`}).join('');
 doc('Lista de Produtos',`<h2>Lista de produtos${S.cat!=ALL?' - '+h(S.cat):''}</h2><table><tr><th>Produto</th><th>Descrição</th>${cs?'<th class="r">Preço de custo</th>':''}<th class="r">Preço de venda</th></tr>${rows}</table>`)}},

top:{title:'Top Clientes',
bar:()=>`<label><input type="checkbox" data-s="rec" ${S.rec?'checked':''}> Considerar apenas negócios Ganhos / Clientes Recorrentes</label>`,
list(){const m={};D.negocios.forEach(n=>{const c=g('contatos',n.contato_id);if(!c||(S.rec&&!REC.includes(n.estagio)))return;const r=m[c.id]??={c,q:0,v:0,r:0};r.q++;r.v+=n.valor||0;if(n.estagio=='Cliente Recorrente')r.r=1});
 const L0=Object.values(m).filter(r=>r.v>0).sort((a,b)=>b.v-a.v);L0.forEach((r,i)=>r.k=i);
 const L=srt(L0,{k:r=>r.k,n:r=>r.c.nome,e:r=>r.c.empresa,s:r=>r.c.status,q:r=>r.q,r:r=>r.r,v:r=>r.v},{k:'v',d:-1});st(`${L.length} cliente(s) no ranking — Total: ${$$(L.reduce((t,r)=>t+r.v,0))}`);
 return T([['#','k'],['Cliente','n'],['Empresa','e'],['Status','s'],['Nº negócios','q'],['Recorrente?','r'],['Valor total gerado','v']],L.map(r=>[r.k+1,h(r.c.nome),h(r.c.empresa),bd(r.c.status,CST[r.c.status]),r.q,r.r?'Sim':'-',$$(r.v)]),'Nenhum cliente com negócios no critério escolhido.',[6],j=>['o','pr','bz'][L[j].k]||'')}},

tarefas:{title:'Tarefas',
bar:()=>`<select data-s="stt" aria-label="Status">${['Todas','Atrasadas',...STT].map(x=>op(x,S.stt)).join('')}</select><button class="b p" data-a="n">Nova tarefa</button>`,
list(){const L=srt(D.tarefas.filter(t=>S.stt=='Todas'||(S.stt=='Atrasadas'?atras(t):t.status==S.stt)),{t:t=>t.titulo,ti:t=>t.tipo,pr:t=>({Alta:0,'Média':1,Baixa:2})[t.prioridade||'Média'],c:t=>cnome(t.contato_id),d:t=>t.data_prevista||'',s:t=>t.status},{k:'d',d:1});st(`${L.length} tarefa(s)`);
 return T([['Título','t'],['Tipo','ti'],['Prioridade','pr'],['Contato','c'],['Data prevista','d'],['Status','s'],''],L.map(t=>[`<b>${h(t.titulo)}</b>`,h(t.tipo),bd(t.prioridade||'Média',PRI[t.prioridade||'Média']),h(cnome(t.contato_id)),atras(t)?`<span style="color:var(--rd);font-weight:600">${fdt(t.data_prevista)} (atrasada)</span>`:fdt(t.data_prevista),bd(t.status,CTS[t.status]),AC([...(t.status=='Pendente'?[['c','Concluir']]:[]),['e','Editar'],['x','Excluir']],t.id)]),'Nenhuma tarefa encontrada.',[],j=>atras(L[j])?'at':'','tc')},
n(){this.form()},e(id){this.form(g('tarefas',id))},
form(t){const v=t||{tipo:'Follow-up',status:'Pendente',prioridade:'Média',categoria:'Outro'};dlg(t?'Editar tarefa':'Nova tarefa',F('Título da tarefa','titulo',v.titulo,'text','required',1)+F('Tipo','tipo',v.tipo,'select',TIP)+F('Prioridade','prioridade',v.prioridade||'Média','select',PRIO)+F('Categoria','categoria',v.categoria||'Outro','select',CATT)+CB('Contato vinculado','contato_id',v.contato_id)+F('Negócio vinculado','negocio_id',v.negocio_id,'select',[['','(nenhum)'],...D.negocios.map(n=>[n.id,n.titulo])],1)+F('Data prevista','data_prevista',v.data_prevista,'date')+F('Status','status',v.status,'select',STT)+F('Observações','observacoes',v.observacoes,'area','',1),f=>{const d=fd(f),o={...d,titulo:d.titulo.trim(),contato_id:d.contato_id?+d.contato_id:null,negocio_id:d.negocio_id?+d.negocio_id:null};if(t)Object.assign(t,o);else D.tarefas.push({id:nid('tarefas'),negocio_id:null,...o,criado_em:now()});commit('Tarefa salva.')})},
c(id){g('tarefas',id).status='Concluída';commit('Tarefa concluída.',()=>{const t=g('tarefas',id);if(t){t.status='Pendente';commit('Tarefa reaberta.')}})},
x(id){const t=g('tarefas',id);del(`Tarefa “${t?.titulo||''}” excluída.`,['tarefas'],()=>{D.tarefas=D.tarefas.filter(t=>t.id!=id)})}},

empresa:{title:'Empresa',bar:()=>'',
list(){const e=D.empresa||{};S.logo=undefined;return`<p style="margin:0;color:var(--mu)">Estes dados aparecem no cabeçalho das impressões.</p><div class="form">${F('Nome da empresa *','nome',e.nome,'text','id="en"',1)+F('Endereço','endereco',e.endereco,'text','id="ee"',1)+F('CNPJ','cnpj',mcnpj(e.cnpj||''),'text','id="ec" data-m="cnpj" inputmode="numeric" placeholder="00.000.000/0000-00"')+F('Contato (telefone/e-mail)','contato',e.contato,'text','id="et"')}<label class="w">Logomarca<input type="file" id="lg" accept="image/*"></label><label class="w">Ou endereço (URL) da logomarca<input type="text" id="lu" placeholder="logo.png" value="${h(e.logo&&!e.logo.startsWith('data:')?e.logo:'')}"></label><div class="w"><img id="pv" alt="Logomarca" ${e.logo?`src="${e.logo}"`:'hidden'}></div><div class="w bar"><button class="b p" data-a="sv">Salvar dados da empresa</button><button class="b" data-a="rl">Remover logomarca</button></div></div>`},
sv(){const n=$('#en').value.trim();if(!n)return ferr($('#en'),'Informe o nome da empresa.');D.empresa={...D.empresa,nome:n,endereco:$('#ee').value.trim(),cnpj:$('#ec').value.trim(),contato:$('#et').value.trim()};{const u=$('#lu').value.trim();if(S.logo!==undefined)D.empresa.logo=S.logo;else if(u)D.empresa.logo=u}commit('Dados da empresa atualizados.')},
rl(){del('Logomarca removida.',['empresa'],()=>{D.empresa.logo=null})}},

backup:{title:'Backup',bar:()=>'',
list(){return`<div class="form"><p class="w" style="margin:0">Os dados ficam salvos <b>na nuvem (Firebase)</b> e são compartilhados entre os administradores. Mesmo assim, faça backup com frequência. <b>Importar substitui os dados de todos os admins.</b></p><div class="w bar"><button class="b p" data-a="exp">Exportar backup (.json)</button><button class="b" data-a="imp">Importar backup (.json)</button></div><p class="w" style="margin:0;color:var(--mu)">Ao importar, uma cópia de segurança dos dados atuais é baixada automaticamente antes de substituí-los.</p></div>`},
exp(pre){dl(`${pre=='pre'?'pre_import_backup':'backup_crm'}_${stamp()}.json`,JSON.stringify({app:APP,versao:VER,gerado_em:new Date().toISOString(),...D}),'application/json');pre!='pre'&&toast('Backup exportado.')},
imp(){const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=async()=>{let j;try{j=JSON.parse(await i.files[0].text())}catch{return toast('O arquivo selecionado não é um backup válido (.json).',{err:1})}
 if(!Array.isArray(j.contatos)||!Array.isArray(j.negocios))return toast(`Este arquivo não parece ser um backup do ${APP}.`,{err:1});
 if(!confirm(`Importar ${j.contatos.length} contatos, ${j.negocios.length} negócios e ${(j.produtos||[]).length} produtos? Isto substitui todos os dados atuais.`))return;
 this.exp('pre');for(const k of ['contatos','negocios','tarefas','interacoes','produtos','negocio_produtos','metas','receitas','despesas'])D[k]=Array.isArray(j[k])?j[k]:[];D.empresa=j.empresa||{};if(j.jornada)D.jornada=j.jornada;commit('Backup importado com sucesso.')};i.click()}}
};

/* ---------- tema, ações do celular e navegação ---------- */
const isDark=()=>{const t=ls('crm_tema');return t?t=='dark':matchMedia('(prefers-color-scheme: dark)').matches},
themeLbl=()=>`${ic(isDark()?'sol':'lua')}<span class="tx">${isDark()?'Tema claro':'Tema escuro'}</span>`,
applyTheme=()=>{const t=ls('crm_tema'),r=document.documentElement;t?r.dataset.theme=t:delete r.dataset.theme;const b=$('#tema');if(b){b.innerHTML=themeLbl();b.setAttribute('aria-label',isDark()?'Usar tema claro':'Usar tema escuro')}},
DO={tema(){ls('crm_tema',isDark()?'light':'dark');applyTheme()},
fab(){S.tab=='dashboard'?modal('Criar novo',`<div class="w sh">${[['contatos','Novo contato'],['negocios','Novo negócio'],['tarefas','Nova tarefa'],['produtos','Novo produto']].map(([k,l])=>`<button type="button" class="b" data-do="new" data-k="${k}">${ic(k)}${l}</button>`).join('')}</div>`,[]):V[S.tab].n()},
new(b){V[b.dataset.k].n()},
more(){modal('Mais',`<div class="w sh">${['produtos','top','empresa','backup'].map(k=>`<button type="button" class="b" data-go="${k}">${ic(k)}${V[k].title}</button>`).join('')}<button type="button" class="b" data-do="tema">${themeLbl()}</button></div>`,[])}};
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',applyTheme);

const render=()=>{const v=V[S.tab],sl=$('.kb')?.scrollLeft;
$('#nav').innerHTML=Object.entries(V).map(([k,x])=>`<button type="button" data-go="${k}" class="${k==S.tab?'on':''}"${k==S.tab?' aria-current="page"':''}>${ic(k)}${x.title}</button>`).join('');
$('#tb').innerHTML=MAIN.map(k=>`<button type="button" data-go="${k}" class="${k==S.tab?'on':''}">${ic(k)}<span>${V[k].title}</span></button>`).join('')+`<button type="button" data-do="more" class="${MAIN.includes(S.tab)?'':'on'}">${ic('mais')}<span>Mais</span></button>`;
const fb=$('#fab');fb.hidden=!FABL[S.tab];fb.textContent='+';fb.setAttribute('aria-label',FABL[S.tab]||'');
$('#h').textContent=v.title;$('#bar').innerHTML=v.bar();$('#view').innerHTML=v.list();$('#co').textContent=D.empresa?.nome||'Gestão de clientes';{const l=D.empresa?.logo,i=$('#bl');if(l)i.src=l;i.hidden=!l;$('#bi').style.display=l?'none':''}
if(sl&&$('.kb'))$('.kb').scrollLeft=sl;sync()};
const go=(t,p={})=>{S={tab:t,q:'',cat:ALL,est:'Todos',stt:'Todas',rec:true,dias:DIAS,vw:ls('crm_vw')||'lista',...p};if(p.est)S.vw='lista';render();scrollTo(0,0)};

document.addEventListener('click',e=>{const t=e.target;
 /* WhatsApp no computador: vai direto ao WhatsApp Web, sempre na mesma aba (no celular segue o wa.me, que abre o app) */
 const wl=t.closest('a[href^="https://wa.me/"]');if(wl&&!matchMedia('(pointer:coarse)').matches){e.preventDefault();const n=wl.getAttribute('href').split('wa.me/')[1],m=ls('crm_wa')||'web';
  if(m=='app')location.href='whatsapp://send?phone='+n;
  else if(m=='copiar'){const ok=()=>toast('Número copiado: +'+n+'. Cole na busca do WhatsApp Web.');navigator.clipboard?.writeText(n).then(ok,()=>toast('Não foi possível copiar: +'+n,{err:1}))||toast('+'+n)}
  else window.open('https://web.whatsapp.com/send?phone='+n,'whatsapp_web');
  return}
 const li=t.closest('.cbx li[data-id]');if(li)return cbPick(li.closest('.cbx'),li.dataset.id);
 const b=t.closest('[data-go],[data-a],[data-do],[data-sort]');
 if(b){if(b.dataset.sort){const k=b.dataset.sort;S.so={k,d:S.act?.k==k&&S.act.d==1?-1:1};$('#view').innerHTML=V[S.tab].list();return}
  b.closest('dialog')?.close();
  if(b.dataset.go)return go(b.dataset.go,b.dataset.set?JSON.parse(b.dataset.set):{});
  if(b.dataset.do)return DO[b.dataset.do]?.(b);
  return V[S.tab][b.dataset.a]?.(+b.dataset.id,b)}
 const r=t.closest('[data-open]');if(r&&!t.closest('a,button,select,input,label'))V[S.tab].d?.(+r.dataset.id)});
document.addEventListener('input',e=>{const k=e.target.dataset.s;if(!k)return;S[k]=e.target.type=='checkbox'?e.target.checked:e.target.value;if(k=='dias'){DIAS=+S.dias;ls('crm_dias',DIAS)}$('#view').innerHTML=V[S.tab].list()});
/* máscaras e limpeza de erro (fase de captura: roda antes dos outros ouvintes) */
document.addEventListener('input',e=>{const t=e.target;if(t.hasAttribute?.('aria-invalid'))clr(t);const m=MK[t.dataset?.m];if(m){const v=m(t.value);if(v!==t.value)t.value=v}},true);
document.addEventListener('change',e=>{if(e.target.dataset.wa!==undefined){ls('crm_wa',e.target.value);return toast('Preferência do WhatsApp salva.')}if(e.target.dataset.mv)return mover(+e.target.dataset.mv,e.target.value);if(e.target.id!='lg'||!e.target.files[0])return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,256/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);const d=c.toDataURL('image/png');S.logo=d;$('#pv').src=d;$('#pv').hidden=false};im.src=r.result};r.readAsDataURL(e.target.files[0])});
/* arrastar e soltar no quadro */
document.addEventListener('dragstart',e=>{const c=e.target.closest?.('.kc');if(!c)return;e.dataTransfer.setData('text/plain',c.dataset.id);e.dataTransfer.effectAllowed='move';c.classList.add('dg')});
document.addEventListener('dragend',()=>document.querySelectorAll('.dg,.ov').forEach(x=>x.classList.remove('dg','ov')));
document.addEventListener('dragover',e=>{const c=e.target.closest?.('.kcol');if(!c)return;e.preventDefault();document.querySelectorAll('.ov').forEach(x=>x!=c&&x.classList.remove('ov'));c.classList.add('ov')});
document.addEventListener('drop',e=>{const c=e.target.closest?.('.kcol');if(!c)return;e.preventDefault();document.querySelectorAll('.dg,.ov').forEach(x=>x.classList.remove('dg','ov'));mover(+e.dataTransfer.getData('text/plain'),c.dataset.e)});
/* busca de contato com sugestões */
document.addEventListener('focusin',e=>{const i=e.target;if(i.matches?.('[data-cb]')){i.select();cbShow(i)}});
document.addEventListener('input',e=>{const i=e.target;if(i.matches?.('[data-cb]')){i.closest('.cbx').querySelector('[type=hidden]').value='';cbShow(i)}});
document.addEventListener('focusout',e=>{const w=e.target.closest?.('.cbx');if(!w||w.contains(e.relatedTarget))return;const i=w.querySelector('[data-cb]'),hd=w.querySelector('[type=hidden]');if(!hd.value&&i.value.trim()){const v=i.value.trim().toLowerCase(),L=cbl(v),x=L.find(c=>c.nome.toLowerCase()==v)||(L.length==1?L[0]:null);x?cbPick(w,x.id):i.value=''}cbHide(w)});
document.addEventListener('mousedown',e=>{if(e.target.closest?.('.cl'))e.preventDefault()});
document.addEventListener('keydown',e=>{const i=e.target,w=i.closest?.('.cbx');if(!w)return;const u=w.querySelector('.cl');
 if(e.key=='Escape'&&!u.hidden){e.preventDefault();return cbHide(w)}
 if(e.key=='ArrowDown'||e.key=='ArrowUp'){e.preventDefault();if(u.hidden)cbShow(w.querySelector('[data-cb]'));const L=[...u.querySelectorAll('li[data-id]')],k=L.indexOf(document.activeElement),n=e.key=='ArrowDown'?k+1:k-1;if(n>=0&&n<L.length)L[n].focus();else if(n<0)w.querySelector('[data-cb]').focus()}
 if(e.key=='Enter'){const li=i.matches('li[data-id]')?i:(i.matches('[data-cb]')&&!u.hidden?u.querySelector('li[data-id]'):null);if(li){e.preventDefault();cbPick(w,li.dataset.id)}}});

window.boot=async()=>{let s,mig=false;$('#view').innerHTML='<div class="ld" role="status"><i class="sp"></i><span>Carregando seus dados…</span></div>';
try{s=await window.FB.load()}catch(e){console.error(e);$('#view').innerHTML='<div class="ld col"><p>Não foi possível carregar os dados da nuvem. Verifique a conexão.</p><button type="button" class="b p" onclick="location.reload()">Tentar de novo</button></div>';return}
if(!s){const l=await loadLocal();if(l&&confirm('Encontrei dados salvos neste navegador (versão antiga). Enviar para a nuvem?')){s=l;mig=true}}
if(s){if(s.__mig){mig=true;delete s.__mig}D={...D,...s}}if(mig)save();go('dashboard')};
applyTheme();
