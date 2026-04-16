const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== DATABASE SETUP ====================

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'dryclean.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'customer',
    address TEXT,
    city TEXT,
    pincode TEXT,
    shop_name TEXT,
    shop_phone TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    pincode TEXT,
    phone TEXT,
    service_radius_km INTEGER DEFAULT 5,
    total_bookings INTEGER DEFAULT 0,
    rating REAL DEFAULT 4.5
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    service_name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    base_price REAL NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    shop_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    cloth_type TEXT,
    quantity INTEGER DEFAULT 1,
    total_amount REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    final_amount REAL DEFAULT 0,
    pickup_date TEXT NOT NULL,
    delivery_date TEXT NOT NULL,
    pickup_address TEXT,
    special_instructions TEXT,
    status TEXT DEFAULT 'Pending',
    customer_approved INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
  );
`);

console.log('✅ Database initialized successfully');

// Check if shop exists, if not create default shop (needed for business operations)
const existingShop = db.prepare('SELECT id FROM shops').get();
if (!existingShop) {
  db.prepare(`
    INSERT INTO shops (shop_name, address, city, pincode, phone, service_radius_km)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('Sri Sai Electrical Dry Clean', 'Manikonda, Hyderabad', 'Hyderabad', '500008', '9876543210', 5);

  // Add default services
  const shopId = 1;
  const services = [
    ['Shirt/Pant', 'Wash', 100],
    ['Saree', 'Wash', 150],
    ['Suit/Blazer', 'Dry Clean', 400],
    ['Steam Iron', 'Iron', 50],
    ['Bed Sheet', 'Wash', 80],
    ['Curtain', 'Wash', 200]
  ];

  const insertService = db.prepare('INSERT INTO services (shop_id, service_name, service_type, base_price) VALUES (?, ?, ?, ?)');
  for (const [name, type, price] of services) {
    insertService.run(shopId, name, type, price);
  }
  console.log('✅ Default shop and services created');
}

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());

// ==================== AUTH ROUTES ====================

// POST /register - User Registration
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, city, pincode, shop_name, shop_phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role based on shop_name presence
    const role = shop_name ? 'admin' : 'customer';

    // Insert new user
    const result = db.prepare(`
      INSERT INTO users (name, email, password, phone, role, address, city, pincode, shop_name, shop_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, hashedPassword, phone || '', role, address || '', city || '', pincode || '', shop_name || '', shop_phone || '');

    const newUser = {
      id: result.lastInsertRowid,
      name,
      email,
      phone: phone || '',
      role,
      address: address || '',
      city: city || '',
      pincode: pincode || '',
      shop_name: shop_name || '',
      shop_phone: shop_phone || ''
    };

    console.log('✅ User registered:', email, 'Role:', role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed: ' + error.message
    });
  }
});

// POST /login - User Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log('✅ User logged in:', email);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message
    });
  }
});

// GET /users - Get all users (for testing)
app.get('/users', (req, res) => {
  const users = db.prepare('SELECT id, name, email, phone, role, address, city, pincode, shop_name, shop_phone, createdAt FROM users').all();
  res.json({ success: true, users });
});

// ==================== SHOP ROUTES ====================

// GET /shops - Get all shops
app.get('/shops', (req, res) => {
  const shops = db.prepare(`
    SELECT s.*, 
           (SELECT COUNT(*) FROM bookings WHERE shop_id = s.id) as total_bookings
    FROM shops s
  `).all();

  const shopsWithServices = shops.map(shop => ({
    ...shop,
    services: db.prepare('SELECT * FROM services WHERE shop_id = ?').all(shop.id)
  }));

  res.json({
    success: true,
    shops: shopsWithServices
  });
});

// GET /shops/:id - Get single shop by ID
app.get('/shops/:id', (req, res) => {
  const shopId = parseInt(req.params.id);
  const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shopId);

  if (!shop) {
    return res.status(404).json({
      success: false,
      error: 'Shop not found'
    });
  }

  const services = db.prepare('SELECT * FROM services WHERE shop_id = ?').all(shopId);

  res.json({
    success: true,
    shop: {
      ...shop,
      services
    }
  });
});

// ==================== ADMIN ROUTES ====================

// GET /admin/shops - Get shops for admin
app.get('/admin/shops', (req, res) => {
  const shops = db.prepare('SELECT * FROM shops').all();
  res.json({
    success: true,
    shops
  });
});

// GET /admin/bookings - Get all bookings for admin
app.get('/admin/bookings', (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, 
           u.name as customer_name, 
           u.phone as customer_phone,
           s.shop_name,
           srv.service_name
    FROM bookings b
    LEFT JOIN users u ON b.customer_id = u.id
    LEFT JOIN shops s ON b.shop_id = s.id
    LEFT JOIN services srv ON b.service_id = srv.id
    ORDER BY b.createdAt DESC
  `).all();

  res.json({
    success: true,
    bookings
  });
});

// ==================== BOOKING ROUTES ====================

