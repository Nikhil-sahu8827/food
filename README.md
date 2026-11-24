# Royal Spice Kitchen – Complete Food Ordering Website

A complete, production-ready, highly optimized food ordering platform built for single-restaurant operations.

Featuring real-time order alerts with audio chimes, **WhatsApp delivery location sharing**, **Cash on Delivery (COD) only** checkout, **30-day active database retention** optimized for the Supabase 500 MB Free Tier, and an **automatic restaurant open/close system** supporting midnight-crossing schedules.

---

## Architecture & Technology Stack

```
                   +----------------------------------+
                   |       React 18 + Vite (SPA)      |
                   |   Tailwind CSS + React Router    |
                   |      Axios + SockJS + Stomp      |
                   +-----------------+----------------+
                                     |
                                REST | WebSocket (/ws)
                                     v
                   +-----------------+----------------+
                   |    Spring Boot 3.3.5 Backend     |
                   |       Java 21 LTS / Maven        |
                   |   Spring Security + JWT + BCrypt |
                   |     Spring Data JPA / Hibernate  |
                   |   Spring Scheduler (Daily 3 AM)  |
                   +-----------------+----------------+
                                     |
                        HikariCP Pool (Max: 10)
                                     v
                   +-----------------+----------------+
                   |  PostgreSQL / Supabase Database  |
                   |     Flyway Schema Migrations     |
                   |     30-Day Partitioned Retention |
                   +----------------------------------+
```

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios with JWT Bearer Interceptor
- **Real-Time**: SockJS & STOMP WebSocket Client with automatic reconnection and fallback polling
- **Audio Chime**: Web Audio API melodic synthesizer (works on all browsers without external audio downloads)
- **Notifications**: React Hot Toast

### Backend
- **Framework**: Spring Boot 3.3.5
- **Java**: Java 21 LTS
- **Security**: Spring Security 6 with stateless JWT authentication & BCrypt password hashing
- **Persistence**: Spring Data JPA & Hibernate with connection pooling (HikariCP)
- **Migrations**: Flyway Migration (`V1__init_schema.sql`, `V2__seed_initial_data.sql`)
- **Real-Time Engine**: Spring WebSocket Message Broker (`/topic/admin/orders`, `/topic/orders/{orderNumber}`)
- **Scheduled Tasks**: Spring Scheduler for automated daily order retention and table archival

### Database & Storage
- **Operational Database**: PostgreSQL / Supabase PostgreSQL
- **Storage Allowance**: Optimized for Supabase Free Tier (500 MB Limit)
- **Image Storage**: Supabase Storage or local multipart file storage (JPEG, PNG, WebP <= 2 MB)

---

## Key Features & Business Workflows

### 1. User Roles & Authentication
- Strictly two roles: `ADMIN` and `CUSTOMER`.
- **Customer Registration**: Validates full name, email uniqueness, mobile number format, and matching passwords. Passwords hashed with BCrypt.
- **Admin Setup**: Initial admin seeded via Flyway and Spring `DataInitializer` (`admin@restaurant.com` / `AdminPassword@123`). Public registration is strictly restricted from assigning the `ADMIN` role.

### 2. WhatsApp Delivery Location Sharing Flow
1. Customer places order; status starts at `PENDING`.
2. Admin reviews order in the dashboard and clicks **Accept**.
3. Status changes to `ACCEPTED` and instantly notifies the customer via WebSocket.
4. The **Share Current Location** button illuminates on the customer's confirmation and tracking screens.
5. Customer clicks the button; browser requests HTML5 Geolocation permission (`navigator.geolocation`).
6. Latitude and longitude coordinates are saved to the backend order record.
7. WhatsApp opens via click-to-chat with a prefilled message:
   ```text
   Hello Restaurant,

   My order has been accepted.

   Order ID: ORD-20261119-1001

   Customer Name: Rahul Sharma

   My Delivery Location:
   https://www.google.com/maps?q=12.9716,77.5946

   Please deliver my order to this location.
   ```
