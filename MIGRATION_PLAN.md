# Database Migration Plan: Neon PostgreSQL to Supabase

## Overview
This document outlines the step-by-step process for migrating EndorseMe from the current Neon PostgreSQL database to Supabase, while maintaining data integrity and minimising downtime.

## Current State Analysis

### Database Schema
- **ORM**: Drizzle ORM
- **Tables**: 8 core tables
  - sessions (Replit Auth)
  - users
  - practice_hours
  - cpd_records
  - documents
  - competency_assessments
  - progress_milestones
  - activity_log
- **Relationships**: Properly defined with foreign keys
- **Indexes**: On session expiry and primary keys

### Data Volume Estimates
- Users: ~100 (beta phase)
- Practice Hours: ~500 records
- CPD Records: ~300 records
- Documents: ~200 records
- Activity Logs: ~2000 records

## Migration Strategy

### Phase 1: Preparation (Day 1-2)

#### 1.1 Supabase Project Setup
```bash
# Create Supabase project in Sydney region
# Project name: endorseme-prod
# Database password: [secure password]
# Region: ap-southeast-2 (Sydney)
```

#### 1.2 Environment Setup
```bash
# Update .env.local with Supabase credentials
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-key]
```

#### 1.3 Schema Export
```bash
# Export current schema from Neon
pg_dump $DATABASE_URL --schema-only --no-owner --no-privileges > schema.sql

# Export current data
pg_dump $DATABASE_URL --data-only --inserts > data.sql
```

### Phase 2: Schema Migration (Day 3-4)

#### 2.1 Schema Modifications
```sql
-- Add Supabase-specific features to schema.sql

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpd_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own practice hours" ON practice_hours
  FOR ALL USING (auth.uid() = user_id);

-- Add similar policies for all tables...
```

#### 2.2 Apply Schema to Supabase
```bash
# Connect to Supabase and apply schema
psql $SUPABASE_DB_URL < schema.sql
```

#### 2.3 Update Drizzle Configuration
```typescript
// drizzle.config.ts
export default {
  schema: "./src/shared/schema.ts",
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.SUPABASE_DB_URL,
  },
  tablesFilter: ["endorseme_*"],
} satisfies Config;
```

### Phase 3: Authentication Migration (Day 5-6)

#### 3.1 User Migration Strategy
```typescript
// migration/migrate-users.ts
async function migrateUsers() {
  // 1. Export users from current system
  const currentUsers = await getCurrentUsers();
  
  // 2. Create Supabase auth users
  for (const user of currentUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      user_metadata: {
        first_name: user.firstName,
        last_name: user.lastName,
        legacy_id: user.id,
      }
    });
    
    // 3. Map old user ID to new Supabase ID
    await createUserMapping(user.id, data.user.id);
  }
}
```

#### 3.2 Session Migration
- Sessions will not be migrated (users will need to log in again)
- Send email notification about the migration

### Phase 4: Data Migration (Day 7-8)

#### 4.1 Pre-Migration Checks
```typescript
// migration/pre-checks.ts
async function runPreMigrationChecks() {
  // Verify row counts
  const neonCounts = await getNeonRowCounts();
  console.log('Neon DB counts:', neonCounts);
  
  // Check for data integrity
  const orphanedRecords = await findOrphanedRecords();
  if (orphanedRecords.length > 0) {
    console.error('Found orphaned records:', orphanedRecords);
    // Handle appropriately
  }
  
  // Backup current data
  await createFullBackup();
}
```

#### 4.2 Data Transfer Script
```typescript
// migration/transfer-data.ts
async function transferData() {
  const tables = [
    'practice_hours',
    'cpd_records',
    'documents',
    'competency_assessments',
    'progress_milestones',
    'activity_log'
  ];
  
  for (const table of tables) {
    console.log(`Migrating ${table}...`);
    
    // Read from Neon
    const data = await neonDb.select().from(table);
    
    // Transform user_id references
    const transformedData = data.map(row => ({
      ...row,
      user_id: getUserMapping(row.user_id)
    }));
    
    // Write to Supabase
    const { error } = await supabase
      .from(table)
      .insert(transformedData);
      
    if (error) {
      console.error(`Error migrating ${table}:`, error);
      throw error;
    }
    
    console.log(`✓ Migrated ${data.length} rows from ${table}`);
  }
}
```

