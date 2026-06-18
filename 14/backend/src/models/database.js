const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'equipment.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let _db = null;
let _dirty = false;

function load() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      _db = JSON.parse(content);
    } catch (e) {
      console.warn('[DB] 数据库文件损坏，将重新初始化:', e.message);
      _db = createEmpty();
    }
  } else {
    _db = createEmpty();
  }
}

function createEmpty() {
  return {
    meta: { version: 1, createdAt: new Date().toISOString() },
    equipment: [],
    borrowRecords: [],
    sequences: { equipment: 0, borrowRecord: 0 }
  };
}

function save() {
  if (!_dirty) return;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(_db, null, 2), 'utf-8');
    _dirty = false;
  } catch (e) {
    console.error('[DB] 保存数据库失败:', e.message);
    throw e;
  }
}

setInterval(() => {
  if (_dirty) save();
}, 1000);

function nextId(collection) {
  if (!_db.sequences[collection]) _db.sequences[collection] = 0;
  _db.sequences[collection] += 1;
  _dirty = true;
  return _db.sequences[collection];
}

function initDatabase() {
  if (!_db) load();
}

function isDatabaseEmpty() {
  if (!_db) load();
  return _db.equipment.length === 0;
}

function seedSampleData() {
  if (!_db) load();
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  const eq1 = {
    id: nextId('equipment'),
    name: '投影仪',
    code: 'EQ-2024-001',
    model: 'EPSON CB-X51',
    location: 'A区-3楼-会议室301',
    status: 'available',
    created_at: now,
    updated_at: now
  };
  _db.equipment.push(eq1);

  const eq2 = {
    id: nextId('equipment'),
    name: '笔记本电脑',
    code: 'EQ-2024-002',
    model: 'ThinkPad X1 Carbon',
    location: 'B区-2楼-IT部',
    status: 'borrowed',
    created_at: now,
    updated_at: now
  };
  _db.equipment.push(eq2);

  const eq3 = {
    id: nextId('equipment'),
    name: '单反相机',
    code: 'EQ-2024-003',
    model: 'Canon EOS R6',
    location: 'C区-1楼-市场部',
    status: 'borrowed',
    created_at: now,
    updated_at: now
  };
  _db.equipment.push(eq3);

  const eq4 = {
    id: nextId('equipment'),
    name: '移动工作站',
    code: 'EQ-2024-004',
    model: 'Dell Precision 7780',
    location: 'A区-3楼-研发部',
    status: 'maintenance',
    created_at: now,
    updated_at: now
  };
  _db.equipment.push(eq4);

  _db.borrowRecords.push({
    id: nextId('borrowRecord'),
    equipment_id: eq2.id,
    borrower: '张三',
    reason: '外出拜访客户做演示',
    borrow_date: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
    expected_return_date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    actual_return_date: null,
    status: 'borrowing',
    created_at: now,
    updated_at: now
  });

  _db.borrowRecords.push({
    id: nextId('borrowRecord'),
    equipment_id: eq3.id,
    borrower: '李四',
    reason: '拍摄年会宣传视频',
    borrow_date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    expected_return_date: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    actual_return_date: null,
    status: 'borrowing',
    created_at: now,
    updated_at: now
  });

  _db.borrowRecords.push({
    id: nextId('borrowRecord'),
    equipment_id: eq2.id,
    borrower: '王五',
    reason: '内部培训使用',
    borrow_date: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
    expected_return_date: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
    actual_return_date: dayjs().subtract(11, 'day').format('YYYY-MM-DD'),
    status: 'returned',
    created_at: now,
    updated_at: now
  });

  _db.borrowRecords.push({
    id: nextId('borrowRecord'),
    equipment_id: eq1.id,
    borrower: '赵六',
    reason: '季度会议使用',
    borrow_date: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    expected_return_date: dayjs().subtract(25, 'day').format('YYYY-MM-DD'),
    actual_return_date: dayjs().subtract(26, 'day').format('YYYY-MM-DD'),
    status: 'returned',
    created_at: now,
    updated_at: now
  });

  _dirty = true;
  save();
  console.log('[DB] 示例数据初始化完成');
}

const db = {
  prepare(sql) {
    if (!_db) load();
    return new Statement(sql, _db, () => { _dirty = true; });
  },
  exec(sql) {
    if (!_db) load();
    const trimmed = sql.trim();
    const statements = trimmed.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      if (stmt.toUpperCase().startsWith('CREATE TABLE')) {
      } else if (stmt.toUpperCase().startsWith('CREATE INDEX')) {
      }
    }
  }
};

class Statement {
  constructor(sql, dbref, markDirty) {
    this.sql = sql.trim();
    this.db = dbref;
    this.markDirty = markDirty;
  }

  all(...params) {
    this._ensureParsed();
    return this._executeSelect(params);
  }

