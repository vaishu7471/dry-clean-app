# 🚀 Shine Dry Clean - Setup Guide

## 📋 Project Structure

```
dry-clean/
├── backend/              # Node.js + Express backend
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   └── .env              # Backend config (if needed)
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── context/      # AuthContext
│   │   └── ...
│   ├── .env              # Frontend config
│   └── package.json
└── README.md             # This file
```

---

## ⚡ Quick Start (5 minutes)

### Step 1: Start Backend

Open **Terminal 1**:
```bash
cd /home/vaishnavi/Desktop/dry-clean/backend
npm install          # First time only
npm start
```

You should see:
```
🚀 Server running on http://localhost:5000
📝 API available at:
   POST http://localhost:5000/register
   POST http://localhost:5000/login
   GET  http://localhost:5000/users
```

### Step 2: Start Frontend

Open **Terminal 2**:
```bash
cd /home/vaishnavi/Desktop/dry-clean/frontend
npm install          # First time only
npm run dev
```

You should see:
```
VITE ready in 500ms
➜  Local:   http://localhost:3000/
```

### Step 3: Open Browser

Go to: **http://localhost:3000**

---

## 🔐 Test the Application

### 1. Register a New User

1. Click **"Register"** on the homepage
2. Fill in the form:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `9876543210`
   - Password: `password123`
   - Confirm Password: `password123`
   - Address: `123 Main Street`
   - City: `Mumbai`
   - Pincode: `400001`
3. Click **"Create Account"**
4. **Expected:** ✅ Registration successful! Redirected to dashboard

### 2. Login

1. Click **"Logout"** (if logged in)
2. Click **"Login"**
3. Enter:
   - Email: `john@example.com`
   - Password: `password123`
4. Click **"Login"**
5. **Expected:** ✅ Login successful, redirected to dashboard

### 3. Test Error Cases

**Wrong Password:**
- Email: `john@example.com`
- Password: `wrongpassword`
- **Expected:** ❌ Invalid email or password

**Non-existent User:**
- Email: `nobody@example.com`
- Password: `password123`
- **Expected:** ❌ Invalid email or password

**Duplicate Email:**
- Try to register with `john@example.com` again
- **Expected:** ❌ User with this email already exists

---

## 🛠️ Backend API Reference

### POST /register

**Register a new user**

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```

**Response (Error - Duplicate Email):**
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

---

### POST /login

**Login existing user**

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### GET /users

**Get all registered users** (for testing)

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  ]
}
```

---

## 📁 Frontend Configuration

### .env File

Located at: `/frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

This tells the frontend where to find the backend API.

---

## 🔧 Troubleshooting

### "Cannot connect to server"

**Problem:** Frontend shows "Cannot connect to server. Please ensure backend is running."

**Solution:**
1. Make sure backend is running in Terminal 1
2. Check if port 5000 is available
3. Verify `.env` file has correct URL

**Check:**
```bash
curl http://localhost:5000/health
```

Should return: `{"status":"OK","message":"Backend is running"}`

---

### "Registration failed"

**Possible causes:**
1. Backend not running
2. Email already exists
3. Missing required fields

**Solution:**
1. Check backend console for errors
2. Try different email
3. Fill all required fields (name, email, password)

---

### "Login failed"

**Possible causes:**
1. Backend not running
2. Wrong email or password
3. User doesn't exist

**Solution:**
1. Check backend is running
2. Verify credentials
3. Register first if new user

---

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

Or change the port in `backend/server.js`:
```javascript
const PORT = 5001; // Change to different port
```

---

## 🎯 Features Working

| Feature | Status | Notes |
|---------|--------|-------|
| User Registration | ✅ | Stores in memory |
| User Login | ✅ | Password hashing with bcrypt |
| Duplicate Prevention | ✅ | Checks email before register |
| Error Handling | ✅ | Proper error messages |
| Session Persistence | ✅ | User stays logged in |
| Logout | ✅ | Clears session |

---

## 📝 Important Notes

### 1. In-Memory Storage

**Current:** Users are stored in memory (array in `server.js`)

**Limitation:** Users are lost when server restarts

**For Production:** Replace with a database (MongoDB, PostgreSQL, etc.)

---

### 2. Password Security

**Current:** Passwords are hashed using bcryptjs

**Hash Strength:** 10 rounds (good for development)

**For Production:** Increase to 12+ rounds

---

### 3. CORS

**Current:** CORS enabled for all origins (`app.use(cors())`)

**For Production:** Restrict to specific origin:
```javascript
app.use(cors({
  origin: 'https://your-frontend.vercel.app'
}));
```

---

## 🚀 Next Steps

### To Add More Features:

1. **Add Database:**
   - MongoDB with Mongoose
   - PostgreSQL with pg
   - SQLite with better-sqlite3

2. **Add JWT Authentication:**
   - Generate JWT token on login
   - Verify token on protected routes

3. **Add More Endpoints:**
   - GET /profile - Get user profile
   - PUT /profile - Update profile
   - POST /logout - Logout (with JWT)

4. **Add Validation:**
   - Email format validation
   - Phone number validation
   - Password strength requirements

---

## 📞 Support

### Common Issues:

**1. Backend won't start:**
```bash
cd backend
npm install
npm start
```

**2. Frontend won't start:**
```bash
cd frontend
npm install
npm run dev
```

**3. Can't login/register:**
- Check browser console (F12)
- Check backend terminal for errors
- Verify backend is running on port 5000

---

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can register new user
- [ ] Can login with registered user
- [ ] Can logout
- [ ] Error messages show correctly
- [ ] Success messages show correctly

---

**Your Shine Dry Clean app is ready! 🎉**

**Start both terminals and enjoy!**
