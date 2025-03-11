const jwt = require('jsonwebtoken');
const connection = require('../config/database');

// Middleware xác thực JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token not found' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware kiểm tra quyền
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    const query = `
      SELECT q.Ten_quyen 
      FROM Quyen q 
      JOIN Quyen_NguoiDung qn ON q.Id = qn.Quyen_id 
      WHERE qn.Nguoi_dung_id = ?
    `;

    connection.query(query, [req.userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Chuyển đổi tất cả quyền về chữ thường để so sánh
      const userRoles = results.map(role => role.Ten_quyen.toLowerCase());
      const requiredRolesLower = requiredRoles.map(role => role.toLowerCase());

      console.log('User roles:', userRoles);
      console.log('Required roles:', requiredRolesLower);

      const hasRequiredRole = requiredRolesLower.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({ 
          error: 'Không có quyền truy cập',
          userRoles: results.map(role => role.Ten_quyen),
          requiredRoles: requiredRoles
        });
      }

      next();
    });
  };
};

module.exports = {
  verifyToken,
  checkRole
}; 