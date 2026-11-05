/* ================== NÚCLEO: precios, IVA, compras y planificador ================== */
const IVA_RATE = 0.15;
const ING = DATA.ing, R = DATA.rec, CAN = DATA.can;
const PROT = {pollo:'Pollo', res:'Res', cerdo:'Cerdo', pescado:'Pescado y mariscos', huevo:'Huevo', embutido:'Embutidos', sincarne:'Sin carne'};
const COCINAS = {nica:'Nica', latina:'Latinoamericana', italiana:'Italiana', asiatica:'Asiática', internacional:'Internacional', casera:'Casera'};
const STYLES = {tipico:'Típico nica', sopa:'Sopas', rapido:'Rápido', ligero:'Ligero', pasta:'Pastas'};
const FOCUS = {proteina:'Proteína', vegetal:'Vegetales', cereal:'Cereal'};
const MEALS = [['d','Desayuno'],['a','Almuerzo'],['c','Cena']];
const LIST_CATS = {c:'Carnes y embutidos', l:'Lácteos y huevos', g:'Granos y abarrotes', v:'Frutas y verduras', e:'Condimentos y salsas'};
const PANTRY = new Set(Object.keys(ING).filter(k => ING[k].pan));
const RMAP = Object.fromEntries(R.map(r => [r.id, r]));

/* ---------- Catálogo ---------- */
const CAT = DATA.cat.map(([id, n, p, si, x, was, q, u, w]) => ({id, n, p, si, x, was, q, u:['g','ml','u'][u], w}));
const CAT_BY = Object.fromEntries(CAT.map(p => [p.id, p]));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
CAT.forEach(p => { p.k = norm(p.n + ' ' + DATA.subs[p.si].join(' ')); });

/* ---------- IVA ---------- */
const CFG = {iva: true};
const ivaOf = (price, exempt) => (CFG.iva && !exempt) ? price * IVA_RATE : 0;
const withIva = (price, exempt) => price + ivaOf(price, exempt);

/* ---------- Precios en vivo ---------- */
let PRICE_VERSION = 0; const buyCache = new Map();
const ALL_OPTS = () => { const a = []; for (const k in ING) for (const o of ING[k].o) a.push(o); for (const it of CAN) if (it.o) for (const o of it.o) a.push(o); return a; };
function applyPrices(map, extra) {
  let n = 0;
  for (const o of ALL_OPTS()) { const v = map[o.id]; if (v > 0 && v !== o.p) { o.p = +v; n++; } }
  for (const p of CAT) { const v = map[p.id]; if (v > 0 && v !== p.p) { p.prev = p.prev ?? p.p; p.p = +v; n++; } }
  if (extra) for (const e of extra) if (!CAT_BY[e.id]) { const p = {id:e.id, n:e.n, p:e.p, si:e.si ?? 0, x:e.x ? 1 : 0, was:0, q:1, u:'u', w:0, nuevo:1}; p.k = norm(p.n); CAT.push(p); CAT_BY[p.id] = p; n++; }
  if (n) { PRICE_VERSION++; buyCache.clear(); }
  return n;
}

/* ---------- Compra óptima de empaques ----------
   Devuelve {cost (con IVA), base (sin IVA), iva, picks:[{o,c}], qty} */
function buyOpts(opts, need, key) {
  if (need <= 1e-9 || !opts.length) return {cost:0, base:0, iva:0, picks:[], qty:0};
  const ck = key ? key + '|' + Math.round(need * 100) + '|' + (CFG.iva ? 1 : 0) + '|' + opts.length : null;
  if (ck) { const h = buyCache.get(ck); if (h) return h; }
  const pe = o => withIva(o.p, o.x);
  const single = (o, n) => {
    if (n <= 1e-9) return {cost:0, picks:[], qty:0};
    if (o.b) { const st = o.st || 113.4; const q = Math.ceil(n / st - 1e-9) * st; return {cost:q / o.s * pe(o), picks:[{o, c:q / o.s}], qty:q}; }
    const c = Math.ceil(n / o.s - 1e-9); return {cost:c * pe(o), picks:[{o, c}], qty:c * o.s};
  };
  let best = null;
  for (const big of opts) {
    if (big.b) continue;
    const max = Math.min(Math.ceil(need / big.s - 1e-9), 400);
    for (let k = 0; k <= max; k++) {
      const rest = need - k * big.s;
      for (const o of opts) {
        if (o === big && k > 0) continue;
        const r = single(o, rest), cost = k * pe(big) + r.cost;
        if (!best || cost < best.cost - 1e-9) best = {cost, picks:(k ? [{o:big, c:k}] : []).concat(r.picks), qty:k * big.s + r.qty};
      }
      if (rest <= 0) break;
    }
  }
  for (const o of opts) { const r = single(o, need); if (!best || r.cost < best.cost - 1e-9) best = r; }
  const m = new Map(); for (const p of best.picks) m.set(p.o, (m.get(p.o) || 0) + p.c);
  best.picks = [...m].map(([o, c]) => ({o, c}));
  best.base = best.picks.reduce((s, {o, c}) => s + o.p * c, 0);
  best.iva = best.cost - best.base;
  if (ck) buyCache.set(ck, best);
  return best;
}
const buy = (key, need) => buyOpts(ING[key].o, need, 'i:' + key);
function totals(needs, skip) { let cost = 0, base = 0, iva = 0; for (const k in needs) { if (skip && skip.has(k)) continue; const b = buy(k, needs[k]); cost += b.cost; base += b.base; iva += b.iva; } return {cost, base, iva}; }
const totalCost = (needs, skip) => totals(needs, skip).cost;
function addNeeds(needs, recipe, people, sign = 1) {
  const n = Object.assign({}, needs);
  for (const [k, a] of recipe.i) { n[k] = (n[k] || 0) + sign * a * people; if (n[k] < 1e-9) delete n[k]; }
  return n;
}
const unitPrice = key => Math.min(...ING[key].o.map(o => withIva(o.p, o.x) / o.s));
const recipeCost = (r, people, skip) => r.i.reduce((s, [k, a]) => s + (skip && skip.has(k) ? 0 : unitPrice(k) * a * people), 0);
const isQuick = r => r.min <= 20;
const styleHit = (r, styles) => { let n = 0; for (const s of styles) if (s === 'rapido' ? isQuick(r) : r.e.includes(s)) n++; return n; };
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- Planificador semanal ---------- */
function recipePool(m, allow, cocinas) {
  const all = R.filter(r => r.m === m);
  let f = all.filter(r => allow.has(r.p) && (!cocinas || cocinas.has(r.k)));
  if (!f.length) f = all.filter(r => allow.has(r.p));
  return {list:f.length ? f : all, fallback:!f.length || f.length < all.filter(r => allow.has(r.p)).length && false};
}
function planMenu(opts) {
  const {budget, days, meals, people, pref, allow, cocinas, styles, locks = {}, seed = 1, skip} = opts;
  const pools = {}, fallbacks = [];
  for (const m of meals) { pools[m] = recipePool(m, allow, cocinas); if (!R.some(r => r.m === m && allow.has(r.p))) fallbacks.push(m); }
  const maxUses = m => Math.max(2, Math.ceil(days.length / 4), Math.ceil(days.length / pools[m].list.length) + 1);
  const hit = r => pref !== 'equilibrado' && r.t.includes(pref);
  const lockOf = (di, m) => { const id = locks[days[di].i + m]; return id ? RMAP[id] : null; };
  const build = costW => {
    const rand = rng(seed); let needs = {}; const uses = {}; const plan = [];
    days.forEach((d, di) => meals.forEach(m => { const L = lockOf(di, m); if (L) { uses[L.id] = (uses[L.id] || 0) + 1; needs = addNeeds(needs, L, people); } }));
    days.forEach((day, di) => {
      const row = {day:day.name, di:day.i, meals:{}};
      for (const m of meals) {
        const L = lockOf(di, m); if (L) { row.meals[m] = L; continue; }
        const prev = di > 0 ? plan[di - 1].meals[m]?.id : null;
        let best = null, bestS = Infinity; const base = totalCost(needs, skip);
        // muestra aleatoria para que sea rápido con muchas recetas
        const cand = pools[m].list.length > 60 ? pools[m].list.filter(() => rand() < 60 / pools[m].list.length) : pools[m].list;
        for (const r of cand) {
          if (r.id === prev && cand.length > 1) continue;
          const u = uses[r.id] || 0; if (u >= maxUses(m)) continue;
          const marg = totalCost(addNeeds(needs, r, people), skip) - base;
          const s = marg * costW - (hit(r) ? 30 * people : 0) - styleHit(r, styles) * 22 * people + u * 35 * people + rand() * 18 * people;
          if (s < bestS) { bestS = s; best = r; }
        }
        if (!best) best = pools[m].list[Math.floor(rand() * pools[m].list.length)];
        row.meals[m] = best; uses[best.id] = (uses[best.id] || 0) + 1; needs = addNeeds(needs, best, people);
      }
      plan.push(row);
    });
    return {plan, needs, total:totalCost(needs, skip)};
  };
  let res = null;
  for (const w of [0.3, 0.6, 1, 1.6, 2.5, 4]) { const c = build(w); if (!res || c.total < res.total) res = c; if (c.total <= budget) { res = c; break; } }
  const needsOf = plan => plan.reduce((n, row) => meals.reduce((nn, m) => addNeeds(nn, row.meals[m], people), n), {});
  let total = res.total, guard = 0;
  while (total > budget && guard++ < 200) {
    const cu = {}; res.plan.forEach(row => meals.forEach(m => { const id = row.meals[m].id; cu[id] = (cu[id] || 0) + 1; }));
    let bestGain = 0, bestSwap = null;
    res.plan.forEach((row, pi) => meals.forEach(m => {
      if (lockOf(pi, m)) return;
      const cur = row.meals[m];
      for (const r of pools[m].list) {
        if (r.id === cur.id || (cu[r.id] || 0) >= maxUses(m)) continue;
        if (pi > 0 && res.plan[pi - 1].meals[m].id === r.id) continue;
        if (pi < res.plan.length - 1 && res.plan[pi + 1].meals[m].id === r.id) continue;
        if (recipeCost(r, people, skip) >= recipeCost(cur, people, skip)) continue;
        const t = totalCost(addNeeds(addNeeds(res.needs, cur, people, -1), r, people), skip);
        const gain = total - t - (hit(cur) && !hit(r) ? 8 * people : 0);
        if (gain > bestGain + 1e-6) { bestGain = gain; bestSwap = {pi, m, r}; }
      }
    }));
    if (!bestSwap) break;
    res.plan[bestSwap.pi].meals[bestSwap.m] = bestSwap.r; res.needs = needsOf(res.plan); total = totalCost(res.needs, skip);
  }
  return {plan:res.plan, needs:res.needs, total, budget, people, pref, meals, fallbacks};
}
function recompute(result, skip) { const {plan, meals, people} = result; result.needs = plan.reduce((n, row) => meals.reduce((nn, m) => addNeeds(nn, row.meals[m], people), n), {}); result.total = totalCost(result.needs, skip); return result; }
function shoppingList(needs, plan, meals, skip) {
  const usedIn = {};
  plan.forEach(row => meals.forEach(m => row.meals[m].i.forEach(([k]) => { (usedIn[k] = usedIn[k] || new Set()).add(row.di + m); })));
  return Object.keys(needs).map(k => { const b = buy(k, needs[k]); return {key:k, ...ING[k], need:needs[k], ...b, left:b.qty - needs[k], uses:usedIn[k] ? usedIn[k].size : 0, pantry:!!(skip && skip.has(k))}; })
    .sort((a, b) => (a.pantry - b.pantry) || 'cglve'.indexOf(a.c) - 'cglve'.indexOf(b.c) || b.cost - a.cost);
}

