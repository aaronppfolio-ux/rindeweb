// API que usa la página: GET /api/precios → {updatedAt, prices:{código: precio}}
import { leerPrecios } from "../shared/actualizar.mjs";
const VIEJO_MS = 3 * 24 * 60 * 60 * 1000;
export default async (req) => {
  const data = await leerPrecios();
  const viejo = !data || !data.updatedAt || Date.now() - Date.parse(data.updatedAt) > VIEJO_MS;
  if (viejo) { try { await fetch(new URL("/.netlify/functions/actualizar-ahora-background", req.url), { method: "POST" }); } catch {} }
  const body = data ? { updatedAt: data.updatedAt, count: data.count, prices: data.prices } : { updatedAt: null, prices: {} };
  return Response.json(body, { headers: { "cache-control": "public, max-age=600", "netlify-cdn-cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
};
export const config = { path: "/api/precios" };
