# Prastha Frontend

Prastha is a lightweight thread hub for pop-up community coordination. Users can spin up a thread, invite others, exchange short messages, trade gossips, and send alert cards when plans change. Nothing beyond that—no gamification or feeds we haven’t built yet. The UI you see is exactly what ships: thread creation, membership requests, chat, gossip board, minimal analytics, and admin-only delete controls.

This frontend is a collaborative effort by **asmith0713** and **Niteesh206**, forked from [Niteesh206/event-thread-frontend](https://github.com/Niteesh206/event-thread-frontend).

> **Companion backend:** [server/event-thread-backend](../server/event-thread-backend/README.md) (forked from [Niteesh206/event-thread-backend](https://github.com/Niteesh206/event-thread-backend)).

## What’s Implemented

- Create a thread with title, description, tags, duration, and location
- Request access to threads and approve/deny requests as the creator
- Live-ish thread chat (polling + socket refresh) with send-only support in the home surface
- Alerts list that links back to the originating thread
- Explore + Profile pages that just wrap the same thread data, no extra logic
- Gossip board with up/down votes, inline replies, and comment reporting
- Creator/admin-only delete button that nukes the thread after confirmation
- Responsive layout + dark mode token tweaks to keep cards readable

## Stack

- Next.js 16 (App Router, React 19)
- Tailwind CSS 3.4 with semantic design tokens
- TanStack Query 5 for caching + React Query Devtools (dev-only)
- Radix UI, Lucide icons, Sonner toasts

## Prerequisites

- Node.js 18+
- pnpm / npm / yarn (examples use `npm`)
- Backend API running locally at `NEXT_PUBLIC_API_URL=http://localhost:5000`

## Environment

Create `.env.local` with at least:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Additional tokens (analytics, auth providers, etc.) can be added as needed.

## Scripts

```bash
# install deps
npm install

# start dev server (webpack mode)


# lint + type-check
npm run lint

# build for production
npm run build
```

The dev server expects the backend to be reachable for API calls; otherwise mock data or fallbacks should be injected.

## Project Structure

```
src/
	app/            # App Router pages
	components/     # Reusable UI + feature widgets
	features/       # Page-level feature composites
	hooks/          # TanStack Query + state hooks
	lib/            # API client, constants, sockets, utilities
	store/          # Zustand stores
	types/          # Shared TS types
```

## Development Notes

- React Query Devtools render only when `NODE_ENV === "development"`, so users never see them in production builds.
- Radix Sheet/Dialog components include visually-hidden titles/descriptions purely to silence accessibility warnings—no fancy semantics beyond that.
- Deletion is the only privileged action: backend checks the creator id or a stored `isAdmin` flag before removing a thread.

## Credits

- Original concept & starter: [Niteesh206/event-thread-frontend](https://github.com/Niteesh206/event-thread-frontend)
- Current collaborative maintainers: **asmith0713** & **Niteesh206**

Feel free to open issues or PRs in either fork—just mention which surface (frontend/backend) you’re targeting so we can coordinate changes across both repos.
