# Campus Marketplace

A full-stack web app where students buy and sell items within their campus community. List an item, browse and search what others have posted, and manage your own listings.

**Live app:** <your-vercel-url>
**Video walkthrough:** <your-video-link>

## Features

- Sign up, log in and log out (JWT in an httpOnly cookie)
- Create a listing with name, description, price, category and image
- Browse listings with search, category and price filters, sorting and pagination
- Filters are stored in the URL, so a filtered view can be shared and works with the back button
- Listing detail page with seller info and pickup location map
- Edit, delete and mark your own listings as sold (or available again)
- "My listings" page to manage everything you've posted
- Sold items are clearly marked (SOLD badge, greyed-out card), and hidden from browse unless "Show sold" is on
- Loading skeletons, empty states and error states with retry
- Input validation on both the client and the server
- **Bonus:** location-based listings (pickup location search and map)
- **Bonus:** favourites / wishlist with optimistic updates

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React, Vite, React Router, plain CSS |
| Backend | Node.js, Express 5 |
| Database | Neon (serverless Postgres), `pg` with plain SQL (no ORM) |
| Auth | `bcryptjs` and `jsonwebtoken`, httpOnly cookie |
| Image storage | Cloudinary (direct browser upload, unsigned preset) |
| External API | OpenStreetMap Nominatim (geocoding) and Leaflet map |
| Deployment | Vercel (static client and Express as a serverless function) |

## Project structure

```
campus-marketplace/
  api/index.js            Vercel serverless entry (exports the Express app)
  server/
    app.js                Builds and exports the Express app
    dev.js                Local entry, calls app.listen()
    db.js                 pg Pool (max 2 connections)
    schema.sql            users, listings, favorites
    migrate.js            Applies schema.sql
    validate.js           Server-side validators
    middleware/auth.js    JWT helpers and requireAuth
    routes/               auth.js, listings.js, geocode.js, favorites.js
  client/
    src/
      api.js              fetch wrapper and shared constants
      AuthContext.jsx     Logged-in user state
      FavoritesContext.jsx
      pages/              Home, ListingDetail, NewListing, EditListing,
                          MyListings, Favorites, Login, Signup
      components/         Navbar, ListingCard, ListingForm, ListingActions,
                          LocationPicker, ListingMap, FavoriteButton,
                          ProtectedRoute, States
  vercel.json
```

## Setup

**Prerequisites:** Node 20 or newer, a free [Neon](https://neon.tech) project and a free [Cloudinary](https://cloudinary.com) account.

1. Clone the repo and install dependencies:
```bash
   npm install
   npm --prefix client install
```
2. Create `.env` in the project root:
```
   DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=a-long-random-string
```
   Use Neon's **pooled** connection string (the host contains `-pooler`).
3. Create `client/.env`:
```
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_PRESET=your_unsigned_upload_preset
```
   The preset must be set to **Unsigned** in Cloudinary (Settings, Upload, Upload presets).
4. Create the database tables:
```bash
   npm run migrate
```
5. Start the app in two terminals:
```bash
   npm run dev:server    # API on http://localhost:4000
   npm run dev:client    # App on http://localhost:5173
```
   Vite proxies `/api` to the Express server, so there is no CORS setup.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | server | Neon pooled connection string |
| `JWT_SECRET` | server | Secret used to sign login tokens |
| `NODE_ENV` | server | Set to `production` on Vercel (makes the cookie `secure`) |
| `VITE_CLOUDINARY_CLOUD_NAME` | client | Cloudinary cloud name |
| `VITE_CLOUDINARY_PRESET` | client | Unsigned upload preset name |

## Database schema

- `users` (id, name, email unique, password_hash, created_at)
- `listings` (id, seller_id, title, description, price, category, image_url, location_name, lat, lng, is_sold, created_at, updated_at). Price has a `CHECK (price > 0)`.
- `favorites` (user_id, listing_id), composite primary key

Deleting a user deletes their listings, and deleting a listing removes it from everyone's wishlist (`ON DELETE CASCADE`).

## API

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | none | Create account and log in |
| POST | `/api/auth/login` | none | Log in |
| POST | `/api/auth/logout` | none | Clear the session cookie |
| GET | `/api/auth/me` | user | Current user |
| GET | `/api/listings` | none | Browse. Query: `q`, `category`, `minPrice`, `maxPrice`, `sort`, `showSold`, `page` |
| GET | `/api/listings/mine` | user | Listings created by the current user |
| GET | `/api/listings/:id` | none | Listing detail |
| POST | `/api/listings` | user | Create a listing |
| PUT | `/api/listings/:id` | owner | Edit a listing |
| PATCH | `/api/listings/:id/sold` | owner | Mark sold or available |
| DELETE | `/api/listings/:id` | owner | Delete a listing |
| GET | `/api/geocode?q=` | none | Nominatim proxy for place search |
| GET | `/api/favorites` | user | Wishlist listings |
| GET | `/api/favorites/ids` | user | IDs of favourited listings |
| PUT / DELETE | `/api/favorites/:listingId` | user | Add or remove a favourite |

Errors return JSON as `{ "error": "message" }`. Status codes used: 400 (validation), 401 (not logged in), 403 (not the owner), 404 (not found), 409 (email already registered).

## Technical decisions

- **Authorization is enforced on the server.** Edit, delete and mark-sold go through an `ownListing` middleware that compares `seller_id` to the logged-in user and returns 403 otherwise. Hiding buttons in the UI is only a convenience.
- **JWT in an httpOnly cookie** instead of localStorage, so scripts in the page can't read the token. The API and client share one origin, so no CORS configuration is needed.
- **Plain SQL with `pg`** and parameterised queries (`$1, $2...`). This keeps the data layer easy to read and avoids SQL injection.
- **Small connection pool (`max: 2`) and Neon's pooled URL**, because every serverless instance on Vercel opens its own connections.
- **Images upload straight from the browser to Cloudinary**, and only the resulting URL is sent to the API. Serverless functions have no persistent disk and a ~4.5 MB request body limit, so this avoids both problems.
- **Nominatim is called through our own `/api/geocode` route.** The server sends the `User-Agent` header Nominatim requires, caches results, and the client debounces typing (500 ms) to respect the public rate limit.
- **Filters live in the URL** (`?q=bike&category=Cycles&page=2`), which makes views shareable and keeps the back button working.
- **Validation happens twice:** in the forms for quick feedback and in `server/validate.js` as the source of truth.
- **Express app is separated from `listen()`** (`app.js` vs `dev.js`) so the same app runs locally and as a Vercel serverless function.

## Deployment (Vercel)

1. Push the repo to GitHub and import it in Vercel (root directory is the repo root).
2. Add the environment variables above in **Project, Settings, Environment Variables**.
3. Deploy. `vercel.json` builds the client, serves `client/dist`, and rewrites `/api/*` to the Express function and all other routes to `index.html` so React Router works.

## Challenges and how I solved them

- **Serverless database connections:** used Neon's pooled connection string and a pool of 2.
- **Upload size limits on Vercel:** moved image upload to the browser, sending only the URL to the API.
- **Nominatim rate limits:** proxy route with a User-Agent, caching and client-side debounce.
- **Keeping the UI in sync after changes:** mutations update local state immediately (sold, delete, favourite toggle with rollback), and pages refetch from the API when opened.

## Possible improvements

Buyer-seller chat, real-time updates and push notifications.