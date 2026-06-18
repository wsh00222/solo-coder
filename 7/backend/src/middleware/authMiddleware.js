const { verifyToken } = require('../utils/authUtils');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: '认证令牌无效或已过期' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(500).json({ error: '认证服务器错误' });
  }
};

module.exports = authMiddleware;