  get(...params) {
    this._ensureParsed();
    const rows = this._executeSelect(params);
    return rows.length > 0 ? rows[0] : undefined;
  }

  run(...params) {
    this._ensureParsed();
    return this._executeWrite(params);
  }

  _ensureParsed() {
    if (this._parsed) return;
    const sql = this.sql;
    const upper = sql.toUpperCase();

    if (upper.startsWith('SELECT')) {
      this._type = 'SELECT';
      this._parseSelect(sql);
    } else if (upper.startsWith('INSERT')) {
      this._type = 'INSERT';
      this._parseInsert(sql);
    } else if (upper.startsWith('UPDATE')) {
      this._type = 'UPDATE';
      this._parseUpdate(sql);
    } else if (upper.startsWith('DELETE')) {
      this._type = 'DELETE';
      this._parseDelete(sql);
    } else {
      this._type = 'OTHER';
    }
    this._parsed = true;
  }

  _tableFromName(name) {
    if (name === 'equipment') return this.db.equipment;
    if (name === 'borrow_record') return this.db.borrowRecords;
    return null;
  }

  _parseSelect(sql) {
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    const table = fromMatch ? fromMatch[1] : null;
    this._table = table;

    const whereMatch = sql.match(/WHERE\s+(.+?)(ORDER BY|$)/is);
    this._whereRaw = whereMatch ? whereMatch[1].trim() : null;

    const orderMatch = sql.match(/ORDER\s+BY\s+(.+?)$/is);
    if (orderMatch) {
      const orderClause = orderMatch[1].trim();
      const parts = orderClause.split(',').map(p => p.trim());
      this._order = parts.map(p => {
        const [field, dir = 'ASC'] = p.split(/\s+/);
        return { field, dir: dir.toUpperCase() };
      });
    } else {
      this._order = null;
    }
  }

  _executeSelect(params) {
    const collection = this._tableFromName(this._table);
    if (!collection) return [];
    let rows = [...collection];
    if (this._whereRaw) {
      const filter = this._buildFilter(this._whereRaw, params);
      rows = rows.filter(filter);
    }
    if (this._order) {
      rows.sort((a, b) => {
        for (const { field, dir } of this._order) {
          let va = a[field], vb = b[field];
          if (va == null && vb == null) continue;
          if (va == null) return 1;
          if (vb == null) return -1;
          if (va < vb) return dir === 'ASC' ? -1 : 1;
          if (va > vb) return dir === 'ASC' ? 1 : -1;
        }
        return 0;
      });
    }
    return rows;
  }

  _parseInsert(sql) {
    const intoMatch = sql.match(/INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES/i);
    this._table = intoMatch ? intoMatch[1] : null;
    this._insertColumns = intoMatch
      ? intoMatch[2].split(',').map(s => s.trim())
      : [];
  }

  _executeWrite(params) {
    let result = { changes: 0, lastInsertRowid: null };
    if (this._type === 'INSERT') {
      const collection = this._tableFromName(this._table);
      if (!collection) return result;
      const obj = {};
      const seqName = this._table === 'equipment' ? 'equipment' : 'borrowRecord';
      obj.id = nextId(seqName);
      this._insertColumns.forEach((col, idx) => {
        if (col === 'id') return;
        let val = params[idx];
        if (typeof val === 'string') {
          if (val === '' && (col === 'model' || col === 'location')) val = null;
        }
        obj[col] = val;
      });
      collection.push(obj);
      this.markDirty();
      result.changes = 1;
      result.lastInsertRowid = obj.id;
    } else if (this._type === 'UPDATE') {
      const collection = this._tableFromName(this._table);
      if (!collection) return result;
      const filter = this._whereRaw ? this._buildFilter(this._whereRaw, this._updateWhereParams) : () => true;
      let changes = 0;
      for (let i = 0; i < collection.length; i++) {
        if (filter(collection[i], i, collection)) {
          Object.assign(collection[i], this._updateSets);
          changes++;
        }
      }
      if (changes > 0) this.markDirty();
      result.changes = changes;
    } else if (this._type === 'DELETE') {
      const collection = this._tableFromName(this._table);
      if (!collection) return result;
      const filter = this._whereRaw ? this._buildFilter(this._whereRaw, params) : () => true;
      const before = collection.length;
      const newArr = collection.filter((r, i, arr) => !filter(r, i, arr));
      collection.length = 0;
      collection.push(...newArr);
      result.changes = before - collection.length;
      if (result.changes > 0) this.markDirty();
    }
    return result;
  }

  _parseUpdate(sql) {
    const tableMatch = sql.match(/UPDATE\s+(\w+)\s+SET/i);
    this._table = tableMatch ? tableMatch[1] : null;

    const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/is);
    const setClause = setMatch ? setMatch[1].trim() : sql.match(/SET\s+(.+?)$/is)?.[1].trim();
    this._updateSets = {};
    const setParams = [];
    if (setClause) {
      const parts = this._splitTopLevel(setClause, ',');
      for (const part of parts) {
        const eqIdx = part.indexOf('=');
        const field = part.slice(0, eqIdx).trim();
        let value = part.slice(eqIdx + 1).trim();
        if (value === '?') {
          setParams.push({ field });
        } else {
          value = this._parseLiteral(value);
          this._updateSets[field] = value;
        }
      }
    }

