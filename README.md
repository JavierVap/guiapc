# GuiaPC

GuiaPC is a Puerto Cabello guide built with Vue 3 and Tailwind CSS. Its API is in `server/` and uses Node.js, Express, Prisma, and MySQL.

## API setup

1. Install a supported Node.js version and start MySQL from XAMPP.
2. Create an empty database named `guiapc` in phpMyAdmin (use `utf8mb4`), then copy `server/.env.example` to `server/.env`. Set `DATABASE_URL` to match your local MySQL account (for a default XAMPP installation, this may be `mysql://root:@localhost:3306/guiapc`). Set a random `JWT_SECRET` of at least 32 characters and the initial administrator email/password. Use a strong password of at least 12 characters. Keep `.env` private and never use the local root account in production.
3. In `server/`, run `npm install`, `npm run db:migrate -- --name init`, and `npm run db:seed`.
4. Start the API with `npm run dev`. The health check is available at `http://localhost:3000/api/health`.
5. In the repository root, run `npm run dev` to start the Vue app.

The Vue development server proxies `/api` requests to `http://localhost:3000`. Start MySQL, the API, and Vue in separate terminals. The API has no demo-data fallback: the public guide shows records saved in MySQL and marked approved.

The migrations create the account, business, and menu tables, plus image attribution fields. The seed creates or promotes the configured administrator and synchronizes its password from `ADMIN_PASSWORD`; run it again after changing that value. It also loads four Puerto Cabello destinations with locally stored photographs from Wikimedia Commons: Fortín Solano, Playa de Patanemo, Isla Larga, and Castillo Libertador. Photo credits and Creative Commons license links are shown on the cards and detail views. Listing details avoid unverified hours, phone numbers, and services. The seed only creates destination records when they do not already exist, so rerunning it will not overwrite later edits.

## API routes

- `POST /api/auth/register` creates a client account. Public registration cannot set a role.
- `POST /api/auth/login` authenticates and returns a bearer token.
- `GET /api/auth/me` returns the authenticated user.
- `GET /api/places` lists approved businesses and their menu items.
- `GET /api/places/:id/reviews` lists approved reviews; authenticated users can submit one review per place for moderation.
- `GET /api/places/mine` lists the authenticated collaborator's submissions (or all submissions for an administrator).
- `POST /api/places` creates a business submission; only collaborators and administrators can use it, and every new submission starts pending.
- `PATCH /api/places/:id` edits a business owned by the collaborator or any business as an administrator. A collaborator's changes require approval again.
- `GET /api/places/pending` lists pending submissions for administrators.
- `PATCH /api/places/:id/moderation` approves or rejects a submission; administrators only.
- `GET /api/admin/users` lists accounts; administrators only.
- `PATCH /api/admin/users/:id/role` assigns or removes collaborator access; administrators only. The public API cannot create administrator accounts.
- `GET /api/events` lists approved future events; collaborators and administrators can propose events, and administrators moderate and feature them.
- `POST /api/events` creates a pending event; `GET /api/events/mine` and `GET /api/events/pending` list owned or pending events.
- `PATCH /api/events/:id` edits an owned event; `PATCH /api/events/:id/moderation` reviews events; `PATCH /api/events/:id/featured` features an event (admin only).
- `GET /api/favorites` lists a signed-in user's saved places; `PUT` and `DELETE /api/favorites/:placeId` add or remove a favorite.
- `POST /api/places/:id/reviews` submits one review per user and place. `GET /api/admin/reviews/pending` and `PATCH /api/admin/reviews/:id/moderation` let administrators moderate reviews.
- `PATCH /api/admin/places/:id/featured` lets administrators feature or unfeature a place.

The public guide includes Google Maps directions, shareable place/event links, upcoming approved events, featured places, optional additional photo URLs and visitor information, user favorites, and moderated ratings/reviews. Only confirmed details should be entered, and only upload/link to photos you own or have permission to publish. Photo attribution must be retained for the bundled Commons photos. After pulling schema changes, apply them from `server/` using `npm run db:migrate -- --name <short-description>`, then restart the API and Vue development servers.

Send protected requests with `Authorization: Bearer <token>`. Collaborator accounts are assigned by an administrator; do not add public role selection to registration.
