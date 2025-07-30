# Protected Files - DO NOT MODIFY

This document lists all files that should be preserved exactly as they are. These files represent completed work from the Replit development phase and should not be modified without explicit permission.

## Landing Pages & UI Components

### Primary Landing Page
- **File**: `client/src/pages/landing.tsx`
- **Status**: ✅ Complete - DO NOT MODIFY
- **Description**: Beautiful dark-themed landing page with:
  - Hero section with live dashboard preview
  - Stats section showing key metrics
  - Comprehensive features grid
  - Pathways explanation (A & B)
  - Pricing tiers (Candidate, Professional, Enterprise)
  - Strong CTAs throughout
  - Professional footer

### Dashboard Page
- **File**: `client/src/pages/dashboard.tsx`
- **Status**: ✅ Complete - DO NOT MODIFY
- **Description**: User dashboard with:
  - Progress cards for practice hours, CPD, documents
  - Readiness indicator
  - Next steps component
  - Recent activity feed
  - Responsive grid layout

### Other Protected Pages
- `client/src/pages/practice-hours.tsx` - Practice hours tracking
- `client/src/pages/cpd-management.tsx` - CPD records management
- `client/src/pages/documents.tsx` - Document upload/management
- `client/src/pages/progress.tsx` - Progress milestones view
- `client/src/pages/not-found.tsx` - 404 page

## UI Component Library

### Core Components (shadcn/ui)
All files in `client/src/components/ui/` are part of the shadcn/ui library and should remain unchanged:
- Button, Card, Badge, Alert, Dialog, Form components
- Navigation components (tabs, menu, breadcrumb)
- Input components (input, select, checkbox, etc.)
- Display components (table, accordion, avatar, etc.)

### Custom Dashboard Components
- `client/src/components/dashboard/progress-card.tsx`
- `client/src/components/dashboard/next-steps.tsx`
- `client/src/components/dashboard/recent-activity.tsx`

### Layout Components
- `client/src/components/layout/header.tsx`
- `client/src/components/layout/sidebar.tsx`

## Styling & Configuration

### Protected Style Files
- `client/src/index.css` - Global styles with dark theme
- `tailwind.config.ts` - Tailwind configuration
- `components.json` - shadcn/ui configuration

### Protected Config Files
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration

## Why These Files Are Protected

1. **Design Consistency**: The current design system is cohesive and professional
2. **User Experience**: The UX has been carefully crafted for the target audience
3. **Brand Identity**: The dark theme with sky/emerald accents is part of the brand
4. **Component Library**: shadcn/ui provides a solid, accessible foundation
5. **Performance**: Current implementation is optimised and tested

## Modification Guidelines

If changes are absolutely necessary:

1. **Create a backup** first
2. **Document the reason** for changes
3. **Maintain design consistency**
4. **Test thoroughly** on all screen sizes
5. **Get approval** before proceeding

## Design System Reference

### Colour Palette
- Primary: Sky (sky-500, sky-600)
- Secondary: Emerald (emerald-500, emerald-600)
- Accent: Amber, Purple, Red (for specific features)
- Background: Slate (slate-900, slate-800)
- Text: Slate (slate-50, slate-300, slate-400)

### Typography
- Font: System font stack
- Headings: Bold, various sizes
- Body: Regular, good line height
- Monospace: For technical content

### Spacing
- Consistent use of Tailwind spacing scale
- Generous padding for readability
- Proper component separation

### Interactions
- Hover states on all interactive elements
- Smooth transitions (150ms)
- Clear focus states for accessibility
- Loading states with skeletons

## Notes for Developers

- The landing page is the first impression - it must remain polished
- All components follow React best practices
- TypeScript is used throughout for type safety
- The design is mobile-first and fully responsive
- Accessibility has been considered (WCAG compliance)

Remember: These files represent significant work and testing. Any changes should enhance, not detract from, the current user experience.