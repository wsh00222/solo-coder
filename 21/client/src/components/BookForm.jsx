import { useState, useEffect } from 'react';
import StarRating from './StarRating.jsx';
import '../styles/components/BookForm.css';

function BookForm({ initialData, onSubmit, onCancel, submitText = '保存' }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: new Date().getFullYear(),
    genre: '小说',
    rating: 5,
    status: '想读'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        year: initialData.year || new Date().getFullYear(),
        genre: initialData.genre || '小说',
        rating: initialData.rating || 5,
        status: initialData.status || '想读'
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入书名';
    }

    if (!formData.author.trim()) {
      newErrors.author = '请输入作者';
    }

    const yearNum = Number(formData.year);
    if (!formData.year || isNaN(yearNum) || yearNum < 0 || yearNum > new Date().getFullYear() + 5) {
      newErrors.year = '请输入有效的出版年份';
    }

    if (!Number.isInteger(formData.rating) || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = '评分必须为 1-5 的整数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        year: Number(formData.year),
        rating: Number(formData.rating)
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="book-form">
      <div className="form-group">
        <label className="form-label">📖 书名 *</label>
        <input
          type="text"
          className={`form-input ${errors.title ? 'input-error' : ''}`}
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="请输入书名"
        />
        {errors.title && <p className="form-error">{errors.title}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">✍️ 作者 *</label>
        <input
          type="text"
          className={`form-input ${errors.author ? 'input-error' : ''}`}
          value={formData.author}
          onChange={(e) => handleChange('author', e.target.value)}
          placeholder="请输入作者姓名"
        />
        {errors.author && <p className="form-error">{errors.author}</p>}
      </div>

      <div className="form-row">
        <div className="form-group form-group-half">
          <label className="form-label">📅 出版年份 *</label>
          <input
            type="number"
            className={`form-input ${errors.year ? 'input-error' : ''}`}
            value={formData.year}
            onChange={(e) => handleChange('year', e.target.value)}
            placeholder="2024"
            min="0"
            max={new Date().getFullYear() + 5}
          />
          {errors.year && <p className="form-error">{errors.year}</p>}
        </div>

        <div className="form-group form-group-half">
          <label className="form-label">📚 类型 *</label>
          <select
            className="form-select"
            value={formData.genre}
            onChange={(e) => handleChange('genre', e.target.value)}
          >
            <option value="小说">小说</option>
            <option value="科技">科技</option>
            <option value="生活">生活</option>
            <option value="其他">其他</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">📌 阅读状态 *</label>
        <div className="status-options">
          {['想读', '在读', '读完'].map((status) => (
            <label
              key={status}
              className={`status-option ${formData.status === status ? 'selected' : ''}`}
              style={{
                '--status-color': status === '想读' ? '#3498db' : status === '在读' ? '#e67e22' : '#27ae60'
              }}
            >
              <input
                type="radio"
                name="status"
                value={status}
                checked={formData.status === status}
                onChange={(e) => handleChange('status', e.target.value)}
                style={{ display: 'none' }}
              />
              <span className="status-text">{status}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          ⭐ 评分 * {errors.rating && <span className="form-error-inline">{errors.rating}</span>}
        </label>
        <div className="rating-input-wrapper">
          <StarRating
            rating={formData.rating}
            interactive={true}
            onChange={(value) => handleChange('rating', value)}
            size="large"
          />
          <span className="rating-number">{formData.rating} 星</span>
        </div>
        <p className="form-hint">点击星星选择 1-5 星评分</p>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          取消
        </button>
        <button type="submit" className="btn btn-primary">
          {submitText}
        </button>
      </div>
    </form>
  );
}

export default BookForm;
