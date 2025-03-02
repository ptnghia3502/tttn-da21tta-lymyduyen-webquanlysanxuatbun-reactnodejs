const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

//const userRoutes = require('./routers/nguoiDungRouter/userRouters');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
//app.use('/api', userRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Quản lý sản xuất bún API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Lỗi server!' });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route không tồn tại' });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Cổng ${PORT} đã được sử dụng`);
  } else {
    console.error('Lỗi server:', error);
  }
}); 