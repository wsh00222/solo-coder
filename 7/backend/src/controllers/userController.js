const userService = require('../services/userService');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await userService.registerUser({ username, email, password });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, error: '服务器错误，注册失败' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser({ email, password });

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, error: '服务器错误，登录失败' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = userService.getCurrentUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
