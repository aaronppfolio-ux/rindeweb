// API que usa la página: GET /api/precios
// Si todavía no hay precios guardados (primer despliegue) o tienen más de 3 días, los actualiza en el momento.
import { actualizarPrecios, leerPrecios } from "../shared/actualizar.mjs";

const VIEJO_MS = 3 * 24 * 60 * 60 * 1000;

export default async () => {
  let data = await leerPrecios();
  const viejo = !data || !data.updatedAt || Date.now() - Date.parse(data.updatedAt) > VIEJO_MS;
  if (viejo) {
    try { const r = await actualizarPrecios({ budgetMs: 8000 }); if (r.data) data = r.data; } catch (e) { console.error(e); }
  }
  const body = data
    ? { updatedAt: data.updatedAt, count: data.count, prices: data.prices, previous: data.previous, previousAt: data.previousAt }
    : { updatedAt: null, prices: {} };
  return Response.json(body, {
    headers: {
      "cache-control": "public, max-age=300",
      "netlify-cdn-cache-control": "public, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
};

export const config = { path: "/api/precios" };
