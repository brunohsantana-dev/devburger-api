# DevBurger API

[English](README.md) | [Português](README.pt-BR.md)

**Building a burger app from the inside out.**

A good-looking menu is only part of the job. Behind it, there's a system handling users, products, images, and data.

That's what I'm building here.

DevBurger is a Full Stack project I'm developing during the DevClub program. This repository contains the backend, built with Node.js, Express, and PostgreSQL.

**Current progress:** Backend Node.js — Part 1 completed. Work in progress.

## What works so far

- **User registration** — Input validation, unique email checks, and password hashing with bcrypt.
- **Login** — Credential verification against stored password hashes.
- **Product management** — Create and list products with names, prices, categories, and images.
- **Image uploads** — Receive product images with Multer, store them locally, and serve them through URLs.
- **Database** — PostgreSQL with Sequelize models and migrations.

The API follows an MVC-inspired structure, separating routes, controllers, and data models.

## Tech stack

| Area | Technologies |
| --- | --- |
| Backend | Node.js, Express |
| Database | PostgreSQL, Sequelize |
| Validation & security | Yup, bcrypt |
| File uploads | Multer |
| Development tools | Docker, pnpm, Biome |

**Request flow:**

`Request → Route → Controller → Model → PostgreSQL`

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/users` | Register a user |
| POST | `/session` | Validate login credentials |
| POST | `/products` | Create a product with an image |
| GET | `/products` | List registered products |
| GET | `/product-file/:filename` | Access uploaded images |

The endpoints have been tested locally with Insomnia, with database records inspected using Beekeeper Studio.

## Running locally

**Requirements:** Node.js 24+, pnpm, and PostgreSQL.

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Copy `.env.example` to `.env` and configure your PostgreSQL credentials.

Check and apply pending database migrations:

```bash
pnpm exec sequelize-cli db:migrate:status
pnpm exec sequelize-cli db:migrate
```

Start the development server:

```bash
pnpm dev
```

The API runs at `http://localhost:3001`.

Uploaded images are stored in the local `uploads/` directory.

## What's next?

The first backend milestone is complete, but there's still plenty to build.

JWT authentication, protected routes, proper role permissions, and stronger upload restrictions are not implemented yet. The API is currently intended for local development, not production.

I'll keep expanding the project as I progress through the Full Stack course.

---

Built by [Bruno Santana](https://github.com/brunohsantana-dev).

**One module down. More to come.**
