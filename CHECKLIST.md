# ✅ Deployment Checklist

## Before You Start

- [ ] Node.js installed (v16+)
- [ ] Supabase account created
- [ ] GitHub account created
- [ ] Vercel account created (optional - can use GitHub login)

---

## 1️⃣ Supabase Setup (15 minutes)

### Create Project
- [ ] Go to https://supabase.com
- [ ] Click "New Project"
- [ ] Name: `shine-dry-clean`
- [ ] Set strong database password (save it!)
- [ ] Choose region (closest to you)
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for setup

### Get Credentials
- [ ] Go to Settings → API
- [ ] Copy `Project URL`
- [ ] Copy `anon` `public` key
- [ ] Save both for later

### Run SQL Schema
- [ ] Go to SQL Editor
- [ ] Copy schema from README.md
- [ ] Paste and click "Run"
- [ ] Verify tables created:
  - [ ] profiles
  - [ ] shops
  - [ ] services
  - [ ] bookings

### Create Test Users
- [ ] Go to Authentication → Users
- [ ] Click "Add user"
- [ ] Create admin: `admin@shinedryclean.com` / `admin123`
- [ ] Create customer: `customer@shinedryclean.com` / `customer123`

### Add Sample Data
- [ ] Go to Table Editor → shops
- [ ] Insert shop (use admin's UUID from profiles table)
- [ ] Go to Table Editor → services
- [ ] Add 4-5 services for the shop

---

## 2️⃣ Local Setup (5 minutes)

### Configure Environment
- [ ] Navigate to: `/home/vaishnavi/Desktop/dry-clean/frontend`
- [ ] Open `.env` file
- [ ] Add your Supabase URL:
  ```env
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  ```
- [ ] Add your Supabase anon key:
  ```env
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- [ ] Save file

### Install & Test
- [ ] Run: `npm install`
- [ ] Run: `npm run dev`
- [ ] Open: http://localhost:3000
- [ ] Test login with customer credentials
- [ ] Test booking a service
- [ ] Verify order appears in "My Orders"

---

## 3️⃣ Deploy to Vercel (10 minutes)

### Push to GitHub
- [ ] Open terminal in frontend folder
- [ ] Run:
  ```bash
  git init
  git add .
  git commit -m "Ready for deployment"
  ```
- [ ] Create new repo on GitHub (name: `shine-dry-clean`)
- [ ] Copy the commands Vercel shows
- [ ] Run:
  ```bash
  git remote add origin https://github.com/YOU/shine-dry-clean.git
  git push -u origin main
  ```

### Deploy on Vercel
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "Add New Project"
- [ ] Select `shine-dry-clean` repository
- [ ] Configure:
  - **Framework Preset:** Vite
  - **Root Directory:** `frontend`
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
- [ ] Click "Environment Variables"
- [ ] Add variables:
  - [ ] `VITE_SUPABASE_URL` = your URL
  - [ ] `VITE_SUPABASE_ANON_KEY` = your key
- [ ] Click "Deploy"
- [ ] Wait 1-2 minutes for build

### Update Supabase
- [ ] Copy your Vercel URL (shown after deploy)
- [ ] Go to Supabase Dashboard
- [ ] Authentication → URL Configuration
- [ ] Add Vercel URL to:
  - [ ] Site URL
  - [ ] Redirect URLs
- [ ] Click "Save"

---

## 4️⃣ Test Live App (5 minutes)

### Test on Vercel
- [ ] Open your Vercel URL
- [ ] Login as customer
- [ ] Create a booking
- [ ] Verify it appears in "My Orders"
- [ ] Test logout
- [ ] Login as admin
- [ ] Check dashboard shows bookings

### Test All Features
- [ ] User Registration
- [ ] User Login
- [ ] View Shops
- [ ] Book Service
- [ ] View Orders
- [ ] Cancel Order (if pending)
- [ ] Admin Dashboard
- [ ] Update Order Status

---

## 5️⃣ Final Checks

### Security
- [ ] `.env` file is in `.gitignore`
- [ ] Not committed to GitHub
- [ ] Using `anon` key (not `service_role`)

### Performance
- [ ] App loads in < 3 seconds
- [ ] No console errors
- [ ] Responsive on mobile

### Documentation
- [ ] README.md is clear
- [ ] DEPLOYMENT.md has correct steps
- [ ] Test credentials documented

---

## 🎉 Success!

If all boxes are checked, your app is:
- ✅ Live on Vercel
- ✅ Connected to Supabase
- ✅ Fully functional
- ✅ Ready for users

---

## 📱 What's Next?

### Optional Improvements
- [ ] Add custom domain
- [ ] Set up email templates in Supabase
- [ ] Add more services
- [ ] Customize styling
- [ ] Add image upload for shops
- [ ] Implement real-time notifications

### Maintenance
- Monitor Supabase usage (free tier is generous)
- Check Vercel analytics
- Update dependencies regularly
- Backup database periodically

---

## 🆘 Need Help?

### Common Issues:

**Build fails:**
- Check environment variables in Vercel
- Verify all imports are correct
- Check build logs

**Can't login:**
- Verify Supabase credentials in `.env`
- Check user exists in Supabase dashboard
- Ensure RLS policies are set

**No data showing:**
- Verify SQL schema was run
- Check sample data was added
- Ensure user has correct permissions

**Still stuck?**
- Check browser console (F12)
- Review Supabase logs
- Check Vercel function logs

---

**Your Shine Dry Clean app is ready! 🚀**

Time to share it with the world!
