const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const DB_PATH = path.join(DATA_DIR, 'ledger.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readAll() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), 'utf-8')
    return []
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
}

function writeAll(records) {
  fs.writeFileSync(DB_PATH, JSON.stringify(records, null, 2), 'utf-8')
}

module.exports = { readAll, writeAll }
