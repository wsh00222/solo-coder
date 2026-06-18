const { getDB } = require('../db');

class StatsModel {
  static getGlobalStats() {
    const db = getDB();
    const books = db.books;

    const totalBooks = books.length;

    const statusCounts = { want_to_read: 0, reading: 0, finished: 0 };
    books.forEach((b) => {
      if (statusCounts.hasOwnProperty(b.status)) statusCounts[b.status] += 1;
    });

    const rated = books.filter((b) => b.rating > 0);
    const avgRating = rated.length > 0
      ? Number((rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1))
      : 0;

    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const newThisMonth = books.filter((b) => {
      const d = new Date(b.created_at);
      return d.getFullYear() === y && d.getMonth() === m;
    }).length;

    return { totalBooks, statusCounts, avgRating, newThisMonth };
  }
}

module.exports = StatsModel;
