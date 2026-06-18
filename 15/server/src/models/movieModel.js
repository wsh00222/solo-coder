const { getStore, persist } = require('../db/database');

const movieModel = {
  findAll(filters = {}) {
    let list = [...getStore().movies];

    if (filters.status && filters.status !== 'all') {
      list = list.filter(m => m.status === filters.status);
    }
    if (filters.genre && filters.genre !== 'all') {
      list = list.filter(m => m.genre === filters.genre);
    }
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(kw));
    }

    if (filters.sortBy === 'rating-desc') {
      list.sort((a, b) => {
        const ar = a.rating === null ? -1 : a.rating;
        const br = b.rating === null ? -1 : b.rating;
        if (br !== ar) return br - ar;
        return b.year - a.year;
      });
    } else if (filters.sortBy === 'rating-asc') {
      list.sort((a, b) => {
        const ar = a.rating === null ? 999 : a.rating;
        const br = b.rating === null ? 999 : b.rating;
        if (ar !== br) return ar - br;
        return b.year - a.year;
      });
    } else if (filters.sortBy === 'year-desc') {
      list.sort((a, b) => b.year - a.year || (new Date(b.createdAt) - new Date(a.createdAt)));
    } else if (filters.sortBy === 'year-asc') {
      list.sort((a, b) => a.year - b.year || (new Date(b.createdAt) - new Date(a.createdAt)));
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  },

  findById(id) {
    return getStore().movies.find(m => m.id === Number(id)) || null;
  },

  create(data) {
    const store = getStore();
    const movie = {
      ...data,
      id: store.nextId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.movies.push(movie);
    persist();
    return movie;
  },

  update(id, data) {
    const store = getStore();
    const idx = store.movies.findIndex(m => m.id === Number(id));
    if (idx === -1) return null;
    store.movies[idx] = {
      ...store.movies[idx],
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString()
    };
    persist();
    return store.movies[idx];
  },

  delete(id) {
    const store = getStore();
    const before = store.movies.length;
    store.movies = store.movies.filter(m => m.id !== Number(id));
    persist();
    return { changes: before - store.movies.length };
  },

  deleteMany(ids) {
    const store = getStore();
    const idSet = new Set(ids.map(Number));
    const before = store.movies.length;
    store.movies = store.movies.filter(m => !idSet.has(m.id));
    persist();
    return { changes: before - store.movies.length };
  },

  updateManyStatus(ids, status) {
    const store = getStore();
    const idSet = new Set(ids.map(Number));
    const now = new Date().toISOString();
    let count = 0;
    store.movies.forEach(m => {
      if (idSet.has(m.id)) {
        m.status = status;
        m.updatedAt = now;
        count++;
      }
    });
    persist();
    return { changes: count };
  },

  getStats() {
    const movies = getStore().movies;
    const total = movies.length;
    const watchedMovies = movies.filter(m => m.status === '已看' || m.status === '二刷');
    const watched = watchedMovies.length;
    const rated = watchedMovies.filter(m => m.rating !== null);
    const sum = rated.reduce((s, m) => s + m.rating, 0);
    const avgRating = rated.length > 0 ? Number((sum / rated.length).toFixed(1)) : 0;

    const sorted = [...rated].sort((a, b) => b.rating - a.rating || b.year - a.year);
    const topMovie = sorted[0] ? { title: sorted[0].title, rating: sorted[0].rating } : null;

    return { total, watched, avgRating, topMovie };
  },

  getRatingDistribution() {
    const dist = {};
    for (let i = 1; i <= 10; i++) dist[i] = 0;
    const watched = getStore().movies.filter(m =>
      (m.status === '已看' || m.status === '二刷') && m.rating !== null
    );
    watched.forEach(m => {
      if (m.rating >= 1 && m.rating <= 10) dist[m.rating]++;
    });
    return dist;
  },

  getRandomRecommendation() {
    const candidates = getStore().movies.filter(m =>
      (m.status === '已看' || m.status === '二刷') && m.rating !== null && m.rating >= 7
    );
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
};

module.exports = movieModel;
