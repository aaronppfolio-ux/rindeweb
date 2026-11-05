/* ================== INTERFAZ ================== */
const $ = s => document.querySelector(s);
const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const ICON = {
  d:'<svg viewBox="0 0 24 24" fill="none" stroke="var(--maiz-ink)" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="14" r="4"/><path d="M12 4v2M4.5 7.5l1.4 1.4M19.5 7.5l-1.4 1.4M3 18h18"/></svg>',
  a:'<svg viewBox="0 0 24 24" fill="none" stroke="var(--maiz-ink)" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg>',
  c:'<svg viewBox="0 0 24 24" fill="none" stroke="var(--maiz-ink)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'};
const MEAL_N = {d:'Desayuno', a:'Almuerzo', c:'Cena'};
const FOCUS_UI = [['equilibrado','Equilibrado','var(--ink)'],['proteina','Proteína','var(--frijol)'],['vegetal','Vegetales','var(--leaf)'],['cereal','Cereales','var(--maiz)']];

const fmt = n => 'C$' + n.toLocaleString('es-NI',{minimumFractionDigits:2, maximumFractionDigits:2});
const fmt0 = n => 'C$' + Math.round(n).toLocaleString('es-NI');
const frac = x => { const w=Math.floor(x+1e-9), r=Math.round((x-w)*4)/4; if(r===1) return String(w+1); const f={0:'',0.25:'¼',0.5:'½',0.75:'¾'}[r]; return w ? w+(f?' '+f:'') : (f||'¼'); };
function amount(v, u){
  if(u==='u') return frac(v) + ' u';
  if(u==='ml') return v>=1000 ? (v/1000).toFixed(1).replace('.0','')+' L' : Math.round(v)+' ml';
  return v>=1000 ? (v/1000).toFixed(2).replace(/\.?0+$/,'')+' kg' : Math.round(v)+' g';
}
const bought = picks => picks.map(({o,c}) => o.b ? c.toFixed(2).replace(/\.?0+$/,'') + ' lb' : (c>1? c+' × ':'') + o.k).join(' + ');
const esc = s => String(s).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));

/* ---------- Estado ---------- */
const ALL_P = Object.keys(PROT);
const state = {budget:1500, days:[0,1,2,3,4], meals:['d','a','c'], people:2, pref:'equilibrado', allow:[...ALL_P], styles:[], pantry:true, locks:{},
  seed:7, tab:'menu', checked:{}, result:null, catQ:'', catC:'all'};
try{ const s = JSON.parse(localStorage.getItem('rinde-v2')||'null'); if(s) for(const k of ['budget','days','meals','people','pref','allow','styles','pantry','locks']) if(s[k]!==undefined) state[k]=s[k]; }catch(e){}
const save = () => { try{ const o={}; for(const k of ['budget','days','meals','people','pref','allow','styles','pantry','locks']) o[k]=state[k]; localStorage.setItem('rinde-v2', JSON.stringify(o)); }catch(e){} };
const skipSet = () => state.pantry ? PANTRY : null;
const BASE = {}; allOptions().forEach(({o}) => BASE[o.id] = o.p);
$('#fRecipes').textContent = R.length; $('#fProducts').textContent = allOptions().length;

/* ---------- Presupuesto ---------- */
const bIn = $('#budget'), bRange = $('#budgetRange');
function setBudget(v, from){
  v = Math.max(0, Math.round(Number(v)||0)); state.budget = v;
  if(from!=='input') bIn.value = v ? v.toLocaleString('es-NI') : '';
  if(from!=='range') bRange.value = Math.min(v, 10000);
  document.querySelectorAll('#quick button').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.v===v)));
  perDay(); schedule();
}
bIn.addEventListener('input', () => { const raw = bIn.value.replace(/[^\d]/g,''); setBudget(raw, 'input'); bIn.value = raw ? Number(raw).toLocaleString('es-NI') : ''; });
bRange.addEventListener('input', () => setBudget(bRange.value, 'range'));
$('#quick').addEventListener('click', e => { const c = e.target.closest('button'); if(c) setBudget(c.dataset.v); });
function perDay(){
  const n = state.days.length, m = state.meals.length;
  $('#perday').innerHTML = n ? `<span>${n} ${n===1?'día':'días'} · ${n*m} comidas · ${state.people} ${state.people===1?'persona':'personas'}</span><span>≈ <b>${fmt0(state.budget/n)}</b> por día</span>` : '<span>Elegí al menos un día.</span>';
}

