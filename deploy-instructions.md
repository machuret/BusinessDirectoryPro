# Deploy to Vercel - Step by Step

## 1. Install Vercel CLI
```bash
npm install -g vercel
```

## 2. Login to Vercel
```bash
vercel login
```

## 3. Deploy from project root
```bash
vercel --prod
```

## 4. Follow prompts:
- Link to existing project? **N** (No)
- What's your project's name? **business-directory-pro**
- In which directory is your code located? **./** (current directory)

## 5. Your deployment will be live at:
`https://business-directory-pro-[your-username].vercel.app`

## Test endpoints after deployment:
- `GET /api/health` - Check API status
- `GET /api/businesses` - View business listings
- `POST /api/auth/login` - Admin login (admin@businesshub.com / Xola2025)

Your API is ready in the `api/index.js` file with all endpoints working.