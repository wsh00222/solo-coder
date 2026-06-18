import React, { useState, useEffect } from 'react';

const GENRES = ['剧情', '喜剧', '动作', '科幻', '其他'];
const STATUSES = ['想看', '已看', '二刷'];

export default function MovieForm({ initial, onSubmit, onCancel, submitText }) {
  const [form, setForm] = useState({
    title: '',
    director: '',
    year: new Date().getFullYear(),
    genre: '剧情',
    rating: '',
    watchDate: '',
    status: '想看',
    notes: ''
  });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        director: initial.director || '',
        year: initial.year || new Date().getFullYear(),
        genre: initial.genre || '剧情',
        rating: initial.rating === null || initial.rating === undefined ? '' : String(initial.rating),
        watchDate: initial.watchDate || '',
        status: initial.status || '想看',
        notes: initial.notes || ''
      });
    }
  }, [initial]);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const errs = [];
    if (!form.title.trim()) errs.push('片名不能为空');
    if (!form.director.trim()) errs.push('导演不能为空');
    const y = parseInt(form.year, 10);
    if (isNaN(y) || y < 1800 || y > 2100) errs.push('上映年份必须在 1800-2100 之间');
    if (form.rating !== '') {
      const r = parseInt(form.rating, 10);
      if (isNaN(r) || r < 1 || r > 10) errs.push('评分必须是 1-10 的整数');
    }
    if (form.watchDate && isNaN(new Date(form.watchDate).getTime())) errs.push('观看日期无效');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      rating: form.rating === '' ? null : parseInt(form.rating, 10),
      watchDate: form.watchDate || null,
      year: parseInt(form.year, 10)
    };
    onSubmit && onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label"><span className="req">*</span> 片名</label>
        <input className="input form-input" value={form.title}
          onChange={(e) => upd('title', e.target.value)} placeholder="输入电影片名" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label"><span className="req">*</span> 导演</label>
          <input className="input form-input" value={form.director}
            onChange={(e) => upd('director', e.target.value)} placeholder="导演姓名" />
        </div>
        <div className="form-group">
          <label className="form-label"><span className="req">*</span> 上映年份</label>
          <input className="input form-input" type="number" value={form.year}
            onChange={(e) => upd('year', e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label"><span className="req">*</span> 类型</label>
          <select className="select form-input" value={form.genre}
            onChange={(e) => upd('genre', e.target.value)}>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label"><span className="req">*</span> 状态</label>
          <select className="select form-input" value={form.status}
            onChange={(e) => upd('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">评分（1-10 整数）</label>
          <input className="input form-input" type="number" min="1" max="10" value={form.rating}
            onChange={(e) => upd('rating', e.target.value)} placeholder="1-10，可选" />
        </div>
        <div className="form-group">
          <label className="form-label">观看日期</label>
          <input className="input form-input" type="date" value={form.watchDate}
            onChange={(e) => upd('watchDate', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">备注（可选）</label>
        <textarea className="textarea form-input" value={form.notes}
          onChange={(e) => upd('notes', e.target.value)} placeholder="写点感想..." rows="3" />
      </div>
      {errors.length > 0 && (
        <div className="form-error">
          {errors.map((e, i) => <div key={i}>· {e}</div>)}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
        {onCancel && <button type="button" className="btn" onClick={onCancel}>取消</button>}
        <button type="submit" className="btn btn-primary">{submitText || '保存'}</button>
      </div>
    </form>
  );
}
