# District Chronicle

A personal publishing platform: blog posts, gossip posts, photo albums, a
portfolio page, visitor comments and reactions, and a contact inbox — all
run through a single-admin newsroom panel.

```
district-chronicle/
├── backend/     FastAPI + MongoDB API
└── frontend/    React + Tailwind (CRA via craco)
```

## Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# edit .env — at minimum set a real SECRET_KEY and ADMIN_PASSWORD,
# and point MONGO_URL at your MongoDB instance (local or Atlas)

uvicorn app.main:app --reload --port 8000
```

On first boot the app seeds a single admin account from `ADMIN_USERNAME` /
`ADMIN_PASSWORD` in `.env` (only if no admin exists yet in the database).
Change the password immediately if you're deploying this anywhere public —
there's currently no in-app "change password" flow.

API docs are auto-generated at `http://localhost:8000/docs` while the
server is running.

### Email notifications

Leave `SMTP_HOST` blank in `.env` to disable outgoing email entirely —
comments and contact messages still save normally either way, they just
won't trigger a notification. To turn it on, fill in `SMTP_HOST`,
`SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, and `SMTP_FROM_EMAIL` (a
Gmail app password or a transactional provider like SendGrid/Mailgun both
work over standard SMTP). Which events actually send mail — new comments,
new contact messages — and an optional recipient override are controlled
per-site from the admin Settings page, not from `.env`.

### File storage

Uploads currently save to local disk (`backend/uploads/`, served at
`/api/uploads/file/...`). That's fine for local development, but most free
hosting tiers wipe local disk on every redeploy. Before deploying to
production, swap `app/routers/uploads.py`'s save step for Cloudinary or S3
— the upload endpoint's request/response shape can stay the same, only the
storage call inside it needs to change.

## Frontend

```bash
cd frontend
npm install

cp .env.example .env   # or edit .env directly
# REACT_APP_API_URL should point at the backend, e.g. http://localhost:8000/api

npm start
```

This runs the dev server on `http://localhost:3000`. Make sure the
backend's `FRONTEND_ORIGIN` in `backend/.env` matches whatever origin the
frontend is actually served from (CORS is strict about this — including
`localhost` vs `127.0.0.1`, which browsers treat as different origins).

For a production build: `npm run build`, then serve the `build/` folder
from any static host.

## What's here (MVP)

- Blog posts and gossip posts (same underlying model, separate sections)
- Tags — comma-separated per post, filterable via `/tag/:tag`, with a public
  `/api/posts/tags/all` endpoint for building tag clouds
- Drafts and scheduled publishing — each post has a `draft` / `scheduled` /
  `published` status; scheduled posts go live on their own once the
  publish time passes (checked on read, no separate worker process needed)
- Public commenting (no visitor accounts) and emoji-style reactions
- Photo albums with per-photo captions
- Single-block portfolio page
- Site-wide settings (title, tagline, contact email, notification toggles)
- Contact form with an admin inbox (read / delete)
- Email notifications — optional, off by a missing SMTP host rather than a
  broken request: new comments and new contact messages can each trigger
  an email to the admin, configured via environment variables and toggled
  per-type from the site settings page
- RSS feed at `/api/rss.xml` (supports `?post_type=` and `?tag=` filters)
- Single-admin cookie-based login, with a dashboard showing basic stats

## Not yet built (see the original project guide for the full roadmap)

Search, custom analytics, visitor accounts, rich text/embeds in the editor,
and a scheduled-post background worker (currently lazy: a scheduled post
becomes visible the next time anything queries it, which is instant for a
site with normal traffic but means a post won't appear in, say, the RSS
feed of a reader who cached results moments before the publish time).

## Design notes

The frontend leans into the "one-person newspaper" premise in its name:
a masthead with a real edition ticker (the issue number is just the live
post count), Fraunces for display type, Source Serif 4 for body copy, and
IBM Plex Mono for bylines/labels. Blog posts get a clean underlined-headline
card; gossip posts get a tilted, taped "clipping" treatment so the two
sections read as visually distinct at a glance.
