# DevBurger API

[English](README.md) | [Português](README.pt-BR.md)

**Building a burger app from the inside out.**

A good-looking menu is only part of the job. Behind it, there's a system handling users, products, images, and data.

That's what I'm building here.

DevBurger is a Full Stack project I'm developing during the DevClub program. This repository contains the backend, built with Node.js, Express, and PostgreSQL.

**Current progress:** JWT, products, categories, offers and admin permissions implemented. Work in progress.

## What works so far

Send `Authorization: Bearer <token>` to access product and category routes. Logged-in users can browse the menu; only administrators can create or update it. Public registration ignores any supplied `admin` value. Existing administrators retain their access; there is no public route to grant administrative privileges.

Categories group menu items, while the `offer` flag identifies products marked as offers. It does not calculate discounts or change prices automatically. Product and category updates keep the current image when no new file is sent and return a success message.

## Tech stack

| Area | Technologies |
| --- | --- |
| Backend | Node.js 24+, Express 5 |
| Database | PostgreSQL, Sequelize, Sequelize CLI |
| Validation & security | Yup, bcrypt, JWT (jsonwebtoken) |
| File uploads | Multer, UUID |
| Development tools | Docker, pnpm, Biome |

**Request flow:**

`Request → Route → Controller → Model → PostgreSQL`

## Structure

```text
src/
  app/controllers/   # Registration, sessions, products and categories
  app/models/        # User, Product and Category models
  config/            # Database, uploads, static files (.cjs) and JWT
  database/          # Connection and migrations (.cjs)
  middlewares/       # JWT authentication and admin authorization
  app.js             # Express configuration
  routes.js          # API routes
  server.js          # Startup on port 3001
tests/               # Focused controller regression tests
uploads/             # Local images (contents ignored by Git)
```

Routes connect requests to controllers, which validate input and use Sequelize models to read and write PostgreSQL data. Products belong to categories, keeping the menu organized without repeating category names in each product.

## API endpoints

| Method | Route | Description |
| --- | --- | --- |
| POST | `/users` | Public registration with name, email and password; bcrypt password hash; new users always receive `admin: false` |
| POST | `/session` | Email and password login; returns basic user data and a JWT valid for one day |
| POST | `/products` | Admin only: multipart/form-data with `name`, `price`, `category_id`, optional `offer` and an image in `file` |
| PUT | `/products/:id` | Admin only: updates product fields; sending a new image is optional |
| GET | `/products` | Authenticated product listing with image URL and category ID and name |
| POST | `/categories` | Admin only: creates a category with `name` and an image in `file`; checks for duplicate names |
| PUT | `/categories/:id` | Admin only: updates the name and/or image; checks that the category exists and the name is not already used by another category |
| GET | `/categories` | Authenticated category listing with image URLs |
| GET | `/product-file/:file` | Public access to images in `uploads/` |
| GET | `/category-file/:file` | Public access to images in `uploads/` |

The endpoints have been tested locally with Insomnia, with database records inspected using Beekeeper Studio.

The focused tests cover public registration privileges, login for an existing administrator, and update responses with and without images. They replace database operations and do not validate real PostgreSQL integration. Orders, payments and MongoDB are not implemented at this stage.

## Running locally

Requirements: Node.js 24 or later, pnpm 12.18.0 and an accessible PostgreSQL instance with a database and user already created.

```sh
pnpm install --frozen-lockfile
```

Copy `.env.example` to `.env` and fill in `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_NAME` with your PostgreSQL settings. Set `JWT_SECRET` to a long, random secret of your own. Do not publish `.env`. Existing environment variables take priority. Environment loading uses native Node.js support in the application and Sequelize CLI.

For a new database, apply the migrations after checking the target database:

```sh
pnpm exec sequelize-cli db:migrate:status
pnpm exec sequelize-cli db:migrate
```

For an existing database, review migration status and back up its data before applying changes. The migration that removes the old product `category` column discards its text values; it does not transfer them to `category_id`. Review existing product-category links separately. The application uses ES Modules, while `.cjs` files and `.sequelizerc` use CommonJS.

```sh
pnpm dev       # Development with automatic restart
pnpm start     # Run without watch mode
pnpm lint      # Static analysis
pnpm check     # Analysis, formatting and import organization
node --test    # Focused tests without a database connection
```

The API runs at `http://localhost:3001`. Keep the `uploads/` folder available and writable. Uploaded images stay in the local environment; preserve them alongside database data. Image URLs at this stage use `localhost:3001`.

## What's next?

Work in progress for local study. Items for review at the end of the backend module:

- Validate missing files and restrict upload types and sizes.
- Review product ID/category validation and the response when updating a product that does not exist.
- Review category name normalization and duplicate handling during simultaneous requests.
- Review admin permission changes while a JWT remains valid.
- Add database integration coverage and align formatting and imports with Biome (`pnpm check` currently reports style issues).

---

Built by [Bruno Santana](https://github.com/brunohsantana-dev).

**One module down. More to come.**