8. Customer manually sends the WhatsApp message. The restaurant and delivery rider can click the Google Maps link to navigate directly to the customer's doorstep.
9. **Graceful Fallback**: If geolocation permission is denied, customer can share their confirmed delivery text address on WhatsApp with one click.

### 3. Shopping Cart & COD Checkout
- **Cash on Delivery (COD) Only**: No online payment gateways (Stripe/Razorpay/UPI).
- **Backend Price Calculation**: Frontend prices are never trusted. All totals and item sub-totals are computed and snapshotted on the server.
- **Minimum Order Amount**: Enforced server-side based on restaurant settings (default ₹150).
- **Food Availability Check**: Validates that all items are active and in stock prior to order creation.

### 4. Automatic Restaurant Opening / Closing System
- **Weekly Schedule**: Configurable opening time, closing time, and closed toggle for each day of the week (Monday through Sunday).
- **Midnight-Crossing Support**: Supports schedules like 12:00 PM to 01:00 AM (closing time < opening time) seamlessly across day transitions.
- **Holiday Calendar**: Register holiday closures by date with descriptions.
- **Manual Management Override**: Emergency `FORCE_OPEN` or `FORCE_CLOSED` with configurable automatic expiry durations (30 min, 1 hr, 2 hrs, 4 hrs, or permanent).
- **Server-Side Enforcement**: Order placement is strictly rejected at the API level when the restaurant is closed.

### 5. 30-Day Retention Policy & Supabase 500 MB Optimization
Designed for 200 orders/day (~6,000 monthly, 18,000 items/month):

| Entity | 30-Day Footprint |
|---|---:|
| 6,000 Active Orders | ~6–12 MB |
| 18,000 Order Items | ~9–18 MB |
| User Accounts & Settings | ~2–5 MB |
| Menu & Categories | ~2–5 MB |
| Indexes & System Overhead | ~10–25 MB |
| **Total Database Size** | **~30–66 MB (Well below 500 MB)** |

- **Daily Scheduled Job**: Runs every night at 3:00 AM (`@Scheduled(cron = "0 0 3 * * *")`).
- **Archival Before Purge**: Orders older than 30 days that are in final status (`COMPLETED`, `CANCELLED`, `REJECTED`) are snapshotted into `order_archive` and `order_item_archive` before deletion from operational tables.
- **Safety**: Unfinished orders (`PENDING`, `ACCEPTED`, `PREPARING`, `READY`), customer accounts, admin accounts, restaurant settings, and menu records are **never deleted**.
- **Admin Storage Monitor**: Visual gauge in the admin console displays storage utilization against the 500 MB quota, with on-demand manual cleanup triggering.

---

## REST API Reference

### Authentication
- `POST /api/auth/register` - Register customer account
- `POST /api/auth/login` - Authenticate customer or admin, returns JWT token
- `GET /api/auth/me` - Get current authenticated user profile

### Customer Menu
- `GET /api/menu` - Get available food items (supports `categoryId` and `search` query parameters)
- `GET /api/menu/categories` - List active food categories
- `GET /api/menu/{id}` - Get item details

### Customer Orders
- `POST /api/orders` - Place Cash on Delivery order
- `GET /api/orders/my-orders` - Get customer's order history
- `GET /api/orders/{id}` - Get single order details
- `POST /api/orders/{id}/share-location` - Save delivery GPS coordinates (only allowed after acceptance)

### Admin Order Management
- `GET /api/admin/orders` - Paged orders with optional status filter (`?status=PENDING&page=0&size=20`)
- `GET /api/admin/orders/{id}` - Get order details with line items and customer location
- `PATCH /api/admin/orders/{id}/status` - Update status (`PENDING -> ACCEPTED -> PREPARING -> READY -> COMPLETED`)

