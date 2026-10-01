import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, getDocs, doc, getDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const TABS = ["contatos", "negocios", "tarefas", "interacoes", "produtos", "negocio_produtos"];
const META = ["empresa", "jornada"]; // documentos em users/{uid}/meta/{nome}
const $ = s => document.querySelector(s);

if (firebaseConfig.apiKey.startsWith("COLE")) {
  document.body.innerHTML = '<p style="padding:24px">Configure o arquivo <b>firebase-config.js</b> com os dados do seu novo projeto Firebase.</p>';
  throw new Error("firebase-config.js não preenchido");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// cache local: continua funcionando sem internet e sincroniza quando voltar
const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });

let uid = null, snap = {}, fila = Promise.resolve();
// cada empreendedor tem o próprio espaço: users/{uid}/...
const base = () => ["users", uid];
const str = r => JSON.stringify(r); // JSON remove campos undefined, que o Firestore não aceita

// Mesma interface usada pelo script.js: window.FB.load() e window.FB.save(D)
window.FB = {
  carregado: false,
  async load() {
    snap = {};
    const out = { empresa: {} }, sn = {};
    let vazio = true;
    for (const t of TABS) {
      const qs = await getDocs(collection(db, ...base(), t));
      out[t] = qs.docs.map(d => { const r = d.data(); sn[t + "/" + d.id] = str(r); return r; });
      if (out[t].length) vazio = false;
    }
    for (const m of META) {
      const d = await getDoc(doc(db, ...base(), "meta", m));
      if (d.exists()) { out[m] = d.data(); sn[m] = str(out[m]); vazio = false; }
    }
    this.carregado = true;
    if (vazio) return null; // conta nova: o boot oferece dados antigos do navegador, ou use Backup > importar JSON
    snap = sn;
    return out;
  },
  // grava só o que mudou (novos/alterados) e apaga o que foi removido
  save(D) {
    fila = fila.catch(() => {}).then(async () => {
      const ops = [], novo = {};
      for (const t of TABS) for (const r of D[t]) {
        const k = t + "/" + r.id, s = str(r);
        novo[k] = s;
        if (snap[k] !== s) ops.push(b => b.set(doc(db, ...base(), t, String(r.id)), JSON.parse(s)));
      }
      for (const k of Object.keys(snap)) if (!META.includes(k) && !(k in novo)) {
        const [t, id] = k.split("/");
        ops.push(b => b.delete(doc(db, ...base(), t, id)));
      }
      for (const m of META) {
        const v = m === "empresa" ? (D.empresa || {}) : D[m];
        if (v === undefined) continue;
        const s = str(v);
        if (snap[m] !== s) ops.push(b => b.set(doc(db, ...base(), "meta", m), JSON.parse(s)));
        novo[m] = s;
      }
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

/* ---------- login e cadastro ---------- */
document.body.insertAdjacentHTML("beforeend", `<dialog id="login"><form><h2>Entrar</h2>
<div class="fb" style="grid-template-columns:1fr"><label>E-mail<input name="e" type="email" required autocomplete="username"></label>
<label>Senha (mínimo 6 caracteres)<input name="s" type="password" required minlength="6" autocomplete="current-password"></label><p id="le" style="color:var(--rd);margin:0"></p></div>
<div class="fa"><button type="button" class="b" id="nova">Criar conta</button><button class="b p">Entrar</button></div></form></dialog>`);
$("aside").insertAdjacentHTML("beforeend", '<button class="b" id="sair" style="margin:14px 8px;display:none">Sair</button>');
$("#login").addEventListener("cancel", e => e.preventDefault());
$("#sair").onclick = () => signOut(auth).then(() => location.reload());

$("#login form").onsubmit = async e => {
  e.preventDefault();
  const f = e.target;
  try { await signInWithEmailAndPassword(auth, f.e.value.trim(), f.s.value); }
  catch { $("#le").textContent = "E-mail ou senha inválidos."; }
};
$("#nova").onclick = async () => {
  const f = $("#login form");
  if (!f.reportValidity()) return;
  try { await createUserWithEmailAndPassword(auth, f.e.value.trim(), f.s.value); }
  catch (e) {
    $("#le").textContent = e.code === "auth/email-already-in-use" ? "Este e-mail já tem conta. Use Entrar."
      : e.code === "auth/weak-password" ? "Senha fraca: use pelo menos 6 caracteres."
      : "Não foi possível criar a conta (" + (e.code || "erro") + ").";
  }
};

let iniciado = false;
onAuthStateChanged(auth, async u => {
  if (!u) { uid = null; if (!$("#login").open) $("#login").showModal(); return; }
  uid = u.uid;
  if ($("#login").open) $("#login").close();
  $("#sair").style.display = "block";
  if (!iniciado) { iniciado = true; await window.boot(); }
});
