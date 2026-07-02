# SolidJS Frontend Refactor Plan

## Goal

Rewrite the `web/` frontend from React to SolidJS while keeping the app small, direct, and easier to maintain. The new app should preserve the existing Teledeck workflows:

- Browse paginated Telegram media.
- Filter by sort order, favorite state, videos-only, and search text.
- Toggle favorite, delete media, undo delete, and delete a page.
- View images/videos in a fullscreen overlay.
- Download media files.
- Login/register/logout.
- Persist dark mode, hide-info, and search preferences.

The rewrite should also remove Radix UI and avoid carrying over UI complexity that does not serve the current app.

## Current Frontend Snapshot

The active React app lives in `web/src`. It is compact and mostly organized by feature:

- `features/gallery`: gallery queries, pagination, fullscreen view, context menu, undo.
- `features/media`: media card, video player behavior, media controls.
- `features/navigation`: nav bar, search box, search/view options.
- `features/preferences`: Jotai atoms backed by local storage.
- `features/auth`: auth API hooks and login/register components.
- `shared/api`: Axios request helpers, query keys, serialization utilities.
- `shared/types`: API, media, preference, and user types.
- `routes`: TanStack Router file routes.

Important libraries currently in use:

- React and React DOM.
- TanStack React Query.
- TanStack React Router and router Vite plugin.
- Jotai.
- Radix UI Themes.
- `lucide-react`.
- Axios.

The API request layer and shared types can mostly survive the rewrite. The React-specific hooks, route files, Jotai atoms, and Radix components should be replaced.

## Target Stack

Use a deliberately small SolidJS stack:

- `solid-js`
- `@solidjs/router`
- `@tanstack/solid-query`
- `lucide-solid`
- Tailwind CSS
- `axios`
- Existing Vite and TypeScript setup, switched from React plugin to Solid plugin.

Use native HTML controls, Tailwind utilities, and small CSS modules only where component-specific behavior is clearer than utility classes. The app is a media browser, so the interface should prioritize fast scanning, stable layout, and simple controls over component-library polish.

## Proposed File Moves

Start by preserving the old implementation:

```text
web/src       -> web/src-react
web/src       <- new SolidJS app
```

Keep the React source available until the Solid app reaches parity. Do not delete `web/src-react` in the first migration pass.

Suggested new structure:

```text
web/src/
  app/
    App.tsx
    routes.tsx
    queryClient.ts
  features/
    auth/
      api.ts
      AuthForms.tsx
    gallery/
      api.ts
      Gallery.tsx
      GalleryPage.tsx
      Pagination.tsx
      FullscreenOverlay.tsx
      ContextMenu.tsx
      UndoButton.tsx
      state.ts
    media/
      MediaCard.tsx
      mediaControls.ts
      videoPlayer.ts
      media-card.module.css
    navigation/
      Navigation.tsx
      SearchBox.tsx
      SearchOptions.tsx
      ViewOptions.tsx
      constants.ts
    preferences/
      constants.ts
      state.ts
  shared/
    api/
    style/
      global.css
    types/
  main.tsx
  vite-env.d.ts
```

The exact names can move around as the implementation settles, but keeping the current feature boundaries will make the rewrite easier to verify.

## Dependency Changes

Update `web/package.json`:

- Remove:
  - `react`
  - `react-dom`
  - `@types/react`
  - `@types/react-dom`
  - `@vitejs/plugin-react-swc`
  - `@tanstack/react-query`
  - `@tanstack/react-query-devtools`
  - `@tanstack/react-router`
  - `@tanstack/router-devtools`
  - `@tanstack/router-vite-plugin`
  - `jotai`
  - `@radix-ui/themes`
  - `radix-ui`
  - `lucide-react`
  - `monorepo`
- Add:
  - `solid-js`
  - `@vitejs/plugin-solid`
  - `@solidjs/router`
  - `@tanstack/solid-query`
  - `@tanstack/solid-query-devtools` if devtools are still wanted
  - `lucide-solid`
  - `tailwindcss`
  - `@tailwindcss/vite` if using Tailwind v4
  - `postcss` and `autoprefixer` if staying on Tailwind v3

Adjust TypeScript:

- `jsx`: `preserve`
- `jsxImportSource`: `solid-js`
- `include`: keep `src`
- path aliases should continue to point at the new `src` tree.

Adjust Vite:

- Replace `@vitejs/plugin-react-swc` with `@vitejs/plugin-solid`.
- Add the Tailwind Vite plugin if using Tailwind v4.
- Remove `TanStackRouterVite`.
- Keep the existing `/api`, `/static`, `/media`, and `/thumbnail` proxies.
- Keep the same build output so the Go embedding path does not change.

