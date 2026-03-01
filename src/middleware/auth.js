import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Si no hay token en los headers
  if (!authHeader) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ message: 'Token no valido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token no valido' });
  }
};