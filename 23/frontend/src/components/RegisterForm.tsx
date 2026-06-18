import { useState, FormEvent } from 'react';

interface RegisterFormProps {
  onSubmit: (data: { name: string; phone: string; email?: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function RegisterForm({ onSubmit, onCancel, loading }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('请输入姓名');
    if (!/^1[3-9]\d{9}$/.test(phone)) return setError('请输入有效的手机号');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('请输入有效的邮箱');

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>
          姓名 <span className="required">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入您的姓名"
        />
      </div>

      <div className="form-group">
        <label>
          手机号 <span className="required">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="请输入手机号"
          maxLength={11}
        />
      </div>

      <div className="form-group">
        <label>邮箱（可选）</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="请输入邮箱"
        />
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          取消
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '提交中...' : '确认报名'}
        </button>
      </div>
    </form>
  );
}
