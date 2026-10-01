import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, getDocs, doc, getDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const TABS = ["contatos", "negocios", "tarefas", "interacoes", "produtos", "negocio_produtos"];
const $ = s => document.querySelector(s);

if (firebaseConfig.apiKey.startsWith("COLE")) {
  document.body.innerHTML = '<p style="padding:24px">Configure o arquivo <b>firebase-config.js</b> com os dados do seu projeto Firebase.</p>';
  throw new Error("firebase-config.js não preenchido");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// cache local: continua funcionando sem internet e sincroniza quando voltar
const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });

let uid = null, snap = {}, fila = Promise.resolve();
// dados compartilhados entre todos os admins
const base = () => ["workspaces", "principal"];
// caminho antigo (dados individuais), usado só para migrar uma vez
const antigo = () => ["users", uid];
const str = r => JSON.stringify(r); // JSON remove campos undefined, que o Firestore não aceita

async function lerTudo(caminho) {
  const out = { empresa: {} }, sn = {};
  let vazio = true;
  for (const t of TABS) {
    const qs = await getDocs(collection(db, ...caminho, t));
    out[t] = qs.docs.map(d => { const r = d.data(); sn[t + "/" + d.id] = str(r); return r; });
    if (out[t].length) vazio = false;
  }
  const e = await getDoc(doc(db, ...caminho, "meta", "empresa"));
  if (e.exists()) { out.empresa = e.data(); sn["empresa"] = str(out.empresa); vazio = false; }
  return { out, snap: sn, vazio };
}

window.FB = {
  async load() {
    snap = {};
    const r = await lerTudo(base());
    if (r.vazio) {
      // primeira vez no espaço compartilhado: traz os dados antigos do próprio usuário, se existirem
      const o = await lerTudo(antigo());
      if (!o.vazio) { o.out.__mig = true; return o.out; } // snap fica vazio => o próximo save grava tudo
      return null;
    }
    snap = r.snap;
    return r.out;
  },
  // grava só o que mudou (novos/alterados) e apaga o que foi removido
  save(D) {
    fila = fila.then(async () => {
      const ops = [], novo = {};
      for (const t of TABS) for (const r of D[t]) {
        const k = t + "/" + r.id, s = str(r);
        novo[k] = s;
        if (snap[k] !== s) ops.push(b => b.set(doc(db, ...base(), t, String(r.id)), JSON.parse(s)));
      }
      for (const k of Object.keys(snap)) if (k !== "empresa" && !(k in novo)) {
        const [t, id] = k.split("/");
        ops.push(b => b.delete(doc(db, ...base(), t, id)));
      }
      const se = str(D.empresa || {});
      if (snap["empresa"] !== se) { novo["empresa"] = se; ops.push(b => b.set(doc(db, ...base(), "meta", "empresa"), JSON.parse(se))); }
      else if ("empresa" in snap) novo["empresa"] = snap["empresa"];
      for (let i = 0; i < ops.length; i += 450) {
        const b = writeBatch(db);
        ops.slice(i, i + 450).forEach(f => f(b));
        await b.commit();
      }
      snap = novo;
    });
    return fila;
  }
};

/* ---------- login ---------- */
document.body.insertAdjacentHTML("beforeend", `<dialog id="login"><form><h2>Entrar</h2>
<div class="fb" style="grid-template-columns:1fr"><label>E-mail<input name="e" type="email" required autocomplete="username"></label>
<label>Senha<input name="s" type="password" required autocomplete="current-password"></label><p id="le" style="color:var(--rd);margin:0"></p></div>
<div class="fa"><button class="b p">Entrar</button></div></form></dialog>`);
$("aside").insertAdjacentHTML("beforeend", '<button class="b" id="sair" style="margin:14px 8px;display:none">Sair</button>');
$("#login").addEventListener("cancel", e => e.preventDefault());
$("#sair").onclick = () => signOut(auth).then(() => location.reload());
$("#login form").onsubmit = async e => {
  e.preventDefault();
  const f = e.target;
  try { await signInWithEmailAndPassword(auth, f.e.value.trim(), f.s.value); }
  catch { $("#le").textContent = "E-mail ou senha inválidos."; }
};

let iniciado = false;
onAuthStateChanged(auth, async u => {
  if (!u) { uid = null; $("#login").showModal(); return; }
  uid = u.uid;
  // só admins (documento admins/{uid}) podem usar o sistema
  let admin = false, erro = "";
  try { admin = (await getDoc(doc(db, "admins", uid))).exists(); } catch (e) { erro = e.code || String(e); }
  if (!admin) {
    const meuUid = uid;
    await signOut(auth);
    $("#le").textContent = erro
      ? "Erro ao verificar permissão (" + erro + "). Publique as regras novas do Firestore."
      : "Sem permissão: não existe o documento admins/" + meuUid + " no Firestore.";
    $("#login").showModal();
    return;
  }
  $("#login").close();
  $("#sair").style.display = "block";
  if (!iniciado) { iniciado = true; await window.boot(); }
});
