# Agro Connect — React migration

The Agro Connect frontend, migrated from static HTML + ES modules to a React +
React Router application, with the authentication bypass fixed.

The visual identity is unchanged: all eight original stylesheets are used
verbatim, and the only CSS added is `src/styles/react-adjustments.css` (~40
lines, documented inline).

---

## 1. Running it

```sh
npm install
cp .env.example .env.local     # point VITE_API_BASE_URL at your API
npm run dev                    # http://localhost:5173
```

> **You need the backend running before anyone can sign in.** See §5.

---

## 2. What the audit found

The original project (`Agro-connect-main/agro/`) was already well structured:
every HTML file was a 20-line shell, `boot-app.js` built the chrome, and each
screen was a `render(main)` module. What it did **not** have:

| Expectation in the brief | What is actually in the ZIP |
| --- | --- |
| A backend to connect to | **None.** No `package.json`, no server code, no `requirements.txt`, no `.env`. |
| MongoDB authentication | **None.** No Mongo, no Mongoose, no driver, no connection string anywhere. |
| Login that fakes success / sets `localStorage.isLoggedIn` | **Did not exist.** `pages-login.js` already POSTed to the real API and stored nothing on failure. |

The frontend expects an external **FastAPI** service at
`http://localhost:8000/api/v1` (see the original README §3). That service is not
part of the repository.

### The real cause of the bypass

It was three things, none of them in the login form:

1. **`boot-app.js` never called a guard at all.** Loading
   `/admin/dashboard.html` built the admin shell and rendered the admin module.
   Nothing checked anything.
2. **`auth.js`'s `requireRole(role, { enforce = false })` was a no-op by
   default** — even where it had been called, it returned `true` and moved on.
3. **The access token was in memory only, with no restore path.** Any refresh
   lost the session, so enforcing the guard would have logged everyone out on
   every reload. The guard was disabled to keep the UI reviewable, and the hole
   was never closed.
4. Two console screens had public duplicates
   (`/pages/demand-forecasting.html`), giving anonymous users a second door in.

---

## 3. How access control works now

```
src/services/session.js      the one session store — token in memory, never persisted
src/context/AuthContext.jsx  status: initialising | authenticated | anonymous
src/routes/ProtectedRoute.jsx  the single gate
src/routes/manifest.js       every route declared once, with its role
```

Three rules make the bypass unreachable:

1. **The token is never persisted.** No `localStorage`, no `sessionStorage`, no
   cookie the JS can read. There is no client-side flag to flip in devtools.
2. **Nothing in browser storage is ever treated as proof of authentication.** On
   a hard refresh the app calls `POST /auth/refresh` (httpOnly refresh cookie),
   then `GET /auth/me`. If either fails, the user is anonymous. Full stop.
3. **The guard is a parent route, not a check inside a page.** An anonymous
   request for `/admin/dashboard` is redirected *before the admin module is
   imported* — typing the URL and clicking a link hit exactly the same gate.

The `initialising` state renders a full-screen loader, so no dashboard can flash
on screen before the session answer arrives.

Roles come from the profile the backend returns, never from the signup form. The
role radio on `/register` is a *request*; a hand-edited form cannot mint an
admin, because `ProtectedRoute` reads `user.role` from `/auth/me`.

### Route zones

| Zone | Routes | Guard |
| --- | --- | --- |
| Public | `/`, `/marketplace`, `/crop-details`, `/farmers`, `/farmer-profile`, `/ai-crop-doctor`, `/about`, `/faq`, `/contact` | none |
| Public-only | `/login`, `/register`, `/forgot-password`, `/reset-password` | signed-in users bounce to their console |
| Protected | `/farmer/*` (14), `/buyer/*` (13), `/expert/*` (4), `/admin/*` (14) | `<ProtectedRoute allowedRoles={[role]}>` |
| Errors | `/403`, `*` → 404 | — |

`/dashboard` forwards each signed-in user to their own console.

---

## 4. Project structure

