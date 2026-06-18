const movieModel = require('../models/movieModel');

const GENRES = ['剧情', '喜剧', '动作', '科幻', '其他'];
const STATUSES = ['想看', '已看', '二刷'];

function validateMovie(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.title !== undefined) {
    if (!data.title || String(data.title).trim() === '') {
      errors.push('片名不能为空');
    }
  }
  if (!isUpdate || data.director !== undefined) {
    if (!data.director || String(data.director).trim() === '') {
      errors.push('导演不能为空');
    }
  }
  if (!isUpdate || data.year !== undefined) {
    const y = parseInt(data.year, 10);
    if (isNaN(y) || y < 1800 || y > 2100) {
      errors.push('上映年份必须在 1800-2100 之间');
    }
  }
  if (!isUpdate || data.genre !== undefined) {
    if (!GENRES.includes(data.genre)) {
      errors.push('类型必须是：剧情、喜剧、动作、科幻、其他');
    }
  }
  if (!isUpdate || data.status !== undefined) {
    if (!STATUSES.includes(data.status)) {
      errors.push('状态必须是：想看、已看、二刷');
    }
  }
  if (data.rating !== undefined && data.rating !== null) {
    const r = parseInt(data.rating, 10);
    if (isNaN(r) || r < 1 || r > 10) {
      errors.push('评分必须是 1-10 的整数');
    }
  }
  if (data.watchDate !== undefined && data.watchDate !== null) {
    const d = new Date(data.watchDate);
    if (isNaN(d.getTime())) {
      errors.push('观看日期格式无效');
    }
  }

  return errors;
}

function normalizeMovie(data) {
  const rating = data.rating === '' || data.rating === undefined || data.rating === null
    ? null : parseInt(data.rating, 10);
  const watchDate = !data.watchDate ? null : String(data.watchDate);
  const notes = data.notes || '';

  return {
    title: String(data.title || '').trim(),
    director: String(data.director || '').trim(),
    year: parseInt(data.year, 10),
    genre: data.genre,
    rating,
    watchDate,
    status: data.status,
    notes
  };
}

const movieService = {
  getAllMovies(filters) {
    return movieModel.findAll(filters);
  },

  getMovieById(id) {
    const movie = movieModel.findById(id);
    if (!movie) throw { status: 404, message: '电影不存在' };
    return movie;
  },

  createMovie(data) {
    const errors = validateMovie(data);
    if (errors.length > 0) throw { status: 400, message: errors.join('；') };
    const normalized = normalizeMovie(data);
    return movieModel.create(normalized);
  },

  updateMovie(id, data) {
    const existing = movieModel.findById(id);
    if (!existing) throw { status: 404, message: '电影不存在' };

    const merged = { ...existing, ...data };
    const errors = validateMovie(merged, true);
    if (errors.length > 0) throw { status: 400, message: errors.join('；') };

    const normalized = normalizeMovie(merged);
    return movieModel.update(id, normalized);
  },

  deleteMovie(id) {
    const existing = movieModel.findById(id);
    if (!existing) throw { status: 404, message: '电影不存在' };
    movieModel.delete(id);
    return true;
  },

  batchDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw { status: 400, message: '请选择要删除的电影' };
    }
    movieModel.deleteMany(ids);
    return true;
  },

  batchUpdateStatus(ids, status) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw { status: 400, message: '请选择要修改的电影' };
    }
    if (!STATUSES.includes(status)) {
      throw { status: 400, message: '状态无效' };
    }
    movieModel.updateManyStatus(ids, status);
    return true;
  },

  markAsWatched(id, rating) {
    const existing = movieModel.findById(id);
    if (!existing) throw { status: 404, message: '电影不存在' };

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let finalRating = null;
    if (rating !== undefined && rating !== null && rating !== '') {
      const r = parseInt(rating, 10);
      if (isNaN(r) || r < 1 || r > 10) {
        throw { status: 400, message: '评分必须是 1-10 的整数' };
      }
      finalRating = r;
    }

    const merged = {
      ...existing,
      status: '已看',
      watchDate: dateStr,
      rating: finalRating !== null ? finalRating : existing.rating
    };
    return movieModel.update(id, normalizeMovie(merged));
  },

  getStats() {
    return movieModel.getStats();
  },

  getRatingDistribution() {
    return movieModel.getRatingDistribution();
  },

  getRandomRecommendation() {
    return movieModel.getRandomRecommendation();
  },

  getMeta() {
    return { genres: GENRES, statuses: STATUSES };
  }
};

module.exports = movieService;
