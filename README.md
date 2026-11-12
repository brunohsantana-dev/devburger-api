# DevBurger API

[English](README.md) | [Português](README.pt-BR.md)

**Building a burger app from the inside out.**

A good-looking menu is only part of the job. Behind it, there's a system handling users, products, images, and orders.

That's what I'm building here.

DevBurger is a Full Stack project I'm developing during the DevClub program. This repository contains the backend, built with Node.js, Express, PostgreSQL, and MongoDB.

**Current progress:** both backend course modules are complete. The Full Stack project is still in development. Next comes the React frontend.

## What works so far

Users can register, sign in, browse products and categories, and place orders. Send `Authorization: Bearer <token>` to access protected routes. Public registration always creates a regular user, even if `admin: true` is supplied. There is no public route to grant administrative privileges.

Only administrators can create or update products and categories or change order status. Customers see their own orders; administrators see all orders. Order prices, names, and categories come from the server's catalog, and the customer identity comes from authentication. Empty orders, repeated product IDs, missing products, and quantities that are not positive integers are rejected.

Categories group menu items. The `offer` flag marks a product as an offer; it does not calculate discounts. Product and category updates preserve the current image when no new file is sent and return a success message. New records require an image. Uploads accept declared JPEG, PNG, or WebP types up to 5 MB, with generated filenames. This checks the declared MIME type, not the file contents.

## Tech stack

| Area | Technologies |
| --- | --- |
| Backend | Node.js 24+, Express 5 |
| Users and catalog | PostgreSQL, Sequelize, Sequelize CLI |
| Orders | MongoDB, Mongoose |
| Validation & security | Yup, bcrypt, JWT (jsonwebtoken) |
| File uploads | Multer, UUID |
| Development tools | Docker for local databases, pnpm, Biome |

**Request flow:**

`Request → Route → Authentication/authorization → Controller → Model → Database`

PostgreSQL stores users, products, categories, and product-category links. MongoDB stores each order with a snapshot of its items and prices at checkout, customer identity, status, and timestamps. Later catalog changes do not rewrite an existing order. Payments are not implemented.

## Structure

```text
src/
  app/controllers/   # Registration, sessions, catalog and orders
  app/middlewares/   # JWT authentication and admin authorization
  app/models/        # Sequelize: User, Product and Category
  app/schemas/       # Mongoose: Order
  config/            # Database, uploads, static files (.cjs) and JWT
  database/          # Connections and PostgreSQL migrations (.cjs)
  app.js             # Express, CORS and JSON error responses
  routes.js          # Public and protected API routes
  server.js          # Startup on port 3001
tests/               # Focused tests using Node's built-in runner
uploads/             # Local images (contents ignored by Git)
```

Routes direct requests to controllers, which validate input and use Sequelize or Mongoose to read and write data. Authentication identifies the user; the admin middleware restricts catalog changes and order status updates.

## API endpoints

| Method | Route | Description |
| --- | --- | --- |
| POST | `/users` | Public: `name`, `email`, `password` (at least 6 characters); returns `id`, `name`, `email`, `admin: false` |
| POST | `/sessions` | Public: email/password login; returns `message`, `id`, `name`, `email`, `admin`, and a JWT `token` valid for one day |
| POST | `/products` | Admin: multipart/form-data with `name`, integer `price` ≥ 0, existing `category_id`, optional boolean `offer`, and image in `file` |
| PUT | `/products/:id` | Admin: partial update of those fields; a new image is optional; 404 when the product is not found |
| GET | `/products` | Authenticated: product array with image URL and category ID/name |
| POST | `/categories` | Admin: `name` (at least 2 characters) and image in `file`; rejects duplicate names |
| PUT | `/categories/:id` | Admin: name and/or image update; checks existence and duplicate names |
| GET | `/categories` | Authenticated: category array with image URLs |
| POST | `/orders` | Authenticated: creates an order from `products: [{ id, quantity }]`; returns the stored order with `_id` |
| GET | `/orders` | Authenticated: own orders for customers, all orders for administrators |
| PUT | `/orders/:id` | Admin: JSON `{ "status": "preparing" }`; requires a valid MongoDB ID and an existing order |
| GET | `/product-file/:file` | Public: uploaded image |
| GET | `/category-file/:file` | Public: uploaded image |

