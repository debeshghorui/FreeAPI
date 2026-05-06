# FreeAPI Authentication App

Authentication frontend project for **Web Dev Cohort 2026** using React + Vite.

This app implements a complete auth flow with:
- Register user
- Login user
- Logout user
- Get current user
- Success/error messages
- Loading states
- Session-based auth with cookies

## Tech Stack

- React 19
- Vite 8
- Vanilla CSS
- FreeAPI Authentication Module

## API Endpoints Used

- `POST /api/v1/users/register`
- `POST /api/v1/users/login`
- `POST /api/v1/users/logout`
- `GET /api/v1/users/current-user`

In local development, these paths are proxied by Vite to:
- `https://api.freeapi.app`

## Important CORS Note

FreeAPI session endpoints use cookies, and browser credentialed requests can fail if called cross-origin directly.

To avoid this, the project uses a Vite proxy in `vite.config.js`:
- Browser calls `http://localhost:5173/api/...` (same-origin)
- Vite forwards to `https://api.freeapi.app/...`

If you update proxy settings, restart the dev server.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open:

```text
http://localhost:5173
```

## Build & Lint

```bash
npm run lint
npm run build
```

## Auth Flow (Implemented)

1. On load, app checks active session using `GET /users/current-user`.
2. User can register with `email`, `username`, `password`, and `role`.
3. User can login with `username` and `password`.
4. App fetches and displays current user profile details.
5. User can logout to clear active session.

## UI Features

- Login/Register tab switch
- Password show/hide toggle
- Loading states for each async action
- Inline API feedback messages
- Responsive layout for mobile and desktop