/* ---------- Ajustes ---------- */
function renderControls(){
  $('#days').innerHTML = DAYS.map((l,i)=>`<button class="day" data-i="${i}" aria-label="${l}" aria-pressed="${state.days.includes(i)}"><small>${l.slice(0,3)}</small>${l[0]}</button>`).join('');
  $('#mealsSw').innerHTML = MEALS.map(([m,l])=>`<button class="sw" role="switch" data-m="${m}" aria-checked="${state.meals.includes(m)}"><span class="l"><span class="ic" aria-hidden="true">${ICON[m]}</span>${l}</span><span class="track"></span></button>`).join('');
  $('#mealsCount').textContent = state.meals.length + (state.meals.length===1?' plato al día':' platos al día');
  $('#people').textContent = state.people;
  $('#focus').innerHTML = FOCUS_UI.map(([k,l,c])=>`<button data-f="${k}" aria-pressed="${state.pref===k}"><i style="background:${c}"></i>${l}</button>`).join('');
  $('#prots').innerHTML = ALL_P.map(k=>`<button class="chip" data-p="${k}" aria-pressed="${state.allow.includes(k)}">${PROT[k]}${state.allow.includes(k)?'':' <span class="x">✕</span>'}</button>`).join('');
  $('#protCount').textContent = state.allow.length===ALL_P.length ? 'Todo' : state.allow.length+' de '+ALL_P.length;
  $('#styles').innerHTML = Object.entries(STYLES).map(([k,l])=>`<button class="chip style" data-s="${k}" aria-pressed="${state.styles.includes(k)}">${l}</button>`).join('');
  $('#pantrySw').setAttribute('aria-checked', String(state.pantry));
  const nl = Object.keys(state.locks).length;
  $('#unlock').hidden = !nl; $('#unlock').textContent = `Soltar ${nl} ${nl===1?'platillo fijado':'platillos fijados'}`;
  perDay();
}
$('#days').addEventListener('click', e => { const b=e.target.closest('.day'); if(!b) return; const i=+b.dataset.i;
  if(state.days.includes(i)){ if(state.days.length===1) return toast('Dejá al menos un día'); state.days = state.days.filter(d=>d!==i); } else state.days = [...state.days, i].sort();
  changed(); });
$('#allDays').onclick = () => { state.days=[0,1,2,3,4,5,6]; changed(); };
$('#wk').onclick = () => { state.days=[0,1,2,3,4]; changed(); };
$('#mealsSw').addEventListener('click', e => { const b=e.target.closest('.sw'); if(!b) return; const m=b.dataset.m;
  if(state.meals.includes(m)){ if(state.meals.length===1) return toast('Dejá al menos una comida'); state.meals = state.meals.filter(x=>x!==m); } else state.meals = MEALS.map(x=>x[0]).filter(x=>x===m||state.meals.includes(x));
  changed(); });
$('#pMinus').onclick = () => { state.people = Math.max(1, state.people-1); changed(); };
$('#pPlus').onclick = () => { state.people = Math.min(10, state.people+1); changed(); };
$('#focus').addEventListener('click', e => { const b=e.target.closest('[data-f]'); if(b){ state.pref=b.dataset.f; changed(); } });
$('#prots').addEventListener('click', e => { const b=e.target.closest('[data-p]'); if(!b) return; const k=b.dataset.p;
  if(state.allow.includes(k)){ if(state.allow.length===1) return toast('Dejá al menos una opción'); state.allow = state.allow.filter(x=>x!==k); } else state.allow = [...state.allow, k];
  changed(); });
