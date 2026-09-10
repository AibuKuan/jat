# Job Tracker App

A full-stack job application tracking dashboard built with Next.js, Drizzle ORM, and Shadcn UI. Keep track of your active job search, update application statuses, and manage them in one clean interface.

## Features

- **Dashboard Overview:** View all submitted, ongoing, and completed applications at a glance.
- **Add Applications:** Record new job listings with company details, job titles, links, and initial status.
- **Inline Status Updates:** Instantly change application statuses (Applied, Interviewing, Offered, Rejected) from the table.
- **Edit & Delete:** Update application details or remove outdated records via built-in dialogs.
- **Database Integration:** Persistent data management using Drizzle ORM.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Database / ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) / Base UI

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory and add your database connection string:

```env
DATABASE_URL="your-database-connection-string"
```

### 3. Run Database Migrations

Ensure your database schema is up to date with Drizzle:

```bash
npx drizzle-kit push
```

### 4. Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to launch the dashboard.

## API Routes

The core logic is handled via `app/api/applications/route.ts`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/applications` | Fetch all job applications |
| `POST` | `/api/applications` | Create a new job application |
| `PUT` | `/api/applications` | Update an existing application's details |
| `PATCH` | `/api/applications` | Quick-update an application's status |
| `DELETE` | `/api/applications?id={id}` | Delete an application by ID |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and App Router syntax.
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview) - Explore Drizzle schema setup and queries.
- [Shadcn UI Documentation](https://ui.shadcn.com/) - Reusable components built with Radix / Base UI and Tailwind CSS.