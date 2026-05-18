# Skillence

Marketing site + API for Skillence Nextgen Institute.

- **Live site**: https://skillence-landing-page.vercel.app
- **Frontend**: static HTML/CSS/JS at the repo root
- **Backend**: Express + Prisma, wrapped as a Vercel serverless function at `api/index.ts`
- Both deploy together as a single Vercel project — the API lives at `/api/*` on the same origin as the frontend.

## Repo layout

```
.
├── index.html / about.html / courses.html / scholarship.html   # Static pages
├── favicon/
├── js/
│   ├── skillence-config.js   # Sets API base URL (default: same origin)
│   ├── skillence-api.js      # Thin fetch wrapper → window.SkillenceAPI
│   └── skillence-auth.js     # Sign-in/up modal + nav state → window.SkillenceAuth
├── api/
│   └── index.ts              # Vercel serverless entrypoint — exports the Express app
├── src/
│   ├── index.ts              # Express app (createApp + standalone listen)
│   ├── lib/                  # auth, env, prisma singleton
│   ├── middleware/           # errorHandler, requireAuth, validate
│   ├── routes/               # auth, courses, scholarships, contact, me
│   └── schemas/              # Zod request schemas
├── prisma/
│   ├── schema.prisma         # 6 models (User, Course, Enrollment, ScholarshipApplication, ContactMessage, NewsletterSubscriber)
│   └── seed.ts
├── vercel.json               # Function config + /api/* rewrite
├── render.yaml               # Optional: deploy the standalone Express server to Render instead
└── package.json
```

## Endpoints

All routes are JSON. Auth-protected endpoints require the `skillence_token` cookie (set automatically by `/api/auth/login` and `/api/auth/register`).

| Method | Path | Body / notes |
| --- | --- | --- |
| `POST` | `/api/auth/register` | `{ email, password, name }` — creates user, sets cookie |
| `POST` | `/api/auth/login` | `{ email, password }` |
| `POST` | `/api/auth/logout` | clears cookie |
| `GET`  | `/api/auth/me` | current user (cookie required) |
| `GET`  | `/api/courses` | list all courses |
| `GET`  | `/api/courses/:slug` | single course |
| `POST` | `/api/courses/:slug/enroll` | `{ scholarshipTier? }` (auth required) |
| `POST` | `/api/scholarships/apply` | `{ fullName, email, phone?, courseSlug, tierApplied, motivation }` — works logged-in or anonymous |
| `POST` | `/api/contact` | `{ name, email, subject?, message }` |
| `POST` | `/api/newsletter` | `{ email }` (idempotent) |
| `GET`  | `/api/me/enrollments` | current user's enrollments |
| `GET`  | `/api/me/scholarship-applications` | current user's applications |
| `GET`  | `/api/health` | health check |

## Frontend API usage

Every page loads `skillence-api.js` + `skillence-auth.js`. Call the backend via the helpers:

```js
// Newsletter
await SkillenceAPI.newsletter('user@example.com');

// Auth — usually you let the modal handle this:
SkillenceAuth.openModal({ initialTab: 'register', onSuccess: (u) => console.log(u) });
// …but you can also call the API directly:
await SkillenceAPI.auth.register({ email, password, name });
await SkillenceAPI.auth.login({ email, password });
const { user } = await SkillenceAPI.auth.me();

// Courses
const { courses } = await SkillenceAPI.courses.list();
await SkillenceAPI.courses.enroll('web-development', { scholarshipTier: 'OFF_50' });

// Scholarship
await SkillenceAPI.scholarships.apply({
  fullName, email, courseSlug: 'web-development',
  tierApplied: 'FULL_100', motivation: '...',
});

// Contact
await SkillenceAPI.contact({ name, email, message });
```

Listen for auth state changes:

```js
window.addEventListener('skillence:auth:change', (e) => {
  console.log('user is now', e.detail.user);
});
```

## What the frontend already wires

- **index.html** — no forms; auth widget is in the nav
- **courses.html** — newsletter, "Enroll in This Track" button, "Apply for Scholarship" link → `scholarship.html#apply`
- **scholarship.html** — full scholarship application form (loads course list dynamically)
- **about.html** — contact form

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import the repo into Vercel — it auto-detects the static frontend + `api/index.ts` function.
3. Add a Postgres database from the [Vercel Marketplace](https://vercel.com/marketplace/category/databases) (Neon recommended). Vercel will inject `DATABASE_URL` automatically.
4. Set environment variables in the Vercel dashboard:
   - `JWT_SECRET` — generate with `openssl rand -base64 48`
   - `JWT_EXPIRES_IN` — default `7d`
   - `NODE_ENV` — `production` (Vercel sets this automatically on Production)
5. Run migrations once (locally pointed at the production DB, or via a one-off Vercel deployment hook):
   ```bash
   DATABASE_URL=... npx prisma migrate deploy
   DATABASE_URL=... npm run seed
   ```

## Local development

### Option A: `vercel dev` (recommended — mirrors production)

```bash
npm install
cp .env.example .env       # fill DATABASE_URL + JWT_SECRET
npx prisma migrate dev --name init
npm run seed
npx vercel dev             # serves frontend + API at http://localhost:3000
```

### Option B: standalone Express + static server

```bash
# Terminal 1: API on :4000
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run seed
npm run dev

# Terminal 2: static frontend on :5500
python3 -m http.server 5500
# open http://localhost:5500
```

For Option B, override the API URL in `js/skillence-config.js` (or set `window.SKILLENCE_API_URL = 'http://localhost:4000'` before that script loads), and add `http://localhost:5500` to `CORS_ORIGINS` in `.env`.

## Deploying to Render (alternative)

`render.yaml` is kept as a fallback. It deploys only the standalone Express server (`npm run build` + `npm start`), not the static frontend. If you use this, point `window.SKILLENCE_API_URL` at the Render URL and re-enable CORS.
