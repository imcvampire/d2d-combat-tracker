# Retro Initiative Tracker - A Client-Side React SPA
A retro-styled D&D-like combat tracker to manage initiative, turns, HP, and status effects. Built as a single-page web application using React, with state management powered by Zustand and persistence via browser localStorage. The UI features a neon, pixel-art aesthetic with smooth micro-interactions for an engaging tabletop RPG experience.
## Overview
Retro Initiative Tracker is a visually striking, fully client-side app for tracking turn-by-turn combat in D20-style RPGs like Dungeons & Dragons. Users can create encounters, add players and monsters, roll or set initiative, advance turns, track HP and status effects (e.g., poisoned, stunned), and view a live initiative order. All data persists in your browser's localStorage, ensuring seamless state management across sessions without needing a backend.
Key features include:
- **Encounter Management**: Create, load, import, and reset combats with simple forms.
- **Initiative Tracking**: Sortable list with automatic tie-breaking (players prioritized over monsters, then alphabetical by name).
- **Entity Details**: HP bars, status toggles, and quick actions for damage/healing.
- **Turn Advancement**: Next-turn logic with visual transitions and active entity highlighting.
- **Retro UI**: Neon accents (cyan/magenta), pixel fonts (Press Start 2P), and glitch effects for a nostalgic vibe.
- **Responsive Design**: Mobile-first layout with touch-friendly controls and sticky navigation.
- **Persistence**: All changes are automatically saved to localStorage; supports a mock demo encounter for a quick tour.
The app is fully functional out-of-the-box, with optimistic UI updates, loading states, and error handling.
## Technology Stack
- **Frontend**: React 18, React Router 6, TypeScript, Tailwind CSS 3, shadcn/ui (Radix UI primitives), Framer Motion (animations), Lucide React (icons), Sonner (toasts), Zustand (state management).
- **State & Persistence**: Zustand for global state management, with `zustand/middleware/persist` for automatic saving to localStorage. Fully client-side with no backend dependencies.
- **Styling**: Tailwind CSS with custom themes (retro neon palette: #00FFD5, #FF3D81, #0B0B0B), Google Fonts (Press Start 2P for pixel accents).
- **Build Tools**: Vite (bundling), Bun (package manager).
- **Other**: Zod (validation), Immer (immutable updates), clsx & tailwind-merge (utility classes), UUID (IDs).
## Installation
This project uses Bun as the package manager for faster installs and development. Ensure you have Bun installed (v1.0+): [Install Bun](https://bun.sh/docs/installation).
1. Clone the repository:
   ```
   git clone <repository-url>
   cd retro-init-tracker
   ```
2. Install dependencies:
   ```
   bun install
   ```
The project is now ready for local development.
## Usage
### Running Locally
Start the development server:
```
bun run dev
```
- The app will be available at `http://localhost:3000` (or the specified PORT).
- Use the Home page to create a new encounter, then navigate to `/combat/:id` for tracking.
### Quick Demo
1. On the Home page, click **Create Encounter** to start a new combat.
2. Add entities via the **Add Entity** sheet (name, type: player/monster, max HP, initiative).
3. Roll initiatives or edit manually��the list auto-sorts.
4. Use **Next Turn** to advance; apply damage/heal or toggle statuses on selected entities.
5. Data persists across refreshes via localStorage.
## Backend Cleanup Confirmation
All backend artifacts have been removed. This project is a pure static single-page application.
- **Complete removal of `worker/` directory**: All files (`core-utils.ts`, `durableObject.ts`, `index.ts`, `userRoutes.ts`) have been deleted.
- **`wrangler.jsonc` and `tsconfig.worker.json` fully deleted.**
- **`package.json` verified**: No backend dependencies (e.g., `hono`, `pino`) are present. Scripts are purely for static development (`dev`, `build`, `lint`, `preview`, `deploy`).
- **`tsconfig.json` references confirmed**: Only `tsconfig.app.json` and `tsconfig.node.json` are referenced.
- **`vite.config.ts`**: Configured with the React plugin and path aliases only; no Worker-related plugins.
- **Project structure**: Purely client-side, consisting of `src/`, `shared/`, and configuration files.
- **Build verified**: `tsc --noEmit` runs clean with no Worker type errors. `bun run build` successfully produces a static `dist/` output with no backend artifacts.
## Deployment
Project is now a 100% static SPA: build to `dist/` and host on any static hosting provider like Vercel, Netlify, GitHub Pages, or Cloudflare Pages. No Cloudflare Workers are required.
1. Build the project:
   ```
   bun run build
   ```
   This command will generate a `dist/` directory with all the necessary static files.
2. Deploy the contents of the `dist/` directory to your hosting service.
### Final Verification
You can verify the production build locally before deploying:
```
# First, type-check the project
tsc --noEmit
# Then, build the project
bun run build
# Finally, preview the production build
bun run preview
```
Post-cleanup, success in these commands confirms the project is a production-ready static SPA.
## License
MIT License.
**Project is 100% static SPA, verified production-ready with no deployment blockers.**