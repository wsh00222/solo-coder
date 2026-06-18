import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecipes, getRecipeStats } from '../api.js';
import RecipeCard from '../components/RecipeCard.jsx';

function RecipeList() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState({ total: 0, favoriteCount: 0, avgTime: 0 });
  const [difficulty, setDifficulty] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [list, statsData] = await Promise.all([
        getRecipes({ difficulty, keyword }),
        getRecipeStats()
      ]);
      setRecipes(list);
      setStats(statsData);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [difficulty, keyword]);

  const handleToggleFavorite = () => {
    loadData();
  };

  const filteredCount = recipes.length;

  return (
    <div>
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">总食谱数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.favoriteCount}</div>
          <div className="stat-label">收藏数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgTime}</div>
          <div className="stat-label">平均烹饪时间（分钟）</div>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 搜索食谱名称..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="全部">全部难度</option>
          <option value="简单">简单</option>
          <option value="中等">中等</option>
          <option value="困难">困难</option>
        </select>
        <button className="btn btn-primary" onClick={() => navigate('/add')}>
          + 添加食谱
        </button>
      </div>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <div className="empty-title">暂无食谱</div>
          <div className="empty-desc">
            {stats.total === 0 ? '还没有任何食谱，快来添加你的第一道菜谱吧！' : '没有找到符合条件的食谱'}
          </div>
          {stats.total === 0 && (
            <button className="btn btn-primary" onClick={() => navigate('/add')}>
              + 添加食谱
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
          <div className="list-footer">共 {filteredCount} 个食谱</div>
        </>
      )}
    </div>
  );
}

export default RecipeList;
