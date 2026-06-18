import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipe, deleteRecipe } from '../api.js';

function difficultyClass(diff) {
  if (diff === '简单') return 'easy';
  if (diff === '中等') return 'medium';
  return 'hard';
}

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  async function loadRecipe() {
    setLoading(true);
    try {
      const data = await getRecipe(id);
      setRecipe(data);
    } catch (err) {
      alert(err.message);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteRecipe(id);
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!recipe) {
    return <div className="loading">食谱不存在</div>;
  }

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">← 返回列表</Link>

      <h1 className="detail-title">
        {recipe.name}
        {recipe.favorite && <span style={{ color: '#ffa502' }}>★</span>}
      </h1>

      <div className="detail-meta">
        <span className="meta-item">⏱ {recipe.cookingTime} 分钟</span>
        <span className={`difficulty-tag ${difficultyClass(recipe.difficulty)}`}>
          {recipe.difficulty}
        </span>
        {recipe.favorite && (
          <span className="meta-item" style={{ color: '#ffa502' }}>已收藏</span>
        )}
      </div>

      <div className="detail-section">
        <h3>🥬 主要食材</h3>
        <p>{recipe.ingredients || '暂无食材信息'}</p>
      </div>

      <div className="detail-section">
        <h3>📝 制作步骤</h3>
        <pre>{recipe.steps || '暂无步骤信息'}</pre>
      </div>

      <div className="detail-actions">
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/edit/${id}`)}
        >
          ✏️ 编辑
        </button>
        <button
          className="btn btn-danger"
          onClick={() => setShowDeleteModal(true)}
        >
          🗑️ 删除
        </button>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>确认删除</h3>
            <p>确定要删除「{recipe.name}」吗？此操作不可撤销。</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                取消
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeDetail;
