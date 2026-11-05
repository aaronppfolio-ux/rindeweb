// Función programada: todos los días a las 11:00 UTC (5:00 a. m. en Nicaragua).
import { actualizarPrecios } from "../shared/actualizar.mjs";
export default async () => {
  const r = await actualizarPrecios({ budgetMs: 25000 });
  console.log(`Precios: ${r.found} productos, ${r.changed ?? 0} cambiaron, fallaron: ${r.fails.join(", ") || "ninguna"}, ${r.ms} ms`);
  return new Response(null, { status: r.ok ? 200 : 502 });
};
export const config = { schedule: "0 11 * * *" };
