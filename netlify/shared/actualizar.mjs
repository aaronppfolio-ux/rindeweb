// Lee el catálogo completo de La Colonia (todas las categorías) y guarda los precios en Netlify Blobs.
import { getStore } from "@netlify/blobs";

export const CATEGORIAS = ["Abarrotes","Bebes","BebidasAlcoholicas","BebidasYGaseosas","Carnes","Congelado","CuidadoDelHogar","CuidadoPersonal","Embutidos","FrutasVerduras","LacteosHuevo","Mascotas","Medicamentos","Panaderia","PapelHigienicoYDesechables","Cigarros","CocinaVajilla","FerreteriaAuto","TextilesJuguetes"];
const BASE = "https://lacolonia.com.ni/categoria/";
const KEY = "actual";
export const store = () => getStore({ name: "precios", consistency: "strong" });

// La página de cada categoría trae la lista completa de productos dentro del código de la página (Next.js)
export function productosDeHtml(html) {
  const parts = []; const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g; let m;
  while ((m = re.exec(html))) parts.push(JSON.parse('"' + m[1] + '"'));
  const s = parts.join("");
  const i = s.indexOf('{"initialProducts"'); if (i < 0) return [];
  let d = 0, j = i, inS = false, esc = false;
  for (; j < s.length; j++) { const c = s[j]; if (inS) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inS = false; continue; } if (c === '"') inS = true; else if (c === "{") d++; else if (c === "}") { d--; if (d === 0) break; } }
  return JSON.parse(s.slice(i, j + 1)).initialProducts || [];
}

async function leerCategoria(cat, signal) {
  const res = await fetch(BASE + cat, { signal, headers: { "user-agent": "Mozilla/5.0 (compatible; Rinde/2.0; planificador de comidas)", accept: "text/html" } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return productosDeHtml(await res.text());
}

export async function actualizarPrecios({ budgetMs = 25000, concurrency = 4, leer = leerCategoria, blobs = store() } = {}) {
  const t0 = Date.now(); const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), budgetMs);
  const fresh = {}, fails = []; let i = 0;
  async function worker() {
    while (i < CATEGORIAS.length && !ctrl.signal.aborted) {
      const cat = CATEGORIAS[i++];
      try { for (const x of await leer(cat, ctrl.signal)) { const v = x.hasDiscount ? x.discountValue : x.price; if (v > 0) fresh[x.code] = v; } }
      catch { fails.push(cat); }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  clearTimeout(timer);
  for (let j = i; j < CATEGORIAS.length; j++) fails.push(CATEGORIAS[j]);
  const prev = (await blobs.get(KEY, { type: "json" })) || null;
  const found = Object.keys(fresh).length;
  if (found < 1000) return { ok: false, found, fails, ms: Date.now() - t0, data: prev };
  const changed = Object.keys(fresh).filter(id => prev?.prices?.[id] != null && prev.prices[id] !== fresh[id]).length;
  const data = { updatedAt: new Date().toISOString(), source: "lacolonia.com.ni", count: Object.keys({ ...(prev?.prices || {}), ...fresh }).length, changed, fails, prices: { ...(prev?.prices || {}), ...fresh } };
  await blobs.setJSON(KEY, data);
  return { ok: true, found, changed, fails, ms: Date.now() - t0, data };
}
export const leerPrecios = async (blobs = store()) => (await blobs.get(KEY, { type: "json" })) || null;