/* ---------- Presupuesto del mes ---------- */
function canastaPlan({people, level, bulk, groups, removed, mult}) {
  const lines = [];
  for (const it of CAN) {
    if (it.lvl > level || !groups.has(it.g) || removed.has(it.k)) continue;
    const need = (it.pp * people + it.casa) * (mult[it.k] || 1);
    if (need <= 0) continue;
    let opts = it.ing ? ING[it.k].o : it.o;
    let retail = opts;
    const nonW = opts.filter(o => !o.b);
    if (nonW.length) { const minS = Math.min(...nonW.map(o => o.s)); retail = opts.filter(o => o.b || o.s <= minS * 1.01); }
    const b = buyOpts(bulk ? opts : retail, need, 'c:' + it.k + (bulk ? 'B' : 'R'));
    const r = bulk ? buyOpts(retail, need, 'c:' + it.k + 'R') : b;
    lines.push({it, need, ...b, retailCost:r.cost});
  }
  const t = lines.reduce((a, l) => ({cost:a.cost + l.cost, base:a.base + l.base, iva:a.iva + l.iva, retail:a.retail + l.retailCost}), {cost:0, base:0, iva:0, retail:0});
  return {lines, ...t, saving:Math.max(0, t.retail - t.cost)};
}

/* ---------- ¿Qué cocino? ---------- */
function cookSuggestions(have, {people = 2, pantry = true, meal = 'all', skip}) {
  const H = new Set(have);
  const res = [];
  for (const r of R) {
    if (meal !== 'all' && r.m !== meal) continue;
    const main = r.i.filter(([k]) => !(pantry && PANTRY.has(k)));
    if (!main.length) continue;
    const got = main.filter(([k]) => H.has(k)), miss = main.filter(([k]) => !H.has(k));
    if (!got.length) continue;
    const missCost = miss.reduce((s, [k, a]) => s + buy(k, a * people).cost, 0);
    res.push({r, got, miss, score:got.length / main.length, missCost});
  }
  res.sort((a, b) => b.score - a.score || a.miss.length - b.miss.length || a.missCost - b.missCost);
  // ingredientes que más recetas desbloquean
  const unlock = {};
  for (const x of res) if (x.miss.length === 1) { const k = x.miss[0][0]; unlock[k] = (unlock[k] || 0) + 1; }
  const tips = Object.entries(unlock).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return {list:res, tips};
}

if (typeof module !== 'undefined' && module.exports) module.exports = {ING, R, CAN, CAT, CFG, buy, buyOpts, planMenu, shoppingList, totals, canastaPlan, cookSuggestions, applyPrices, recipeCost, PANTRY};

