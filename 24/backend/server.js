const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'recipes.json');

app.use(cors());
app.use(express.json());

function readRecipes() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeRecipes(recipes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(recipes, null, 2), 'utf-8');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

app.get('/api/recipes', (req, res) => {
  let recipes = readRecipes();
  const { difficulty, keyword } = req.query;

  if (difficulty && difficulty !== '全部') {
    recipes = recipes.filter(r => r.difficulty === difficulty);
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    recipes = recipes.filter(r => r.name.toLowerCase().includes(kw));
  }

  const favorites = recipes.filter(r => r.favorite);
  const others = recipes.filter(r => !r.favorite);
  recipes = [...favorites, ...others];

  res.json(recipes);
});

app.get('/api/recipes/stats', (req, res) => {
  const recipes = readRecipes();
  const total = recipes.length;
  const favoriteCount = recipes.filter(r => r.favorite).length;
  const avgTime = total > 0
    ? Math.round(recipes.reduce((sum, r) => sum + r.cookingTime, 0) / total)
    : 0;

  res.json({
    total,
    favoriteCount,
    avgTime: Math.round(avgTime)
  });
});

app.get('/api/recipes/:id', (req, res) => {
  const recipes = readRecipes();
  const recipe = recipes.find(r => r.id === req.params.id);

  if (!recipe) {
    return res.status(404).json({ error: '食谱不存在' });
  }

  res.json(recipe);
});

app.post('/api/recipes', (req, res) => {
  const { name, ingredients, steps, cookingTime, difficulty } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: '食谱名称不能为空' });
  }

  if (!cookingTime || !Number.isInteger(Number(cookingTime)) || Number(cookingTime) <= 0) {
    return res.status(400).json({ error: '烹饪时间必须为正整数' });
  }

  const validDifficulties = ['简单', '中等', '困难'];
  if (!validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: '难度值无效' });
  }

  const recipes = readRecipes();
  const newRecipe = {
    id: generateId(),
    name: name.trim(),
    ingredients: ingredients || '',
    steps: steps || '',
    cookingTime: Number(cookingTime),
    difficulty,
    favorite: false
  };

  recipes.push(newRecipe);
  writeRecipes(recipes);
  res.status(201).json(newRecipe);
});

app.put('/api/recipes/:id', (req, res) => {
  const { name, ingredients, steps, cookingTime, difficulty, favorite } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: '食谱名称不能为空' });
  }

  if (cookingTime !== undefined) {
    if (!Number.isInteger(Number(cookingTime)) || Number(cookingTime) <= 0) {
      return res.status(400).json({ error: '烹饪时间必须为正整数' });
    }
  }

  const recipes = readRecipes();
  const index = recipes.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: '食谱不存在' });
  }

  const original = recipes[index];
  const updated = {
    ...original,
    name: name.trim(),
    ingredients: ingredients !== undefined ? ingredients : original.ingredients,
    steps: steps !== undefined ? steps : original.steps,
    cookingTime: cookingTime !== undefined ? Number(cookingTime) : original.cookingTime,
    difficulty: difficulty || original.difficulty,
    favorite: favorite !== undefined ? favorite : original.favorite
  };

  recipes[index] = updated;
  writeRecipes(recipes);
  res.json(updated);
});

app.patch('/api/recipes/:id/favorite', (req, res) => {
  const recipes = readRecipes();
  const index = recipes.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: '食谱不存在' });
  }

  recipes[index].favorite = !recipes[index].favorite;
  writeRecipes(recipes);
  res.json({ id: recipes[index].id, favorite: recipes[index].favorite });
});

app.delete('/api/recipes/:id', (req, res) => {
  const recipes = readRecipes();
  const index = recipes.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: '食谱不存在' });
  }

  recipes.splice(index, 1);
  writeRecipes(recipes);
  res.json({ message: '删除成功' });
});

app.listen(PORT, () => {
  console.log(`Recipe API server running at http://localhost:${PORT}`);
});