#### 4.3 Document Storage Migration
```typescript
// migration/migrate-documents.ts
async function migrateDocumentStorage() {
  // Current documents are stored as URLs
  // Need to download and re-upload to Supabase Storage
  
  const documents = await getDocuments();
  
  for (const doc of documents) {
    // Download from current location
    const fileData = await downloadFile(doc.fileUrl);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(`${doc.userId}/${doc.id}/${doc.fileName}`, fileData);
      
    // Update document record with new URL
    await updateDocumentUrl(doc.id, data.path);
  }
}
```

### Phase 5: Application Updates (Day 9-10)

#### 5.1 Update Database Connection
```typescript
// server/db.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

#### 5.2 Update Authentication
```typescript
// server/auth.ts
import { createServerClient } from '@supabase/ssr';

export async function getSession(req: Request) {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => getCookie(req, name),
      },
    }
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
```

#### 5.3 Update API Routes
- Replace Replit Auth with Supabase Auth
- Update all database queries to use Supabase client
- Implement proper error handling

### Phase 6: Testing & Validation (Day 11-12)

#### 6.1 Data Validation
```typescript
// migration/validate.ts
async function validateMigration() {
  const validations = [
    validateUserCounts,
    validatePracticeHours,
    validateCPDRecords,
    validateDocuments,
    validateRelationships,
    validateAggregates
  ];
  
  for (const validate of validations) {
    const result = await validate();
    if (!result.success) {
      console.error(`Validation failed: ${result.message}`);
      return false;
    }
  }
  
  return true;
}
```

#### 6.2 Application Testing
- Test all authentication flows
- Verify all CRUD operations
- Check file uploads/downloads
- Test dashboard calculations
- Verify email notifications

### Phase 7: Cutover (Day 13-14)

#### 7.1 Cutover Plan
```
1. Set application to maintenance mode (11 PM AEDT)
2. Final data sync from Neon to Supabase
3. Update DNS/environment variables
4. Deploy new application version
5. Run smoke tests
6. Remove maintenance mode
7. Monitor for issues
```

#### 7.2 Rollback Plan
```
If critical issues:
1. Revert DNS/environment variables
2. Restore from Neon backup
3. Deploy previous application version
4. Investigate and fix issues
5. Reschedule migration
```

## Post-Migration Tasks

### Immediate (Day 15)
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify backup processes
- [ ] User communication

### Week 1
- [ ] Performance optimisation
- [ ] Update documentation
- [ ] Train support team
- [ ] Gather user feedback

### Month 1
- [ ] Decommission Neon database
- [ ] Audit security settings
- [ ] Optimise costs
- [ ] Plan next features

## Risk Mitigation

### Data Loss Prevention
- Full backup before migration
- Incremental backups during migration
- Data validation at each step
- Keep Neon running for 30 days

### Downtime Minimisation
- Migration during low-traffic period
- Clear communication to users
- Maintenance page ready
- Quick rollback capability

### Security Considerations
- Audit all RLS policies
- Review API permissions
- Update security headers
- Pen test after migration

## Success Criteria

- ✅ Zero data loss
- ✅ < 2 hours downtime
- ✅ All features working
- ✅ No security vulnerabilities
- ✅ Performance equal or better
- ✅ Users successfully migrated

## Communication Plan

### Pre-Migration
- Email users 1 week before
- In-app banner 3 days before
- Social media updates

### During Migration
- Maintenance page with progress
- Status page updates
- Support team ready

### Post-Migration
- Success announcement
- New feature highlights
- Support documentation

## Appendix: Scripts and Commands

### Backup Commands
```bash
# Full backup of Neon
pg_dump $DATABASE_URL --verbose --format=custom --file=backup_$(date +%Y%m%d).dump

# Restore to Supabase
pg_restore --verbose --no-owner --no-privileges -d $SUPABASE_DB_URL backup.dump
```

### Monitoring Queries
```sql
-- Check row counts
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Check for missing foreign keys
SELECT 
  conname,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f';
```

This migration plan ensures a smooth transition from Neon to Supabase with minimal risk and downtime.