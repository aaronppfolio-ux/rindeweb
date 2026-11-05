// Lógica compartida: lee los precios de La Colonia y los guarda en Netlify Blobs.
import { getStore } from "@netlify/blobs";

// IDs de los productos que usa la app (los mismos de public/assets/datos.js)
export const IDS = ["4030080","4030054","1520122","4050033","4050054","4050013","1130554","1130053","1130131","4090025","4090041","3080027","3080024","1220283","1220163","4200109","4200105","1300421","1301067","1300708","1300047","1300024","4140031","4140027","4140026","1410066","4070604","4020186","4020227","4040032","4040018","4060034","1070389","1070397","1070400","1070386","1070355","1050733","1090490","1051023","1051024","1010235","1030144","1320029","1320015","1320715","1320724","1130135","6030209","6030083","1700022","6030166","6010056","6080097","6080240","6080187","6080181","6080169","1610318","6021023","1730005","6020047","6050210","6050131","1540547","1541975","1540179","1540034","1541860","1540035","4150049","4150017","4150028","4150029","1350778","1351446","1350522","1351704","1350552","1361330","1510096","1380166","4100130","4100113","5030010","5010395","5010081","5030022","5010001","5010021","5010469","5010049","5010599","5010010","5010365","5010055","5010210","5010006","5010016","5010042","5010020","5010489","5010569","5010025","5010222","5010048","5020454","5020017","5020030","5020434","5020103","5020035","5040086","5010494"];

const BASE_URL = "https://lacolonia.com.ni/producto/";
const STORE = "precios";
const KEY = "actual";

export const store = () => getStore({ name: STORE, consistency: "strong" });

// Saca el precio del bloque JSON-LD "Product" de la página del producto
export function parsePrice(html) {
  const m = html.match(/"@type"\s*:\s*"Product"[\s\S]*?"price"\s*:\s*"?([\d.]+)"?/);
  const p = m ? Number(m[1]) : NaN;
  return p > 0 ? p : null;
}

async function fetchPrice(id, signal) {
  const res = await fetch(BASE_URL + id, { signal, headers: { "user-agent": "Rinde/1.0 (planificador de comidas; uso personal)", "accept": "text/html" } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return parsePrice(await res.text());
}

/**
 * Descarga los precios y los guarda. Conserva el precio anterior de un producto que no se pudo leer.
 * budgetMs: tiempo máximo; lo que no alcance a leerse queda con su precio anterior.
 */
export async function actualizarPrecios({ budgetMs = 25000, concurrency = 12, fetcher = fetchPrice, blobs = store() } = {}) {
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), budgetMs);
  const fresh = {}, missing = [];
  let i = 0;
  async function worker() {
    while (i < IDS.length && !ctrl.signal.aborted) {
      const id = IDS[i++];
      try { const p = await fetcher(id, ctrl.signal); if (p) fresh[id] = p; else missing.push(id); }
      catch { missing.push(id); }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  clearTimeout(timer);
  for (let j = i; j < IDS.length; j++) missing.push(IDS[j]);

  const prev = (await blobs.get(KEY, { type: "json" })) || null;
  const found = Object.keys(fresh).length;
  if (!found) return { ok: false, found, missing: missing.length, ms: Date.now() - started, data: prev };

  const prices = { ...(prev?.prices || {}), ...fresh };
  const changed = Object.keys(fresh).filter(id => prev?.prices?.[id] != null && prev.prices[id] !== fresh[id]).length;
  const data = {
    updatedAt: new Date().toISOString(),
    source: "lacolonia.com.ni",
    count: Object.keys(prices).length,
    missing,
    changed,
    prices,
    previous: prev?.prices || null,
    previousAt: prev?.updatedAt || null,
  };
  await blobs.setJSON(KEY, data);
  return { ok: true, found, missing: missing.length, changed, ms: Date.now() - started, data };
}

export async function leerPrecios(blobs = store()) {
  return (await blobs.get(KEY, { type: "json" })) || null;
}
