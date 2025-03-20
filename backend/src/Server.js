const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const nguyenVatLieuRoutes = require('./Routers/nguyenVatLieuRoutes/nguyenVatLieuRoutes');
const userRoutes = require('./Routers/nguoiDungRouter/userRouters');
const roleRoutes = require('./Routers/roleRouter/roleRouters');
const thanhPhamRoutes = require('./Routers/thanhphamRoutes/thanhphamRoutes');
const nhapKhoRoutes = require('./Controllers/nhapKhoController/nhapKhoController');
const xuatKhoRoutes = require('./Controllers/xuatKhoController/xuatKhoController');
const connection = require('./config/database');
const setupSwagger = require('./config/swagger');
const helmet = require('helmet');

const app = express();

// Security middleware
app.use(helmet());

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "https://quanly-sanxuat-tts-vnpt.vercel.app/"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup Swagger
setupSwagger(app);

// Thêm middleware logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Debug middleware - Thêm chi tiết hơn
app.use((req, res, next) => {
  console.log('Request URL:', req.method, req.url);
  console.log('Request Body:', req.body);
  next();
});

// Error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Error handler for unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Thêm vào trước khi import các module khác
console.log('Node ENV:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());
console.log('Checking environment variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_DATABASE: process.env.DB_DATABASE,
  PORT: process.env.DB_PORT
});

// Thêm vào đầu file Server.js sau khi import connection
connection.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('Database connection test failed:', err);
    process.exit(1);
  }
  console.log('Database connection test successful');
});

try {
  // Routes
  app.use('/api', userRoutes);
  app.use('/api', nguyenVatLieuRoutes);
  app.use('/api', roleRoutes);
  app.use('/api', thanhPhamRoutes);
  app.use('/api/nhap-kho', nhapKhoRoutes);
  app.use('/api/xuat-kho', xuatKhoRoutes);
  
  // Test route
  app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
  });

  // Handle 404
  app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({
      error: 'Route không tồn tại',
      path: req.url,
      method: req.method
    });
  });

  const PORT = process.env.PORT || 3001;

  // Thêm xử lý lỗi khi start server
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);

    // Log tất cả các routes đã đăng ký
    console.log('\nRegistered Routes:');
    function print(path, layer) {
      if (layer.route) {
        layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
      } else if (layer.name === 'router' && layer.handle.stack) {
        layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
      } else if (layer.method) {
        console.log('%s /%s',
          layer.method.toUpperCase(),
          path.concat(split(layer.regexp)).filter(Boolean).join('/'))
      }
    }
    function split(thing) {
      if (typeof thing === 'string') return thing.split('/')
      if (thing.fast_slash) return ''
      var match = thing.toString()
        .replace('\\/?', '')
        .replace('(?=\\/|$)', '$')
        .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
      return match
        ? match[1].replace(/\\(.)/g, '$1').split('/')
        : '<complex:' + thing.toString() + '>'
    }
    app._router.stack.forEach(print.bind(null, []))
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is busy, trying with port ${Number(PORT) + 1}`);
      // Thử với port mới
      app.listen(Number(PORT) + 1, () => {
        console.log(`Server is running on port ${Number(PORT) + 1}`);
        console.log(`Swagger documentation available at http://localhost:${Number(PORT) + 1}/api-docs`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
} catch (error) {
  console.error('Server initialization error:', error);
} 