/* ================== INTERFAZ: comunes ================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const MEAL_N = {d:'Desayuno', a:'Almuerzo', c:'Cena'};
const ICON = {
  d:'<svg viewBox="0 0 24 24" fill="none" stroke="var(--maiz-ink)" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="14" r="4"/><path d="M12 4v2M4.5 7.5l1.4 1.4M19.5 7.5l-1.4 1.4M3 18h18"/></svg>',
  a:'<svg viewBox="0 0 24 24" fill="none" stroke="var(--maiz-ink)" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg>',
  c:'<svg viewBox="0 0 24 24" fill="none" stroke="var(--maiz-ink)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
  mes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  buscar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20.5" r="1.3"/><circle cx="17" cy="20.5" r="1.3"/></svg>',
  cocinar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.9V20h12v-6.1"/><path d="M6 14a4 4 0 0 1-.6-7.9 5 5 0 0 1 9.2-1.6A4 4 0 1 1 18 14z"/><path d="M6 17h12"/></svg>',
  refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
};
const VIEWS = [['menu','Menú semanal','Menú'],['mes','Presupuesto del mes','Mes'],['buscar','Buscador de precios','Buscador'],['cocinar','¿Qué cocino?','Cocinar']];

const fmt = n => 'C$' + n.toLocaleString('es-NI', {minimumFractionDigits:2, maximumFractionDigits:2});
const fmt0 = n => 'C$' + Math.round(n).toLocaleString('es-NI');
const esc = s => String(s).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
const frac = x => { const w = Math.floor(x + 1e-9), r = Math.round((x - w) * 4) / 4; if (r === 1) return String(w + 1); const f = {0:'',0.25:'¼',0.5:'½',0.75:'¾'}[r]; return w ? w + (f ? ' ' + f : '') : (f || '¼'); };
function amount(v, u) {
  if (u === 'u') return (v < 1 && v > 0 ? frac(v) : Math.round(v * 10) / 10) + ' u';
  if (u === 'ml') return v >= 1000 ? (v / 1000).toFixed(1).replace('.0', '') + ' L' : Math.round(v) + ' ml';
  if (v >= 1000) return (v / 1000).toFixed(2).replace(/\.?0+$/, '') + ' kg';
  return (v >= 10 ? Math.round(v) : Math.round(v * 10) / 10) + ' g';
}
const pkLabel = o => o.b ? 'lb' : o.d.replace(/\s·.*$/, '');
const bought = picks => picks.map(({o, c}) => o.b ? (c).toFixed(2).replace(/\.?0+$/, '') + ' lb ' + o.d.replace(/\s·.*$/, '').replace(/\s*(Libra|lb|LB).*/i, '') : (c > 1 ? c + ' × ' : '') + o.d).join(' + ');
const store = {get(k, d){ try { const v = localStorage.getItem('rinde3-' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v){ try { localStorage.setItem('rinde3-' + k, JSON.stringify(v)); } catch (e) {} }};

/* ---------- Factura: subtotal, IVA, total ---------- */
function totRows(base, iva, extra = '') {
  return `<div class="tot"><div><span>Subtotal</span><span>${fmt(base)}</span></div><div><span>IVA 15 %${CFG.iva ? '' : ' (desactivado)'}</span><span>${fmt(iva)}</span></div><div class="big"><span>TOTAL</span><span>${fmt(base + iva)}</span></div>${extra}</div>`;
}

/* ---------- Animación de números ---------- */
const shown = {};
function animateNum(el, key, to, f) {
  if (!el) return;
  const from = shown[key] ?? 0; shown[key] = to;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(to - from) < .5) { el.textContent = f(to); return; }
  const t0 = performance.now(), dur = 450;
  const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = f(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* ---------- Hoja modal y aviso ---------- */
let lastFocus = null;
function sheet(html, onReady) {
  lastFocus = document.activeElement;
  $('#sheetRoot').innerHTML = `<div class="sheet-bg" id="sbg"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`;
  $('#sbg').addEventListener('click', e => { if (e.target.id === 'sbg' || e.target.closest('[data-close]')) closeSheet(); });
  document.addEventListener('keydown', escKey);
  onReady && onReady($('#sheetRoot .sheet'));
  const f = $('#sheetRoot .sheet input, #sheetRoot .sheet button'); if (f) f.focus();
}
function escKey(e) { if (e.key === 'Escape') closeSheet(); }
function closeSheet() { $('#sheetRoot').innerHTML = ''; document.removeEventListener('keydown', escKey); if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }
let tt; function toast(msg) { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 2300); }
function copyText(txt, ok = 'Lista copiada') {
  const fallback = () => { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); let r = false; try { r = document.execCommand('copy'); } catch (e) {} ta.remove(); toast(r ? ok : 'No se pudo copiar'); };
  try { navigator.clipboard.writeText(txt).then(() => toast(ok), fallback); } catch (e) { fallback(); }
}

/* ---------- Receta ---------- */
const tagsHtml = (rec, opt = {}) => `<div class="tags">${rec.t.map(t => `<span class="tag${t === opt.pref ? ' hit' : ''}">${FOCUS[t]}</span>`).join('')}<span class="tag">${PROT[rec.p]}</span><span class="tag">${COCINAS[rec.k] || ''}</span>${rec.e.filter(x => x !== 'rapido').map(x => `<span class="tag${(opt.styles || []).includes(x) ? ' hit' : ''}">${STYLES[x]}</span>`).join('')}<span class="tag${(opt.styles || []).includes('rapido') && rec.min <= 20 ? ' hit' : ''}">${rec.min} min</span></div>`;
function openRecipe(id, people = 2, skip = null) {
  const rec = RMAP[id];
  sheet(`<div><div class="eyebrow">${MEAL_N[rec.m]} · ${COCINAS[rec.k]}</div><h3>${esc(rec.n)}</h3></div>
    <div class="facts2"><span class="fact">Para <b>${people}</b> ${people === 1 ? 'persona' : 'personas'}</span><span class="fact"><b>${rec.min}</b> min</span><span class="fact">≈ <b>${fmt0(recipeCost(rec, people, skip))}</b> con IVA</span><span class="fact">${PROT[rec.p]}</span></div>
    <h4>Ingredientes y condimentos</h4>
    <ul class="ing">${rec.i.map(([k, a]) => `<li><span>${ING[k].n}${PANTRY.has(k) ? ' <span class="tag">despensa</span>' : ''}</span><span>${amount(a * people, ING[k].u)}</span></li>`).join('')}</ul>
    <h4>Preparación</h4>
    <ol class="stepsl">${rec.s.map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol>
    <button class="btn btn-ghost" data-close>Cerrar</button>`);
}

/* ---------- Carrito compartido (Buscador y ¿Qué cocino?) ---------- */
const CART = {items: store.get('cart', {}), listeners: [],
  add(id, q = 1) { this.items[id] = (this.items[id] || 0) + q; if (this.items[id] <= 0) delete this.items[id]; this.save(); },
  set(id, q) { if (q <= 0) delete this.items[id]; else this.items[id] = q; this.save(); },
  clear() { this.items = {}; this.save(); },
  save() { store.set('cart', this.items); this.listeners.forEach(f => f()); },
  count() { return Object.keys(this.items).filter(id => CAT_BY[id]).length; },
  totals() { let base = 0, iva = 0; for (const id in this.items) { const p = CAT_BY[id]; if (!p) continue; base += p.p * this.items[id]; iva += ivaOf(p.p, p.x) * this.items[id]; } return {base, iva, total:base + iva}; }};

/* ---------- Navegación por secciones ---------- */
const RENDERERS = {};
let current = null;
function route() {
  const h = location.hash.replace('#', '');
  const v = VIEWS.some(x => x[0] === h) ? h : 'menu';
  if (v === current) return;
  current = v;
  $$('section[data-view]').forEach(s => s.hidden = s.dataset.view !== v);
  $$('[data-go]').forEach(a => a.setAttribute('aria-current', a.dataset.go === v ? 'page' : 'false'));
  $('#cartfab').hidden = v !== 'buscar' && v !== 'cocinar' || !CART.count();
  RENDERERS[v] && RENDERERS[v]();
  window.scrollTo({top:0});
}
function navInit() {
  $('#sections').innerHTML = VIEWS.map(([k, , s]) => `<a href="#${k}" data-go="${k}">${ICON[k]}${s === 'Menú' ? 'Menú semanal' : s === 'Mes' ? 'Mes' : s === 'Cocinar' ? '¿Qué cocino?' : s}</a>`).join('');
  $('#tabbar').innerHTML = VIEWS.map(([k, , s]) => `<a href="#${k}" data-go="${k}">${ICON[k]}${s}</a>`).join('');
  window.addEventListener('hashchange', route);
  CFG.iva = store.get('iva', true);
  const sw = $('#ivaSw'); sw.setAttribute('aria-checked', String(CFG.iva));
  sw.onclick = () => { CFG.iva = !CFG.iva; store.set('iva', CFG.iva); sw.setAttribute('aria-checked', String(CFG.iva)); buyCache.clear(); toast(CFG.iva ? 'IVA 15 % sumado a productos gravados' : 'Precios sin IVA'); RENDERERS[current] && RENDERERS[current](); updateFab(); };
  CART.listeners.push(updateFab);
  $('#cartfab').onclick = () => { location.hash = 'buscar'; setTimeout(() => $('#cartBox')?.scrollIntoView({behavior:'smooth'}), 60); };
}
const RERENDER = [];
function updateFab() { const n = CART.count(), t = CART.totals(); const f = $('#cartfab'); f.innerHTML = `${ICON.buscar}<span>${n} ${n === 1 ? 'producto' : 'productos'}</span><b>${fmt0(t.total)}</b>`; f.hidden = !n || (current !== 'buscar' && current !== 'cocinar'); }

/* ---------- Estado de precios ---------- */
function setStatus(s, txt) { $('#status').dataset.s = s; $('#statusTxt').innerHTML = txt; }
function priceDateLabel(iso) { return new Date(iso).toLocaleDateString('es-NI', {day:'numeric', month:'short'}); }

/* ================== MENÚ SEMANAL ================== */
const ALL_P = Object.keys(PROT), ALL_K = Object.keys(COCINAS);
const FOCUS_UI = [['equilibrado','Equilibrado','var(--ink)'],['proteina','Proteína','var(--frijol)'],['vegetal','Vegetales','var(--leaf)'],['cereal','Cereales','var(--maiz)']];
const MS = Object.assign({budget:1500, days:[0,1,2,3,4], meals:['d','a','c'], people:2, pref:'equilibrado', allow:[...ALL_P], cocinas:[...ALL_K], styles:[], pantry:true, locks:{}, seed:7, tab:'menu', checked:{}, result:null}, store.get('menu', {}));
MS.tab = 'menu'; MS.checked = {}; MS.result = null;
const saveMS = () => { const o = {}; for (const k of ['budget','days','meals','people','pref','allow','cocinas','styles','pantry','locks']) o[k] = MS[k]; store.set('menu', o); };
const mSkip = () => MS.pantry ? PANTRY : null;
let menuBuilt = false;

function buildMenu() {
  $('#v-menu').innerHTML = `
  <header class="head">
    <div>
      <div class="eyebrow">Menú semanal · ${R.length} recetas</div>
      <h1>Decí cuánto tenés. <em>Te armamos qué comer.</em></h1>
      <p>Menú de la semana con recetas nicas e internacionales y la lista exacta de lo que hay que comprar en La Colonia, con IVA incluido.</p>
      <div class="facts"><div><b class="num">${R.length}</b>recetas</div><div><b class="num">${CAT.length.toLocaleString('es-NI')}</b>productos</div><div><b>6</b>tipos de cocina</div></div>
    </div>
    <div class="budget">
      <label for="mBudget">Presupuesto para la comida</label>
      <div class="money"><span>C$</span><input id="mBudget" inputmode="numeric" autocomplete="off"></div>
      <div><input class="range" id="mRange" type="range" min="0" max="10000" step="50" aria-label="Barra de presupuesto"><div class="scale num" aria-hidden="true"><span>C$0</span><span>C$5,000</span><span>C$10,000+</span></div></div>
      <div class="qchips" id="mQuick">${[800,1500,2500,4000,6000].map(v => `<button data-v="${v}">C$${v.toLocaleString('es-NI')}</button>`).join('')}</div>
      <div class="perday" id="mPerday"></div>
    </div>
  </header>
  <div class="layout">
    <aside class="settings" aria-label="Ajustes del menú">
      <div class="set"><div class="set-h"><h3>Días</h3><span><button class="linkbtn" id="mWk">Lun–Vie</button> · <button class="linkbtn" id="mAll">Semana</button></span></div><div class="days" id="mDays"></div></div>
      <div class="set"><div class="set-h"><h3>Comidas del día</h3><span id="mMealsCount"></span></div><div id="mMeals"></div></div>
      <div class="set"><div class="set-h"><h3>Personas</h3><span>Ajusta las cantidades</span></div><div class="stepper"><button id="mPm" aria-label="Menos personas">−</button><output id="mPeople" class="num"></output><button id="mPp" aria-label="Más personas">+</button></div></div>
      <div class="set"><div class="set-h"><h3>Querés comer más…</h3></div><div class="seg" id="mFocus"></div></div>
      <div class="set"><div class="set-h"><h3>¿Qué querés comer?</h3><span id="mProtN"></span></div><div class="chips" id="mProts"></div><div class="hint">Tocá para quitar lo que no querés.</div></div>
      <div class="set"><div class="set-h"><h3>Tipo de cocina</h3><span id="mCocN"></span></div><div class="chips" id="mCoc"></div></div>
      <div class="set"><div class="set-h"><h3>Tus preferidos</h3><span>Les damos prioridad</span></div><div class="chips" id="mStyles"></div></div>
      <div class="set"><button class="sw" id="mPantry" role="switch"><span class="l" style="font-weight:500;font-size:14px">Ya tengo sal, aceite, azúcar, consomé y especias</span><span class="track"></span></button></div>
      <div class="actions"><button class="btn btn-primary" id="mAgain">${ICON.refresh}Otra combinación</button><button class="btn btn-ghost" id="mUnlock" hidden></button></div>
    </aside>
    <section class="results" id="mResults" aria-live="polite"></section>
  </div>`;
  const bIn = $('#mBudget'), bR = $('#mRange');
  bIn.addEventListener('input', () => { const raw = bIn.value.replace(/[^\d]/g, ''); mSetBudget(raw, 'input'); bIn.value = raw ? Number(raw).toLocaleString('es-NI') : ''; });
  bR.addEventListener('input', () => mSetBudget(bR.value, 'range'));
  $('#mQuick').onclick = e => { const c = e.target.closest('button'); if (c) mSetBudget(c.dataset.v); };
  $('#mDays').onclick = e => { const b = e.target.closest('.day'); if (!b) return; const i = +b.dataset.i;
    if (MS.days.includes(i)) { if (MS.days.length === 1) return toast('Dejá al menos un día'); MS.days = MS.days.filter(d => d !== i); } else MS.days = [...MS.days, i].sort(); mChanged(); };
  $('#mAll').onclick = () => { MS.days = [0,1,2,3,4,5,6]; mChanged(); };
  $('#mWk').onclick = () => { MS.days = [0,1,2,3,4]; mChanged(); };
  $('#mMeals').onclick = e => { const b = e.target.closest('.sw'); if (!b) return; const m = b.dataset.m;
    if (MS.meals.includes(m)) { if (MS.meals.length === 1) return toast('Dejá al menos una comida'); MS.meals = MS.meals.filter(x => x !== m); } else MS.meals = MEALS.map(x => x[0]).filter(x => x === m || MS.meals.includes(x)); mChanged(); };
  $('#mPm').onclick = () => { MS.people = Math.max(1, MS.people - 1); mChanged(); };
  $('#mPp').onclick = () => { MS.people = Math.min(10, MS.people + 1); mChanged(); };
  $('#mFocus').onclick = e => { const b = e.target.closest('[data-f]'); if (b) { MS.pref = b.dataset.f; mChanged(); } };
  $('#mProts').onclick = e => { const b = e.target.closest('[data-p]'); if (!b) return; const k = b.dataset.p;
    if (MS.allow.includes(k)) { if (MS.allow.length === 1) return toast('Dejá al menos una opción'); MS.allow = MS.allow.filter(x => x !== k); } else MS.allow = [...MS.allow, k]; mChanged(); };
  $('#mCoc').onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k;
    if (MS.cocinas.includes(k)) { if (MS.cocinas.length === 1) return toast('Dejá al menos un tipo de cocina'); MS.cocinas = MS.cocinas.filter(x => x !== k); } else MS.cocinas = [...MS.cocinas, k]; mChanged(); };
  $('#mStyles').onclick = e => { const b = e.target.closest('[data-s]'); if (!b) return; const k = b.dataset.s; MS.styles = MS.styles.includes(k) ? MS.styles.filter(x => x !== k) : [...MS.styles, k]; mChanged(); };
  $('#mPantry').onclick = () => { MS.pantry = !MS.pantry; mChanged(); };
  $('#mAgain').onclick = () => { MS.seed = Math.floor(Math.random() * 1e9); mRun(); toast('Nueva combinación lista'); };
  $('#mUnlock').onclick = () => { MS.locks = {}; mChanged(); toast('Platillos liberados'); };
  menuBuilt = true;
  mSetBudget(MS.budget);
}
function mSetBudget(v, from) {
  v = Math.max(0, Math.round(Number(v) || 0)); MS.budget = v;
  if (from !== 'input') $('#mBudget').value = v ? v.toLocaleString('es-NI') : '';
  if (from !== 'range') $('#mRange').value = Math.min(v, 10000);
  $$('#mQuick button').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.v === v)));
  mPerDay(); mSchedule();
}
function mPerDay() { const n = MS.days.length, m = MS.meals.length; $('#mPerday').innerHTML = `<span>${n} ${n === 1 ? 'día' : 'días'} · ${n * m} comidas · ${MS.people} ${MS.people === 1 ? 'persona' : 'personas'}</span><span>≈ <b>${fmt0(MS.budget / n)}</b> por día</span>`; }
function mControls() {
  $('#mDays').innerHTML = DAYS.map((l, i) => `<button class="day" data-i="${i}" aria-label="${l}" aria-pressed="${MS.days.includes(i)}"><small>${l.slice(0, 3)}</small>${l[0]}</button>`).join('');
  $('#mMeals').innerHTML = MEALS.map(([m, l]) => `<button class="sw" role="switch" data-m="${m}" aria-checked="${MS.meals.includes(m)}"><span class="l"><span class="ic" aria-hidden="true">${ICON[m]}</span>${l}</span><span class="track"></span></button>`).join('');
  $('#mMealsCount').textContent = MS.meals.length + (MS.meals.length === 1 ? ' plato al día' : ' platos al día');
  $('#mPeople').textContent = MS.people;
  $('#mFocus').innerHTML = FOCUS_UI.map(([k, l, c]) => `<button data-f="${k}" aria-pressed="${MS.pref === k}"><i style="background:${c}"></i>${l}</button>`).join('');
  $('#mProts').innerHTML = ALL_P.map(k => `<button class="chip" data-p="${k}" aria-pressed="${MS.allow.includes(k)}">${PROT[k]}${MS.allow.includes(k) ? '' : ' <span class="x">✕</span>'}</button>`).join('');
  $('#mProtN').textContent = MS.allow.length === ALL_P.length ? 'Todo' : MS.allow.length + ' de ' + ALL_P.length;
  $('#mCoc').innerHTML = ALL_K.map(k => `<button class="chip" data-k="${k}" aria-pressed="${MS.cocinas.includes(k)}">${COCINAS[k]} <span class="x">${R.filter(r => r.k === k).length}</span></button>`).join('');
  $('#mCocN').textContent = MS.cocinas.length === ALL_K.length ? 'Todas' : MS.cocinas.length + ' de ' + ALL_K.length;
  $('#mStyles').innerHTML = Object.entries(STYLES).map(([k, l]) => `<button class="chip alt" data-s="${k}" aria-pressed="${MS.styles.includes(k)}">${l}</button>`).join('');
  $('#mPantry').setAttribute('aria-checked', String(MS.pantry));
  const nl = Object.keys(MS.locks).length; $('#mUnlock').hidden = !nl; $('#mUnlock').textContent = `Soltar ${nl} ${nl === 1 ? 'platillo fijado' : 'platillos fijados'}`;
  mPerDay();
}
function mChanged() { mControls(); mSchedule(); }
let mT; function mSchedule() { clearTimeout(mT); mT = setTimeout(mRun, 150); }
function mRun() {
  saveMS(); MS.checked = {};
  if (!(MS.budget > 0)) { $('#mResults').innerHTML = '<div class="notice info">Escribí tu presupuesto en córdobas para armar el menú.</div>'; return; }
  const days = MS.days.map(i => ({i, name:DAYS[i]}));
  const cocinas = MS.cocinas.length === ALL_K.length ? null : new Set(MS.cocinas);
  MS.result = planMenu({budget:MS.budget, days, meals:MS.meals, people:MS.people, pref:MS.pref, allow:new Set(MS.allow), cocinas, styles:new Set(MS.styles), locks:MS.locks, seed:MS.seed, skip:mSkip()});
  mRender();
}
function mRender() {
  const r = MS.result; r.list = shoppingList(r.needs, r.plan, r.meals, mSkip());
  const t = totals(r.needs, mSkip());
  const over = r.total > r.budget + .005, left = r.budget - r.total;
  $('#mResults').innerHTML = `
    <div class="summary">
      <div><div class="k">Gastás (con IVA)</div><div class="v num" id="mvT"></div><div class="sub">de ${fmt0(r.budget)}</div></div>
      <div><div class="k">${over ? 'Te faltan' : 'Te sobran'}</div><div class="v num ${over ? 'bad' : 'good'}" id="mvL"></div><div class="sub">${over ? 'para cubrir este menú' : 'para otra cosa'}</div></div>
      <div class="third"><div class="k">Por persona al día</div><div class="v num" id="mvP"></div><div class="sub">${r.plan.length} ${r.plan.length === 1 ? 'día' : 'días'} · ${r.plan.length * r.meals.length} comidas · ${r.people} ${r.people === 1 ? 'persona' : 'personas'}</div></div>
      <div class="meter"><div class="bar${over ? ' over' : ''}" role="img" aria-label="Usás ${Math.round(r.total / r.budget * 100)}% del presupuesto"><i style="width:${Math.min(100, r.total / r.budget * 100)}%"></i></div>
      <div class="meter-l"><span>Usás ${Math.round(r.total / r.budget * 100)}% · IVA incluido ${fmt0(t.iva)}</span><span>${MS.pantry ? 'Sin contar lo básico de la despensa' : 'Incluye sal, aceite y especias'}</span></div></div>
    </div>
    ${over ? `<div class="notice"><b>Con ${fmt0(r.budget)} no alcanza.</b> Este es el menú más barato con tus filtros. Probá con menos días o comidas, quitá filtros, o subí el presupuesto a ${fmt0(Math.ceil(r.total / 50) * 50)}.</div>` : ''}
    ${r.fallbacks.length ? `<div class="notice info">No hay recetas de ${r.fallbacks.map(m => MEAL_N[m].toLowerCase()).join(' ni ')} con lo que elegiste, así que usamos todas las opciones para esa comida.</div>` : ''}
    <div class="tabs" role="tablist" id="mTabs">${[['menu','Menú'],['lista','Lista de compras'],['recetas','Recetas']].map(([k, l]) => `<button role="tab" data-t="${k}" aria-selected="${MS.tab === k}">${l}${k === 'lista' ? `<span class="count">${r.list.filter(x => !x.pantry).length}</span>` : ''}</button>`).join('')}</div>
    <div id="mBody" class="fade"></div>
    <div id="mFinal"></div>`;
  animateNum($('#mvT'), 'mT', r.total, fmt0); animateNum($('#mvL'), 'mL', Math.abs(left), fmt0); animateNum($('#mvP'), 'mP', r.total / r.plan.length / r.people, fmt0);
  $('#mTabs').onclick = e => { const b = e.target.closest('[data-t]'); if (b) { MS.tab = b.dataset.t; $$('#mTabs button').forEach(x => x.setAttribute('aria-selected', String(x === b))); mTab(); } };
  mTab();
}
function mTab() {
  const body = $('#mBody'), r = MS.result;
  body.classList.remove('fade'); void body.offsetWidth; body.classList.add('fade');
  if (MS.tab === 'menu') body.innerHTML = mMenuHtml(r);
  if (MS.tab === 'lista') body.innerHTML = mListHtml(r);
  if (MS.tab === 'recetas') body.innerHTML = mRecipesHtml(r);
  $('#mFinal').innerHTML = mFinalHtml(r);
  body.onclick = e => {
    const sw = e.target.closest('[data-swap]'); if (sw) { mSwap(+sw.dataset.pi, sw.dataset.m); return; }
    const m = e.target.closest('[data-r]'); if (m) { openRecipe(m.dataset.r, r.people, mSkip()); return; }
    if (e.target.closest('#mCopy')) mCopy();
  };
  body.onchange = e => { if (e.target.matches('.item input')) { MS.checked[e.target.dataset.k] = e.target.checked; e.target.closest('.item').classList.toggle('done', e.target.checked); mProgress(); } };
}
function mMenuHtml(r) {
  const opt = {pref:r.pref, styles:MS.styles};
  return `<div class="week">${r.plan.map((row, pi) => {
    const dayCost = r.meals.reduce((s, m) => s + recipeCost(row.meals[m], r.people, mSkip()), 0);
    return `<article class="daycard"><div class="dayhead"><h3>${row.day}</h3><span class="num">≈ ${fmt0(dayCost)}</span></div>${r.meals.map(m => {
      const rec = row.meals[m], locked = MS.locks[row.di + m] === rec.id;
      return `<div class="meal" id="m-${row.di}${m}"><span class="meal-ic" aria-hidden="true">${ICON[m]}</span>
        <button class="meal-t" data-r="${rec.id}"><small>${MEAL_N[m]}${locked ? '<span class="lock">Fijado</span>' : ''}</small><b>${esc(rec.n)}</b>${tagsHtml(rec, opt)}</button>
        <span class="meal-r"><span class="c">≈${fmt0(recipeCost(rec, r.people, mSkip()))}</span><button class="swap" data-swap data-pi="${pi}" data-m="${m}" aria-label="Cambiar ${MEAL_N[m].toLowerCase()} del ${row.day}">${ICON.swap}Cambiar</button></span></div>`;
    }).join('')}</article>`; }).join('')}</div>
    <p class="hint" style="margin:10px 4px 0">El costo por plato es lo que usás de cada ingrediente, con IVA. Lo que sobra de un empaque se aprovecha en otros platos.</p>`;
}
function mItemRow(it, checked) {
  const o = it.picks[0]?.o, done = !!checked[it.key];
  const leftTxt = !it.pantry && it.left > (it.u === 'u' ? .2 : it.u === 'ml' ? 30 : 40) ? `<span class="sobra">Sobra ≈ ${amount(it.left, it.u)}</span>` : '';
  const ex = it.picks.every(p => p.o.x);
  return `<label class="item${done ? ' done' : ''}${it.pantry ? ' pantry' : ''}"><input type="checkbox" data-k="${it.key}" ${done ? 'checked' : ''}>
    <span class="item-n"><b>${it.n} · ${esc(bought(it.picks))}</b><span>Usás ${amount(it.need, it.u)} en ${it.uses} ${it.uses === 1 ? 'plato' : 'platos'} · ${ex ? '<span class="tag ex">Exento de IVA</span>' : 'Paga IVA'}</span>${leftTxt}
    ${o ? `<a href="https://lacolonia.com.ni/producto/${o.id}" target="_blank" rel="noopener">Ver en La Colonia ↗</a>` : ''}</span>
    <span class="item-p">${it.pantry ? 'en casa' : fmt(it.base)}</span></label>`;
}
function mListHtml(r) {
  let html = `<div class="receipt"><div class="rc-head"><b>LISTA DE COMPRAS</b><span>La Colonia · ${r.plan.length} ${r.plan.length === 1 ? 'día' : 'días'} · ${r.people} ${r.people === 1 ? 'persona' : 'personas'}</span></div>`;
  const shop = r.list.filter(x => !x.pantry), pan = r.list.filter(x => x.pantry);
  let cat = null;
  for (const it of shop) { if (it.c !== cat) { cat = it.c; html += `<div class="rc-cat"><span>${LIST_CATS[cat]}</span><span>${fmt(shop.filter(x => x.c === cat).reduce((s, x) => s + x.base, 0))}</span></div>`; } html += mItemRow(it, MS.checked); }
  if (pan.length) html += `<div class="rc-cat"><span>Despensa · ya lo tenés</span><span></span></div>` + pan.map(it => mItemRow(it, MS.checked)).join('');
  const base = shop.reduce((s, x) => s + x.base, 0), iva = shop.reduce((s, x) => s + x.iva, 0);
  html += totRows(base, iva, `<div><span>Presupuesto</span><span>${fmt(r.budget)}</span></div><div><span>${base + iva > r.budget ? 'Faltan' : 'Sobran'}</span><span>${fmt(Math.abs(r.budget - base - iva))}</span></div>`) + `<div class="progress" id="mProg"></div></div>
    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn btn-primary" id="mCopy" style="flex:1">Copiar lista para WhatsApp</button></div>`;
  setTimeout(mProgress);
  return html;
}
function mProgress() { const p = $('#mProg'); if (!p) return; const shop = MS.result.list.filter(x => !x.pantry); const n = shop.filter(x => MS.checked[x.key]).length; p.textContent = n ? `${n} de ${shop.length} productos en el carrito` : 'Marcá los productos mientras comprás.'; }
function mRecipesHtml(r) {
  const count = {}; r.plan.forEach(row => r.meals.forEach(m => { const id = row.meals[m].id; count[id] = (count[id] || 0) + 1; }));
  return r.meals.map(m => { const recs = R.filter(x => x.m === m && count[x.id]);
    return `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px"><div class="eyebrow" style="padding:0 4px">${MEAL_N[m]}</div><div class="rgrid">${recs.map(x => `<button class="rcard" data-r="${x.id}"><b>${esc(x.n)}</b>${tagsHtml(x, {pref:r.pref, styles:MS.styles})}<span class="meta"><span>≈ ${fmt0(recipeCost(x, r.people, mSkip()))} para ${r.people}</span><span class="times">${count[x.id]}× en el menú</span></span></button>`).join('')}</div></div>`;
  }).join('') + `<p class="hint" style="margin:0 4px">Hay ${R.length} recetas en total. Usá "Cambiar" en el menú para ver todas las opciones.</p>`;
}
function mFinalHtml(r) {
  const shop = r.list.filter(x => !x.pantry);
  const base = shop.reduce((s, x) => s + x.base, 0), iva = shop.reduce((s, x) => s + x.iva, 0);
  return `<section class="final" aria-labelledby="mFT"><div class="final-h"><div><div class="eyebrow">Resumen</div><h2 id="mFT">Total a comprar</h2></div><span class="hint">${shop.length} productos · precios de La Colonia</span></div>
  <div class="table-wrap"><table><thead><tr><th>Producto</th><th>Cantidad</th><th class="r">Subtotal</th></tr></thead><tbody>
  ${shop.map(it => `<tr><td>${it.n}<span class="mut">${it.picks.every(p => p.o.x) ? 'Exento de IVA' : 'Paga IVA'}</span></td><td>${esc(bought(it.picks))}</td><td class="r num">${fmt(it.base)}</td></tr>`).join('')}
  </tbody><tfoot><tr><td colspan="2">Subtotal</td><td class="r">${fmt(base)}</td></tr><tr><td colspan="2">IVA 15 %</td><td class="r">${fmt(iva)}</td></tr><tr class="big"><td colspan="2">Total</td><td class="r">${fmt(base + iva)}</td></tr></tfoot></table></div></section>`;
}
function mCopy() {
  const r = MS.result, shop = r.list.filter(x => !x.pantry), t = totals(r.needs, mSkip());
  copyText(`🛒 Lista de compras (Rinde) · ${r.plan.length} días · ${r.people} personas\n\n` + shop.map(it => `☐ ${it.n}: ${bought(it.picks)} — ${fmt(it.base)}`).join('\n') + `\n\nSubtotal: ${fmt(t.base)}\nIVA: ${fmt(t.iva)}\nTOTAL: ${fmt(t.cost)}`);
}
function mSwap(pi, m) {
  const r = MS.result, row = r.plan[pi], cur = row.meals[m], skip = mSkip(), allow = new Set(MS.allow);
  let showAll = false, q = '';
  const draw = () => {
    const nq = norm(q);
    const list = R.filter(x => x.m === m && (showAll || allow.has(x.p)) && (!nq || norm(x.n + ' ' + COCINAS[x.k] + ' ' + PROT[x.p]).includes(nq)));
    const sub = (needs, rec, sign) => { const o = Object.assign({}, needs); for (const [k, a] of rec.i) { o[k] = (o[k] || 0) + sign * a * r.people; if (o[k] < 1e-9) delete o[k]; } return o; };
    const base = sub(r.needs, cur, -1);
    const rows = list.map(x => ({x, d:totalCost(sub(base, x, 1), skip) - r.total})).sort((a, b) => a.x.id === cur.id ? -1 : b.x.id === cur.id ? 1 : a.d - b.d);
    $('#altList').innerHTML = rows.slice(0, 80).map(({x, d}) => `<button class="altr${x.id === cur.id ? ' cur' : ''}" data-pick="${x.id}"><span><b>${esc(x.n)}</b>${tagsHtml(x, {pref:r.pref, styles:MS.styles})}</span><span class="delta ${x.id === cur.id ? '' : d > .5 ? 'up' : d < -.5 ? 'down' : ''}">${x.id === cur.id ? 'Actual' : (d > .5 ? '+' : d < -.5 ? '−' : '±') + fmt0(Math.abs(d))}</span></button>`).join('') || '<div class="empty">No hay recetas con esa búsqueda.</div>';
    $('#altAll').textContent = showAll ? 'Solo lo que elegí comer' : 'Ver todas las opciones';
    $('#altN').textContent = `${rows.length} opciones`;
  };
  const locked = MS.locks[row.di + m];
  sheet(`<div><div class="eyebrow">${row.day} · ${MEAL_N[m]}</div><h3>Cambiar platillo</h3></div>
    <p class="hint" style="margin:0">El número es cuánto sube o baja el total de tu compra. El platillo que elijas queda fijado aunque cambies los ajustes.</p>
    <label class="minisearch">${ICON.search}<input id="altQ" placeholder="Buscar: pollo, sopa, pasta, típico…" aria-label="Buscar receta"></label>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button class="btn btn-ghost sm" id="altRand">Sorprendeme</button><button class="btn btn-ghost sm" id="altAll"></button>${locked ? '<button class="btn btn-ghost sm" id="altUnlock">Soltar fijado</button>' : ''}<span class="hint" id="altN"></span></div>
    <div class="altrs" id="altList"></div>
    <button class="btn btn-ghost" data-close>Cerrar</button>`);
  draw();
  const pick = id => { const rec = RMAP[id]; row.meals[m] = rec; MS.locks[row.di + m] = id; saveMS(); closeSheet(); recompute(r, skip); mRender(); mControls(); toast(`${MEAL_N[m]} del ${row.day}: ${rec.n}`); requestAnimationFrame(() => $('#m-' + row.di + m)?.classList.add('flash')); };
  $('#altList').onclick = e => { const b = e.target.closest('[data-pick]'); if (b && b.dataset.pick !== cur.id) pick(b.dataset.pick); };
  $('#altAll').onclick = () => { showAll = !showAll; draw(); };
  $('#altQ').oninput = e => { q = e.target.value; draw(); };
  $('#altRand').onclick = () => { const o = R.filter(x => x.m === m && allow.has(x.p) && x.id !== cur.id); if (o.length) pick(o[Math.floor(Math.random() * o.length)].id); };
  const ul = $('#altUnlock'); if (ul) ul.onclick = () => { delete MS.locks[row.di + m]; saveMS(); closeSheet(); mControls(); toast('Platillo liberado'); };
}
RENDERERS.menu = () => { if (!menuBuilt) { buildMenu(); } mControls(); mRun(); };