$('#styles').addEventListener('click', e => { const b=e.target.closest('[data-s]'); if(!b) return; const k=b.dataset.s; state.styles = state.styles.includes(k) ? state.styles.filter(x=>x!==k) : [...state.styles, k]; changed(); });
$('#pantrySw').onclick = () => { state.pantry = !state.pantry; changed(); };
$('#again').onclick = () => { state.seed = Math.floor(Math.random()*1e9); run(); toast('Nueva combinación lista'); };
$('#unlock').onclick = () => { state.locks = {}; changed(); toast('Platillos liberados'); };
function changed(){ renderControls(); schedule(); }

/* ---------- Cálculo ---------- */
let tmr; function schedule(){ clearTimeout(tmr); tmr = setTimeout(run, 160); }
function run(){
  save(); state.checked = {};
  if(!(state.budget>0)){ renderEmpty(); return; }
  const days = state.days.map(i => ({i, name:DAYS[i]}));
  const res = planMenu({budget:state.budget, days, meals:state.meals, people:state.people, pref:state.pref, allow:new Set(state.allow), styles:new Set(state.styles), locks:state.locks, seed:state.seed, skip:skipSet()});
  state.result = res; renderResults();
}
function refreshTotals(){ recompute(state.result, skipSet()); renderResults(); }