```
src/
├── main.jsx                 entry — imports main.css (which @imports the rest)
├── App.jsx                  BrowserRouter > AuthProvider > AppRoutes
├── config/navigation.js     sidebar / navbar / bottom-nav data (React paths)
├── context/AuthContext.jsx  centralised auth state
├── hooks/useAuth.js
├── routes/
│   ├── manifest.js          every route, once
│   ├── AppRoutes.jsx        the route table
│   ├── ProtectedRoute.jsx   auth + role gate
│   ├── PublicOnlyRoute.jsx
│   └── RoleHome.jsx
├── layouts/                 PublicLayout · AuthLayout · ConsoleLayout
├── components/              Navbar Footer Sidebar Topbar BottomNav Brand Icon
│                            SkipLink ScrollToTop FullPageLoader LegacyPage
├── pages/
│   ├── auth/Login.jsx       rewritten in React
│   ├── auth/Register.jsx    rewritten in React
│   ├── Forbidden.jsx        403
│   └── NotFound.jsx         404
├── services/
│   ├── session.js           the session store
│   └── api.js               re-export of the HTTP gateway
├── styles/                  the 8 original stylesheets, unmodified
│                            + react-adjustments.css (the only new one)
└── legacy/                  the ported screen modules and service layer
    ├── js/*.js              api, utils, validation, charts, crops, orders,
    │                        marketplace, messaging, weather, route-optimizer …
    └── js/pages/*.js        56 screen modules
```

### About `src/legacy/`

These are the original modules, kept deliberately. They are plain ES modules
with no framework coupling — they take a DOM node and talk to the service layer
— so reusing them preserves every screen's behaviour exactly, which is what the
brief asked for. Three files were changed:

* `config.js` — now reads Vite env vars; `BASE_PATH` is `""`.
* `auth.js` — now a thin re-export of `services/session.js`, so legacy code and
  React share one session. `requireRole()` was deleted; the router guards now.
* `pages-login.js`, `pages-register.js`, `pages-demand-forecasting.js` —
  **deleted**, replaced by the React pages and a redirect, so there is no second
  copy of the authentication logic.

`<LegacyPage>` mounts these modules into a React-owned `<main>`, re-renders on
route change, and intercepts internal anchor clicks so `href="/farmer/orders.html"`
navigates through the router with no page reload (see `utils/legacyHref.js`).
Every one of them sits behind `<ProtectedRoute>` in the route table.

---

## 5. Connecting a backend

`.env.local`:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_USE_DEMO_DATA=false
```

Only `VITE_*` variables reach the browser. Database URIs and JWT secrets must
never be added here — they belong on the server.

The frontend expects:

| Endpoint | Returns |
| --- | --- |
| `POST /auth/login` | `{ access_token, user: { id, name, role, … } }` |
| `POST /auth/register` | 201; `409` on duplicate; `422` with field errors |
| `POST /auth/refresh` | `{ access_token, user? }` from an **httpOnly** refresh cookie |
| `GET /auth/me` | the current `user` |
| `POST /auth/logout` | revokes the refresh cookie |

`role` must be one of `farmer` · `buyer` · `expert` · `admin`.

Server-side requirements for this design to hold:

* Set the refresh token as `HttpOnly; Secure; SameSite=Lax`.
* Enable CORS with `allow_credentials=True` for the frontend origin.
* **Re-check the role on every protected endpoint.** The route guards here stop
  a user from *seeing* the wrong console; only the server can stop them from
  *fetching* the wrong data.

---

## 6. Test script

| # | Steps | Expected |
| --- | --- | --- |
| 1 | Fresh session → `/farmer/dashboard` | loader, then `/login` |
| 2 | Fresh session → `/admin/dashboard` | loader, then `/login` |
| 3 | Sign in as farmer | `/farmer/dashboard` |
| 4 | As farmer → type `/admin/dashboard` | `/403`; admin never renders |
| 5 | Sign out from the sidebar | back to `/login` |
| 6 | After sign-out → `/farmer/dashboard` | `/login` |
| 7 | Register a new account | account created; sent to `/login`; no console access until signed in |
| 8 | Signed in, press browser Back to `/login` | bounced to the console |
| 9 | Refresh while signed in | stays signed in (needs the refresh cookie) |
| 10 | Refresh while signed out | stays at `/login` |
| 11 | Wrong password | inline "Those sign-in details weren't recognised." |
| 12 | Stop the backend, then sign in | inline "We couldn't reach the Agro Connect server." |
| 13 | Any unknown URL | 404 page |

Tests 3–12 need a running backend.

---

## 7. Security notes from the audit

Fixed:

* Authentication bypass on every console route (§2).
* Public duplicates of console screens.
* Role trusted from the signup form → now read from the backend profile.
* Token persistence → never written to storage.
* A `401` from any request now ends the session immediately.
* Hardcoded API URL → `VITE_API_BASE_URL`.

Preserved from the original (do not weaken):

* No secret ever in frontend code.
* AI, price-prediction and payment screens never fall back to demo values.
* The CSP, `X-Frame-Options` and other headers in the old `vercel.json` should be
  carried over to the new deployment. `script-src 'self'` still holds; no
  external scripts were added.

Still the server's job:

* Role checks on every endpoint, rate limiting on `/auth/*`, and the httpOnly
  cookie flags above.
