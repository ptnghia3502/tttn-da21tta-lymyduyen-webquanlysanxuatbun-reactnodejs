const mysql = require('mysql2');
require('dotenv').config();

let connection;

try {
  // Log để debug
  console.log('Database Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

  connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    port: process.env.DB_PORT || 3306,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'quanlybun',
    queueLimit: 0,
    connectionLimit: 10,
    charset: 'utf8mb4'
  });

  connection.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err);
      process.exit(1);
    }
    console.log('Connected to database:', process.env.DB_DATABASE);

    // Kiểm tra database đã được chọn
    connection.query('SELECT DATABASE() as db', (err, results) => {
      if (err) throw err;
      console.log('Current database:', results[0].db);
    });
  });

  // Xử lý mất kết nối
  connection.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    } else if (err.code === 'ER_NO_DB_ERROR') {
      console.error('No database selected');
    }
  });
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
}

module.exports = connection; 