/* ---------- Resultados ---------- */
const shown = {total:0, left:0, pp:0};
function animateNum(el, key, to, f){
  const from = shown[key] ?? 0; shown[key] = to;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(to-from)<0.5){ el.textContent = f(to); return; }
  const t0 = performance.now(), dur = 450;
  const step = t => { const k = Math.min(1,(t-t0)/dur), e = 1-Math.pow(1-k,3); el.textContent = f(from+(to-from)*e); if(k<1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function renderEmpty(){ $('#results').innerHTML = '<div class="notice info">Escribí tu presupuesto en córdobas para armar el menú.</div>'; $('#mobiTxt').textContent=''; }
function renderResults(){
  ensureList();
  const r = state.result, over = r.total > r.budget + 0.005, left = r.budget - r.total;
  const comidas = r.plan.length * r.meals.length;
  const el = $('#results');
  el.innerHTML = `
    <div class="summary">
      <div><div class="k">Gastás</div><div class="v num" id="vTotal"></div><div class="sub">de ${fmt0(r.budget)}</div></div>
      <div><div class="k">${over?'Te faltan':'Te sobran'}</div><div class="v num ${over?'bad':'good'}" id="vLeft"></div><div class="sub">${over?'para cubrir este menú':'para otra cosa'}</div></div>
      <div class="third"><div class="k">Por persona al día</div><div class="v num" id="vPP"></div><div class="sub">${r.plan.length} ${r.plan.length===1?'día':'días'} · ${comidas} comidas · ${r.people} ${r.people===1?'persona':'personas'}</div></div>
      <div class="meter"><div class="bar${over?' over':''}" role="img" aria-label="Usás ${Math.round(r.total/r.budget*100)}% del presupuesto"><i style="width:${Math.min(100, r.total/r.budget*100)}%"></i></div>
      <div class="meter-l"><span>Usás ${Math.round(r.total/r.budget*100)}% del presupuesto</span><span>${state.pantry?'Sin contar lo básico de la despensa':'Incluye sal, aceite y especias'}</span></div></div>
    </div>
    ${over?`<div class="notice"><b>Con ${fmt0(r.budget)} no alcanza.</b> Este es el menú más barato que encontramos con tus filtros. Probá con menos días o comidas, quitá filtros, o subí el presupuesto a ${fmt0(Math.ceil(r.total/50)*50)}.</div>`:''}
    ${r.fallbacks.length?`<div class="notice info">No hay recetas de ${r.fallbacks.map(m=>MEAL_N[m].toLowerCase()).join(' ni ')} con lo que elegiste en "¿Qué querés comer?", así que usamos todas las opciones para esa comida.</div>`:''}
    <div class="tabs" role="tablist" id="tabs">
      ${[['menu','Menú'],['lista','Lista de compras'],['recetas','Recetas'],['catalogo','Precios']].map(([k,l])=>`<button role="tab" data-t="${k}" aria-selected="${state.tab===k}">${l}${k==='lista'?`<span class="count">${r.list.filter(x=>!x.pantry).length}</span>`:''}</button>`).join('')}
    </div>
    <div id="tabBody" class="fade"></div>
    <div id="finalBox"></div>`;
  animateNum($('#vTotal'),'total', r.total, fmt0);
  animateNum($('#vLeft'),'left', Math.abs(left), fmt0);
  animateNum($('#vPP'),'pp', r.total/r.plan.length/r.people, fmt0);
  $('#mobiTxt').innerHTML = `Gastás <b>${fmt0(r.total)}</b> de ${fmt0(r.budget)}`;
  $('#tabs').onclick = e => { const b = e.target.closest('[data-t]'); if(b){ state.tab=b.dataset.t; renderTab(); document.querySelectorAll('#tabs button').forEach(x=>x.setAttribute('aria-selected', String(x===b))); } };
  renderTab();
}
function ensureList(){ const r = state.result; r.list = shoppingList(r.needs, r.plan, r.meals, skipSet()); }

function renderTab(){
  const body = $('#tabBody'), r = state.result;
  body.classList.remove('fade'); void body.offsetWidth; body.classList.add('fade');
  if(state.tab==='menu') body.innerHTML = renderMenu(r);
  if(state.tab==='lista') body.innerHTML = renderList(r);
  if(state.tab==='recetas') body.innerHTML = renderRecipes(r);
  if(state.tab==='catalogo') { body.innerHTML = renderCatalogShell(); renderCatalogRows(); }
  $('#finalBox').innerHTML = state.tab==='catalogo' ? '' : renderFinal(r);
  body.onclick = e => {
    const sw = e.target.closest('[data-swap]'); if(sw){ openSwap(+sw.dataset.pi, sw.dataset.m); return; }
    const m = e.target.closest('[data-r]'); if(m){ openRecipe(m.dataset.r); return; }
    if(e.target.closest('#copy')) copyList();
    const cc = e.target.closest('[data-cc]'); if(cc){ state.catC = cc.dataset.cc; document.querySelectorAll('[data-cc]').forEach(x=>x.setAttribute('aria-pressed', String(x===cc))); renderCatalogRows(); }
  };
  body.onchange = e => { if(e.target.matches('.item input')){ state.checked[e.target.dataset.k] = e.target.checked; e.target.closest('.item').classList.toggle('done', e.target.checked); updateProgress(); } };
  body.oninput = e => { if(e.target.id==='catQ'){ state.catQ = e.target.value; renderCatalogRows(); } };
}
const tagsHtml = (rec, pref) => `<div class="tags">${rec.t.map(t=>`<span class="tag${t===pref?' hit':''}">${FOCUS[t]}</span>`).join('')}<span class="tag">${PROT[rec.p]}</span>${rec.e.filter(x=>x!=='rapido').map(x=>`<span class="tag${state.styles.includes(x)?' hit':''}">${STYLES[x]}</span>`).join('')}<span class="tag${state.styles.includes('rapido')&&rec.min<=20?' hit':''}">${rec.min} min</span></div>`;
function renderMenu(r){
  return `<div class="week">${r.plan.map((row,pi)=>{
    const dayCost = r.meals.reduce((s,m)=>s+recipeCost(row.meals[m], r.people, skipSet()),0);
    return `<article class="daycard"><div class="dayhead"><h3>${row.day}</h3><span class="num">≈ ${fmt0(dayCost)}</span></div>${r.meals.map(m=>{
      const rec=row.meals[m], locked = state.locks[row.di+m]===rec.id;
      return `<div class="meal" id="m-${row.di}${m}"><span class="meal-ic" aria-hidden="true">${ICON[m]}</span>
        <button class="meal-t" data-r="${rec.id}"><small>${MEAL_N[m]}${locked?'<span class="lock">Fijado</span>':''}</small><b>${rec.n}</b>${tagsHtml(rec, r.pref)}</button>
        <span class="meal-r"><span class="c">≈${fmt0(recipeCost(rec, r.people, skipSet()))}</span><button class="swap" data-swap data-pi="${pi}" data-m="${m}" aria-label="Cambiar ${MEAL_N[m].toLowerCase()} del ${row.day}">${ICON.swap}Cambiar</button></span></div>`;}).join('')}</article>`;}).join('')}</div>
    <p class="hint" style="margin:10px 4px 0">El costo por plato es lo que usás de cada ingrediente. Lo que sobra de un empaque se aprovecha en otros platos.</p>`;
}
function renderList(r){
  let html = `<div class="receipt"><div class="rc-head"><b>LISTA DE COMPRAS</b><span>La Colonia · ${r.plan.length} ${r.plan.length===1?'día':'días'} · ${r.people} ${r.people===1?'persona':'personas'}</span></div>`;
  let cat = null;
  const shop = r.list.filter(x=>!x.pantry), pantry = r.list.filter(x=>x.pantry);
  const row = it => { const o = it.picks[0]?.o; const done = !!state.checked[it.key];
    const leftTxt = !it.pantry && it.left > (it.u==='u'? .2 : it.u==='ml'? 30 : 40) ? `<span class="sobra">Sobra ≈ ${amount(it.left, it.u)}</span>` : '';
    return `<label class="item${done?' done':''}${it.pantry?' pantry':''}"><input type="checkbox" data-k="${it.key}" ${done?'checked':''}>
      <span class="item-n"><b>${it.n} · ${bought(it.picks)}</b><span>${it.picks.map(p=>esc(p.o.d)).join(' + ')}</span><span>Usás ${amount(it.need, it.u)} en ${it.uses} ${it.uses===1?'plato':'platos'}</span>${leftTxt}
      ${o?`<a href="https://lacolonia.com.ni/producto/${o.id}" target="_blank" rel="noopener">Ver en La Colonia ↗</a>`:''}</span>
      <span class="item-p">${it.pantry?'en casa':fmt(it.cost)}</span></label>`; };
  for(const it of shop){
    if(it.c!==cat){ cat = it.c; const sub = shop.filter(x=>x.c===cat).reduce((s,x)=>s+x.cost,0); html += `<div class="rc-cat"><span>${CATS[cat]}</span><span>${fmt(sub)}</span></div>`; }
    html += row(it);
  }
  if(pantry.length) html += `<div class="rc-cat"><span>Despensa · ya lo tenés</span><span>${fmt(pantry.reduce((s,x)=>s+x.cost,0))}</span></div>` + pantry.map(row).join('');
  html += `<div class="rc-total"><span>TOTAL</span><span>${fmt(r.total)}</span></div>
    <div class="rc-total small"><span>Presupuesto</span><span>${fmt(r.budget)}</span></div>
    <div class="rc-total small"><span>${r.total>r.budget?'Faltan':'Sobran'}</span><span>${fmt(Math.abs(r.budget-r.total))}</span></div>
    <div class="progress" id="progress"></div></div>
    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn btn-primary" id="copy" style="flex:1">Copiar lista para WhatsApp</button></div>`;
  setTimeout(updateProgress);
  return html;
}
function updateProgress(){ const p = $('#progress'); if(!p) return; const shop = state.result.list.filter(x=>!x.pantry); const n = shop.filter(x=>state.checked[x.key]).length; p.textContent = n ? `${n} de ${shop.length} productos en el carrito` : 'Marcá los productos mientras comprás.'; }
function renderRecipes(r){
  const count = {}; r.plan.forEach(row=>r.meals.forEach(m=>{ const id=row.meals[m].id; count[id]=(count[id]||0)+1; }));
  return r.meals.map(m=>{
    const recs = R.filter(x=>x.m===m && count[x.id]);
    return `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px"><div class="eyebrow" style="padding:0 4px">${MEAL_N[m]}</div><div class="rgrid">${recs.map(x=>`<button class="rcard" data-r="${x.id}"><b>${x.n}</b>${tagsHtml(x, r.pref)}<span class="meta"><span>≈ ${fmt0(recipeCost(x,r.people,skipSet()))} para ${r.people}</span><span class="times">${count[x.id]}× en el menú</span></span></button>`).join('')}</div></div>`;
  }).join('') + `<p class="hint" style="margin:0 4px">En total hay ${R.length} recetas disponibles. Usá "Cambiar" en el menú para ver otras.</p>`;
}
function renderFinal(r){
  const shop = r.list.filter(x=>!x.pantry);
  return `<section class="final" aria-labelledby="finalT"><div class="final-h"><div><div class="eyebrow">Resumen</div><h2 id="finalT">Total a comprar</h2></div><span class="hint">${shop.length} productos · precios de La Colonia</span></div>
  <div class="table-wrap"><table><thead><tr><th>Producto</th><th>Cantidad</th><th class="r">Subtotal</th></tr></thead><tbody>
  ${shop.map(it=>`<tr><td>${it.n}<span class="mut">${it.picks.map(p=>esc(p.o.d)).join(' + ')}</span></td><td class="num">${bought(it.picks)}</td><td class="r num">${fmt(it.cost)}</td></tr>`).join('')}
  </tbody><tfoot><tr><td colspan="2">Total</td><td class="r">${fmt(r.total)}</td></tr></tfoot></table></div></section>`;
}

/* ---------- Catálogo de precios ---------- */
function renderCatalogShell(){
  return `<div style="display:flex;flex-direction:column;gap:12px">
    <div class="cat-tools"><label class="search">${ICON.search}<input id="catQ" placeholder="Buscar producto: arroz, pollo, queso…" value="${esc(state.catQ)}" aria-label="Buscar producto"></label></div>
    <div class="chips">${[['all','Todo'],...Object.entries(CATS)].map(([k,l])=>`<button class="chip" data-cc="${k}" aria-pressed="${state.catC===k}">${l}</button>`).join('')}</div>
    <div class="table-wrap"><table><thead><tr><th>Producto</th><th class="r">Precio</th><th class="r">Cambio</th></tr></thead><tbody id="catRows"></tbody></table></div>
    <p class="hint" style="margin:0 4px" id="catNote"></p></div>`;
}
function renderCatalogRows(){
  const q = state.catQ.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const rows = allOptions().filter(({ing,o}) => (state.catC==='all' || ing.c===state.catC) && (!q || (ing.n+' '+o.d).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').includes(q)));
  const used = k => R.filter(r=>r.i.some(([x])=>x===k)).length;
  $('#catRows').innerHTML = rows.map(({key,ing,o})=>{
    const b = (PRICES.previous && PRICES.previous[o.id]) || BASE[o.id], d = b ? (o.p-b)/b*100 : 0;
    const chg = Math.abs(d) < .05 ? '<span class="chg">—</span>' : `<span class="chg ${d>0?'up':'down'}">${d>0?'▲':'▼'} ${Math.abs(d).toFixed(1)}%</span>`;
    return `<tr><td>${esc(o.d)}<span class="mut">${ing.n} · ${CATS[ing.c]} · en ${used(key)} recetas · <a href="https://lacolonia.com.ni/producto/${o.id}" target="_blank" rel="noopener">#${o.id} ↗</a></span></td><td class="r num">${fmt(o.p)}<span class="mut">${o.b?'por libra':o.k}</span></td><td class="r">${chg}</td></tr>`;
  }).join('') || '<tr><td colspan="3">No encontramos ese producto.</td></tr>';
  $('#catNote').textContent = `${rows.length} productos. ${PRICES.updatedAt ? 'Precios actualizados el '+new Date(PRICES.updatedAt).toLocaleDateString('es-NI',{day:'numeric',month:'long'})+'. El cambio se compara con la actualización anterior.' : 'Precios del 4 nov 2026.'}`;
}

/* ---------- Cambiar platillo ---------- */
function openSwap(pi, m){
  const r = state.result, row = r.plan[pi], cur = row.meals[m], skip = skipSet();
  const allow = new Set(state.allow);
  let showAll = false;
  const draw = () => {
    const list = R.filter(x=>x.m===m && (showAll || allow.has(x.p)));
    const withDelta = list.map(x=>{ const n = Object.assign({}, r.needs); let nn = n;
      const sub = (needs, rec, sign) => { const o = Object.assign({}, needs); for(const [k,a] of rec.i){ o[k]=(o[k]||0)+sign*a*r.people; if(o[k]<1e-9) delete o[k]; } return o; };
      nn = sub(sub(nn, cur, -1), x, 1); return {x, d: totalCost(nn, skip) - r.total}; }).sort((a,b)=>(a.x.id===cur.id?-1:b.x.id===cur.id?1:a.d-b.d));
    $('#altList').innerHTML = withDelta.map(({x,d})=>`<button class="alt${x.id===cur.id?' cur':''}" data-pick="${x.id}"><span><b>${x.n}</b>${tagsHtml(x, r.pref)}</span><span class="delta ${x.id===cur.id?'':d>0.5?'up':d<-0.5?'down':''}">${x.id===cur.id?'Actual':(d>0.5?'+':d<-0.5?'−':'±')+fmt0(Math.abs(d))}</span></button>`).join('');
    $('#altAll').textContent = showAll ? 'Solo lo que elegí comer' : 'Ver todas las opciones';
  };
  const locked = state.locks[row.di+m];
  sheet(`<div><div class="eyebrow">${row.day} · ${MEAL_N[m]}</div><h3>Cambiar platillo</h3></div>
    <p class="hint" style="margin:0">El número indica cuánto sube o baja el total de tu compra. El platillo que elijas queda fijado aunque cambies los ajustes.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost" id="altRand" style="flex:1">Sorprendeme</button><button class="btn btn-ghost" id="altAll" style="flex:1"></button>${locked?'<button class="btn btn-ghost" id="altUnlock" style="flex:1">Soltar fijado</button>':''}</div>
    <div class="alts" id="altList"></div>
    <button class="btn btn-ghost" data-close>Cerrar</button>`);
  draw();
  const pick = id => { const rec = R.find(x=>x.id===id); row.meals[m] = rec; state.locks[row.di+m] = id; save(); closeSheet(); refreshTotals(); renderControls(); toast(`${MEAL_N[m]} del ${row.day}: ${rec.n}`);
    requestAnimationFrame(()=>{ const el = document.getElementById('m-'+row.di+m); if(el){ el.classList.add('flash'); } }); };
  $('#altList').onclick = e => { const b = e.target.closest('[data-pick]'); if(b && b.dataset.pick!==cur.id) pick(b.dataset.pick); };
  $('#altAll').onclick = () => { showAll=!showAll; draw(); };
  $('#altRand').onclick = () => { const opts = R.filter(x=>x.m===m && allow.has(x.p) && x.id!==cur.id); if(opts.length) pick(opts[Math.floor(Math.random()*opts.length)].id); };
  const ul = $('#altUnlock'); if(ul) ul.onclick = () => { delete state.locks[row.di+m]; save(); closeSheet(); renderControls(); toast('Platillo liberado'); };
}

/* ---------- Receta ---------- */
function openRecipe(id){
  const rec = R.find(x=>x.id===id), p = state.result.people;
  sheet(`<div><div class="eyebrow">${MEAL_N[rec.m]}</div><h3 id="stitle">${rec.n}</h3></div>
    <div class="facts2"><span class="fact">Para <b>${p}</b> ${p===1?'persona':'personas'}</span><span class="fact"><b>${rec.min}</b> min</span><span class="fact">≈ <b>${fmt0(recipeCost(rec,p,skipSet()))}</b></span><span class="fact">${PROT[rec.p]}</span></div>
    <h4>Ingredientes</h4>
    <ul class="ing">${rec.i.map(([k,a])=>`<li><span>${P[k].n}</span><span>${amount(a*p, P[k].u)}</span></li>`).join('')}<li><span>Sal y especias</span><span>al gusto</span></li></ul>
    <h4>Preparación</h4>
    <ol class="stepsl">${rec.s.map(s=>`<li><span>${s}</span></li>`).join('')}</ol>
    <button class="btn btn-ghost" data-close>Cerrar</button>`);
}
let lastFocus = null;
function sheet(html){
  lastFocus = document.activeElement;
  $('#sheetRoot').innerHTML = `<div class="sheet-bg" id="sbg"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`;
  $('#sbg').onclick = e => { if(e.target.id==='sbg' || e.target.closest('[data-close]')) closeSheet(); };
  document.addEventListener('keydown', escKey);
  const f = $('#sheetRoot .sheet button'); if(f) f.focus();
}
function escKey(e){ if(e.key==='Escape') closeSheet(); }
function closeSheet(){ $('#sheetRoot').innerHTML=''; document.removeEventListener('keydown', escKey); if(lastFocus && document.contains(lastFocus)) lastFocus.focus(); }

/* ---------- Copiar ---------- */
function copyList(){
  const r = state.result;
  const txt = `🛒 Lista de compras (Rinde) · ${r.plan.length} días · ${r.people} personas\n\n` + r.list.filter(x=>!x.pantry).map(it=>`☐ ${it.n}: ${bought(it.picks)} — ${fmt(it.cost)}`).join('\n') + `\n\nTOTAL: ${fmt(r.total)} de ${fmt(r.budget)}`;
  const fallback = () => { const ta=document.createElement('textarea'); ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); let ok=false; try{ ok=document.execCommand('copy'); }catch(e){} ta.remove(); toast(ok?'Lista copiada':'No se pudo copiar'); };
  try{ navigator.clipboard.writeText(txt).then(()=>toast('Lista copiada'), fallback); }catch(e){ fallback(); }
}
let tt; function toast(msg){ let t=$('.toast'); if(!t){ t=document.createElement('div'); t.className='toast'; t.setAttribute('role','status'); document.body.appendChild(t);} t.textContent=msg; t.hidden=false; clearTimeout(tt); tt=setTimeout(()=>t.hidden=true, 2200); }

/* ---------- Navegación ---------- */
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { state.tab = b.dataset.go; if(state.result){ renderTab(); document.querySelectorAll('#tabs button').forEach(x=>x.setAttribute('aria-selected', String(x.dataset.t===state.tab))); } $('#results').scrollIntoView({behavior:'smooth'}); });
$('#mobiGo').onclick = () => { state.tab='menu'; if(state.result) renderResults(); $('#results').scrollIntoView({behavior:'smooth'}); };

/* ---------- Precios en línea (función de Netlify) ---------- */
const PRICES = {updatedAt:null, previous:null};
function setStatus(s, txt){ $('#status').dataset.s = s; $('#statusTxt').innerHTML = txt; }
(async function livePrices(){
  setStatus('loading','Actualizando precios…');
  try{
    const ctrl = new AbortController(); const t = setTimeout(()=>ctrl.abort(), 15000);
    const res = await fetch('/api/precios', {signal: ctrl.signal, headers:{accept:'application/json'}}); clearTimeout(t);
    if(!res.ok) throw new Error('HTTP '+res.status);
    const d = await res.json();
    if(!d.updatedAt || !d.prices || !Object.keys(d.prices).length) throw new Error('sin datos');
    PRICES.updatedAt = d.updatedAt; PRICES.previous = d.previous || null;
    const when = new Date(d.updatedAt).toLocaleDateString('es-NI',{day:'numeric', month:'short'});
    setStatus('live', `Precios al día<span class="ptxt-long"> · ${when}</span>`);
    setPrices(d.prices);
    if(state.result) run();
  }catch(e){ setStatus('base','Precios del 4 nov 2026'); }
})();
if('serviceWorker' in navigator && location.protocol==='https:') window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(()=>{}));

setBudget(state.budget); renderControls(); run();
