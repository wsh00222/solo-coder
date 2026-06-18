const BookModel = require('../models/BookModel');

class BookService {
  static getAllBooks(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 6;
    const { status, genre, sort } = query;

    const validStatuses = ['want_to_read', 'reading', 'finished'];
    const validGenres = ['novel', 'tech', 'life', 'other'];
    const validSorts = ['title', 'rating'];

    return BookModel.findAll({
      status: validStatuses.includes(status) ? status : null,
      genre: validGenres.includes(genre) ? genre : null,
      sort: validSorts.includes(sort) ? sort : null,
      page,
      limit,
    });
  }

  static getBookById(id) {
    const book = BookModel.findById(id);
    if (!book) {
      const error = new Error('书籍不存在');
      error.statusCode = 404;
      throw error;
    }
    return book;
  }

  static createBook(data) {
    if (!data.title || !data.author) {
      const error = new Error('书名和作者不能为空');
      error.statusCode = 400;
      throw error;
    }

    const validData = this._validateBookData(data);
    return BookModel.create(validData);
  }

  static quickAddBook(title, author) {
    if (!title || !author) {
      const error = new Error('书名和作者不能为空');
      error.statusCode = 400;
      throw error;
    }
    return BookModel.quickCreate(title.trim(), author.trim());
  }

  static updateBook(id, data) {
    this.getBookById(id);
    const validData = this._validateBookData(data);
    const result = BookModel.update(id, validData);
    if (!result) {
      const error = new Error('更新失败');
      error.statusCode = 500;
      throw error;
    }
    return result;
  }

  static deleteBook(id) {
    this.getBookById(id);
    const deleted = BookModel.delete(id);
    if (!deleted) {
      const error = new Error('删除失败');
      error.statusCode = 500;
      throw error;
    }
    return true;
  }

  static updateBookRating(id, rating) {
    this.getBookById(id);
    const r = parseInt(rating);
    if (isNaN(r) || r < 0 || r > 5) {
      const error = new Error('评分必须是 0-5 之间的整数');
      error.statusCode = 400;
      throw error;
    }
    return BookModel.updateRating(id, r);
  }

  static updateBookProgress(id, current_pages, total_pages) {
    this.getBookById(id);
    const cp = parseInt(current_pages);
    if (isNaN(cp) || cp < 0) {
      const error = new Error('当前页数必须是非负整数');
      error.statusCode = 400;
      throw error;
    }

    let tp = null;
    if (total_pages !== undefined && total_pages !== null && total_pages !== '') {
      tp = parseInt(total_pages);
      if (isNaN(tp) || tp <= 0) {
        const error = new Error('总页数必须是正整数');
        error.statusCode = 400;
        throw error;
      }
      if (cp > tp) {
        const error = new Error('当前页数不能超过总页数');
        error.statusCode = 400;
        throw error;
      }
    }

    return BookModel.updateProgress(id, cp, tp);
  }

  static _validateBookData(data) {
    const result = {};

    if (data.title !== undefined) result.title = String(data.title).trim();
    if (data.author !== undefined) result.author = String(data.author).trim();

    if (data.publish_year !== undefined && data.publish_year !== null && data.publish_year !== '') {
      const y = parseInt(data.publish_year);
      if (!isNaN(y) && y > 0) result.publish_year = y;
      else result.publish_year = null;
    } else {
      result.publish_year = null;
    }

    const validGenres = ['novel', 'tech', 'life', 'other'];
    result.genre = validGenres.includes(data.genre) ? data.genre : 'other';

    if (data.rating !== undefined) {
      const r = parseInt(data.rating);
      result.rating = (isNaN(r) || r < 0 || r > 5) ? 0 : r;
    }

    const validStatuses = ['want_to_read', 'reading', 'finished'];
    result.status = validStatuses.includes(data.status) ? data.status : 'want_to_read';

    if (data.current_pages !== undefined) {
      const cp = parseInt(data.current_pages);
      result.current_pages = (isNaN(cp) || cp < 0) ? 0 : cp;
    }

    if (data.total_pages !== undefined && data.total_pages !== null && data.total_pages !== '') {
      const tp = parseInt(data.total_pages);
      result.total_pages = (!isNaN(tp) && tp > 0) ? tp : null;
    }

    return result;
  }
}

module.exports = BookService;
