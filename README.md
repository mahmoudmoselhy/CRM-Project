# Wasl CRM (وصل) — Graduation Project

A CRM SaaS platform where multiple companies manage leads, follow-up tasks, users,
and reports — each company's data fully isolated.

**Stack:** React 19 + Vite + Tailwind 4 · Node.js + Express 5 + Prisma 6 + PostgreSQL

---

## Features (so far)

- Auth: company registration, login, JWT
- Multi-tenant data isolation (every query scoped by company)
- Roles (Admin / Manager / Agent) + per-user action-level permissions
- Leads: CRUD, assignment, status workflow, notes, activity timeline
- Tasks: lead-linked + general team tasks, due dates, overdue detection, auto follow-up task on new lead
- Dashboard + Reports: live stats, leads-by-status chart, agent & source performance
- Feature flags (per-company extensions)

---

## Project structure

```
crm-system/
├── server/          # Express + Prisma API
│   ├── prisma/
│   │   ├── schema/  # multi-file Prisma schema
│   │   └── seed.js  # demo data
│   └── src/
│       ├── modules/ # auth, users, leads, tasks, reports
│       ├── middlewares/
│       ├── config/
│       └── ...
└── client/          # React + Vite app
    └── src/
        ├── api/  components/  hooks/  layouts/  pages/  routes/  store/
```

---

## Requirements

- Node.js 20+
- PostgreSQL 14+ (running locally, or a hosted one like Supabase)

---

## Run locally (or on a new machine)

### 1. Backend

```bash
cd server
npm install

# create your env file from the example, then edit DATABASE_URL + JWT_SECRET
cp .env.example .env      # Windows: copy .env.example .env

# create the database tables and generate the Prisma client
npx prisma migrate dev --name init

# (optional) fill demo data
npm run seed

npm run dev               # http://localhost:5000/api/health
```

`.env` values:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/crm"
JWT_SECRET="any-long-random-string"
JWT_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```

---

## Demo accounts (after `npm run seed`)

Password for all: `password123`

| Email | Role | Access |
|-------|------|--------|
| admin@maysan.com | ADMIN | everything |
| manager@maysan.com | MANAGER | leads, tasks, reports |
| agent1@maysan.com | AGENT | leads + tasks |
| agent2@maysan.com | AGENT | view only |
| admin@threeway.com | ADMIN | a second company (isolated data) |

---

## Notes

- After any change to `prisma/schema/`, run `npx prisma migrate dev` before starting the server.
- `.env` files are git-ignored — never commit secrets. Use the `.env.example` files as templates.
