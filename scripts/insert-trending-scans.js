#!/usr/bin/env node
// Insert trending scan data into Supabase
// Usage: node insert-trending-scans.js [data-file.json]
// 
// Prerequisites: The trending_scans table must exist in Supabase.
// Run the migration first: see supabase/migrations/run-now-003.sql

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lmboomcjvrohibzqbmaw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable is required');
  process.exit(1);
}

const fs = require('fs');
const path = require('path');

async function insertScans(dataFile) {
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  let inserted = 0;
  let failed = 0;

  for (const scan of data) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/trending_scans`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          platform: scan.platform,
          scan_type: scan.scan_type,
          items: scan.items,
          source_url: scan.source_url || null,
          notes: scan.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to insert ${scan.platform}/${scan.scan_type}: ${error}`);
        failed++;
      } else {
        console.log(`Inserted ${scan.platform}/${scan.scan_type}`);
        inserted++;
      }
    } catch (error) {
      console.error(`Error inserting ${scan.platform}/${scan.scan_type}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Failed: ${failed}`);
}

const dataFile = process.argv[2] || path.join(__dirname, '..', 'data', 'trending-scans-2026-05-15.json');
insertScans(dataFile);