    const whereMatch = sql.match(/WHERE\s+(.+?)$/is);
    this._whereRaw = whereMatch ? whereMatch[1].trim() : null;
    this._setParamFields = setParams.map(p => p.field);
  }

  run(...params) {
    if (!this._parsed) this._ensureParsed();
    if (this._type === 'UPDATE') {
      const setCount = this._setParamFields.length;
      const setValues = params.slice(0, setCount);
      const whereValues = params.slice(setCount);
      this._setParamFields.forEach((field, idx) => {
        this._updateSets[field] = setValues[idx];
      });
      this._updateWhereParams = whereValues;
    }
    return this._executeWrite(params);
  }

  _parseDelete(sql) {
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    this._table = fromMatch ? fromMatch[1] : null;
    const whereMatch = sql.match(/WHERE\s+(.+?)$/is);
    this._whereRaw = whereMatch ? whereMatch[1].trim() : null;
  }

  _splitTopLevel(str, delim) {
    const parts = [];
    let depth = 0;
    let current = '';
    for (const ch of str) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (ch === delim && depth === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  _parseLiteral(val) {
    if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1).replace(/''/g, "'");
    if (val.toUpperCase() === 'NULL') return null;
    if (val === '?') return '?';
    const num = Number(val);
    if (!Number.isNaN(num) && val.trim() !== '') return num;
    return val;
  }

  _buildFilter(whereRaw, params) {
    const tokens = this._tokenizeAnd(whereRaw);
    const paramIdxRef = { v: 0 };

    const compiled = tokens.map(tok => this._compileCondition(tok, params, paramIdxRef));

    return (row, idx, arr) => {
      for (const fn of compiled) {
        if (!fn(row, idx, arr)) return false;
      }
      return true;
    };
  }

  _tokenizeAnd(str) {
    return this._splitTopLevel(str, /AND/i).map(s => s.trim()).filter(Boolean);
  }

  _splitTopLevel(str, delim) {
    if (delim instanceof RegExp) {
      const parts = [];
      let depth = 0;
      let current = '';
      for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        if (depth === 0) {
          const remaining = str.slice(i);
          const match = remaining.match(/^AND\s/i);
          if (match) {
            parts.push(current);
            current = '';
            i += match[0].length - 1;
            continue;
          }
        }
        current += ch;
      }
      if (current.trim()) parts.push(current);
      return parts;
    }
    const parts = [];
    let depth = 0;
    let current = '';
    for (const ch of str) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (ch === delim && depth === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  _compileCondition(tok, params, paramIdxRef) {
    const operators = ['!=', '<=', '>=', '<>', '=', '<', '>', ' IS NOT', ' IS', ' LIKE'];
    for (const op of operators) {
      const pattern = new RegExp(`^(\\w+(?:\\.\\w+)?)(\\s+)?${op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s+)?(.+)$`, 'i');
      const m = tok.match(pattern);
      if (m) {
        const field = m[1].split('.').pop();
        let value = m[4].trim();
        let opNorm = op.trim().toUpperCase();
        if (opNorm === '<>') opNorm = '!=';

        let rightVal;
        if (value === '?') {
          rightVal = params[paramIdxRef.v++];
        } else {
          rightVal = this._parseLiteral(value);
        }

        return (row) => {
          const left = row[field];
          return this._compare(left, opNorm, rightVal);
        };
      }
    }
    return () => true;
  }

  _compare(left, op, right) {
    switch (op) {
      case '=':
      case 'IS':
        if (right == null) return left == null;
        if (typeof right === 'string' && typeof left === 'string') {
          const re = new RegExp('^' + right.replace(/%/g, '.*').replace(/_/g, '.').replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\\\.\\\*/g, '.*').replace(/\\\./g, '.') + '$', 'i');
          if (right.includes('%') || right.includes('_')) return re.test(left);
        }
        return left === right;
      case '!=':
      case 'IS NOT':
        if (right == null) return left != null;
        return left !== right;
      case 'LIKE': {
        if (left == null || right == null) return false;
        const pattern = String(right)
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/%/g, '.*')
          .replace(/_/g, '.');
        return new RegExp('^' + pattern + '$', 'i').test(String(left));
      }
      case '>': return left != null && right != null && left > right;
      case '<': return left != null && right != null && left < right;
      case '>=': return left != null && right != null && left >= right;
      case '<=': return left != null && right != null && left <= right;
      default: return false;
    }
  }
}

module.exports = { db, initDatabase, isDatabaseEmpty, seedSampleData };
