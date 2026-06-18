const movieService = require('../services/movieService');

function handleError(res, err) {
  const status = err.status || 500;
  const message = err.message || '服务器错误';
  res.status(status).json({ error: message });
}

const movieController = {
  async list(req, res) {
    try {
      const filters = {
        status: req.query.status || 'all',
        genre: req.query.genre || 'all',
        keyword: req.query.keyword || '',
        sortBy: req.query.sortBy || 'createdAt'
      };
      const movies = movieService.getAllMovies(filters);
      res.json({ data: movies });
    } catch (err) {
      handleError(res, err);
    }
  },

  async getById(req, res) {
    try {
      const movie = movieService.getMovieById(parseInt(req.params.id, 10));
      res.json({ data: movie });
    } catch (err) {
      handleError(res, err);
    }
  },

  async create(req, res) {
    try {
      const movie = movieService.createMovie(req.body);
      res.status(201).json({ data: movie });
    } catch (err) {
      handleError(res, err);
    }
  },

  async update(req, res) {
    try {
      const movie = movieService.updateMovie(parseInt(req.params.id, 10), req.body);
      res.json({ data: movie });
    } catch (err) {
      handleError(res, err);
    }
  },

  async remove(req, res) {
    try {
      movieService.deleteMovie(parseInt(req.params.id, 10));
      res.json({ message: '删除成功' });
    } catch (err) {
      handleError(res, err);
    }
  },

  async batchDelete(req, res) {
    try {
      const { ids } = req.body;
      movieService.batchDelete(ids);
      res.json({ message: '批量删除成功' });
    } catch (err) {
      handleError(res, err);
    }
  },

  async batchUpdateStatus(req, res) {
    try {
      const { ids, status } = req.body;
      movieService.batchUpdateStatus(ids, status);
      res.json({ message: '批量修改成功' });
    } catch (err) {
      handleError(res, err);
    }
  },

  async markAsWatched(req, res) {
    try {
      const { rating } = req.body;
      const movie = movieService.markAsWatched(parseInt(req.params.id, 10), rating);
      res.json({ data: movie });
    } catch (err) {
      handleError(res, err);
    }
  },

  async stats(req, res) {
    try {
      const stats = movieService.getStats();
      res.json({ data: stats });
    } catch (err) {
      handleError(res, err);
    }
  },

  async ratingDistribution(req, res) {
    try {
      const dist = movieService.getRatingDistribution();
      res.json({ data: dist });
    } catch (err) {
      handleError(res, err);
    }
  },

  async recommend(req, res) {
    try {
      const movie = movieService.getRandomRecommendation();
      if (!movie) {
        return res.json({ data: null, message: '暂无推荐' });
      }
      res.json({ data: movie });
    } catch (err) {
      handleError(res, err);
    }
  },

  async meta(req, res) {
    try {
      const meta = movieService.getMeta();
      res.json({ data: meta });
    } catch (err) {
      handleError(res, err);
    }
  }
};

module.exports = movieController;
