import app from './src';

const PORT = process.env.PORT || 29202;

app.listen(PORT, () => {
  console.log(`🚀 Travel Planner API server running on http://localhost:${PORT}`);
});