Tailwind setup:

- Prefer Tailwind v4 for a fresh rewrite unless an existing build step requires v3.
- If Tailwind v4 is used, configure it through `@tailwindcss/vite` and import Tailwind from the main stylesheet.
- If Tailwind v3 is used, add `tailwind.config.*` and `postcss.config.*` with content paths for `./index.html` and `./src/**/*.{ts,tsx}`.
- Keep project-specific theme tokens in CSS variables so dark mode remains a class toggle and Solid components can stay simple.

## Migration Phases

### Phase 1: Preserve and Bootstrap

1. Rename `web/src` to `web/src-react`.
2. Create a minimal Solid app in `web/src` with:
   - `main.tsx`
   - `app/App.tsx`
   - `app/routes.tsx`
   - `shared/style/global.css`
3. Add Tailwind to the Vite build and import it from `shared/style/global.css`.
4. Port the path aliases in `vite.config.ts` and `tsconfig.app.json`.
5. Confirm `npm run build` reaches the new Solid entrypoint.

Acceptance check:

- The app renders a basic shell at `/`.
- Tailwind utility classes compile in the Solid app.
- Vite dev server proxies remain unchanged.
- The old React app is still available in `web/src-react`.

### Phase 2: Port Shared API and Types

Copy these modules first because they are mostly framework-neutral:

- `shared/types/*`
- `shared/api/constants.ts`
- `shared/api/requests.ts`
- `shared/api/serialization.ts`
- `shared/api/utils.ts`
- `shared/api/queryKeys.ts`
- `features/navigation/constants.ts`
- `features/preferences/constants.ts`

Then clean up imports and naming as needed.

Recommended improvements during the port:

- Move login/register requests into `shared/api/requests.ts` instead of keeping inline `fetch` calls in the auth component.
- Normalize thumbnail route naming. The current Vite proxy includes `/thumbnail`, while media cards use `/thumbnails/${fileName}` for posters.
- Review query keys before porting mutations. Existing code mixes `['mediaItem', id]` and `queryKeys.media.item(id)`, which can cause cache misses.

Acceptance check:

- TypeScript can import shared API/types without React dependencies.
- API request functions remain small wrappers around backend endpoints.

### Phase 3: Replace Jotai With Solid State

Create Solid-native preference/state modules:

- `createSignal` for current page, fullscreen item, and context menu state.
- A small `createLocalStorageSignal` helper for persisted preferences.
- Derived accessors for combined search and view preferences.
- Effects that sync `dark` and `hide-info` classes onto `document.documentElement`.

State to preserve:

- `sortMode`: default `date_desc`
- `videosOnly`: default `false`
- `showFavorites`: default `all`
- `searchString`: default ``
- `darkmode`: default `true`
- `hideinfo`: default `false`
- `currentPage`
- `fullscreenItem`
- `contextMenu`

Acceptance check:

- Preference changes persist across reloads.
- Dark mode and hide-info classes apply without Radix.
- Search preference changes reset or clamp pagination intentionally.

### Phase 4: Port Data Queries and Mutations

Rewrite the query hooks using `@tanstack/solid-query`:

- `useUser`
- `useLogout`
- `useTotalPages`
- `useGallery`
- `useMediaItem`
- `useVideoThumbnail`
- `useGalleryMutations`
- `useDeletePage`

Keep the current performance trick where `getGalleryPage` pre-populates individual media item cache entries, but fix cache key consistency first.

Solid Query notes:

- Query keys that depend on signals should be functions/accessors, not stale snapshots.
- Mutations should update query cache using the same query-key builders as queries.
- Keep `staleTime: Infinity` for media items and gallery pages unless the backend behavior changes.

Acceptance check:

- Gallery page loads media IDs and cached media items.
- Next/previous page prefetch still works.
- Favorite/delete/undo update visible state without a full page refresh.

### Phase 5: Rebuild Layout and Navigation

Rebuild the shell without Radix:

- Sticky top navigation.
- Desktop controls in one dense row.
- Mobile search row plus collapsible controls.
- Footer can stay simple.

Use native controls:

- `<select>` for sort and favorite filters.
- Checkbox/toggle for videos-only, dark mode, hide-info.
- Text input for search.
- Plain buttons with `lucide-solid` icons where useful.

Use Tailwind for layout and common styling:

