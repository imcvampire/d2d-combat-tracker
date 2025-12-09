# Retro Initiative Tracker

[![Deploy to Cloudflare Workers][cloudflarebutton]]

A retro-styled D&D-like combat tracker to manage initiative, turns, HP, and status effects. Built as a single-page web application with Cloudflare Workers and a Global Durable Object for persistence. The UI features a neon, pixel-art aesthetic with smooth micro-interactions for an engaging tabletop RPG experience.

## Overview

Retro Initiative Tracker is a visually striking app for tracking turn-by-turn combat in D20-style RPGs like Dungeons & Dragons. Users can create encounters, add players and monsters, roll or set initiative, advance turns, track HP and status effects (e.g., poisoned, stunned), and view a live initiative order. All data persists via Cloudflare's Durable Objects, ensuring seamless state management across sessions.

Key features include:
- **Encounter Management**: Create, load, and reset combats with simple forms.
- **Initiative Tracking**: Sortable list with automatic tie-breaking (players prioritized over monsters, then alphabetical by name).
- **Entity Details**: HP bars, status toggles, and quick actions for damage/healing.
- **Turn Advancement**: Next-turn logic with visual transitions and active entity highlighting.
- **Retro UI**: Neon accents (cyan/magenta), pixel fonts (Press Start 2P), and glitch effects for a nostalgic vibe.
- **Responsive Design**: Mobile-first layout with touch-friendly controls and sticky navigation.
- **Persistence**: All changes saved to a single Global Durable Object; supports mock data seeding for quick demos.

The app is fully functional out-of-the-box, with optimistic UI updates, loading states, and error handling.

## Technology Stack

- **Frontend**: React 18, React Router 6, TypeScript, Tailwind CSS 3, shadcn/ui (Radix UI primitives), Framer Motion (animations), Lucide React (icons), Sonner (toasts), Zustand (state management), @tanstack/react-query (data fetching/caching).
- **Backend**: Cloudflare Workers, Hono (routing), Global Durable Object (persistence), UUID (IDs).
- **Styling**: Tailwind CSS with custom themes (retro neon palette: #00FFD5, #FF3D81, #0B0B0B), Google Fonts (Press Start 2P for pixel accents).
- **Build Tools**: Vite (bundling), Bun (package manager), Wrangler (Cloudflare deployment).
- **Other**: Zod (validation), Immer (immutable updates), clsx & tailwind-merge (utility classes).

No additional databases or external services required—everything runs on Cloudflare's edge.

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

3. Generate Cloudflare types (for Worker bindings):
   ```
   bun run cf-typegen
   ```

The project is now ready for local development.

## Usage

### Running Locally

Start the development server:
```
bun run dev
```

- The app will be available at `http://localhost:3000` (or the specified PORT).
- Frontend builds to static assets served by the Worker; API endpoints are at `/api/combat/*`.
- Use the Home page to create a new encounter, then navigate to `/combat/:id` for tracking.

### Quick Demo

1. On the Home page, click **Create Encounter** to start a new combat.
2. Add entities via the **Add Entity** sheet (name, type: player/monster, max HP, initiative).
3. Roll initiatives or edit manually—the list auto-sorts.
4. Use **Next Turn** to advance; apply damage/heal or toggle statuses on selected entities.
5. Data persists across refreshes via the Durable Object.

Mock data seeds on first load for testing. All operations use API calls to the Worker (e.g., `POST /api/combat` for creation).

### API Endpoints

The backend exposes RESTful endpoints at `/api/combat/*`:
- `GET /api/combat/:id`: Fetch combat state.
- `POST /api/combat`: Create new encounter.
- `POST /api/combat/:id/next-turn`: Advance turn.
- `POST /api/combat/:id/entity`: Add entity.
- `PUT /api/combat/:id/entity/:eid`: Update HP/status/initiative.
- `DELETE /api/combat/:id/entity/:eid`: Remove entity.
- `POST /api/combat/:id/reset`: Reset encounter.

Responses follow `ApiResponse<T>` format with TypeScript types in `shared/types.ts`.

## Development

### Project Structure

- **Frontend** (`src/`): React components, pages, hooks, and utilities. Pages: `HomePage.tsx` (landing), `CombatPage.tsx` (main view).
- **Backend** (`worker/`): Hono routes in `userRoutes.ts`, Durable Object logic in `durableObject.ts`.
- **Shared** (`shared/`): Types (`types.ts`) and mock data.
- **UI Components**: shadcn/ui in `src/components/ui/`—extend as needed without rewriting.
- **Styling**: Custom Tailwind config in `tailwind.config.js`; add colors/animations there.

### Scripts

- `bun run dev`: Start dev server (Vite + Worker proxy).
- `bun run build`: Build frontend assets and Worker.
- `bun run lint`: Run ESLint.
- `bun run preview`: Local preview of production build.
- `bun run deploy`: Build and deploy to Cloudflare.

### Adding Features

- **Frontend**: Add routes in `src/main.tsx`. Use React Query for API caching (e.g., `useQuery` for combat state).
- **Backend**: Extend `userRoutes.ts` for new endpoints; implement DO methods in `durableObject.ts` (e.g., storage keys like `"combat_${id}"`).
- **Types**: Update `shared/types.ts` (e.g., `CombatState`, `Entity`).
- **Styling**: Follow retro theme—use neon gradients, pixel fonts for headings, and Framer Motion for interactions (e.g., turn highlights).
- **Testing**: Add unit tests with Vitest; integration tests via Playwright (not included).

Ensure all changes maintain responsive design and accessibility (ARIA labels, keyboard nav).

## Deployment

Deploy to Cloudflare Workers for global edge runtime:

1. Ensure Wrangler is installed: `bun add -g wrangler`.
2. Authenticate: `wrangler login`.
3. Configure bindings in `wrangler.jsonc` (pre-set for GlobalDurableObject).
4. Deploy:
   ```
   bun run deploy
   ```

The app deploys as a Worker with static asset handling. Access at your Worker URL (e.g., `https://retro-init-tracker.<account>.workers.dev`).

For production:
- Set custom domain via Wrangler.
- Monitor logs: `wrangler tail`.
- Use Cloudflare's dashboard for analytics and Durable Object metrics.

[![Deploy to Cloudflare Workers][cloudflarebutton]]

## Contributing

Contributions welcome! Fork the repo, create a feature branch, and submit a PR. Focus on:
- Bug fixes for persistence/UI.
- New features like multi-user sync or export.
- UI polish aligning with retro aesthetic.

Please adhere to the code style (ESLint, Prettier via `bun run lint`).

## License

MIT License. See [LICENSE](LICENSE) for details.