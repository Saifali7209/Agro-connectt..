# Agro Connect — Backend

A real FastAPI backend for the Agro Connect React frontend. It matches the
exact API contract the frontend already expects (see `src/legacy/js/config.js`
and `src/legacy/js/api.js` in the frontend project) — so once this is
running, registration, login, and the rest of the app work against real,
persisted data instead of showing "couldn't reach the server."

Data is stored in a local SQLite file (`agro_connect.db`), created
automatically the first time you run the server. Nothing needs to be
installed separately for the database.

## What's implemented

- **Auth** — register, login, refresh (httpOnly cookie), me, logout, OTP
  request/verify, forgot/reset password. Fully working.
- **Crops** — full CRUD, search/catalog, price history, status, saved crops.
- **Orders** — create, list, status updates, timeline, negotiation offers.
- **Users / Farmers / Buyers** — admin management, public farmer directory,
  self-profile endpoints.
- **Inventory, Messaging, Notifications, Reviews, Knowledge base, Admin
  stats** — real, DB-backed.
- **Weather, AI Crop Doctor, price/yield prediction** — no external
  service is connected (that needs API keys this project doesn't have), so
  these return clearly-labelled placeholder/heuristic data with the right
  shape, so the screens render instead of erroring. Swap in a real provider
  later by editing `app/routers/weather.py` and `app/routers/ai.py`.

## 1. Install Python dependencies

Open a terminal **inside this `agro-connect-backend` folder** and run:

```
pip install -r requirements.txt
```

If you're using Anaconda (your terminal prompt starts with `(base)`), this
same command works fine inside the base environment — no need for a
separate virtual environment unless you want one.

## 2. (Optional) Configure environment variables

Copy `.env.example` to `.env` if you want to change anything (e.g. the
frontend origin, if you're not using the default Vite port 5173). The
defaults work out of the box for local development:

```
copy .env.example .env
```

## 3. (Optional but recommended) Create demo accounts + sample crops

```
python seed.py
```

This creates one login for each role so you can test immediately without
registering by hand:

| Role   | Email                | Password      |
|--------|-----------------------|----------------|
| Farmer | farmer@example.com    | Password123    |
| Buyer  | buyer@example.com     | Password123    |
| Expert | expert@example.com    | Password123    |
| Admin  | admin@example.com     | Password123    |

Safe to run more than once — it skips anything that already exists.

## 4. Run the server

```
uvicorn app.main:app --reload
```

You should see something like:

```
Uvicorn running on http://127.0.0.1:8000
```

Leave this terminal open — closing it stops the backend. Visit
`http://localhost:8000/docs` in a browser any time to see and try every
endpoint interactively (this is FastAPI's built-in docs page).

## 5. Run the frontend alongside it

In a **separate** terminal, in the `agro-connect-react` project folder:

```
npm run dev
```

Make sure the frontend's `.env.local` (copy it from `.env.example` if you
haven't) has:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

This is already the default even without a `.env.local` file, so if you
haven't changed anything there, it'll just work.

Now open `http://localhost:5173`, register a new account (or log in with
one of the seeded ones above), and everything — registration, login,
posting a crop, placing an order — talks to this real backend.

## Notes on scope

This backend was built to unblock end-to-end testing of the frontend, not
as a production-hardened service. Before deploying it anywhere real, at minimum:

- Change `SECRET_KEY` in `.env` to a long random value.
- Set cookies' `secure=True` in `app/routers/auth.py` once served over HTTPS.
- Replace the placeholder weather/AI endpoints with real providers.
- Add rate limiting to `/auth/login` and `/auth/otp/request`.
- Swap SQLite for Postgres/MySQL if you expect concurrent writers.
