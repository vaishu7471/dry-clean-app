# 🚀 Deploy to Vercel - Step by Step

## Prerequisites ✅
- [ ] Supabase project created
- [ ] SQL schema executed
- [ ] Sample data added
- [ ] `.env` file configured

---

## Step 1: Push to GitHub

```bash
# Navigate to frontend
cd /home/vaishnavi/Desktop/dry-clean/frontend

# Initialize git (if not already done)
git init

# Create .gitignore (already created)
# Make sure .env is NOT committed

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/shine-dry-clean.git
git push -u origin main
```

---

## Step 2: Deploy on Vercel

### 2.1 Go to Vercel
1. Visit: https://vercel.com
2. Sign in with GitHub

### 2.2 Import Project
1. Click **"Add New Project"**
2. Select **"Import Git Repository"**
3. Choose `shine-dry-clean` from the list
4. Click **"Import"**

### 2.3 Configure Build
**Framework Preset:** Vite  
**Root Directory:** `frontend`  
**Build Command:** `npm run build`  
**Output Directory:** `dist`

### 2.4 Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

⚠️ **Important:** Use exact variable names with `VITE_` prefix

### 2.5 Deploy
Click **"Deploy"**

Wait 1-2 minutes for build to complete.

---

## Step 3: Update Supabase Settings

### 3.1 Get Your Vercel URL
After deployment, Vercel gives you:
```
https://shine-dry-clean.vercel.app
```

### 3.2 Update Supabase
1. Go to Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Add your Vercel URL to:
   - **Site URL:** `https://shine-dry-clean.vercel.app`
   - **Redirect URLs:** `https://shine-dry-clean.vercel.app/**`

4. Click **"Save"**

---

## Step 4: Test Your App

1. Open your Vercel URL
2. Try logging in with test credentials
3. Create a booking
4. Check if it appears in "My Orders"

---

## 🎉 Done!

Your app is now live on Vercel!

---

## 🔧 Troubleshooting

### "Build failed"
- Check build logs in Vercel
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Make sure all imports are correct

### "Cannot connect to Supabase"
- Verify environment variables are correct
- Check Supabase project is active
- Ensure RLS policies are set up

### "Blank page after deploy"
- Open browser console (F12)
- Check for errors
- Verify Supabase credentials

---

## 📱 Custom Domain (Optional)

1. Go to Vercel → Project Settings → Domains
2. Add your custom domain
3. Update DNS records as shown
4. Update Supabase redirect URLs with new domain

---

## 🔄 Update After Changes

```bash
# Make your changes, then:
git add .
git commit -m "Update feature"
git push
```

Vercel automatically deploys on every push to `main`!

---

**Your Shine Dry Clean app is now live! 🚀**
