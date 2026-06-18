import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleFavorite } from '../api.js';

function difficultyClass(diff) {
  if (diff === '简单') return 'easy';
  if (diff === '中等') return 'medium';
  return 'hard';
}

function RecipeCard({ recipe, onToggleFavorite }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    try {
      await toggleFavorite(recipe.id);
      if (onToggleFavorite) onToggleFavorite(recipe.id);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={`recipe-card ${recipe.favorite ? 'favorite' : ''}`} onClick={handleCardClick}>
      <div className="card-header">
        <div className="card-title">{recipe.name}</div>
        <button
          className={`favorite-btn ${recipe.favorite ? 'active' : 'inactive'}`}
          onClick={handleFavoriteClick}
          title={recipe.favorite ? '取消收藏' : '收藏'}
        >
          ★
        </button>
      </div>
      <div className="card-ingredients">{recipe.ingredients || '暂无食材信息'}</div>
      <div className="card-footer">
        <span className="time-info">⏱ {recipe.cookingTime} 分钟</span>
        <span className={`difficulty-tag ${difficultyClass(recipe.difficulty)}`}>
          {recipe.difficulty}
        </span>
      </div>
    </div>
  );
}

export default RecipeCard;
