# EndorseMe.com.au - Technical Architecture

## Overview
EndorseMe is a comprehensive SaaS platform designed to streamline the Australian Nurse Practitioner (NP) endorsement journey through AHPRA/NMBA requirements. This document outlines the technical architecture, migration path, and infrastructure decisions.

## Current Stack (Replit)
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Routing**: Wouter (client-side)
- **State Management**: TanStack Query
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (via Neon)
- **ORM**: Drizzle ORM
- **Auth**: Replit Auth (OpenID Connect)
- **Session Storage**: connect-pg-simple
- **Development**: Vite dev server with HMR

## Target Architecture (Production)

### Frontend Hosting: Vercel
- **Why Vercel**:
  - Optimised for React applications
  - Edge functions for API routes
  - Automatic preview deployments
  - Global CDN for Australian users
  - Built-in analytics and monitoring
  - Zero-config deployments from Git

### Backend & Database: Supabase
- **Why Supabase**:
  - PostgreSQL database (matches current stack)
  - Built-in authentication (replaces Replit Auth)
  - Row Level Security (RLS) for data protection
  - Real-time subscriptions for live updates
  - Edge Functions for serverless compute
  - Storage for document uploads
  - Australian region availability (Sydney)

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                         Users                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│  - Static Site Hosting (React App)                          │
│  - Edge Functions (API Routes)                              │
│  - Image Optimisation                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       Supabase                               │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│ │   Auth Service  │ │  PostgreSQL DB  │ │ Storage Service ││
│ │ - User mgmt     │ │ - User data     │ │ - Documents     ││
│ │ - JWT tokens    │ │ - Practice hrs  │ │ - Certificates  ││
│ │ - MFA support   │ │ - CPD records   │ │ - Evidence      ││
│ └─────────────────┘ └─────────────────┘ └─────────────────┘│
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│ │ Edge Functions  │ │   Realtime      │ │    Vector DB    ││
│ │ - AI processing │ │ - Live updates  │ │ - AI embeddings ││
│ │ - PDF generation│ │ - Notifications │ │ - Smart search  ││
│ └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Key Architecture Decisions

### 1. Frontend Architecture
- **SPA with Protected Routes**: Maintain current React SPA architecture
- **Code Splitting**: Lazy load routes for performance
- **Component Library**: Keep shadcn/ui for consistency
- **State Management**: Continue with TanStack Query + Zustand for complex state

### 2. API Architecture
- **RESTful API**: Maintain current REST patterns
- **Edge Functions**: Migrate Express routes to Vercel Edge Functions
- **API Versioning**: Implement `/api/v1/` prefix for future-proofing
- **Rate Limiting**: Implement via Vercel Edge Middleware

### 3. Database Schema
- **Migration Strategy**: Direct PostgreSQL to PostgreSQL migration
- **RLS Policies**: Implement row-level security for multi-tenancy
- **Audit Trail**: Maintain activity_log table with triggers
- **Backups**: Automated daily backups with point-in-time recovery

### 4. Authentication Flow
```
1. User visits site → Check Supabase session
2. No session → Redirect to login page
3. Login options:
   - Email/Password (with email verification)
   - Magic Link
   - Social OAuth (Google, Microsoft)
4. Session created → JWT stored in httpOnly cookie
5. API calls include JWT → Verified by Supabase
```

### 5. Document Storage Architecture
- **Upload Flow**:
  1. Client requests upload URL from API
  2. API generates signed URL from Supabase Storage
  3. Client uploads directly to Supabase
  4. Webhook confirms upload and updates database
- **Security**: 
  - Private buckets per user
  - Signed URLs with expiration
  - Virus scanning via Edge Function

### 6. AI Integration Points
- **Portfolio Analysis**: Edge Function → OpenAI API
- **Document OCR**: Supabase Function → Google Vision API
- **Progress Insights**: Scheduled function for weekly analysis
- **Smart Reminders**: Real-time triggers based on user activity

## Migration Plan

