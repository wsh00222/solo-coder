const BookService = require('../services/BookService');

class BookController {
  static async getAllBooks(req, res, next) {
    try {
      const result = BookService.getAllBooks(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getBookById(req, res, next) {
    try {
      const book = BookService.getBookById(req.params.id);
      res.json(book);
    } catch (err) {
      next(err);
    }
  }

  static async createBook(req, res, next) {
    try {
      const book = BookService.createBook(req.body);
      res.status(201).json(book);
    } catch (err) {
      next(err);
    }
  }

  static async quickAddBook(req, res, next) {
    try {
      const { title, author } = req.body;
      const book = BookService.quickAddBook(title, author);
      res.status(201).json({ message: '书籍添加成功', book });
    } catch (err) {
      next(err);
    }
  }

  static async updateBook(req, res, next) {
    try {
      const book = BookService.updateBook(req.params.id, req.body);
      res.json(book);
    } catch (err) {
      next(err);
    }
  }

  static async deleteBook(req, res, next) {
    try {
      BookService.deleteBook(req.params.id);
      res.json({ message: '删除成功' });
    } catch (err) {
      next(err);
    }
  }

  static async updateRating(req, res, next) {
    try {
      const { rating } = req.body;
      const book = BookService.updateBookRating(req.params.id, rating);
      res.json(book);
    } catch (err) {
      next(err);
    }
  }

  static async updateProgress(req, res, next) {
    try {
      const { current_pages, total_pages } = req.body;
      const book = BookService.updateBookProgress(req.params.id, current_pages, total_pages);
      res.json(book);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BookController;
