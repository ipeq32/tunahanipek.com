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

## Environment Variables for Blog

### `DATABASE_URL`

The URL of the database to use. Defaults to `postgresql://postgres:password@localhost:5432/ozgur-calisan?schema=public`.

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