/* ================== PRESUPUESTO DEL MES ================== */
const GROUPS = {alimentos:['Alimentos','var(--leaf)'], hogar:['Limpieza del hogar','var(--cielo)'], higiene:['Higiene personal','var(--uva)'], papel:['Papel y desechables','var(--maiz)']};
const LEVELS = {1:['Básico','Lo esencial'], 2:['Recomendado','Más variedad'], 3:['Completo','Con extras']};
const XS = Object.assign({budget:8000, people:2, level:2, bulk:true, auto:true, groups:Object.keys(GROUPS), removed:[], mult:{}}, store.get('mes', {}));
const saveXS = () => store.set('mes', XS);
let mesBuilt = false;

function buildMes() {
  $('#v-mes').innerHTML = `
  <header class="head">
    <div>
      <div class="eyebrow">Presupuesto del mes · canasta del hogar</div>
      <h1>Todo el mes de la casa, <em>en una sola compra.</em></h1>
      <p>Comida al por mayor, limpieza, higiene y papel para tu hogar. Poné lo que tenés para el mes y te decimos qué comprar y cuánto alcanza.</p>
      <div class="facts"><div><b class="num">${CAN.length}</b>artículos</div><div><b>4</b>grupos</div><div><b>15%</b>IVA en gravados</div></div>
    </div>
    <div class="budget">
      <label for="xBudget">Presupuesto del mes</label>
      <div class="money"><span>C$</span><input id="xBudget" inputmode="numeric" autocomplete="off"></div>
      <div><input class="range" id="xRange" type="range" min="0" max="20000" step="100" aria-label="Barra de presupuesto mensual"><div class="scale num" aria-hidden="true"><span>C$0</span><span>C$10,000</span><span>C$20,000</span></div></div>
      <div class="qchips" id="xQuick">${[4000,6000,8000,12000,16000,20000].map(v => `<button data-v="${v}">C$${v.toLocaleString('es-NI')}</button>`).join('')}</div>
      <div class="perday" id="xPer"></div>
    </div>
  </header>
  <div class="layout">
    <aside class="settings" aria-label="Ajustes del mes">
      <div class="set"><div class="set-h"><h3>Personas en la casa</h3></div><div class="stepper"><button id="xPm" aria-label="Menos personas">−</button><output id="xPeople" class="num"></output><button id="xPp" aria-label="Más personas">+</button></div></div>
      <div class="set"><div class="set-h"><h3>Nivel de la canasta</h3></div><div class="seg three" id="xLevel"></div></div>
      <div class="set"><button class="sw" id="xAuto" role="switch"><span class="l" style="font-size:14px">Ajustar el nivel al presupuesto</span><span class="track"></span></button>
        <button class="sw" id="xBulk" role="switch"><span class="l" style="font-size:14px">Comprar al por mayor</span><span class="track"></span></button>
        <div class="hint">Al por mayor elige sacos y presentaciones grandes cuando salen más baratas por kilo o litro.</div></div>
      <div class="set"><div class="set-h"><h3>Incluir</h3></div><div class="chips" id="xGroups"></div></div>
      <div class="actions"><button class="btn btn-ghost" id="xReset" hidden>Restaurar artículos quitados</button></div>
    </aside>
    <section class="results" id="xResults" aria-live="polite"></section>
  </div>`;
  const bIn = $('#xBudget'), bR = $('#xRange');
  bIn.addEventListener('input', () => { const raw = bIn.value.replace(/[^\d]/g, ''); xSetBudget(raw, 'input'); bIn.value = raw ? Number(raw).toLocaleString('es-NI') : ''; });
  bR.addEventListener('input', () => xSetBudget(bR.value, 'range'));
  $('#xQuick').onclick = e => { const c = e.target.closest('button'); if (c) xSetBudget(c.dataset.v); };
  $('#xPm').onclick = () => { XS.people = Math.max(1, XS.people - 1); xChanged(); };
  $('#xPp').onclick = () => { XS.people = Math.min(10, XS.people + 1); xChanged(); };
  $('#xLevel').onclick = e => { const b = e.target.closest('[data-l]'); if (b) { XS.level = +b.dataset.l; XS.auto = false; xChanged(); } };
  $('#xAuto').onclick = () => { XS.auto = !XS.auto; xChanged(); };
  $('#xBulk').onclick = () => { XS.bulk = !XS.bulk; xChanged(); };
  $('#xGroups').onclick = e => { const b = e.target.closest('[data-g]'); if (!b) return; const g = b.dataset.g;
    if (XS.groups.includes(g)) { if (XS.groups.length === 1) return toast('Dejá al menos un grupo'); XS.groups = XS.groups.filter(x => x !== g); } else XS.groups = [...XS.groups, g]; xChanged(); };
  $('#xReset').onclick = () => { XS.removed = []; XS.mult = {}; xChanged(); toast('Artículos restaurados'); };
  mesBuilt = true; xSetBudget(XS.budget);
}
function xSetBudget(v, from) {
  v = Math.max(0, Math.round(Number(v) || 0)); XS.budget = v;
  if (from !== 'input') $('#xBudget').value = v ? v.toLocaleString('es-NI') : '';
  if (from !== 'range') $('#xRange').value = Math.min(v, 20000);
  $$('#xQuick button').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.v === v)));
  xSchedule();
}
function xControls() {
  $('#xPeople').textContent = XS.people;
  $('#xLevel').innerHTML = Object.entries(LEVELS).map(([k, [l, s]]) => `<button data-l="${k}" aria-pressed="${XS.level === +k}">${l}<small>${s}</small></button>`).join('');
  $('#xAuto').setAttribute('aria-checked', String(XS.auto));
  $('#xBulk').setAttribute('aria-checked', String(XS.bulk));
  $('#xGroups').innerHTML = Object.entries(GROUPS).map(([k, [l]]) => `<button class="chip" data-g="${k}" aria-pressed="${XS.groups.includes(k)}">${l}</button>`).join('');
  $('#xReset').hidden = !XS.removed.length && !Object.keys(XS.mult).length;
}
function xChanged() { xControls(); xSchedule(); }
let xT; function xSchedule() { clearTimeout(xT); xT = setTimeout(xRun, 120); }
function xPlan(level) { return canastaPlan({people:XS.people, level, bulk:XS.bulk, groups:new Set(XS.groups), removed:new Set(XS.removed), mult:XS.mult}); }
function xRun() {
  saveXS();
  let plan = xPlan(XS.level), autoMsg = '';
  if (XS.auto && XS.budget > 0) {
    let lv = 3; plan = xPlan(3);
    while (lv > 1 && plan.cost > XS.budget) { lv--; plan = xPlan(lv); }
    if (lv !== XS.level) { XS.level = lv; xControls(); }
    autoMsg = `Elegimos el nivel <b>${LEVELS[lv][0]}</b> porque es el más completo que entra en tu presupuesto.`;
  }
  const up = XS.level < 3 ? xPlan(XS.level + 1) : null;
  xRender(plan, up, autoMsg);
}
function donutSvg(parts) {
  const total = parts.reduce((s, p) => s + p.v, 0) || 1; let a = -Math.PI / 2; const R0 = 70, r0 = 46, c = 85;
  const segs = parts.filter(p => p.v > 0).map(p => { const a1 = a, a2 = a + p.v / total * Math.PI * 2; a = a2; const large = a2 - a1 > Math.PI ? 1 : 0;
    const P = (r, t) => `${(c + r * Math.cos(t)).toFixed(2)} ${(c + r * Math.sin(t)).toFixed(2)}`;
    if (a2 - a1 >= Math.PI * 2 - 1e-6) return `<circle cx="${c}" cy="${c}" r="${(R0 + r0) / 2}" fill="none" stroke="${p.c}" stroke-width="${R0 - r0}"/>`;
    return `<path d="M${P(R0, a1)} A${R0} ${R0} 0 ${large} 1 ${P(R0, a2)} L${P(r0, a2)} A${r0} ${r0} 0 ${large} 0 ${P(r0, a1)}Z" fill="${p.c}"/>`; }).join('');
  return `<svg class="donut" viewBox="0 0 170 170" role="img" aria-label="Reparto del gasto por grupo">${segs}<text x="85" y="80" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="var(--f-body)" font-weight="700">TOTAL</text><text x="85" y="100" text-anchor="middle" font-size="17" fill="var(--ink)" font-family="var(--f-mono)" font-weight="600">${fmt0(total)}</text></svg>`;
}
function xRender(plan, up, autoMsg) {
  const over = XS.budget > 0 && plan.cost > XS.budget + .005, left = XS.budget - plan.cost;
  const days = plan.cost > 0 ? Math.floor(XS.budget / plan.cost * 30) : 30;
  const byG = {}; plan.lines.forEach(l => { (byG[l.it.g] = byG[l.it.g] || []).push(l); });
  const gTot = g => (byG[g] || []).reduce((s, l) => s + l.cost, 0);
  $('#xPer').innerHTML = `<span>${XS.people} ${XS.people === 1 ? 'persona' : 'personas'} · nivel ${LEVELS[XS.level][0].toLowerCase()}</span><span>≈ <b>${fmt0(XS.budget / 30)}</b> por día</span>`;
  const parts = Object.entries(GROUPS).filter(([g]) => byG[g]).map(([g, [l, c]]) => ({g, l, c, v:gTot(g)}));
  $('#xResults').innerHTML = `
    <div class="summary">
      <div><div class="k">Total del mes</div><div class="v num" id="xvT"></div><div class="sub">IVA incluido ${fmt0(plan.iva)}</div></div>
      <div><div class="k">${over ? 'Te faltan' : 'Te sobran'}</div><div class="v num ${over ? 'bad' : 'good'}" id="xvL"></div><div class="sub">de ${fmt0(XS.budget)}</div></div>
      <div class="third"><div class="k">Por persona al día</div><div class="v num" id="xvP"></div><div class="sub">${plan.lines.length} artículos en la lista</div></div>
      <div class="meter"><div class="bar${over ? ' over' : ''}" role="img" aria-label="Usás ${XS.budget ? Math.round(plan.cost / XS.budget * 100) : 0}% del presupuesto"><i style="width:${XS.budget ? Math.min(100, plan.cost / XS.budget * 100) : 0}%"></i></div>
      <div class="meter-l"><span>Usás ${XS.budget ? Math.round(plan.cost / XS.budget * 100) : 0}% del presupuesto</span><span>${XS.bulk && plan.saving > 1 ? `Ahorrás ${fmt0(plan.saving)} comprando al por mayor` : XS.bulk ? 'Precios al por mayor' : `Al por mayor ahorrarías ${fmt0(xPlanBulkSaving())}`}</span></div></div>
    </div>
    ${autoMsg && !over ? `<div class="notice ok">${autoMsg}</div>` : ''}
    ${over ? `<div class="notice"><b>Con ${fmt0(XS.budget)} no alcanza la canasta ${LEVELS[XS.level][0].toLowerCase()}.</b> Te cubre unos <b>${days} días</b> del mes. Probá quitar artículos, bajar cantidades o subir el presupuesto a ${fmt0(Math.ceil(plan.cost / 100) * 100)}.</div>` : ''}
    ${!over && up && XS.budget > 0 ? (up.cost <= XS.budget ? `<div class="notice ok">Te alcanza para el nivel <b>${LEVELS[XS.level + 1][0]}</b> (${fmt0(up.cost)}). <button class="linkbtn" id="xUp">Subir de nivel</button></div>` : `<div class="notice info">Para el nivel <b>${LEVELS[XS.level + 1][0]}</b> necesitarías ${fmt0(up.cost - XS.budget)} más.</div>`) : ''}
    <div class="donut-card">${donutSvg(parts)}<div class="legend">${parts.map(p => `<div class="lg"><i style="background:${p.c}"></i><span>${p.l}</span><span class="p">${Math.round(p.v / (plan.cost || 1) * 100)}%</span><b>${fmt0(p.v)}</b></div>`).join('')}</div></div>
    ${Object.entries(GROUPS).filter(([g]) => byG[g]).map(([g, [l, c]]) => `<div class="group"><div class="group-h"><h3><i style="background:${c}"></i>${l}</h3><b>${fmt(gTot(g))}</b></div>${byG[g].map(xRow).join('')}</div>`).join('')}
    <div class="receipt"><div class="rc-head"><b>COMPRA DEL MES</b><span>La Colonia · ${XS.people} ${XS.people === 1 ? 'persona' : 'personas'} · nivel ${LEVELS[XS.level][0].toLowerCase()}</span></div>
      ${totRows(plan.base, plan.iva, `<div><span>Presupuesto</span><span>${fmt(XS.budget)}</span></div><div><span>${over ? 'Faltan' : 'Sobran'}</span><span>${fmt(Math.abs(left))}</span></div>`)}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" id="xCopy" style="flex:1">Copiar lista del mes</button><button class="btn btn-ghost" id="xToCart" style="flex:1">Pasar al buscador</button></div>`;
  animateNum($('#xvT'), 'xT', plan.cost, fmt0); animateNum($('#xvL'), 'xL', Math.abs(left), fmt0); animateNum($('#xvP'), 'xP', plan.cost / XS.people / 30, fmt0);
  const res = $('#xResults');
  res.onclick = e => {
    const q = e.target.closest('[data-q]'); if (q) { const k = q.dataset.k, d = +q.dataset.q; const v = Math.max(.25, Math.min(4, Math.round(((XS.mult[k] || 1) + d) * 100) / 100)); if (v === 1) delete XS.mult[k]; else XS.mult[k] = v; xChanged(); return; }
    const rm = e.target.closest('[data-rm]'); if (rm) { XS.removed = [...XS.removed, rm.dataset.rm]; xChanged(); toast('Quitado de la lista'); return; }
    if (e.target.id === 'xUp') { XS.level++; XS.auto = false; xChanged(); }
    if (e.target.id === 'xCopy') xCopy(plan);
    if (e.target.id === 'xToCart') { plan.lines.forEach(l => l.picks.forEach(({o, c}) => CART.add(o.id, o.b ? Math.max(.25, Math.round(c * 4) / 4) : c))); toast('Lista agregada al carrito del buscador'); location.hash = 'buscar'; }
  };
}
function xPlanBulkSaving() { const p = canastaPlan({people:XS.people, level:XS.level, bulk:true, groups:new Set(XS.groups), removed:new Set(XS.removed), mult:XS.mult}); const r = canastaPlan({people:XS.people, level:XS.level, bulk:false, groups:new Set(XS.groups), removed:new Set(XS.removed), mult:XS.mult}); return Math.max(0, r.cost - p.cost); }
function xRow(l) {
  const it = l.it, m = XS.mult[it.k] || 1;
  const sav = XS.bulk && l.retailCost - l.cost > 1 ? `<small>ahorrás ${fmt0(l.retailCost - l.cost)}</small>` : '';
  const ex = l.picks.every(p => p.o.x);
  return `<div class="mrow"><div class="nm"><b>${esc(it.n)}</b><span>${esc(bought(l.picks))} · ${amount(l.need, it.u)} al mes${it.nota ? ' · ' + esc(it.nota) : ''}</span><div class="tags"><span class="tag">${LEVELS[it.lvl][0]}</span>${ex ? '<span class="tag ex">Exento de IVA</span>' : ''}</div></div>
    <div class="qty" aria-label="Cantidad"><button data-q="-0.25" data-k="${it.k}" aria-label="Menos ${esc(it.n)}">−</button><output>${Math.round(m * 100)}%</output><button data-q="0.25" data-k="${it.k}" aria-label="Más ${esc(it.n)}">+</button></div>
    <div class="pr">${fmt(l.cost)}${sav}<button class="rm" data-rm="${it.k}" aria-label="Quitar ${esc(it.n)}">Quitar</button></div></div>`;
}
function xCopy(plan) {
  const g = {}; plan.lines.forEach(l => (g[l.it.g] = g[l.it.g] || []).push(l));
  copyText(`🏠 Compra del mes (Rinde) · ${XS.people} personas\n` + Object.entries(g).map(([k, ls]) => `\n${GROUPS[k][0].toUpperCase()}\n` + ls.map(l => `☐ ${l.it.n}: ${bought(l.picks)} — ${fmt(l.cost)}`).join('\n')).join('\n') + `\n\nSubtotal: ${fmt(plan.base)}\nIVA: ${fmt(plan.iva)}\nTOTAL: ${fmt(plan.cost)}`);
}
RENDERERS.mes = () => { if (!mesBuilt) buildMes(); xControls(); xRun(); };

