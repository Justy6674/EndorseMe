# EndorseMe - Nurse Practitioner Portfolio Tracker

## Overview

This is a full-stack web application designed to help registered nurses track their progress toward Nurse Practitioner (NP) endorsement in Australia. The application provides comprehensive portfolio management, practice hours tracking, CPD (Continuing Professional Development) management, document storage, and progress monitoring aligned with NMBA (Nursing and Midwifery Board of Australia) requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with organized route handlers
- **Middleware**: Custom logging, error handling, and authentication middleware

### Authentication System
- **Provider**: Replit Auth with OpenID Connect (OIDC)
- **Strategy**: Passport.js with OpenID Client strategy
- **Session Management**: Express session with PostgreSQL session store
- **Security**: HTTP-only cookies, CSRF protection, secure session configuration

## Key Components

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Comprehensive schema covering users, practice hours, CPD records, documents, competency assessments, progress milestones, and activity logs
- **Migrations**: Drizzle Kit for database migrations

### Core Features
1. **Practice Hours Tracking**: Record and manage clinical practice hours with workplace details and supervisor information
2. **CPD Management**: Track continuing professional development activities across mandatory, competence, and education categories
3. **Document Management**: Upload and organize required documents for NP endorsement
4. **Progress Monitoring**: Visual progress tracking with milestone management and completion percentages
5. **Activity Logging**: Comprehensive audit trail of user actions

### Data Models
- **Users**: Profile information including pathway selection (A or B)
- **Practice Hours**: Detailed practice hour records with validation
- **CPD Records**: Professional development activities with categorization
- **Documents**: File metadata and categorization system
- **Competency Assessments**: Self-assessment tracking
- **Progress Milestones**: Goal setting and achievement tracking
- **Activity Log**: System activity audit trail

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **API Requests**: Frontend makes authenticated requests to Express API endpoints
3. **Database Operations**: Drizzle ORM handles type-safe database queries
4. **Response Handling**: TanStack Query manages caching and synchronization
5. **UI Updates**: React components re-render based on query state changes

### Request Lifecycle
- Client request → Express middleware → Authentication check → Route handler → Drizzle query → Database → Response → Query cache update → UI re-render

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **express**: Web application framework
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect client implementation

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives (accordion, dialog, select, etc.)
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **typescript**: Type checking and compilation
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React application to `dist/public`
2. **Backend Build**: esbuild bundles Node.js server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: tsx server with Vite development middleware
- **Production**: Pre-built static files served by Express
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable
- **Auth**: Replit-specific authentication configuration

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database (Neon serverless recommended)
- Environment variables for database and authentication
- Static file serving capability

### Performance Considerations
- Vite provides optimized bundling with code splitting
- TanStack Query implements intelligent caching strategies
- Drizzle ORM generates efficient SQL queries
- Express serves static assets in production
- Session storage uses connection pooling for database efficiency

The application follows modern full-stack practices with strong type safety, comprehensive error handling, and scalable architecture suitable for production deployment.