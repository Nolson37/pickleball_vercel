-- Database initialization script for Pickleball Platform
-- This script ensures the database is properly configured

-- Create the database if it doesn't exist (though Docker should handle this)
-- SELECT 'CREATE DATABASE pickleball' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pickleball');

-- Set up any additional configurations
-- Enable UUID extension for CUID compatibility
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create a health check function
CREATE OR REPLACE FUNCTION health_check() RETURNS text AS $$
BEGIN
    RETURN 'Database is healthy';
END;
$$ LANGUAGE plpgsql;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Pickleball database initialized successfully at %', NOW();
END
$$;