const API_BASE = '/api';

export async function getRecipes({ difficulty, keyword } = {}) {
  const params = new URLSearchParams();
  if (difficulty) params.set('difficulty', difficulty);
  if (keyword) params.set('keyword', keyword);
  const url = `${API_BASE}/recipes${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('获取食谱列表失败');
  return res.json();
}

export async function getRecipeStats() {
  const res = await fetch(`${API_BASE}/recipes/stats`);
  if (!res.ok) throw new Error('获取统计数据失败');
  return res.json();
}

export async function getRecipe(id) {
  const res = await fetch(`${API_BASE}/recipes/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('食谱不存在');
    throw new Error('获取食谱失败');
  }
  return res.json();
}

export async function createRecipe(data) {
  const res = await fetch(`${API_BASE}/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || '添加食谱失败');
  return body;
}

export async function updateRecipe(id, data) {
  const res = await fetch(`${API_BASE}/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || '更新食谱失败');
  return body;
}

export async function toggleFavorite(id) {
  const res = await fetch(`${API_BASE}/recipes/${id}/favorite`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('操作失败');
  return res.json();
}

export async function deleteRecipe(id) {
  const res = await fetch(`${API_BASE}/recipes/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('删除失败');
  return res.json();
}
