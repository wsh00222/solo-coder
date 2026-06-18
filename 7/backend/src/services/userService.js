const { getDb, writeDb, getNow, hashPassword, comparePassword, seedDefaultDataForUser } = require('../config/database');
const { generateToken, sanitizeUser } = require('../utils/authUtils');

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const registerUser = async ({ username, email, password }) => {
  const db = getDb();

  if (!username || username.trim().length < 2) {
    return { success: false, error: '用户名至少2个字符' };
  }
  if (!email || !isValidEmail(email)) {
    return { success: false, error: '请输入有效的邮箱地址' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: '密码至少6个字符' };
  }

  const existingByEmail = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingByEmail) {
    return { success: false, error: '该邮箱已被注册' };
  }

  const existingByUsername = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existingByUsername) {
    return { success: false, error: '该用户名已被使用' };
  }

  const hashedPassword = await hashPassword(password);
  const now = getNow();

  const user = {
    id: db.nextUserId++,
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    created_at: now,
    updated_at: now,
  };

  db.users.push(user);
  writeDb(db);

  seedDefaultDataForUser(user.id);

  const token = generateToken(user);

  return {
    success: true,
    user: sanitizeUser(user),
    token,
    message: '注册成功',
  };
};

const loginUser = async ({ email, password }) => {
  const db = getDb();

  if (!email || !password) {
    return { success: false, error: '请输入邮箱和密码' };
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return { success: false, error: '邮箱或密码错误' };
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return { success: false, error: '邮箱或密码错误' };
  }

  const token = generateToken(user);

  return {
    success: true,
    user: sanitizeUser(user),
    token,
    message: '登录成功',
  };
};

const getCurrentUser = (userId) => {
  const db = getDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;
  return sanitizeUser(user);
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
