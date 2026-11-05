# Rinde · cómo subirlo a Netlify

Planificador de comidas y compras con el catálogo completo de La Colonia Nicaragua (7,961 productos):
menú semanal, presupuesto del mes, buscador con carrito y "¿Qué cocino?". Todo con IVA.
Los precios de todo el catálogo se actualizan solos todos los días a las 5:00 a. m. (hora de Nicaragua).

## Qué hay en esta carpeta

```
rinde-netlify/
├── netlify.toml                 Configuración de Netlify (no lo borres)
├── package.json                 Dependencia para guardar precios (@netlify/blobs)
├── public/                      Lo que ve el usuario (la página)
│   ├── index.html
│   ├── assets/styles.css        Diseño
│   ├── assets/datos.js          Catálogo completo, 297 recetas, ingredientes y canasta del mes
│   ├── assets/app.js            Funcionamiento de la página
│   ├── manifest.webmanifest     Permite instalarla en el celular como app
│   ├── sw.js                    Permite abrirla sin internet
│   └── favicon.svg, icon-192.png, icon-512.png, apple-touch-icon.png
└── netlify/
    ├── functions/precios.mjs                     API: /api/precios
    ├── functions/actualizar-precios.mjs          Tarea diaria que lee las 19 categorías de La Colonia
    ├── functions/actualizar-ahora-background.mjs Actualización en el momento (la primera vez sola)
    └── shared/actualizar.mjs                     Lógica compartida
```

## Opción A (recomendada): GitHub + Netlify

Con esta opción los precios se actualizan solos y cada cambio que subás a GitHub se publica automáticamente.

1. Creá una cuenta gratis en github.com.
2. Creá un repositorio nuevo (por ejemplo `rinde`) y subí **el contenido** de esta carpeta (no la carpeta `rinde-netlify` dentro de otra). En la raíz del repositorio deben quedar `netlify.toml`, `package.json`, `public/` y `netlify/`.
   - Desde la web: botón **Add file → Upload files**, arrastrá todo y **Commit changes**.
3. Entrá a app.netlify.com con tu cuenta de GitHub.
4. **Add new site → Import an existing project → GitHub** y elegí el repositorio.
5. Netlify lee `netlify.toml` solo. Dejá los campos así:
   - Build command: vacío
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
6. **Deploy**. En 1–2 minutos te da un enlace tipo `https://algo.netlify.app`.
7. Abrí el enlace. La primera visita pone en marcha una actualización de fondo de todo el catálogo (tarda 1 o 2 minutos). Mientras tanto la página usa los precios incluidos. Recargá después de unos minutos: arriba a la derecha debe decir **Precios al día**.

Para cambiar el nombre del enlace: **Site configuration → Change site name**.

## Opción B: Netlify CLI (desde tu computadora)

1. Instalá Node.js (versión 18 o más nueva) desde nodejs.org.
2. Abrí una terminal en esta carpeta y ejecutá:
   ```
   npm install
   npx netlify-cli login
   npx netlify-cli deploy --prod
   ```
3. Cuando pregunte, elegí crear un sitio nuevo. La carpeta a publicar es `public`.

## Lo que NO funciona: arrastrar la carpeta a Netlify Drop

Netlify Drop (app.netlify.com/drop) solo sube páginas estáticas, sin funciones. Si arrastrás la carpeta `public/`, la página funciona pero los precios se quedan fijos con los del 4 de noviembre de 2026.

## Cómo revisar que los precios se actualizan

- Visitá `https://TU-SITIO.netlify.app/api/precios`. Debe mostrar un texto con `updatedAt` y los precios.
- En Netlify: **Logs → Functions → actualizar-precios** muestra cada ejecución diaria: cuántos precios leyó y cuántos cambiaron.
- Si La Colonia bloquea las consultas desde Netlify, la página sigue funcionando con los precios guardados y arriba dice "Precios del 4 nov 2026".

## Cambios comunes

- **Hora de actualización:** en `netlify/functions/actualizar-precios.mjs`, la línea `schedule: "0 11 * * *"` está en hora UTC (11:00 UTC = 5:00 a. m. en Nicaragua). Para dos veces al día: `"0 11,23 * * *"`.
- **Forzar una actualización:** visitá `https://TU-SITIO.netlify.app/.netlify/functions/actualizar-ahora-background` (responde vacío y trabaja en segundo plano).
- **Productos nuevos de La Colonia:** se actualizan los precios de todo lo que ya está en el catálogo. Para que aparezcan productos nuevos en el buscador hay que regenerar `datos.js`.
- **Después de cambiar archivos de la página:** cambiá `rinde-v1` por `rinde-v2` en `public/sw.js` para que los celulares descarguen la versión nueva.

## Instalar en el celular

Abrí el enlace en el celular:
- Android (Chrome): menú ⋮ → **Agregar a pantalla principal**.
- iPhone (Safari): botón compartir → **Agregar a inicio**.

Queda como una app y se puede abrir sin internet con los últimos precios guardados.

---
Prototipo de prueba sin fines comerciales. Los precios vienen de lacolonia.com.ni y pueden variar en tienda.
