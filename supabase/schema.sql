-- Motionix Admin Panel - Supabase Database Schema
-- Run this in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tools management
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  engine TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT 'functional',
  status TEXT NOT NULL DEFAULT 'published',
  icon TEXT,
  glyph TEXT,
  tone TEXT,
  og_image TEXT,
  pricing JSONB DEFAULT '{"type": "free"}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- 2. Tool SEO per locale
CREATE TABLE IF NOT EXISTS tool_seo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  primary_keyword TEXT,
  secondary_keywords TEXT[],
  search_intent TEXT,
  target_audience TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tool_id, locale)
);

-- 3. Tool content per locale
CREATE TABLE IF NOT EXISTS tool_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  introduction TEXT,
  features TEXT[],
  limitations TEXT[],
  privacy JSONB,
  examples JSONB,
  related_guides TEXT[],
  h1 TEXT,
  content_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tool_id, locale)
);

-- 4. Tool FAQs per locale
CREATE TABLE IF NOT EXISTS tool_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tool use cases per locale
CREATE TABLE IF NOT EXISTS tool_use_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tool relationships
CREATE TABLE IF NOT EXISTS tool_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  to_tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(from_tool_id, to_tool_id, relationship)
);

-- 7. Blog clusters
CREATE TABLE IF NOT EXISTS blog_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  pillar_slug TEXT,
  tool_slug TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  cluster_id UUID REFERENCES blog_clusters(id),
  locale TEXT NOT NULL DEFAULT 'en',
  title TEXT NOT NULL,
  description TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  content TEXT,
  featured_image TEXT,
  canonical_url TEXT,
  primary_keyword TEXT,
  secondary_keywords TEXT[],
  search_intent TEXT,
  related_tools TEXT[],
  related_articles TEXT[],
  reading_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Keywords
CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  search_volume INTEGER,
  keyword_difficulty INTEGER,
  intent TEXT,
  cluster_id UUID REFERENCES blog_clusters(id),
  tool_slug TEXT,
  target_url TEXT,
  current_rank INTEGER,
  target_rank INTEGER,
  competition TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(keyword, locale)
);

-- 10. Internal links
CREATE TABLE IF NOT EXISTS internal_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  anchor_text TEXT,
  link_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_url, target_url, anchor_text)
);

-- 11. Translations
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locale TEXT NOT NULL,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  translated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(locale, namespace, key)
);

-- 12. Translation completeness
CREATE TABLE IF NOT EXISTS translation_completeness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locale TEXT NOT NULL,
  page_path TEXT NOT NULL,
  seo_complete BOOLEAN DEFAULT false,
  ui_complete BOOLEAN DEFAULT false,
  content_complete BOOLEAN DEFAULT false,
  indexable BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(locale, page_path)
);

-- 13. Redirects
CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_path TEXT UNIQUE NOT NULL,
  destination_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  reason TEXT,
  hit_count INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Media library
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  storage_path TEXT NOT NULL,
  usage_locations TEXT[],
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 17. Analytics snapshots
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  locale TEXT,
  page_url TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC,
  avg_position NUMERIC,
  indexed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. Tool usage events
CREATE TABLE IF NOT EXISTS tool_usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_slug TEXT NOT NULL,
  event_type TEXT NOT NULL,
  locale TEXT,
  browser TEXT,
  device TEXT,
  file_size INTEGER,
  file_format TEXT,
  processing_time_ms INTEGER,
  error_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. Admin users (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'viewer',
  display_name TEXT,
  permissions JSONB DEFAULT '{}',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 21. SEO issues
CREATE TABLE IF NOT EXISTS seo_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  page_url TEXT NOT NULL,
  description TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 22. Performance snapshots
CREATE TABLE IF NOT EXISTS performance_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_url TEXT NOT NULL,
  lcp NUMERIC,
  inp NUMERIC,
  cls NUMERIC,
  ttfb NUMERIC,
  locale TEXT,
  device TEXT,
  measured_at TIMESTAMPTZ DEFAULT now()
);

-- 23. Analytics sync log
CREATE TABLE IF NOT EXISTS analytics_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  rows_synced INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tool_seo_locale ON tool_seo(locale);
CREATE INDEX IF NOT EXISTS idx_tool_content_locale ON tool_content(locale);
CREATE INDEX IF NOT EXISTS idx_tool_faqs_tool_id ON tool_faqs(tool_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_locale ON blog_posts(locale);
CREATE INDEX IF NOT EXISTS idx_keywords_locale ON keywords(locale);
CREATE INDEX IF NOT EXISTS idx_translations_locale ON translations(locale);
CREATE INDEX IF NOT EXISTS idx_tool_usage_events_tool ON tool_usage_events(tool_slug);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
