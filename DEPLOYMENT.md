# Deployment Guide for EndorseMe

## Current Architecture Issue

Your app is built as a traditional Node.js/Express server with:
- Express backend serving API routes
- Vite serving the React frontend in development
- Server-side rendering handled by Express

Vercel is optimized for serverless functions and static sites, not traditional Node.js servers.

## Deployment Options

### Option 1: Deploy to Railway (Recommended)
Railway supports full Node.js applications out of the box.

1. **Sign up at [railway.app](https://railway.app)**
2. **Connect your GitHub repo**
3. **Add environment variables from .env.local**
4. **Deploy** - Railway will automatically detect Node.js and run `npm start`

### Option 2: Deploy to Render
Similar to Railway, supports Node.js servers.

1. **Sign up at [render.com](https://render.com)**
2. **Create a new Web Service**
3. **Connect GitHub repo**
4. **Set build command**: `npm run build`
5. **Set start command**: `npm start`
6. **Add environment variables**

### Option 3: Deploy to Fly.io
More control, supports Node.js apps.

1. **Install Fly CLI**: `brew install flyctl`
2. **Run**: `fly launch`
3. **Add environment variables**: `fly secrets set KEY=value`
4. **Deploy**: `fly deploy`

### Option 4: Modify for Vercel (Major Changes Required)
To deploy on Vercel, you'd need to:

1. **Separate frontend and backend**:
   - Deploy React app as static site on Vercel
   - Convert Express routes to Vercel API functions
   - Update all API calls to use Vercel function endpoints

2. **Create API routes** in `/api` directory:
   ```javascript
   // api/auth/user.js
   export default async function handler(req, res) {
     // Your Express route logic here
   }
   ```

3. **Update frontend** to call Vercel API routes

## Quick Fix for Vercel (Static Landing Page Only)

To at least show your landing page on Vercel:

1. Create `vercel.json`:
```json
{
  "buildCommand": "cd client && npm run build",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/404"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

2. This will deploy ONLY the frontend (no backend functionality)

## Recommended Approach

Given your current architecture:

1. **Use Railway or Render** for the full app (frontend + backend)
2. **Keep Vercel** for future when you refactor to serverless

## Environment Variables to Set

Whichever platform you choose, add these:

```
VITE_SUPABASE_URL=https://bclzmzlcraqobtrfpimv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
DATABASE_SERVICE_ROLE_KEY=eyJhbG...
DATABASE_URL=postgresql://postgres:IloveBB0307$$@db.bclzmzlcraqobtrfpimv.supabase.co:5432/postgres
ANTHROPIC_API_KEY=sk-ant-api03-...
STRIPE_RESTRICTED_KEY=rk_live_...
```

## Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Check database connection
- [ ] Test authentication flow
- [ ] Verify API endpoints work
- [ ] Check browser console for errors
- [ ] Test on mobile devices