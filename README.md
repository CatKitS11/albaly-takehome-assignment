# Albaly Dashboard

A responsive business insights dashboard built with Next.js, TypeScript, and Tailwind CSS. This project demonstrates a full-stack dashboard application with authentication, protected routes, and real-time analytics computed from database aggregations.

## Features

- 🔐 **Authentication**: Secure JWT-based session management with httpOnly cookies
- 📊 **Overview Dashboard**: KPI cards, activity feed, and monthly performance charts
- 📈 **Insights Page**: Product comparisons, customer drop-off analysis, regional performance, and conversion funnel
- 🎨 **Responsive Design**: Mobile and desktop optimized with Tailwind CSS
- 🗄️ **Real Database**: All metrics computed from persisted PostgreSQL records
- 🔒 **Protected Routes**: Middleware-based route protection
- ✅ **Type Safety**: Full TypeScript coverage with Zod validation

## Demo Seed Credentials

Use these credentials after running the seed:

- **Admin**: `admin@albaly.com` / `admin0001`
- **Viewer**: `viewer@albaly.com` / `viewer0001`

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL (running locally or remote)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/CatKitS11/albaly-takehome-assignment.git
cd albaly-takehome-assignment
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in the required variables:

```bash
cp .env.example .env
```

Required environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/albaly_db
SESSION_SECRET=your-secret-here-change-in-production
NEXT_PUBLIC_APP_URL=your-app-url
```

**Important**: 
- Replace `DATABASE_URL` with your PostgreSQL connection string
- Generate a strong random string for `SESSION_SECRET` (e.g., `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_URL` is optional for local development

### 4. Database Setup

1. Ensure PostgreSQL is running locally or have access to a remote database
2. Run migrations to create database schema:

```bash
npx prisma migrate dev
```

3. Seed the database with demo data:

```bash
npm run seed
```

The seed script will create:
- 2 users (admin and viewer)
- 387 customers across 3 regions (NA, EU, APAC)
- 10 products
- 1,245+ sales records across multiple months
- Inventory snapshots
- 4 weeks of funnel data
- Activity logs

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Project Structure

```
albaly-takehome-assignment/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── insights/       # Insights page
│   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   └── page.tsx        # Overview page
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── insights/       # Insights data endpoint
│   │   ├── me/             # Current user endpoint
│   │   └── overview/       # Overview data endpoint
│   ├── login/              # Login page
│   ├── middleware.ts       # Route protection middleware
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── app-sidebar.tsx     # Sidebar navigation
│   ├── chart-area-interactive.tsx
│   ├── recent-activity.tsx
│   └── section-cards.tsx
├── hooks/                  # Custom React hooks
│   ├── use-insights.ts
│   └── use-overview.ts
├── lib/                    # Utilities and helpers
│   ├── prisma.ts          # Prisma client instance
│   ├── queries.ts          # Database queries
│   ├── session.ts          # Session management
│   ├── types.ts            # TypeScript types and Zod schemas
│   └── utils.ts            # Utility functions
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma      # Prisma schema
│   ├── migrations/        # Database migrations
│   └── seed.ts            # Seed script
└── public/                 # Static assets
```

## Architecture Notes

### Tech Stack

- **Framework**: Next.js 16.1.3 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM 7.2.0
- **Authentication**: Custom JWT-based session with `jose` library
- **Validation**: Zod 4.3.5
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts 2.15.4

### Authentication Flow

1. User submits login credentials via `/api/auth/login`
2. Server validates credentials against database
3. On success, creates a database session record
4. Encrypts session data (userId, role, sessionId) into JWT
5. Sets httpOnly cookie with encrypted JWT
6. Middleware verifies session on protected routes
7. Session expires after 3 days or on logout

### Data Flow

- **No Hardcoded Data**: All metrics are computed from database records
- **API Routes**: All dashboard data fetched from `/app/api/*` routes
- **Type Safety**: API responses validated with Zod schemas
- **Error Handling**: Consistent error response format across all endpoints

### Database Schema

Key models:
- `User`: Authentication and authorization
- `Customer`: Customer data with regional distribution
- `Product`: Product catalog
- `Sale`: Sales transactions
- `InventorySnapshot`: Inventory status tracking
- `ActivityLog`: User activity feed
- `FunnelWeekly`: Conversion funnel metrics
- `Session`: Active user sessions

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Authenticate user and create session
- `POST /api/auth/logout` - Destroy session
- `GET /api/me` - Get current user info

#### Analytics
- `GET /api/overview` - Returns KPI cards, activity feed, monthly performance
- `GET /api/insights` - Returns top products, drop-off data, regional performance, conversion funnel

All endpoints return typed JSON responses with proper error handling.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with demo data

## Development Notes

### Assumptions

1. **Session Management**: Sessions stored in database for revocation capability
2. **Password Security**: Passwords hashed with bcrypt (10 rounds)
3. **Cookie Security**: httpOnly cookies prevent XSS attacks, secure flag in production
4. **Data Aggregation**: All metrics computed on-demand from database (no pre-aggregation)
5. **Role-Based Access**: Currently all authenticated users see the same data (RBAC can be extended)

### Known Limitations

- No rate limiting on login endpoint (can be added)
- No CSRF protection (can be added for production)
- Session secret should be rotated regularly in production
- Database connection pooling could be optimized for scale

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables for Production

Ensure all environment variables are set:
- `DATABASE_URL` - Production database connection string
- `SESSION_SECRET` - Strong random secret (32+ characters)
- `NEXT_PUBLIC_APP_URL` - Your production domain
- `NODE_ENV=production` - Set automatically by most platforms

### Recommended Platforms

- **Vercel**: Optimized for Next.js (recommended)
- **Railway**: Easy PostgreSQL + Next.js deployment
- **Render**: Full-stack deployment with managed PostgreSQL

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Ensure database exists: `createdb albaly_db`

### Session Issues

- Clear browser cookies if login fails
- Verify `SESSION_SECRET` is set in `.env`
- Check that cookies are enabled in browser

### Build Errors

- Run `npx prisma generate` if Prisma client is missing
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