### Admin Menu Management
- `GET /api/admin/menu/items` - List all items (including unavailable)
- `POST /api/admin/menu` - Create food item
- `PUT /api/admin/menu/{id}` - Edit food item
- `DELETE /api/admin/menu/{id}` - Delete food item
- `PATCH /api/admin/menu/{id}/availability` - Toggle stock availability
- `POST /api/admin/menu/upload-image` - Upload food image file (JPEG/PNG/WebP <= 2 MB)
- `GET /api/admin/menu/categories` - List all categories
- `POST /api/admin/menu/categories` - Create category
- `PUT /api/admin/menu/categories/{id}` - Edit category
- `DELETE /api/admin/menu/categories/{id}` - Delete category

### Restaurant Settings & Scheduling
- `GET /api/restaurant/status` - Public live restaurant status (open/closed, hours, next opening)
- `GET /api/restaurant/settings` - Public restaurant settings (name, address, WhatsApp, min order)
- `PUT /api/admin/restaurant/settings` - Update settings & manual override
- `GET /api/admin/restaurant/schedule` - Get 7-day weekly schedule
- `PUT /api/admin/restaurant/schedule` - Update weekly opening/closing times
- `GET /api/admin/restaurant/holidays` - List upcoming holidays
- `POST /api/admin/restaurant/holidays` - Add holiday closure
- `DELETE /api/admin/restaurant/holidays/{id}` - Remove holiday

### Monitoring
- `GET /api/admin/dashboard/statistics` - Real-time stats (today's orders, sales, status counts)
- `GET /api/admin/monitoring/database-usage` - Database storage gauge & 30-day retention status
- `POST /api/admin/monitoring/retention-cleanup` - Manually trigger retention archival

---

## Local Development Setup

### Prerequisites
- Java 21 or higher
- Maven 3.9+ (or use included wrapper)
- Node.js 18+ and npm
- Docker and Docker Compose (optional for containerized setup)

### Option 1: Running with Local Services

1. **Start Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   The backend starts on `http://localhost:8080`.
   Initial Admin account: `admin@restaurant.com` / `AdminPassword@123`.

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`.

### Option 2: Running with Docker Compose

```bash
# Starts Spring Boot Backend and PostgreSQL container
docker-compose up --build
```

---

## Production Deployment to Supabase & Vercel

### 1. Database Setup (Supabase)
1. Create a new project in [Supabase](https://supabase.com).
2. Note your database connection string under **Project Settings -> Database**:
   ```text
   jdbc:postgresql://aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
   ```
3. When Spring Boot starts in `prod` profile, Flyway automatically executes `V1__init_schema.sql` and `V2__seed_initial_data.sql` to initialize all tables, indexes, initial settings, and default administrator.

### 2. Backend Deployment (Docker Container Hosting)
Deploy the backend Docker image to any Docker-compatible always-on platform (e.g. AWS ECS, Google Cloud Run, Railway, Render, DigitalOcean App Platform):

Set environment variables:
```bash
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://db.[ref].supabase.co:5432/postgres?sslmode=require
DB_USER=postgres
DB_PASSWORD=[YOUR_SUPABASE_PASSWORD]
DB_POOL_MAX=8
JWT_SECRET=[GENERATE_RANDOM_256_BIT_BASE64_KEY]
ADMIN_EMAIL=admin@restaurant.com
ADMIN_PASSWORD=[STRONG_PRODUCTION_PASSWORD]
CORS_ALLOWED_ORIGINS=https://your-restaurant-frontend.vercel.app
```

### 3. Frontend Deployment (Vercel)
Deploy the `frontend/` directory to Vercel:
1. In Vercel Project Settings, set:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
2. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-domain.com/api`
3. Add a `vercel.json` rewrites rule to route all requests to `/index.html` for client-side routing.

---

## Load Testing

Run the k6 test suite in `load-testing/` to verify concurrency under 20, 50, 100, and 200 users:

```bash
k6 run -e BASE_URL=http://localhost:8080/api load-testing/k6-load-test.js
```
