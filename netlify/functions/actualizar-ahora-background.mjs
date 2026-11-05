// Función de fondo (hasta 15 minutos): actualiza los precios en el momento.
// Se llama sola la primera vez que no hay precios guardados, o visitando /.netlify/functions/actualizar-ahora-background
import { actualizarPrecios } from "../shared/actualizar.mjs";
export default async () => {
  const r = await actualizarPrecios({ budgetMs: 600000, concurrency: 3 });
  console.log(`Actualización manual: ${r.found} productos, ${r.changed ?? 0} cambiaron, ${r.ms} ms`);
};
