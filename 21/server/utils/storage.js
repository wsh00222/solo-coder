const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'books.json');

function ensureDataFile() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

function readBooks() {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data || '[]');
}

function writeBooks(books) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), 'utf8');
}

module.exports = { readBooks, writeBooks, ensureDataFile };