- Sticky header, responsive rows, spacing, text, borders, focus states, and grid layout.
- Dark-mode variants through the existing `.dark` class strategy.
- Keep repeated class clusters small by extracting Solid components rather than creating a large utility wrapper layer.

Routes:

- `/`: gallery.
- `/about`: short project/about text, updated to say SolidJS once the rewrite lands.
- `/login`: login form.
- `/register`: register form.

Acceptance check:

- Navigation works with `@solidjs/router`.
- Auth-aware nav still shows user/logout or login/register actions.
- Mobile layout has the same controls as desktop.

### Phase 6: Rebuild Gallery and Media Cards

Port gallery components in this order:

1. `Pagination`
2. `GalleryPage`
3. `MediaCard`
4. `UndoButton`
5. `ContextMenu`
6. `FullscreenOverlay`

Design direction:

- Use CSS grid with stable cards: `grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr))`.
- Keep square media previews using `aspect-ratio: 1 / 1`.
- Prefer object-fit cover in cards, object-fit contain in fullscreen.
- Keep controls visible on hover for desktop and accessible on touch devices.
- Avoid nested card-heavy layouts. This is a scanning tool, not a landing page.

Behavior to preserve:

- Click image/video preview opens fullscreen on non-mobile.
- Video preview can play/pause.
- Favorite, delete, download buttons stop propagation.
- Context menu opens at pointer location.
- Escape closes fullscreen.
- Arrow left/right paginate when fullscreen or forms are not focused.
- Unsupported media types show a clear inline fallback.

Acceptance check:

- Images and videos render correctly.
- Fullscreen view supports both images and videos.
- Media actions call the same backend endpoints.
- Cards do not shift size when hover controls appear.

### Phase 7: Auth Forms

Port login/register to Solid forms:

- Use `createSignal` for form state and errors.
- Move requests into the shared API layer.
- On successful login, invalidate/refetch `user.me` and navigate home.
- On successful register, navigate to login after a brief success state or immediately if preferred.

Acceptance check:

- Login updates nav without manual reload.
- Logout clears cached user and returns to `/login`.
- Register preserves current backend form-encoded payload format.

### Phase 8: Styling Cleanup

Create a Tailwind-first styling layer:

- CSS custom properties for background, panel, border, text, muted text, accent, danger, and focus.
- Dark theme variables under `.dark`.
- Tailwind theme values mapped to those variables where useful.
- Component classes only for repeated app patterns that are awkward to read inline.
- CSS modules for media-card-specific behavior such as hover overlays, square preview internals, and video overlay transitions.

Remove Radix theme CSS and Radix color dependencies.

Acceptance check:

- No Radix imports remain.
- No React-specific CSS assumptions remain.
- Tailwind classes are used for ordinary layout and control styling.
- The app is legible in light and dark modes.

### Phase 9: Validation

Run from `web/`:

```bash
npm install
npm run build
npm run lint
```

Then run the app:

```bash
npm run dev
```

Manual checks:

- `/` loads gallery with backend running.
- Search/filter/sort controls update requests.
- Pagination and keyboard navigation work.
- Favorite/delete/undo are reflected immediately.
- Download opens `/media/:file_name`.
- Fullscreen image/video works and closes with Escape.
- Login/register/logout flow works.
- Preferences persist after reload.
- Mobile viewport controls remain usable.

If the Go server embeds `web/dist`, also run:

```bash
make web
make build
```

## Risks and Watchpoints

- TanStack Query cache keys need cleanup during the port; inconsistent media item keys exist today.
- Auth is partly outside the API layer today, so login/register behavior should be verified against the backend before reshaping too much.
- Generated `routeTree.gen.ts` disappears with `@solidjs/router`; make sure no build scripts assume it exists.
- Existing route imports in the React app rely on aliases and generated router behavior. The Solid routes should be explicit and boring.
- The frontend currently uses both `/thumbnail` and `/thumbnails`-style paths. Verify backend routes before finalizing video posters.
- Do not delete `web/src-react` until the Solid app reaches feature parity and the team is comfortable losing the React reference.

## Suggested First Implementation Pass

For the first real refactor PR, keep the scope to:

1. Rename `web/src` to `web/src-react`.
2. Install Solid dependencies and update Vite/TypeScript config.
3. Install and configure Tailwind.
4. Create the Solid shell, routes, global CSS, shared API/types, and preference state.
5. Render the gallery with read-only media cards.
6. Prove `npm run build` works.

Then follow with separate passes for mutations, fullscreen/context menu, auth, and final styling. That keeps the rewrite reviewable and makes regressions easier to isolate.
