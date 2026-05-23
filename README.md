# TicketFlow – Mini Ticket Management System

A lightweight support ticketing platform built with Next.js 16, MongoDB, TypeScript, Tailwind CSS, Framer Motion, and Socket.io.

## Features

- **Authentication** – Register/login with JWT sessions (NextAuth.js + bcrypt)
- **Dashboard** – Stats cards (Total / Open / In Progress / Closed) with real-time updates
- **Ticket CRUD** – Create, edit, delete, change status
- **Search & Filters** – Debounced search (300ms), filter by status/priority, pagination (10/page)
- **Activity Timeline** – Per-ticket history log with timestamps
- **Chaos Simulation** – Random slow/failure/empty/duplicate scenarios handled gracefully
- **Real-time** – Socket.io broadcasts ticket updates across open tabs
- **Animations** – Framer Motion for card entrance, modal, and list transitions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js v4 (credentials) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Real-time | Socket.io |
| Data fetching | SWR |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ticketflow
NEXTAUTH_SECRET=<any-random-string>
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to login.

## Folder Structure

```
app/
  (auth)/login|register   – Public auth pages
  dashboard/              – Protected main dashboard
  tickets/[id]/           – Ticket detail + activity timeline
  api/                    – REST API routes
components/
  ui/                     – Button, Badge, Modal, Spinner, Pagination
  tickets/                – TicketCard, TicketForm, TicketFilters, TicketList, ActivityTimeline
  dashboard/              – StatCard
hooks/                    – useTickets (SWR), useDebounce
lib/                      – db, auth, chaos, socket utilities
models/                   – User, Ticket (Mongoose schemas)
types/                    – Shared TypeScript interfaces
server.ts                 – Custom HTTP server with Socket.io
```

## Architecture

1. **Custom server (`server.ts`)** – Required to attach Socket.io to the same HTTP server as Next.js. Uses `tsx` to run TypeScript directly.
2. **Chaos middleware (`lib/chaos.ts`)** – Runs on every `GET /api/tickets` with weighted probability (60% normal, 10% each chaos scenario). Frontend handles each state without breaking layout.
3. **Duplicate deduplication** – Client-side in `useTickets` hook via `Map` keyed on `_id`. Even if the server returns duplicates, the UI stays clean.
4. **Activity log** – Embedded array on the Ticket document. Each PUT appends an entry describing what changed.
5. **SWR** – Lightweight data fetching; `revalidateOnFocus: false` reduces noise during chaos scenarios.

## Keyboard Shortcut

Press **⌘K / Ctrl+K** anywhere on the dashboard to instantly open the "Create New Ticket" modal.
