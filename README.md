# Mortgage Calculator

Calculadora de hipotecas en Angular: tabla de amortización, simuladores de amortización anticipada y recurrente, y calculadora de ahorro.

🌐 **Producción:** https://mc.mariocoleguilla.com/

## Desarrollo

La configuración de Firebase **no está en el repositorio**. Para usar Firebase en local, copia
`.env.example` a `.env` (ignorado por git) y rellénalo con los datos de tu app web
(Firebase Console → Project settings → General → Your apps). Sin `.env` la app funciona en
**modo mock**: login simulado y datos guardados en `localStorage`.

```bash
npm ci            # instala exactamente lo que fija package-lock.json
npm start         # servidor de desarrollo en http://localhost:4200
npm test          # tests en modo watch (abre Chrome)
npm run test:ci   # tests una sola vez, en Chrome headless
npm run build     # build de producción en dist/mortgageCalculator/browser
```

## Despliegue

El despliegue es **automático**: cada push a `main` (por ejemplo, al hacer merge de un PR) ejecuta
el workflow [`deploy.yml`](.github/workflows/deploy.yml), que:

1. Instala dependencias y ejecuta los tests (si fallan, no se publica nada).
2. Compila en producción con la configuración de Firebase sacada de los secrets del repositorio
   y con el base href que indica GitHub Pages (`/` con el dominio propio).
3. Sube `dist/mortgageCalculator/browser` como artefacto y lo publica en GitHub Pages
   con las acciones oficiales (`upload-pages-artifact` + `deploy-pages`). No se usa ninguna rama `gh-pages`.

**Configuración necesaria (una sola vez):**

- Settings → Pages → Build and deployment → Source: **GitHub Actions**. Con "Deploy from a branch"
  GitHub publicaría el `README.md` de `main` en lugar de la app.
- Settings → Secrets and variables → Actions → **New repository secret**, uno por cada variable de
  `.env.example` (`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_APP_ID`
  son obligatorios; si faltan, el despliegue falla en lugar de publicar la app en modo mock).

También se puede relanzar a mano desde **Actions → Deploy to GitHub Pages → Run workflow**.

**Volver a una versión anterior:** en **Actions → Deploy to GitHub Pages**, abre la ejecución
de la versión buena y pulsa **Re-run all jobs**; vuelve a compilar y publicar ese commit.

### Notas

- La app usa rutas con hash (`/#/table`), así que funciona en cualquier hosting estático sin reglas de reescritura.
- `angular.json` tiene `baseHref: "/"`; el base href de cada destino se pasa al compilar con `--base-href`.

### Seguridad de Firebase

La API key de una app web de Firebase **no es un secreto**: identifica el proyecto y acaba siempre
dentro del JavaScript público. Sacarla del repositorio evita filtrarla en el código y las alertas de
GitHub, pero lo que protege los datos es:

- **Reglas de Firestore** ([`firestore.rules`](firestore.rules)): cada usuario solo puede leer y escribir
  sus propios documentos.
- **Dominios autorizados** (Authentication → Settings → Authorized domains): `mc.mariocoleguilla.com` y `localhost`.
- **Restricciones de la API key** (Google Cloud Console → APIs & Services → Credentials): solo
  referrers `https://mc.mariocoleguilla.com/*` y `http://localhost:4200/*`.