/* ================== BUSCADOR DE PRECIOS + CARRITO ================== */
const TOPS = [...new Set(DATA.subs.map(s => s[0]))];
const BS = Object.assign({q:'', top:'', sub:'', sort:'rel', exempt:false, budget:0, shown:48}, store.get('buscar', {}));
BS.shown = 48;
const saveBS = () => store.set('buscar', {q:BS.q, top:BS.top, sub:BS.sub, sort:BS.sort, exempt:BS.exempt, budget:BS.budget});
let busBuilt = false;
const unitTxt = p => { if (p.w) return 'precio por libra'; if (p.u === 'u' && p.q > 1) return fmt(p.p / p.q) + ' c/u'; if (p.u === 'g' && p.q >= 50) return fmt(p.p / p.q * 1000) + ' por kg'; if (p.u === 'ml' && p.q >= 50) return fmt(p.p / p.q * 1000) + ' por litro'; return ''; };
const perBase = p => p.w ? p.p / 453.6 : (p.q > 1 ? p.p / p.q : p.p);

function buildBuscar() {
  $('#v-buscar').innerHTML = `
  <header class="head" style="grid-template-columns:1fr">
    <div>
      <div class="eyebrow">Buscador · ${CAT.length.toLocaleString('es-NI')} productos de La Colonia</div>
      <h1>Buscá, marcá y <em>mirá cuánto suma.</em></h1>
      <p>Elegí productos de todo el súper y te sumamos el total con IVA, para que sepás cuánto llevar antes de salir.</p>
    </div>
  </header>
  <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px">
    <label class="searchbar">${ICON.search}<input id="bQ" type="search" placeholder="Buscar: arroz, pollo, detergente, pañales…" aria-label="Buscar producto" autocomplete="off"></label>
    <div class="scroller" id="bTops"></div>
    <div class="filters"><select class="sel" id="bSub" aria-label="Subcategoría"></select>
      <select class="sel" id="bSort" aria-label="Ordenar"><option value="rel">Más relevantes</option><option value="asc">Precio: menor a mayor</option><option value="desc">Precio: mayor a menor</option><option value="unit">Más barato por kg / unidad</option><option value="desc_off">En oferta primero</option></select>
      <button class="chip sm" id="bEx" aria-pressed="false">Solo exentos de IVA</button>
      <span class="hint" id="bCount"></span></div>
  </div>
  <div class="bgrid">
    <div style="display:flex;flex-direction:column;gap:12px;min-width:0"><div class="pgrid" id="bGrid"></div><button class="btn btn-ghost" id="bMore" hidden>Ver más productos</button></div>
    <aside class="cart" id="cartBox" aria-label="Tu carrito"></aside>
  </div>`;
  const q = $('#bQ'); q.value = BS.q;
  let qt; q.addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(() => { BS.q = q.value; BS.shown = 48; saveBS(); bResults(); }, 120); });
  $('#bTops').onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; BS.top = BS.top === b.dataset.t ? '' : b.dataset.t; BS.sub = ''; BS.shown = 48; saveBS(); bFilters(); bResults(); };
  $('#bSub').onchange = e => { BS.sub = e.target.value; BS.shown = 48; saveBS(); bResults(); };
  $('#bSort').onchange = e => { BS.sort = e.target.value; saveBS(); bResults(); };
  $('#bEx').onclick = () => { BS.exempt = !BS.exempt; saveBS(); bFilters(); bResults(); };
  $('#bMore').onclick = () => { BS.shown += 48; bResults(); };
  $('#bGrid').onclick = e => { const a = e.target.closest('[data-add]'); if (a) { CART.add(a.dataset.add, +a.dataset.step || 1); const p = CAT_BY[a.dataset.add]; toast(`Agregado: ${p.n}`); } };
  $('#cartBox').onclick = e => {
    const s = e.target.closest('[data-cs]'); if (s) { const id = s.dataset.id, st = +s.dataset.step; CART.set(id, Math.round(((CART.items[id] || 0) + (+s.dataset.cs) * st) * 100) / 100); return; }
    if (e.target.id === 'cClear') { CART.clear(); toast('Carrito vacío'); }
    if (e.target.id === 'cCopy') bCopy();
  };
  $('#cartBox').oninput = e => { if (e.target.id === 'cBudget') { BS.budget = Number(e.target.value.replace(/[^\d]/g, '')) || 0; saveBS(); bCartTotals(); } };
  CART.listeners.push(() => { if (current === 'buscar') bCart(); });
  busBuilt = true;
}
function bFilters() {
  $('#bTops').innerHTML = `<button class="chip sm" data-t="" aria-pressed="${!BS.top}">Todo</button>` + TOPS.map(t => `<button class="chip sm" data-t="${esc(t)}" aria-pressed="${BS.top === t}">${esc(t)}</button>`).join('');
  const subs = [...new Set(DATA.subs.filter(s => !BS.top || s[0] === BS.top).map(s => s[1]).filter(Boolean))].sort();
  $('#bSub').innerHTML = `<option value="">${BS.top ? 'Todas las subcategorías' : 'Subcategoría'}</option>` + subs.map(s => `<option ${BS.sub === s ? 'selected' : ''}>${esc(s)}</option>`).join('');
  $('#bSub').disabled = !subs.length;
  $('#bSort').value = BS.sort; $('#bEx').setAttribute('aria-pressed', String(BS.exempt));
}
function bResults() {
  const terms = norm(BS.q).split(/\s+/).filter(Boolean);
  let list = CAT.filter(p => { const s = DATA.subs[p.si]; if (BS.top && s[0] !== BS.top) return false; if (BS.sub && s[1] !== BS.sub) return false; if (BS.exempt && !p.x) return false; return terms.every(t => p.k.includes(t)); });
  if (terms.length && BS.sort === 'rel') { const t0 = terms[0]; list.sort((a, b) => (norm(a.n).startsWith(t0) ? 0 : 1) - (norm(b.n).startsWith(t0) ? 0 : 1) || a.p - b.p); }
  else if (BS.sort === 'asc') list.sort((a, b) => a.p - b.p);
  else if (BS.sort === 'desc') list.sort((a, b) => b.p - a.p);
  else if (BS.sort === 'unit') list.sort((a, b) => perBase(a) - perBase(b));
  else if (BS.sort === 'desc_off') list.sort((a, b) => (b.was ? 1 : 0) - (a.was ? 1 : 0) || a.p - b.p);
  $('#bCount').textContent = `${list.length.toLocaleString('es-NI')} ${list.length === 1 ? 'producto' : 'productos'}`;
  $('#bGrid').innerHTML = list.slice(0, BS.shown).map(p => {
    const s = DATA.subs[p.si], inCart = CART.items[p.id];
    const step = p.w ? .5 : 1;
    return `<article class="pcard"><span class="cat">${esc(s[1] || s[0])}</span><b title="${esc(p.n)}">${esc(p.n)}</b>
      <div class="prc"><span>${fmt(p.p)}</span>${p.was ? `<s>${fmt(p.was)}</s>` : ''}</div>
      <span class="unit">${unitTxt(p)}</span>
      <div class="tags">${p.x ? '<span class="tag ex">Exento de IVA</span>' : `<span class="tag">+IVA ${fmt(ivaOf(p.p, 0) || p.p * IVA_RATE)}</span>`}${p.was ? '<span class="tag off">Oferta</span>' : ''}${p.prev && p.prev !== p.p ? `<span class="tag ${p.p > p.prev ? 'off' : 'hit'}">${p.p > p.prev ? '▲' : '▼'} ${Math.abs((p.p - p.prev) / p.prev * 100).toFixed(0)}%</span>` : ''}</div>
      <div class="foot"><a class="hint" href="https://lacolonia.com.ni/producto/${p.id}" target="_blank" rel="noopener">Ver ↗</a><button class="add" data-add="${p.id}" data-step="${step}">${inCart ? `+ Agregar (${inCart}${p.w ? ' lb' : ''})` : '+ Agregar'}</button></div></article>`;
  }).join('') || '<div class="empty">No encontramos productos con esa búsqueda. Probá con otra palabra o quitá filtros.</div>';
  $('#bMore').hidden = list.length <= BS.shown;
}
function bCart() {
  const ids = Object.keys(CART.items).filter(id => CAT_BY[id]);
  $('#cartBox').innerHTML = `<h3>Tu carrito <span class="hint">${CART.count() ? ids.length + (ids.length === 1 ? ' producto' : ' productos') : ''}</span></h3>
    <label class="minisearch" style="border-style:dashed"><span class="hint" style="white-space:nowrap">Quiero gastar C$</span><input id="cBudget" inputmode="numeric" value="${BS.budget ? BS.budget.toLocaleString('es-NI') : ''}" placeholder="opcional" aria-label="Presupuesto del carrito"></label>
    ${ids.length ? ids.map(id => { const p = CAT_BY[id], q = CART.items[id], step = p.w ? .5 : 1;
      return `<div class="citem"><b>${esc(p.n)}<span class="hint" style="display:block;font-weight:500">${fmt(p.p)}${p.w ? ' por lb' : ''} · ${p.x ? 'exento' : '+IVA'}</span></b><div class="r"><span>${fmt(p.p * q)}</span><div class="qty"><button data-cs="-1" data-id="${id}" data-step="${step}" aria-label="Menos">−</button><output>${q}${p.w ? ' lb' : ''}</output><button data-cs="1" data-id="${id}" data-step="${step}" aria-label="Más">+</button></div></div></div>`; }).join('')
      : '<div class="empty">Tu carrito está vacío.<br>Agregá productos con el botón “+ Agregar”.</div>'}
    <div id="cTot"></div>
    ${ids.length ? `<div style="display:flex;gap:8px"><button class="btn btn-primary sm" id="cCopy" style="flex:1">Copiar lista</button><button class="btn btn-ghost sm" id="cClear">Vaciar</button></div>` : ''}`;
  bCartTotals(); bResultsLight(); updateFab();
}
function bResultsLight() { $$('#bGrid [data-add]').forEach(b => { const q = CART.items[b.dataset.add]; const p = CAT_BY[b.dataset.add]; b.textContent = q ? `+ Agregar (${q}${p.w ? ' lb' : ''})` : '+ Agregar'; }); }
function bCartTotals() {
  const t = CART.totals(), el = $('#cTot'); if (!el) return;
  let extra = '';
  if (BS.budget > 0) { const d = BS.budget - t.total; extra = `<div><span>Presupuesto</span><span>${fmt(BS.budget)}</span></div><div style="color:${d < 0 ? 'var(--frijol)' : 'var(--leaf)'}"><span>${d < 0 ? 'Te pasás por' : 'Te sobran'}</span><span>${fmt(Math.abs(d))}</span></div>`; }
  el.innerHTML = totRows(t.base, t.iva, extra) + (BS.budget > 0 ? `<div class="bar${t.total > BS.budget ? ' over' : ''}" style="margin-top:8px"><i style="width:${Math.min(100, t.total / BS.budget * 100)}%"></i></div>` : '');
}
function bCopy() {
  const t = CART.totals();
  copyText('🛒 Mi lista (Rinde)\n\n' + Object.keys(CART.items).filter(id => CAT_BY[id]).map(id => { const p = CAT_BY[id], q = CART.items[id]; return `☐ ${q}${p.w ? ' lb' : ' ×'} ${p.n} — ${fmt(p.p * q)}`; }).join('\n') + `\n\nSubtotal: ${fmt(t.base)}\nIVA: ${fmt(t.iva)}\nTOTAL: ${fmt(t.total)}`);
}
RENDERERS.buscar = () => { if (!busBuilt) buildBuscar(); bFilters(); bResults(); bCart(); };

