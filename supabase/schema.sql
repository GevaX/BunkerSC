-- ==========================================
-- BunkerSC
-- Supabase PostgreSQL Database Schema
-- ==========================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. USERS TABLE
-- Stores group participants (~20 members)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- 2. TRANSACTIONS TABLE
-- Stores all point submissions and their approval state
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender TEXT,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INDEXES for fast aggregation & querying
CREATE INDEX IF NOT EXISTS idx_transactions_recipient ON public.transactions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Public read access to users"
  ON public.users FOR SELECT
  USING (true);

-- TRANSACTIONS POLICIES
CREATE POLICY "Public read access to transactions"
  ON public.transactions FOR SELECT
  USING (true);

CREATE POLICY "Public insert pending transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (status = 'pending');
