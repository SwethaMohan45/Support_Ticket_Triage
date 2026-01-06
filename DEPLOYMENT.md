# Vercel Deployment Guide

## Quick Deploy

Your code has been pushed to GitHub. Now deploy to Vercel:

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New Project"
4. Import your repository: `SwethaMohan45/Support_Ticket_Triage`

### Step 2: Configure Project

Vercel will auto-detect the configuration from `vercel.json`. Just click "Deploy"!

### Step 3: Add Environment Variables

After deployment, add these environment variables in Vercel Dashboard:

**Project Settings → Environment Variables**

```
USE_MOCK_AI=true
HIGH_CONFIDENCE_THRESHOLD=0.85
LOW_CONFIDENCE_THRESHOLD=0.60
ENABLE_AUTO_ROUTING=true
```

If you want to use OpenAI:
```
USE_MOCK_AI=false
OPENAI_API_KEY=your-key-here
```

### Step 4: Redeploy

After adding environment variables, trigger a new deployment:
- Go to "Deployments" tab
- Click the three dots on latest deployment
- Click "Redeploy"

## How It Works

- **Frontend**: Deployed as static files from `frontend/dist`
- **Backend**: Runs as serverless function at `/api`
- Both are served from the same domain (e.g., `your-app.vercel.app`)

## Important Notes

### Storage Limitation

The backend uses in-memory storage, which resets on each deployment. For production:

1. Connect to a database (PostgreSQL, MongoDB, etc.)
2. Update `backend/src/storage/storage.service.ts` to use database instead of in-memory

### API Routes

All backend routes are accessible at:
- `https://your-app.vercel.app/api/tickets`
- `https://your-app.vercel.app/api/queues`
- `https://your-app.vercel.app/api/system/health`

Frontend automatically proxies to these routes.

## Testing Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-app.vercel.app/api/system/health

# Create ticket
curl -X POST https://your-app.vercel.app/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test ticket",
    "description": "Testing deployment",
    "customerType": "paid"
  }'
```

## Troubleshooting

**Build fails?**
- Check Vercel build logs
- Ensure all dependencies are in package.json
- TypeScript errors will fail the build

**API not working?**
- Check environment variables are set
- Check function logs in Vercel dashboard
- Verify backend builds successfully

**Frontend not loading?**
- Check build output directory is correct
- Verify frontend builds successfully
- Check browser console for errors

## Local Testing

Before deploying, test locally:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit http://localhost:3000 to test.