/* ================== ¿QUÉ COCINO? ================== */
const QUICK_HAVE = ['arroz','frijol','huevo','tomate','cebolla','papa','pollo','queso','tortilla','platano','carne_molida','spaghetti','atun','chiltoma','leche','harina_maiz'];
const KS = Object.assign({have:['arroz','frijol','huevo','tomate','cebolla','queso'], people:2, meal:'all', pantry:true, shown:20}, store.get('cocinar', {}));
KS.shown = 20;
const saveKS = () => store.set('cocinar', {have:KS.have, people:KS.people, meal:KS.meal, pantry:KS.pantry});
let cookBuilt = false;
const ING_LIST = Object.entries(ING).map(([k, v]) => ({k, n:v.n, nn:norm(v.n)})).sort((a, b) => a.n.localeCompare(b.n, 'es'));

function buildCocinar() {
  $('#v-cocinar').innerHTML = `
  <header class="head" style="grid-template-columns:1fr">
    <div>
      <div class="eyebrow">¿Qué cocino? · ${R.length} recetas</div>
      <h1>Decinos qué tenés <em>y te damos ideas.</em></h1>
      <p>Anotá los productos que tenés en casa o que querés comprar. Te mostramos qué recetas salen y qué te falta, con su precio.</p>
    </div>
  </header>
  <div class="layout">
    <aside class="settings" aria-label="Lo que tengo">
      <div class="set"><div class="set-h"><h3>Lo que tengo</h3><span id="kN"></span></div>
        <div class="picker"><label class="minisearch">${ICON.search}<input id="kQ" placeholder="Escribí: pollo, papa, queso…" autocomplete="off" aria-label="Agregar ingrediente" role="combobox" aria-expanded="false" aria-controls="kSugg"></label><div class="sugg" id="kSugg" hidden role="listbox"></div></div>
        <div class="have" id="kHave"></div>
        <button class="linkbtn" id="kClear" style="align-self:flex-start">Borrar todo</button></div>
      <div class="set"><div class="set-h"><h3>Agregar rápido</h3></div><div class="chips" id="kQuick"></div></div>
      <div class="set"><div class="set-h"><h3>Comida</h3></div><div class="seg" id="kMeal"></div></div>
      <div class="set"><div class="set-h"><h3>Personas</h3></div><div class="stepper"><button id="kPm" aria-label="Menos personas">−</button><output id="kPeople" class="num"></output><button id="kPp" aria-label="Más personas">+</button></div></div>
      <div class="set"><button class="sw" id="kPantry" role="switch"><span class="l" style="font-weight:500;font-size:14px">Ya tengo sal, aceite, azúcar, consomé y especias</span><span class="track"></span></button></div>
    </aside>
    <section class="results" id="kResults" aria-live="polite"></section>
  </div>`;
  const q = $('#kQ'), sg = $('#kSugg'); let sel = 0, opts = [];
  const show = () => { const t = norm(q.value.trim()); opts = t ? ING_LIST.filter(x => x.nn.includes(t) && !KS.have.includes(x.k)).sort((a, b) => (a.nn.startsWith(t) ? 0 : (' ' + a.nn).includes(' ' + t) ? 1 : 2) - (b.nn.startsWith(t) ? 0 : (' ' + b.nn).includes(' ' + t) ? 1 : 2) || a.n.length - b.n.length).slice(0, 8) : []; sel = 0;
    sg.hidden = !opts.length; q.setAttribute('aria-expanded', String(!!opts.length));
    sg.innerHTML = opts.map((o, i) => `<button role="option" data-k="${o.k}" class="${i === sel ? 'on' : ''}">${esc(o.n)}<span>${R.filter(r => r.i.some(([k]) => k === o.k)).length} recetas</span></button>`).join(''); };
  const addK = k => { if (!KS.have.includes(k)) KS.have = [...KS.have, k]; q.value = ''; show(); kChanged(); q.focus(); };
  q.addEventListener('input', show);
  q.addEventListener('keydown', e => { if (!opts.length) return; if (e.key === 'ArrowDown') { sel = (sel + 1) % opts.length; e.preventDefault(); } else if (e.key === 'ArrowUp') { sel = (sel - 1 + opts.length) % opts.length; e.preventDefault(); } else if (e.key === 'Enter') { addK(opts[sel].k); e.preventDefault(); return; } else if (e.key === 'Escape') { sg.hidden = true; return; } $$('button', sg).forEach((b, i) => b.classList.toggle('on', i === sel)); });
  sg.onclick = e => { const b = e.target.closest('[data-k]'); if (b) addK(b.dataset.k); };
  document.addEventListener('click', e => { if (!e.target.closest('.picker')) sg.hidden = true; });
  $('#kHave').onclick = e => { const b = e.target.closest('[data-k]'); if (b) { KS.have = KS.have.filter(x => x !== b.dataset.k); kChanged(); } };
  $('#kQuick').onclick = e => { const b = e.target.closest('[data-k]'); if (b) { const k = b.dataset.k; KS.have = KS.have.includes(k) ? KS.have.filter(x => x !== k) : [...KS.have, k]; kChanged(); } };
  $('#kClear').onclick = () => { KS.have = []; kChanged(); };
  $('#kMeal').onclick = e => { const b = e.target.closest('[data-m]'); if (b) { KS.meal = b.dataset.m; KS.shown = 20; kChanged(); } };
  $('#kPm').onclick = () => { KS.people = Math.max(1, KS.people - 1); kChanged(); };
  $('#kPp').onclick = () => { KS.people = Math.min(10, KS.people + 1); kChanged(); };
  $('#kPantry').onclick = () => { KS.pantry = !KS.pantry; kChanged(); };
  cookBuilt = true;
}
function kControls() {
  $('#kN').textContent = KS.have.length + (KS.have.length === 1 ? ' producto' : ' productos');
  $('#kHave').innerHTML = KS.have.map(k => `<button class="chip" data-k="${k}" aria-label="Quitar ${esc(ING[k].n)}">${esc(ING[k].n)} <span class="x">✕</span></button>`).join('') || '<span class="hint">Todavía no agregaste nada.</span>';
  $('#kQuick').innerHTML = QUICK_HAVE.map(k => `<button class="chip sm" data-k="${k}" aria-pressed="${KS.have.includes(k)}">${esc(ING[k].n)}</button>`).join('');
  $('#kMeal').innerHTML = [['all','Todas'], ...MEALS].map(([k, l]) => `<button data-m="${k}" aria-pressed="${KS.meal === k}">${l}</button>`).join('');
  $('#kPeople').textContent = KS.people;
  $('#kPantry').setAttribute('aria-checked', String(KS.pantry));
}
function kChanged() { saveKS(); kControls(); kRun(); }
function ring(p) { const r = 22, c = 2 * Math.PI * r; const col = p >= 1 ? 'var(--leaf)' : p >= .6 ? 'var(--maiz)' : 'var(--frijol)';
  return `<svg class="ring" viewBox="0 0 54 54" role="img" aria-label="Tenés el ${Math.round(p * 100)}% de los ingredientes"><circle cx="27" cy="27" r="${r}" fill="none" stroke="var(--sunk)" stroke-width="6"/><circle cx="27" cy="27" r="${r}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(c * p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 27 27)"/><text x="27" y="31" text-anchor="middle" font-size="12" font-family="var(--f-mono)" font-weight="600" fill="var(--ink)">${Math.round(p * 100)}%</text></svg>`; }
