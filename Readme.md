# Tanuja's BatterHouse (v2)

Online ordering platform for Tanuja's BatterHouse — authentic South Indian food delivery in Panipat, Haryana.

> **v2** — Full rewrite from Django to Next.js. Warm/earthy UI redesign, security hardening, route group architecture, and streamlined admin workflow.

## Features

- **Customer ordering** — Browse menu, build cart, place orders with PhonePe payment
- **Shop management** — Admin controls for opening/closing shop and order gate
- **Order pipeline** — Kitchen view, sorting bay, and packaging bay for order fulfillment
- **Delivery areas** — New Township, Old Township, Khora Kheri

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js (credentials provider, JWT)
- **Payments**: PhonePe API
- **Styling**: Tailwind CSS 4 with CSS custom properties

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, PhonePe keys, and admin credentials

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Customer pages (with Navbar + Footer)
│   │   ├── page.tsx       # Home — order availability status
│   │   ├── menu/          # Product catalog
│   │   ├── order/         # Cart → confirm → payment success
│   │   ├── about/         # About us
│   │   ├── contact/       # Contact info
│   │   ├── closed/        # Shop closed notice
│   │   └── policies/      # Terms, privacy, refund, shipping
│   ├── (admin)/           # Admin pages (with AdminNav, no public nav)
│   │   └── admin/
│   │       ├── login/     # Admin login
│   │       ├── shop/      # Open/close shop and gate
│   │       ├── orders/    # View paid orders
│   │       ├── kitchen/   # Batter requirements
│   │       ├── sorting/   # Item summary by category
│   │       └── packaging/ # Per-order packaging cards
│   └── api/               # API routes
├── components/
│   ├── layout/            # Navbar, Footer
│   ├── admin/             # AdminNav, DateFilter, PrintButton
│   └── ui/                # Button
└── lib/                   # Auth, Prisma, PhonePe, validators, utils
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth JWT secret |
| `NEXTAUTH_URL` | App base URL |
| `NEXT_PUBLIC_BASE_URL` | Public base URL for callbacks |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `PHONEPE_MERCHANT_ID` | PhonePe merchant ID |
| `PHONEPE_SECRET_KEY` | PhonePe salt key |
| `PHONEPE_SALT_INDEX` | PhonePe salt index |

## Scripts

```bash
npm run dev    # Start development server
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Run ESLint
```
