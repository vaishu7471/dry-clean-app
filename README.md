# ✨ Shine Dry Clean - Frontend Only

A modern dry cleaning management system built with React and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Supabase account (free tier works)

### Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Setup Supabase:**
   - Create account at https://supabase.com
   - Create new project
   - Run SQL schema (see below)
   - Get your credentials

3. **Configure environment:**
```bash
# Create .env file
cp .env.example .env

# Edit .env with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start development:**
```bash
npm run dev
```

Open http://localhost:3000

---

## 📋 Supabase Setup

### 1. Create Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait for setup (2-3 minutes)

### 2. Run SQL Schema

Go to SQL Editor and run:

```sql
-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  address TEXT,
  city TEXT,
  pincode TEXT,
  is_first_time BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shops table
CREATE TABLE shops (
  id BIGSERIAL PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  pincode TEXT,
  service_radius_km INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id BIGSERIAL PRIMARY KEY,
  shop_id BIGINT REFERENCES shops(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  service_type TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  price_per_unit TEXT DEFAULT 'piece',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  booking_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  shop_id BIGINT REFERENCES shops(id) ON DELETE CASCADE,
  service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
  cloth_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Pending',
  pickup_date DATE,
  delivery_date DATE,
  pickup_address TEXT,
  special_instructions TEXT,
  customer_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Customers can view own bookings" ON bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Anyone can view active shops" ON shops FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (is_active = true);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email, NEW.raw_user_meta_data->>'phone', COALESCE(NEW.raw_user_meta_data->>'role', 'customer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Create Test Users

1. Go to Authentication → Users
2. Click "Add user"
3. Create:
   - Email: `admin@shinedryclean.com`, Password: `admin123`
   - Email: `customer@shinedryclean.com`, Password: `customer123`

### 4. Add Sample Data

**Add Shop:**
```sql
INSERT INTO shops (owner_id, shop_name, owner_name, phone, address, city, pincode, service_radius_km, is_active)
VALUES ('YOUR_ADMIN_USER_ID', 'Sri Sai Electrical Dry Cleaning', 'Sri Sai Admin', '9876543210', 'Main Street', 'Mumbai', '400001', 20, true);
```

**Add Services:**
```sql
INSERT INTO services (shop_id, service_name, service_type, base_price, price_per_unit, description) VALUES
(1, 'Pant / Shirt (White)', 'Wash', 100.00, 'piece', 'Professional white clothes cleaning'),
(1, 'Saree', 'Wash', 130.00, 'piece', 'Regular saree cleaning'),
(1, 'Suit / Blazer', 'Dry Clean', 400.00, 'piece', 'Professional dry cleaning'),
(1, 'Steam Iron', 'Iron', 50.00, 'piece', 'Steam ironing per cloth');
```

---

## 🎯 Features

- ✅ User Registration & Login
- ✅ Book Dry Cleaning Services
- ✅ View Orders (Customer)
- ✅ Manage Orders (Admin)
- ✅ Real-time Updates
- ✅ Responsive Design
- ✅ First-time Discount (20%)
- ✅ Promo Code Support

---

## 🚀 Deploy to Vercel

### 1. Push to GitHub

```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/shine-dry-clean.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repo
4. **Add Environment Variables:**
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
5. Click "Deploy"

### 3. Update Supabase URLs

1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add your Vercel domain to:
   - Site URL
   - Redirect URLs

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   │   └── Navbar.jsx
│   ├── context/           # React Context
│   │   └── AuthContext.jsx
│   ├── lib/               # Supabase utilities
│   │   ├── supabaseClient.js
│   │   ├── supabaseAuth.js
│   │   └── supabaseQueries.js
│   ├── pages/             # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── BookingPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── ...
│   ├── styles/            # CSS files
│   │   └── index.css
│   ├── App.jsx            # Main app
│   └── main.jsx           # Entry point
├── .env                   # Environment variables
├── package.json
└── vite.config.js
```

---

## 🔐 Test Credentials

**Customer:**
- Email: `customer@shinedryclean.com`
- Password: `customer123`

**Admin:**
- Email: `admin@shinedryclean.com`
- Password: `admin123`

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Styling:** Custom CSS
- **Deployment:** Vercel

---

## 📝 License

MIT License

---

## 💡 Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase credentials in `.env`
3. Ensure RLS policies are set up correctly
4. Check Supabase logs in dashboard

---

**Built with ❤️ using Supabase**
