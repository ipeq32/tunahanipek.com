This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
git clone https://github.com/ipeq32/tunahanipek.com.git

cd ./home
#or
cd ./blog

----- and -----

npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Docker

The project includes a `docker-compose.yml` file at the repository root. [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/) must be installed.

### Environment Variables

Copy the example file and adjust values if needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | `tuna213` | PostgreSQL password |
| `POSTGRES_PORT` | `5432` | Host port for the database |
| `BLOG_PORT` | `3000` | Host port for the blog app |
| `HOME_PORT` | `3001` | Host port for the home app |
| `NEXTAUTH_URL` | `http://localhost:3000` | NextAuth callback URL |
| `NEXTAUTH_SECRET` | — | NextAuth secret (change in production) |
| `NEXTAUTH_SALT` | — | NextAuth salt (change in production) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Blog API URL exposed to the browser |

### Database Only

Starts only PostgreSQL. Useful when running `home` or `blog` locally on your machine:

```bash
docker compose up -d
```

Connection string:

```
postgresql://postgres:tuna213@localhost:5432/postgres?schema=public
```

For local development, set these in `blog/.env`:

```
POSTGRES_PRISMA_URL=postgresql://postgres:tuna213@localhost:5432/postgres?schema=public
POSTGRES_URL_NON_POOLING=postgresql://postgres:tuna213@localhost:5432/postgres?schema=public
```

### Development (Full Stack)

Starts the database, blog, and home apps with hot reload:

```bash
docker compose --profile dev up
```

| App | URL |
| --- | --- |
| Blog | [http://localhost:3000](http://localhost:3000) |
| Home | [http://localhost:3001](http://localhost:3001) |

On first run, the blog container runs Prisma migrations and seeds the database automatically.

### Production

Builds and runs production images:

```bash
docker compose --profile full up --build
```

| App | URL |
| --- | --- |
| Blog | [http://localhost:3000](http://localhost:3000) |
| Home | [http://localhost:3001](http://localhost:3001) |

The blog container applies the Prisma schema with `db push` on startup.

### Useful Commands

```bash
# Stop all running containers
docker compose down

# Stop containers and remove volumes (deletes database data)
docker compose down -v

# View logs
docker compose logs -f

# View logs for a specific service
docker compose logs -f database
docker compose logs -f blog-dev
```

### Troubleshooting

If Prisma fails with an OpenSSL or schema engine error after changing the Docker setup, remove cached volumes and rebuild:

```bash
docker compose --profile dev down -v
docker compose --profile dev up --build
```

This clears the `node_modules` volumes and reinstalls dependencies inside the OpenSSL-enabled dev image.

## Environment Variables for Blog

### `DATABASE_URL`

The URL of the database to use. Defaults to `postgresql://postgres:password@localhost:5432/tunahanipek?schema=public`.

## Prisma Commands

### `yarn generate` -> `npx prisma generate && npx prisma db push && yarn seed`

Generate Prisma Client, Push Database and Seed Data.

### `yarn migrate` -> `npx prisma migrate dev --name <name>`

Create Migration File.

### `yarn reset` -> `npx prisma migrate reset --force`

Reset Database.

### `yarn studio` -> `npx prisma studio`

Open Prisma Studio.

### `yarn push` -> `npx prisma db push`

Push Database.

### `yarn seed` -> `npx prisma db seed`

Seed Data.

## Build Commands

### `yarn build` -> `prisma generate && next build`

Generate Prisma Client and Build Next.js.

### `next start`

Start Next.js.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
