-- AM Group Premium Automotive Database Schema

-- 1. Brands Table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    banner_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Dealerships / Locations
CREATE TABLE dealerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand_id UUID REFERENCES brands(id),
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    map_url TEXT,
    phone TEXT,
    email TEXT,
    is_main_branch BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Vehicles (Inventory)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id),
    name TEXT NOT NULL,
    model_slug TEXT NOT NULL,
    variant TEXT,
    price_ex_showroom DECIMAL,
    body_type TEXT, -- SUV, Sedan, EV, etc.
    fuel_type TEXT,
    transmission TEXT,
    engine_cc INTEGER,
    power_ps DECIMAL,
    images TEXT[], -- Array of URLs
    features JSONB,
    specs JSONB,
    is_featured BOOLEAN DEFAULT FALSE,
    is_used BOOLEAN DEFAULT FALSE,
    stock_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Leads / Inquiries
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    vehicle_id UUID REFERENCES vehicles(id),
    dealership_id UUID REFERENCES dealerships(id),
    inquiry_type TEXT, -- Sales, Service, Finance, Insurance
    message TEXT,
    status TEXT DEFAULT 'New', -- New, Contacted, Follow-up, Closed, Lost
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Service Bookings
CREATE TABLE service_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    vehicle_reg_no TEXT,
    vehicle_model TEXT,
    dealership_id UUID REFERENCES dealerships(id),
    service_type TEXT, -- Scheduled, Running Repair, Body Shop
    preferred_date DATE,
    preferred_time TIME,
    pickup_required BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Blog / News
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    category TEXT,
    author_name TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Testimonials
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    image_url TEXT,
    vehicle_id UUID REFERENCES vehicles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. FAQs
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT, -- General, Service, Finance, EV
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
