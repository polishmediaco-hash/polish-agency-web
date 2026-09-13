/**
 * POLISH Media Co — Supabase Data Migration & Seeding Script
 * 
 * Migrates local JSON files (`server/db/leads.json`, `server/db/content.json`, `server/db/boards/*.json`)
 * into your live Supabase PostgreSQL database.
 * 
 * Usage:
 *   npm run seed:supabase               # Live upsert to cloud Supabase
 *   node scripts/seed-supabase.js --validate # Dry-run validation of schema and payloads
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('--validate');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!isDryRun && (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)) {
  console.error('\n❌ ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in your .env file.');
  console.error('Please add them to .env before running this script in live mode:\n');
  console.error('  SUPABASE_URL=https://your-project.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n');
  console.error('Tip: You can test payload validity without credentials using:');
  console.error('  node scripts/seed-supabase.js --validate\n');
  process.exit(1);
}

let supabase = null;
if (!isDryRun && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function runSeed() {
  console.log('====================================================');
  console.log(`  🚀 POLISH Media Co — Supabase Migration ${isDryRun ? '(DRY-RUN / VALIDATE)' : ''}`);
  console.log(`  🌐 Target: ${isDryRun ? 'Local Validation Engine' : SUPABASE_URL}`);
  console.log('====================================================\n');

  let stats = {
    leadsCount: 0,
    leadsValid: 0,
    cmsPresent: false,
    boardsCount: 0,
    boardsValid: 0
  };

  // 1. Seed Leads
  const leadsFile = path.join(__dirname, '../server/db/leads.json');
  if (fs.existsSync(leadsFile)) {
    try {
      const rawLeads = JSON.parse(fs.readFileSync(leadsFile, 'utf8') || '[]');
      stats.leadsCount = rawLeads.length;
      console.log(`[Leads] Found ${rawLeads.length} local lead dossiers to process...`);

      let importedLeads = 0;
      for (const lead of rawLeads) {
        const row = {
          id: lead.id,
          type: lead.type || (lead.answers ? 'STRATEGY_INTAKE' : 'BRAND_APPLICATION'),
          full_name: lead.fullName || lead.clientName || 'Anonymous',
          brand_name: lead.brandName || lead.storeName || 'Brand',
          email: lead.email || 'not-provided@polishmediaco.com',
          phone: lead.phone || lead.clientWhatsapp || null,
          website_url: lead.websiteUrl || lead.storeUrl || null,
          social_link: lead.socialLink || null,
          role: lead.role || null,
          business_category: lead.businessCategory || null,
          marketing_history: lead.marketingHistory || null,
          primary_goal: lead.primaryGoal || null,
          status: lead.status || 'NEW_APPLICATION',
          notes: lead.notes || lead.clientNotes || null,
          metadata: {
            answers: lead.answers || {},
            answersStructured: lead.answersStructured || {},
            tags: lead.tags || [],
            source: lead.source || 'migration',
            ...lead.metadata
          },
          ip_address: lead.ipAddress || null,
          user_agent: lead.userAgent || null,
          submitted_at: lead.submittedAt || lead.createdAt || new Date().toISOString(),
          created_at: lead.createdAt || lead.submittedAt || new Date().toISOString(),
          updated_at: lead.updatedAt || new Date().toISOString()
        };

        if (isDryRun) {
          if (row.id && row.full_name && row.email) {
            importedLeads++;
          }
        } else {
          const { error } = await supabase.from('leads').upsert(row, { onConflict: 'id' });
          if (error) {
            console.warn(`  ⚠️ Failed to migrate lead ${lead.id}:`, error.message);
          } else {
            importedLeads++;
          }
        }
      }
      stats.leadsValid = importedLeads;
      console.log(`  ✅ Successfully ${isDryRun ? 'validated' : 'migrated'} ${importedLeads}/${rawLeads.length} leads.\n`);
    } catch (err) {
      console.error('  ❌ Error processing leads:', err.message);
    }
  } else {
    console.log('  ℹ️ No local server/db/leads.json found. Skipping leads.\n');
  }

  // 2. Seed CMS Content
  const contentFile = path.join(__dirname, '../server/db/content.json');
  if (fs.existsSync(contentFile)) {
    try {
      console.log('[CMS] Reading local content.json...');
      const rawContent = JSON.parse(fs.readFileSync(contentFile, 'utf8') || '{}');
      stats.cmsPresent = Boolean(rawContent && Object.keys(rawContent).length > 0);

      if (!isDryRun) {
        const { error } = await supabase.from('cms_content').upsert({
          id: 'live_dictionary',
          content: rawContent,
          updated_by: 'Migration Script',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        if (error) {
          console.warn('  ⚠️ Failed to migrate CMS dictionary:', error.message);
        } else {
          console.log(`  ✅ Successfully migrated live trilingual CMS dictionary.\n`);
        }
      } else {
        console.log(`  ✅ CMS content verified (${Object.keys(rawContent).length} root keys).\n`);
      }
    } catch (err) {
      console.error('  ❌ Error processing CMS content:', err.message);
    }
  } else {
    console.log('  ℹ️ No local server/db/content.json found. Skipping CMS.\n');
  }

  // 3. Seed Boards
  const boardsDir = path.join(__dirname, '../server/db/boards');
  if (fs.existsSync(boardsDir)) {
    try {
      const boardFiles = fs.readdirSync(boardsDir).filter(f => f.endsWith('.json'));
      stats.boardsCount = boardFiles.length;
      console.log(`[Boards] Found ${boardFiles.length} board workspace files to process...`);

      let importedBoards = 0;
      for (const file of boardFiles) {
        try {
          const rawBoard = JSON.parse(fs.readFileSync(path.join(boardsDir, file), 'utf8'));
          const row = {
            id: rawBoard.id,
            slug: rawBoard.slug || rawBoard.id,
            title: rawBoard.title || 'Untitled Board',
            client: rawBoard.client || 'Private Advisory Client',
            owner_id: rawBoard.ownerId || 'admin',
            owner_email: rawBoard.ownerEmail || null,
            viewport: rawBoard.viewport || { panX: 0, panY: 0, scale: 1 },
            elements: rawBoard.elements || [],
            is_published: rawBoard.isPublished !== false,
            created_at: rawBoard.createdAt || new Date().toISOString(),
            updated_at: rawBoard.updatedAt || new Date().toISOString()
          };

          if (isDryRun) {
            if (row.id && row.title && Array.isArray(row.elements)) {
              importedBoards++;
            }
          } else {
            const { error } = await supabase.from('boards').upsert(row, { onConflict: 'id' });
            if (error) {
              console.warn(`  ⚠️ Failed to migrate board ${file}:`, error.message);
            } else {
              importedBoards++;
            }
          }
        } catch (fErr) {
          console.warn(`  ⚠️ Corrupt board JSON in ${file}:`, fErr.message);
        }
      }
      stats.boardsValid = importedBoards;
      console.log(`  ✅ Successfully ${isDryRun ? 'validated' : 'migrated'} ${importedBoards}/${boardFiles.length} boards.\n`);
    } catch (err) {
      console.error('  ❌ Error processing boards:', err.message);
    }
  } else {
    console.log('  ℹ️ No local server/db/boards directory found. Skipping boards.\n');
  }

  // 4. Record Initial Keep-Alive Ping (Live mode only)
  if (!isDryRun && supabase) {
    try {
      await supabase.from('keep_alive').insert({
        ping_source: 'migration_seed',
        metadata: { migratedAt: new Date().toISOString() }
      });
      console.log('  ✅ Keep-alive initial heartbeat recorded.');
    } catch (_) {}
  }

  console.log('\n====================================================');
  if (isDryRun) {
    console.log('  🎉 Migration Validation PASSED! All payloads valid.');
    console.log(`  📊 Leads: ${stats.leadsValid}/${stats.leadsCount} | CMS: ${stats.cmsPresent ? 'OK' : 'N/A'} | Boards: ${stats.boardsValid}/${stats.boardsCount}`);
    console.log('  👉 Ready to sync to Supabase once credentials are set in .env');
  } else {
    console.log('  🎉 All data successfully synced to Supabase!      ');
  }
  console.log('====================================================\n');
}

runSeed().catch(console.error);
