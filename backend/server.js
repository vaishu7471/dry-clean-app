const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== IN-MEMORY STORAGE ====================

// Demo users (hardcoded for testing)
const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    phone: '9876543210'
  },
  {
    id: 2,
    name: 'Customer User',
    email: 'user@gmail.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'customer',
    phone: '9123456789'
  }
];

// Single shop data
const shops = [
  {
    id: 1,
    shop_name: 'Sri Sai Electrical Dry Clean',
    address: 'Manikonda, Hyderabad',
    city: 'Hyderabad',
    pincode: '500008',
    phone: '9876543210',
    service_radius_km: 5,
    total_bookings: 0,
    rating: 4.5,
    services: [
      { id: 1, service_name: 'Shirt/Pant', service_type: 'Wash', base_price: 100 },
      { id: 2, service_name: 'Saree', service_type: 'Wash', base_price: 150 },
      { id: 3, service_name: 'Suit/Blazer', service_type: 'Dry Clean', base_price: 400 },
      { id: 4, service_name: 'Steam Iron', service_type: 'Iron', base_price: 50 },
      { id: 5, service_name: 'Bed Sheet', service_type: 'Wash', base_price: 80 },
      { id: 6, service_name: 'Curtain', service_type: 'Wash', base_price: 200 }
    ]
  }
];

// Bookings array
const bookings = [];

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
    const existingUser = users.find(u => u.email === email);
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

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      phone: phone || '',
      password: hashedPassword,
      role,
      address: address || '',
      city: city || '',
      pincode: pincode || '',
      shop_name: shop_name || '',
      shop_phone: shop_phone || '',
      createdAt: new Date().toISOString()
    };

    // Store user
    users.push(newUser);

    console.log('✅ User registered:', email, 'Role:', role);

    // Return success (without password)
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
      error: 'Registration failed'
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
    const user = users.find(u => u.email === email);

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

    // Return success (without password)
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
      error: 'Login failed'
    });
  }
});

// GET /users - Get all users (for testing)
app.get('/users', (req, res) => {
  const usersWithoutPassword = users.map(({ password, ...user }) => user);
  res.json({ success: true, users: usersWithoutPassword });
});

// ==================== SHOP ROUTES ====================

// GET /shops - Get all shops (returns single shop)
app.get('/shops', (req, res) => {
  res.json({
    success: true,
    shops: shops
  });
});

// GET /shops/:id - Get single shop by ID
app.get('/shops/:id', (req, res) => {
  const shopId = parseInt(req.params.id);
  const shop = shops.find(s => s.id === shopId);

  if (!shop) {
    return res.status(404).json({
      success: false,
      error: 'Shop not found'
    });
  }

  res.json({
    success: true,
    shop: shop
  });
});

// ==================== ADMIN ROUTES ====================

// GET /admin/shops - Get shops for admin
app.get('/admin/shops', (req, res) => {
  res.json({
    success: true,
    shops: shops
  });
});

// GET /admin/bookings - Get all bookings for admin
app.get('/admin/bookings', (req, res) => {
  // Enrich bookings with customer and shop info
  const enrichedBookings = bookings.map(booking => {
    const customer = users.find(u => u.id === booking.customer_id);
    const shop = shops.find(s => s.id === booking.shop_id);
    const service = shop?.services.find(s => s.id === booking.service_id);

    return {
      ...booking,
      customer_name: customer?.name || 'Unknown',
      customer_phone: customer?.phone || 'N/A',
      shop_name: shop?.shop_name || 'Unknown',
      service_name: service?.service_name || 'Unknown'
    };
  });

  res.json({
    success: true,
    bookings: enrichedBookings
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
    const newBooking = {
      id: bookings.length + 1,
      booking_number,
      customer_id,
      shop_id,
      service_id,
      cloth_type: cloth_type || '',
      quantity: quantity || 1,
      total_amount: total_amount || 0,
      discount: discount || 0,
      final_amount: final_amount || 0,
      pickup_date,
      delivery_date,
      pickup_address: pickup_address || '',
      special_instructions: special_instructions || '',
      status: status || 'Pending',
      customer_approved: false,
      createdAt: new Date().toISOString()
    };

    // Store booking
    bookings.push(newBooking);

    // Update shop total bookings
    const shop = shops.find(s => s.id === shop_id);
    if (shop) {
      shop.total_bookings = (shop.total_bookings || 0) + 1;
    }

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
      error: 'Failed to create booking'
    });
  }
});

// GET /bookings - Get bookings for current user
app.get('/bookings', (req, res) => {
  // Get user ID from Authorization header (simple auth)
  const userId = parseInt(req.headers.authorization?.replace('Bearer ', ''));

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'User ID required'
    });
  }

  // Filter bookings for this user
  const userBookings = bookings.filter(b => b.customer_id === userId);

  // Enrich with shop and service info
  const enrichedBookings = userBookings.map(booking => {
    const shop = shops.find(s => s.id === booking.shop_id);
    const service = shop?.services.find(s => s.id === booking.service_id);

    return {
      ...booking,
      shop_name: shop?.shop_name || 'Unknown',
      service_name: service?.service_name || 'Unknown'
    };
  });

  res.json({
    success: true,
    bookings: enrichedBookings
  });
});

// DELETE /booking/:id - Cancel a booking
app.delete('/booking/:id', (req, res) => {
  const bookingId = parseInt(req.params.id);
  const bookingIndex = bookings.findIndex(b => b.id === bookingId);

  if (bookingIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Booking not found'
    });
  }

  // Update status to cancelled
  bookings[bookingIndex].status = 'Cancelled';

  console.log('✅ Booking cancelled:', bookingId);

  res.json({
    success: true,
    message: 'Booking cancelled successfully'
  });
});

// PUT /booking/:id/approve - Approve a booking (customer feedback)
app.put('/booking/:id/approve', (req, res) => {
  const bookingId = parseInt(req.params.id);
  const booking = bookings.find(b => b.id === bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      error: 'Booking not found'
    });
  }

  booking.customer_approved = true;

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

  const booking = bookings.find(b => b.id === bookingId);

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

  booking.status = status;

  console.log('✅ Booking status updated:', bookingId, 'to', status);

  res.json({
    success: true,
    message: 'Status updated successfully',
    booking: booking
  });
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is running',
    stats: {
      users: users.length,
      shops: shops.length,
      bookings: bookings.length
    }
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('🚀 Server running on http://localhost:' + PORT);
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
