const { getDB, persist, now } = require('../db');

class BookModel {
  static findAll({ status, genre, sort, page = 1, limit = 6 } = {}) {
    const db = getDB();
    let books = [...db.books];

    if (status) books = books.filter((b) => b.status === status);
    if (genre) books = books.filter((b) => b.genre === genre);

    if (sort === 'title') {
      books.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
    } else if (sort === 'rating') {
      books.sort((a, b) => (b.rating || 0) - (a.rating || 0) || new Date(b.updated_at) - new Date(a.updated_at));
    } else {
      books.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    const total = books.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paged = books.slice(offset, offset + limit);

    return { books: paged, total, page, limit, totalPages };
  }

  static findById(id) {
    const db = getDB();
    const book = db.books.find((b) => b.id === Number(id));
    if (!book) return null;
    const history = db.readingHistory
      .filter((h) => h.book_id === Number(id))
      .sort((a, b) => new Date(b.read_date) - new Date(a.read_date));
    return { ...book, readingHistory: history };
  }

  static create(data) {
    const db = getDB();
    db._meta.bookIdSeq += 1;
    const id = db._meta.bookIdSeq;
    const ts = now();
    const book = {
      id,
      title: data.title,
      author: data.author,
      publish_year: data.publish_year || null,
      genre: data.genre || 'other',
      rating: data.rating || 0,
      status: data.status || 'want_to_read',
      current_pages: data.current_pages || 0,
      total_pages: data.total_pages || null,
      created_at: ts,
      updated_at: ts,
    };
    db.books.push(book);
    persist();
    return this.findById(id);
  }

  static quickCreate(title, author) {
    return this.create({
      title,
      author,
      genre: 'other',
      status: 'want_to_read',
      rating: 0,
      current_pages: 0,
      total_pages: null,
    });
  }

  static update(id, data) {
    const db = getDB();
    const idx = db.books.findIndex((b) => b.id === Number(id));
    if (idx === -1) return null;
    const existing = db.books[idx];
    const merged = { ...existing, ...data, id: existing.id, created_at: existing.created_at, updated_at: now() };
    db.books[idx] = merged;
    persist();
    return this.findById(id);
  }

  static delete(id) {
    const db = getDB();
    const before = db.books.length;
    db.books = db.books.filter((b) => b.id !== Number(id));
    db.readingHistory = db.readingHistory.filter((h) => h.book_id !== Number(id));
    persist();
    return db.books.length < before;
  }

  static updateRating(id, rating) {
    const db = getDB();
    const book = db.books.find((b) => b.id === Number(id));
    if (!book) return null;
    book.rating = rating;
    book.updated_at = now();
    persist();
    return this.findById(id);
  }

  static updateProgress(id, current_pages, total_pages) {
    const db = getDB();
    const book = db.books.find((b) => b.id === Number(id));
    if (!book) return null;

    const newTotal = total_pages !== undefined ? total_pages : book.total_pages;
    const progressPercent = newTotal ? Number(((current_pages / newTotal) * 100).toFixed(2)) : null;

    book.current_pages = current_pages;
    book.total_pages = newTotal;
    book.updated_at = now();

    db._meta.historyIdSeq += 1;
    db.readingHistory.push({
      id: db._meta.historyIdSeq,
      book_id: Number(id),
      current_pages,
      total_pages: newTotal,
      progress_percent: progressPercent,
      read_date: now(),
    });

    persist();
    return this.findById(id);
  }
}

module.exports = BookModel;
