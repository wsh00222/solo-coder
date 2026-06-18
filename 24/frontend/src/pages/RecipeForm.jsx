import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipe, createRecipe, updateRecipe } from '../api.js';

function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    ingredients: '',
    steps: '',
    cookingTime: '',
    difficulty: '简单'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showTimeConfirm, setShowTimeConfirm] = useState(false);
  const [originalTime, setOriginalTime] = useState(null);

  useEffect(() => {
    if (isEdit) {
      loadRecipe();
    }
  }, [id]);

  async function loadRecipe() {
    setLoading(true);
    try {
      const data = await getRecipe(id);
      setFormData({
        name: data.name,
        ingredients: data.ingredients || '',
        steps: data.steps || '',
        cookingTime: String(data.cookingTime),
        difficulty: data.difficulty
      });
      setOriginalTime(data.cookingTime);
    } catch (err) {
      alert(err.message);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  function validate() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '食谱名称不能为空';
    }

    const timeNum = Number(formData.cookingTime);
    if (!formData.cookingTime || !Number.isInteger(timeNum) || timeNum <= 0) {
      newErrors.cookingTime = '烹饪时间必须为正整数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function submitForm() {
    try {
      const data = {
        ...formData,
        cookingTime: Number(formData.cookingTime)
      };

      if (isEdit) {
        await updateRecipe(id, data);
        alert('更新成功');
      } else {
        await createRecipe(data);
        alert('添加成功');
      }
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    if (isEdit && originalTime !== null) {
      const newTime = Number(formData.cookingTime);
      if (newTime < originalTime) {
        setShowTimeConfirm(true);
        return;
      }
    }

    submitForm();
  }

  if (loading && isEdit) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="form-page">
      <Link to="/" className="back-link">← 返回列表</Link>

      <h2>{isEdit ? '编辑食谱' : '添加食谱'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>食谱名称 *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="请输入食谱名称"
          />
          {errors.name && <div className="error-text">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label>主要食材</label>
          <input
            type="text"
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            placeholder="例如：鸡蛋3个、番茄2个"
          />
        </div>

        <div className="form-group">
          <label>制作步骤</label>
          <textarea
            name="steps"
            value={formData.steps}
            onChange={handleChange}
            placeholder="请输入详细的制作步骤..."
            rows={6}
          />
        </div>

        <div className="form-group">
          <label>烹饪时间（分钟） *</label>
          <input
            type="number"
            name="cookingTime"
            value={formData.cookingTime}
            onChange={handleChange}
            placeholder="请输入正整数"
            min="1"
          />
          {errors.cookingTime && <div className="error-text">{errors.cookingTime}</div>}
        </div>

        <div className="form-group">
          <label>难度 *</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
          >
            <option value="简单">简单</option>
            <option value="中等">中等</option>
            <option value="困难">困难</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            取消
          </button>
          <button type="submit" className="btn btn-primary">
            {isEdit ? '保存修改' : '添加食谱'}
          </button>
        </div>
      </form>

      {showTimeConfirm && (
        <div className="modal-overlay" onClick={() => setShowTimeConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>缩短烹饪时间</h3>
            <p>缩短时间可能影响成品效果，确认要继续吗？</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowTimeConfirm(false)}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowTimeConfirm(false);
                  submitForm();
                }}
              >
                确认继续
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeForm;
