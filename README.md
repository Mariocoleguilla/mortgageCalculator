# Mortgage Calculator

Calculadora de hipotecas en Angular: tabla de amortización, simuladores de amortización anticipada y recurrente, y calculadora de ahorro.

🌐 **Producción:** https://mariocoleguilla.github.io/mortgageCalculator/

## Desarrollo

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
2. Compila en producción con `--base-href /mortgageCalculator/`.
3. Publica el contenido de `dist/mortgageCalculator/browser` en la rama `gh-pages`, que es la que sirve GitHub Pages.

También se puede relanzar a mano desde **Actions → Deploy to GitHub Pages → Run workflow**.

**Volver a una versión anterior:** cada despliegue es un commit en `gh-pages`
(`Deploy <sha>: <mensaje>`), así que basta con hacer `git revert` del último commit de esa rama
y hacer push.

### Notas

- La app usa rutas con hash (`/#/table`), así que funciona en cualquier hosting estático sin reglas de reescritura.
- `angular.json` tiene `baseHref: "/"`; el base href de cada destino se pasa al compilar con `--base-href`.
- El login con Google solo funciona en dominios autorizados en Firebase
  (Console → Authentication → Settings → Authorized domains). `mariocoleguilla.github.io` debe estar en la lista.