function kRun() {
  const el = $('#kResults');
  if (!KS.have.length) { el.innerHTML = '<div class="notice info">Agregá al menos un producto que tengás para ver recetas.</div>'; return; }
  const {list, tips} = cookSuggestions(KS.have, {people:KS.people, pantry:KS.pantry, meal:KS.meal});
  const full = list.filter(x => !x.miss.length);
  el.innerHTML = `
    <div class="summary">
      <div><div class="k">Recetas completas</div><div class="v num good">${full.length}</div><div class="sub">con lo que ya tenés</div></div>
      <div><div class="k">Te falta 1 cosa</div><div class="v num">${list.filter(x => x.miss.length === 1).length}</div><div class="sub">recetas casi listas</div></div>
      <div class="third"><div class="k">Ideas en total</div><div class="v num">${list.length}</div><div class="sub">usan algo de lo tuyo</div></div>
    </div>
    ${tips.length ? `<div class="notice ok"><b>Si comprás</b> ${tips.map(([k, n]) => `<button class="chip sm" data-addhave="${k}" style="margin:2px">${esc(ING[k].n)} · +${n}</button>`).join(' ')} <span class="hint">podés hacer más recetas.</span></div>` : ''}
    <div style="display:flex;flex-direction:column;gap:10px" id="kList">${list.slice(0, KS.shown).map(kCard).join('') || '<div class="empty">No encontramos recetas con esos productos.</div>'}</div>
    ${list.length > KS.shown ? '<button class="btn btn-ghost" id="kMore">Ver más recetas</button>' : ''}`;
  el.onclick = e => {
    const a = e.target.closest('[data-addhave]'); if (a) { KS.have = [...KS.have, a.dataset.addhave]; kChanged(); return; }
    const r = e.target.closest('[data-r]'); if (r) { openRecipe(r.dataset.r, KS.people, KS.pantry ? PANTRY : null); return; }
    const c = e.target.closest('[data-cart]'); if (c) { const x = list.find(y => y.r.id === c.dataset.cart); x.miss.forEach(([k, q]) => buy(k, q * KS.people).picks.forEach(({o, c}) => CART.add(o.id, o.b ? Math.max(.25, Math.round(c * 4) / 4) : c))); toast(`Faltantes de “${x.r.n}” agregados al carrito`); updateFab(); return; }
    if (e.target.id === 'kMore') { KS.shown += 20; kRun(); }
  };
}
function kCard(x) {
  const total = x.got.length + x.miss.length;
  return `<article class="cookcard">${ring(x.score)}
    <div class="nm" style="min-width:0"><b>${esc(x.r.n)}</b><span class="hint">${MEAL_N[x.r.m]} · ${COCINAS[x.r.k]} · ${x.r.min} min · tenés ${x.got.length} de ${total}</span>
      <div class="miss">${x.miss.length ? x.miss.map(([k, q]) => `<span class="tag off">Falta ${esc(ING[k].n.toLowerCase())} · ${fmt0(buy(k, q * KS.people).cost)}</span>`).join('') : '<span class="tag hit">¡Tenés todo!</span>'}</div></div>
    <div class="acts">${x.miss.length ? `<span>Comprar: ${fmt0(x.missCost)}</span>` : '<span style="color:var(--leaf)">C$0</span>'}<div style="display:flex;gap:6px"><button class="btn btn-ghost sm" data-r="${x.r.id}">Ver receta</button>${x.miss.length ? `<button class="btn btn-primary sm" data-cart="${x.r.id}">Agregar faltantes</button>` : ''}</div></div></article>`;
}
RENDERERS.cocinar = () => { if (!cookBuilt) buildCocinar(); kControls(); kRun(); updateFab(); };

/* ---------- Precios en vivo (función de Netlify) ---------- */
(async function livePrices() {
  setStatus('base', `<span class="ptxt">Precios del </span>${priceDateLabel(DATA.fecha)}`);
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch('/api/precios', {signal:ctrl.signal, headers:{accept:'application/json'}}); clearTimeout(t);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();
    if (!d.updatedAt || !d.prices) throw new Error('sin datos');
    setStatus('live', `<span class="ptxt">Precios al día · </span>${priceDateLabel(d.updatedAt)}`);
    const n = applyPrices(d.prices, d.nuevos || null);
    if (n && current) { RENDERERS[current] && RENDERERS[current](); }
  } catch (e) { /* se quedan los precios del catálogo incluido */ }
})();
if ('serviceWorker' in navigator && location.protocol === 'https:') window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));

navInit(); route();
