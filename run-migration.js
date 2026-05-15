#!/usr/bin/env node
// Migration runner script for trending_scans table
// Usage: DB_PASSWORD=your_password node run-migration.js
// 
// Get the database password from:
// https://supabase.com/dashboard/project/lmboomcjvrohibzqbmaw/settings/database

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_PASSWORD = process.env.DB_PASSWORD;
const PROJECT_REF = 'lmboomcjvrohibzqbmaw';

if (!DB_PASSWORD) {
  console.error('Error: DB_PASSWORD environment variable is required');
  console.error('Get the password from: https://supabase.com/dashboard/project/' + PROJECT_REF + '/settings/database');
  process.exit(1);
}

const connectionString = `postgres://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function runMigration() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');
    
    const sqlPath = path.join(__dirname, 'supabase', 'migrations', 'run-now-003.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration...');
    await client.query(sql);
    console.log('Migration completed successfully!');
    
    // Verify the table exists
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('trending_scans', 'growth_metrics', 'priority_channels', 'newsletter_repurpose')
    `);
    console.log('Created tables:', result.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();