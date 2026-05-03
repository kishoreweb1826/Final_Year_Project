-- ═══════════════════════════════════════════════════════
--  Neon PostgreSQL Schema for OrganicFarm
--  Run this ONCE on your Neon database console
-- ═══════════════════════════════════════════════════════

-- ── Users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    phone           VARCHAR(10),
    role            VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',
    enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
    email_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    farmer_approved BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ── Products ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(200)   NOT NULL,
    price       NUMERIC(10,2)  NOT NULL,
    category    VARCHAR(30)    NOT NULL,
    image_url   VARCHAR(500),
    rating      NUMERIC(3,1)   DEFAULT 0.0,
    description TEXT,
    farmer_name VARCHAR(200),
    certified   BOOLEAN        NOT NULL DEFAULT FALSE,
    active      BOOLEAN        NOT NULL DEFAULT TRUE,
    farmer_id   BIGINT         REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, active);
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);

-- ── Farmer Registrations ───────────────────────────────
CREATE TABLE IF NOT EXISTS farmer_registrations (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL REFERENCES users(id),
    farm_name       VARCHAR(200) NOT NULL,
    farm_location   VARCHAR(500) NOT NULL,
    farm_size       VARCHAR(100),
    farming_type    VARCHAR(100),
    experience      VARCHAR(50),
    crops           TEXT,
    certificate_path VARCHAR(500),
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    admin_notes     TEXT,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Orders ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id               BIGSERIAL PRIMARY KEY,
    order_ref        VARCHAR(50)   NOT NULL UNIQUE,
    user_id          BIGINT        NOT NULL REFERENCES users(id),
    subtotal         NUMERIC(10,2) NOT NULL,
    delivery_charge  NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount         NUMERIC(10,2) NOT NULL DEFAULT 0,
    total            NUMERIC(10,2) NOT NULL,
    promo_code       VARCHAR(50),
    delivery_name    VARCHAR(200)  NOT NULL,
    delivery_address TEXT          NOT NULL,
    delivery_city    VARCHAR(100)  NOT NULL,
    delivery_state   VARCHAR(100),
    delivery_pincode VARCHAR(10),
    delivery_phone   VARCHAR(10),
    payment_method   VARCHAR(20)   NOT NULL DEFAULT 'COD',
    status           VARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ── Order Items ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT        NOT NULL REFERENCES products(id),
    quantity   INTEGER       NOT NULL,
    price      NUMERIC(10,2) NOT NULL,
    total      NUMERIC(10,2) NOT NULL
);

-- ── Payments ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            BIGINT        NOT NULL REFERENCES orders(id),
    amount              NUMERIC(10,2) NOT NULL,
    currency            VARCHAR(10)   DEFAULT 'INR',
    status              VARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    payment_method      VARCHAR(30),
    gateway_order_id    VARCHAR(100),
    gateway_payment_id  VARCHAR(100),
    gateway_signature   VARCHAR(500),
    created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── Addresses ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
    id       BIGSERIAL PRIMARY KEY,
    user_id  BIGINT       NOT NULL REFERENCES users(id),
    name     VARCHAR(200) NOT NULL,
    address  TEXT         NOT NULL,
    city     VARCHAR(100) NOT NULL,
    state    VARCHAR(100),
    pincode  VARCHAR(10),
    phone    VARCHAR(10),
    is_default BOOLEAN    DEFAULT FALSE
);

-- ── Contact Messages ───────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    email      VARCHAR(200) NOT NULL,
    message    TEXT         NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Email Verifications ────────────────────────────────
CREATE TABLE IF NOT EXISTS email_verifications (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(200) NOT NULL,
    otp         VARCHAR(10)  NOT NULL,
    verified    BOOLEAN      DEFAULT FALSE,
    expires_at  TIMESTAMP    NOT NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);

-- ── AI Tool Logs ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_tool_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT,
    tool_type   VARCHAR(50) NOT NULL,
    input_data  TEXT,
    output_data TEXT,
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);