### Phase 1: Infrastructure Setup (Week 1)
1. Create Supabase project in Sydney region
2. Set up Vercel project connected to GitHub
3. Configure environment variables
4. Set up CI/CD pipeline

### Phase 2: Database Migration (Week 2)
1. Export PostgreSQL schema from Neon
2. Import schema to Supabase
3. Migrate data using pg_dump/pg_restore
4. Implement RLS policies
5. Test data integrity

### Phase 3: Auth Migration (Week 3)
1. Map Replit users to Supabase auth
2. Implement auth middleware
3. Update frontend auth hooks
4. Test auth flows
5. Plan user migration communications

### Phase 4: API Migration (Week 4)
1. Convert Express routes to Edge Functions
2. Update API endpoints in frontend
3. Implement new features (if any)
4. Load testing

### Phase 5: Storage Implementation (Week 5)
1. Set up Supabase Storage buckets
2. Implement upload/download flows
3. Migrate existing documents
4. Test file operations

### Phase 6: Production Deployment (Week 6)
1. Final testing on staging
2. DNS configuration
3. SSL certificates
4. Go-live checklist
5. Monitoring setup

## Security Considerations

### Data Protection
- **Encryption**: At-rest and in-transit encryption
- **PII Handling**: Separate PII into encrypted columns
- **GDPR/APP Compliance**: Data residency in Australia
- **Audit Logging**: All data access logged

### Application Security
- **OWASP Top 10**: Regular security audits
- **Dependency Scanning**: Automated via GitHub
- **Rate Limiting**: Per-user and per-IP
- **Input Validation**: Zod schemas on all inputs

### Infrastructure Security
- **Network**: VPC isolation in Supabase
- **Secrets Management**: Environment variables in Vercel
- **Backup Encryption**: Encrypted backups
- **Access Control**: Role-based permissions

## Performance Targets

### Frontend Performance
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Bundle Size**: < 500KB initial

### API Performance
- **Response Time**: < 200ms p95
- **Throughput**: 1000 req/s
- **Availability**: 99.9% uptime

### Database Performance
- **Query Time**: < 50ms p95
- **Connection Pool**: 25 connections
- **Index Coverage**: > 90%

## Monitoring & Observability

### Application Monitoring
- **Vercel Analytics**: Core Web Vitals
- **Sentry**: Error tracking
- **LogRocket**: Session replay

### Infrastructure Monitoring
- **Supabase Dashboard**: Database metrics
- **Uptime Monitoring**: Better Uptime
- **Custom Dashboards**: Grafana

## Cost Projections

### Monthly Costs (AUD)
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Domain & Email**: $10/month
- **Monitoring Tools**: $50/month
- **Total**: ~$105/month

### Scaling Costs
- Additional database storage: $0.125/GB
- Additional bandwidth: $0.15/GB
- Additional Edge Function executions: $0.60/million

## Development Workflow

### Local Development
```bash
# Clone repository
git clone https://github.com/yourusername/endorseme.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

### Deployment Pipeline
1. Push to feature branch
2. Automated tests run
3. Preview deployment created
4. Code review required
5. Merge to main
6. Automated production deployment

## Future Considerations

### Scalability
- **Database Sharding**: Plan for 100k+ users
- **CDN Strategy**: CloudFront for APAC
- **Microservices**: Consider splitting services

### Features Pipeline
- **Mobile App**: React Native consideration
- **AI Features**: More intelligent portfolio review
- **Marketplace**: Connect NPs with employers
- **Telehealth Integration**: Partner integrations

### International Expansion
- **Multi-region**: Deploy to US/UK markets
- **Localisation**: i18n framework ready
- **Compliance**: Research international requirements

## Conclusion

This architecture provides a solid foundation for EndorseMe to scale from prototype to production-ready SaaS platform. The combination of Vercel and Supabase offers the best balance of developer experience, performance, and cost-effectiveness for an Australian healthcare SaaS startup.

The migration path is designed to be low-risk with minimal downtime, ensuring continuity of service for existing users while enabling new features and improved performance.