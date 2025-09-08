TailwindCSS Integration Log

Date: Auto-generated

Steps performed

- Installed dev deps: tailwindcss, postcss, autoprefixer
- Issue: PowerShell rejected '&&' separator. Switched to ';' and per-command execution.
- Issue: `npx tailwindcss` not found in PATH despite package install. Workaround: created `tailwind.config.js` and `postcss.config.js` manually.
- Added Tailwind directives to `src/index.css` and preserved existing smoothing rules.
- Configured `content` globs in `tailwind.config.js` to include `./public/index.html` and `./src/**/*.{js,jsx,ts,tsx}`.
- Installed `@craco/craco` and added `craco.config.js` to wire PostCSS plugins.
- Updated `package.json` scripts to use `craco` for start/build/test.
- Began migrating UI components to Tailwind: `Navbar.jsx`, `NewTypeModal.jsx`, `DeleteModal.jsx`, `MediaCard.jsx`, `CardsContainer.jsx`, and refined `TierTitle.jsx` styling.
- Restored original Intro page styling (Bootstrap-based) per request and removed the navbar for guests.
- Prevented `NewTypeModal` from rendering for unauthenticated users to avoid stray dialog on the intro page.
- Fixed modal behavior on `ShowMediaList`: replaced native dialog with a controlled Tailwind modal that mounts only when `show` is true, avoiding stray overlay remnants.
- Adjusted navbar z-index to `z-50` so it layers above page content correctly.
- Tier layout: implemented CSS grid container `.tier-grid` using `repeat(auto-fill, minmax(240px, 1fr))` for fixed card min width, still using `rectSortingStrategy` so items can be re-ordered across rows.
- Card titles: added `.title-clamp` to clamp to two lines with ellipsis and keep uniform card heights; small text size so long titles fit.

Next steps

- Replace Bootstrap-based components with Tailwind equivalents (Navbar, Cards, Modals, Filters, Forms).
- Remove unused Bootstrap/MDB CSS imports once migration complete.
- Introduce a small Tailwind component library of utility classes if needed.