Creation returns 201, successful listings/updates return 200, invalid input returns 400, missing/invalid authentication returns 401, denied admin access returns 403, and missing update targets return 404. Oversized uploads return 413. Unexpected failures return a generic JSON error without internal database details. Validation errors may contain an `error` array; other errors contain an `error` string. The duplicate-email response uses `message`.

## Running locally

Requirements: Node.js 24 or later, pnpm 12.18.0, PostgreSQL with a database/user already created, and MongoDB. The databases can run in Docker; this repository does not include a Compose file. Keep both services running while using the API.

```sh
pnpm install --frozen-lockfile
```

Copy `.env.example` to `.env`. Fill in `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`. Set `JWT_SECRET` to your own long, random secret. Configure `MONGO_URL` (default: `mongodb://localhost:27017/devburger`) and `FRONTEND_URL` (default: `http://localhost:5173`). Existing environment variables take priority. Environment loading uses native Node.js support in the application and Sequelize CLI. Never publish `.env`.

For a new PostgreSQL database, check the target and apply the migrations:

```sh
pnpm exec sequelize-cli db:migrate:status
pnpm exec sequelize-cli db:migrate
```

For an existing database, review migration status and back up its data before applying changes. The migration that removes the old product `category` column discards its text values; it does not transfer them to `category_id`. Review existing product-category links separately. MongoDB orders use a Mongoose schema and do not use these SQL migrations. The application uses ES Modules; `.cjs` files and `.sequelizerc` use CommonJS.

```sh
pnpm dev       # Development with automatic restart
pnpm start     # Run without watch mode
pnpm lint      # Static analysis
pnpm check     # Analysis, formatting and import organization
node --test    # Focused tests without a database connection
```

The API runs at `http://localhost:3001`. Keep `uploads/` available and writable and preserve its contents alongside database backups. Git ignores local images, dependencies, environment files, logs, and temporary files. Image URLs currently use `localhost:3001`. The server allows CORS for the single origin in `FRONTEND_URL`, including preflight requests and the Authorization header.

## Trying the API

1. Create a test user with `POST /users`, then sign in with `POST /sessions` using the same email and password.
2. Copy the returned `token` into `Authorization: Bearer <token>`. List `/categories` and `/products` to obtain existing IDs.
3. With an existing administrator account, create categories and products using multipart/form-data and the `file` field. Public registration cannot create an administrator.
4. As a customer, send the following JSON to `POST /orders`, replacing `1` with a real product ID. Read `/orders` and check that only this customer's orders appear.
5. As an administrator, list orders and update an order using `PUT /orders/<_id>` with `{ "status": "preparing" }`. Try catalog/status updates as a customer to check the 403 response.

```json
{ "products": [{ "id": 1, "quantity": 2 }] }
```

Product/category updates return `{ "message": "Product updated successfully" }` or `{ "message": "Category updated successfully" }`. Order updates return `{ "message": "status updated" }`; fetch the list again to obtain updated data. Product prices are integers; the existing order schema serializes each item's price as a string. Order status currently accepts a nonblank string, with `order made` as the initial value. The React frontend should account for these contracts.

For safe testing, use a separate development database and fictional users. The checkpoint tests replace database operations and exercise registration privileges, admin login, partial updates, order validation/privacy, route protection, CORS, and JSON errors. The final review also checked connections, migration status, and GET listings against the local databases without changing their data. Real database writes and a complete checkout flow were not tested in that review. There is no build script. `pnpm lint` passes; `pnpm check` still reports pre-existing formatting/import issues in untouched files.

## What's next?

The next course stage is the React frontend: connect login, the menu, and orders to this API.

Before broader use, review admin permission revocation while a one-day JWT remains valid, inspect actual image contents, clean up files left by rejected or replaced uploads, and add database integration coverage. Align order status values with the frontend. Database startup/readiness handling and non-local image URLs also remain future improvements.

---

Built by [Bruno Santana](https://github.com/brunohsantana-dev).

**Two backend modules down. Next comes React.**