// POST /book - Create a new booking
app.post('/book', (req, res) => {
  try {
    const {
      booking_number,
      customer_id,
      shop_id,
      service_id,
      cloth_type,
      quantity,
      total_amount,
      discount,
      final_amount,
      pickup_date,
      delivery_date,
      pickup_address,
      special_instructions,
      status
    } = req.body;

    // Validate required fields
    if (!booking_number || !customer_id || !shop_id || !service_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Create new booking
    const result = db.prepare(`
      INSERT INTO bookings (
        booking_number, customer_id, shop_id, service_id,
        cloth_type, quantity, total_amount, discount, final_amount,
        pickup_date, delivery_date, pickup_address, special_instructions, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      booking_number,
      customer_id,
      shop_id,
      service_id,
      cloth_type || '',
      quantity || 1,
      total_amount || 0,
      discount || 0,
      final_amount || 0,
      pickup_date,
      delivery_date,
      pickup_address || '',
      special_instructions || '',
      status || 'Pending'
    );

    // Update shop total bookings
    db.prepare('UPDATE shops SET total_bookings = total_bookings + 1 WHERE id = ?').run(shop_id);

    const newBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);

    console.log('✅ Booking created:', booking_number);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: newBooking
    });

  } catch (error) {
    console.error('❌ Booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking: ' + error.message
    });
  }
});

// GET /bookings - Get bookings for current user
app.get('/bookings', (req, res) => {
  const userId = parseInt(req.headers.authorization?.replace('Bearer ', ''));

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'User ID required'
    });
  }

  const userBookings = db.prepare(`
    SELECT b.*, 
           s.shop_name,
           srv.service_name
    FROM bookings b
    LEFT JOIN shops s ON b.shop_id = s.id
    LEFT JOIN services srv ON b.service_id = srv.id
    WHERE b.customer_id = ?
    ORDER BY b.createdAt DESC
  `).all(userId);

  res.json({
    success: true,
    bookings: userBookings
  });
});

// DELETE /booking/:id - Cancel a booking
app.delete('/booking/:id', (req, res) => {
  const bookingId = parseInt(req.params.id);
  const booking = db.prepare('SELECT id FROM bookings WHERE id = ?').get(bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: 'Booking not found'
    });
  }

  db.prepare("UPDATE bookings SET status = 'Cancelled' WHERE id = ?").run(bookingId);

  console.log('✅ Booking cancelled:', bookingId);

  res.json({
    success: true,
    message: 'Booking cancelled successfully'
  });
});

// PUT /booking/:id/approve - Approve a booking
app.put('/booking/:id/approve', (req, res) => {
  const bookingId = parseInt(req.params.id);
  const booking = db.prepare('SELECT id FROM bookings WHERE id = ?').get(bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: 'Booking not found'
    });
  }

  db.prepare('UPDATE bookings SET customer_approved = 1 WHERE id = ?').run(bookingId);

  console.log('✅ Booking approved:', bookingId);

  res.json({
    success: true,
    message: 'Booking approved successfully'
  });
});

// PUT /booking/:id/status - Update booking status
app.put('/booking/:id/status', (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { status } = req.body;

  const booking = db.prepare('SELECT id FROM bookings WHERE id = ?').get(bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: 'Booking not found'
    });
  }

  if (!status) {
    return res.status(400).json({
      success: false,
      error: 'Status is required'
    });
  }

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, bookingId);

  const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

  console.log('✅ Booking status updated:', bookingId, 'to', status);

  res.json({
    success: true,
    message: 'Status updated successfully',
    booking: updatedBooking
  });
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  const stats = {
    users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    shops: db.prepare('SELECT COUNT(*) as count FROM shops').get().count,
    bookings: db.prepare('SELECT COUNT(*) as count FROM bookings').get().count
  };

  res.json({
    status: 'OK',
    message: 'Backend is running',
    stats
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('🚀 Server running on http://localhost:' + PORT);
  console.log('💾 Database: ' + dbPath);
  console.log('');
  console.log('📝 API Endpoints:');
  console.log('');
  console.log('Auth:');
  console.log('   POST /register  - User registration');
  console.log('   POST /login     - User login');
  console.log('   GET  /users     - Get all users');
  console.log('');
  console.log('Shops:');
  console.log('   GET  /shops     - Get all shops');
  console.log('   GET  /shops/:id - Get single shop');
  console.log('');
  console.log('Admin:');
  console.log('   GET  /admin/shops     - Get shops');
  console.log('   GET  /admin/bookings  - Get all bookings');
  console.log('');
  console.log('Bookings:');
  console.log('   POST /book              - Create booking');
  console.log('   GET  /bookings          - Get user bookings');
  console.log('   DELETE /booking/:id     - Cancel booking');
  console.log('   PUT  /booking/:id/approve   - Approve booking');
  console.log('   PUT  /booking/:id/status    - Update status');
  console.log('');
  console.log('🔑 Demo Credentials:');
  console.log('   Admin:    admin@gmail.com / admin123');
  console.log('   Customer: user@gmail.com / user123');
  console.log('');
  console.log('Health:');
  console.log('   GET  /health - Server status');
});
