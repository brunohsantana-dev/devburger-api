import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth.js';

const authMiddleware = (req, res, next) => {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({
      error: 'Token not provided',
    });
  }

  const [scheme, token, extra] = authToken.split(' ');

  if (scheme !== 'Bearer' || !token || extra !== undefined) {
    return res.status(401).json({
      error: 'Invalid token format',
    });
  }

  try {
    const decoded = jwt.verify(token, authConfig.secret);

    if (!decoded.id) {
      return res.status(401).json({
        error: 'Invalid token',
      });
    }

    req.userId = decoded.id;
    req.userName = decoded.name;
    req.userIsAdmin = decoded.admin === true; // Adiciona a propriedade userIsAdmin ao objeto req

    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default authMiddleware;
