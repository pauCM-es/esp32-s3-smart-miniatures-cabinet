# Smart Cabinet Home Assistant frontend

This folder contains editable Home Assistant frontend source. `src/ha/www/` is generated output and is the only directory copied to Home Assistant's `/config/www/`.

## Commands

```powershell
cd frontend
pnpm install
pnpm run build
```

`pnpm run dev` starts a local development server with mock Home Assistant data. It opens at the URL printed by Vite (normally `http://localhost:5173`) and hot-reloads source changes.

Use `pnpm run watch` to rebuild the HA files without starting the mock page.

The build emits:

```text
src/ha/www/smart-cabinet-panel.js
src/ha/www/smart-cabinet-card.js
src/ha/www/smart-cabinet-miniatures-card.js
```
