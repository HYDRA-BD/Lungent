-- Lungent Technical Foundation Initial Migration
-- Platform: Supabase PostgreSQL
-- Milestone: Phase 1.1 Foundation & Project Setup

-- Enable required PostgreSQL cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Comment on database foundation baseline
COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generator for Lungent platform entities';
COMMENT ON EXTENSION "pgcrypto" IS 'Cryptographic functions for hashing and security';

-- NOTE: Production patient schemas, risk models, and clinical tables
-- are scheduled for Phase 2+ migrations per architecture roadmap.
