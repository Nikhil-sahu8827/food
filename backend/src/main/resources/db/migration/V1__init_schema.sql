-- ============================================================
-- V1__init_schema.sql
-- Production schema for Single-Restaurant Food Ordering System
-- Optimized for PostgreSQL / Supabase 500MB Free Tier
-- ============================================================

-- Users table (ADMIN and CUSTOMER only)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mobile_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'CUSTOMER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Food Categories
CREATE TABLE IF NOT EXISTS food_categories (
    id BIGSERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Food Items
CREATE TABLE IF NOT EXISTS food_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    image_url VARCHAR(500),
    category_id BIGINT NOT NULL REFERENCES food_categories(id) ON DELETE RESTRICT,
    veg BOOLEAN NOT NULL DEFAULT TRUE,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_food_items_category_id ON food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_food_items_available ON food_items(available);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    customer_name VARCHAR(100) NOT NULL,
    customer_mobile VARCHAR(20) NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(20) NOT NULL DEFAULT 'COD' CHECK (payment_method = 'COD'),
    order_status VARCHAR(20) NOT NULL CHECK (order_status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
    delivery_address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_shared BOOLEAN NOT NULL DEFAULT FALSE,
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Order Items (Snapshot of price & name for historical integrity)
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    food_item_id BIGINT REFERENCES food_items(id) ON DELETE SET NULL,
    food_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Order Archive Tables (30-Day Retention Policy)
CREATE TABLE IF NOT EXISTS order_archive (
    id BIGINT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL,
    customer_id BIGINT,
    customer_name VARCHAR(100),
    customer_mobile VARCHAR(20),
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    order_status VARCHAR(20) NOT NULL,
    delivery_address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    rejection_reason VARCHAR(255),
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    original_created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_archive_created_at ON order_archive(original_created_at);

CREATE TABLE IF NOT EXISTS order_item_archive (
    id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES order_archive(id) ON DELETE CASCADE,
    food_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL
);

-- Restaurant Settings
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id BIGSERIAL PRIMARY KEY,
    restaurant_name VARCHAR(150) NOT NULL,
    restaurant_address TEXT NOT NULL,
    whatsapp_number VARCHAR(30) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    minimum_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    manual_override VARCHAR(20) NOT NULL DEFAULT 'AUTO' CHECK (manual_override IN ('AUTO', 'FORCE_OPEN', 'FORCE_CLOSED')),
    override_expiry TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Weekly Restaurant Schedule
CREATE TABLE IF NOT EXISTS restaurant_schedules (
    id BIGSERIAL PRIMARY KEY,
    day_of_week VARCHAR(15) NOT NULL UNIQUE CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    closed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Restaurant Holidays
CREATE TABLE IF NOT EXISTS restaurant_holidays (
    id BIGSERIAL PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
