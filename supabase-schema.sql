-- SQL to create the missing mock_sessions and mock_results tables in Supabase
-- Run this in your Supabase SQL editor

-- Create mock_sessions table
CREATE TABLE IF NOT EXISTS mock_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  problem_ids UUID[] NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create mock_results table
CREATE TABLE IF NOT EXISTS mock_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  session_id UUID NOT NULL REFERENCES mock_sessions(id),
  total INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mock_sessions_user_id ON mock_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_sessions_expires_at ON mock_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_mock_results_user_id ON mock_results(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_results_session_id ON mock_results(session_id);