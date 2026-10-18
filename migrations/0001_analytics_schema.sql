-- Migration: 0001_analytics_schema.sql
-- Description: Analytics schema for ORB Clinic column view tracking & daily stats

-- 1. Raw Views Log (with deduplication tracking)
CREATE TABLE IF NOT EXISTS column_views_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  column_slug TEXT NOT NULL,
  session_id TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  view_date TEXT NOT NULL, -- YYYY-MM-DD
  created_at TEXT NOT NULL  -- ISO 8601 Timestamp
);

-- Index for rapid 30-minute deduplication checks (column_slug + session_id / ip_hash)
CREATE INDEX IF NOT EXISTS idx_log_dedup_session 
  ON column_views_log (column_slug, session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_log_dedup_ip 
  ON column_views_log (column_slug, ip_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_log_slug_date 
  ON column_views_log (column_slug, view_date);

-- 2. Daily Aggregated Stats Table (High-performance O(1) reads)
CREATE TABLE IF NOT EXISTS column_daily_stats (
  column_slug TEXT NOT NULL,
  view_date TEXT NOT NULL, -- YYYY-MM-DD
  views_count INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (column_slug, view_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_date 
  ON column_daily_stats (view_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_slug 
  ON column_daily_stats (column_slug);
