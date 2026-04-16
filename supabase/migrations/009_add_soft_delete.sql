-- Add soft delete support to organizations
ALTER TABLE organizations ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Update RLS policies to exclude soft-deleted organizations
-- (This will depend on your existing RLS setup)
