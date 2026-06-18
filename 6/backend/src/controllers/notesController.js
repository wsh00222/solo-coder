const {
  loadDB,
  saveDB,
  now,
  nextNoteId,
  nextTagId,
  getNoteWithTags
} = require('../models/database');

const PAGE_SIZE = 5;

function applyFilters(allNotes, search, tag) {
  let filtered = allNotes;

  if (search && search.trim()) {
    const keyword = search.trim().toLowerCase();
    filtered = filtered.filter(n => n.title.toLowerCase().includes(keyword));
  }

  if (tag && tag.trim()) {
    const tagName = tag.trim();
    filtered = filtered.filter(n => n.tags.some(t => t.name === tagName));
  }

  return filtered;
}

function getFilteredNotes(search, tag) {
  const db = loadDB();
  const allNotes = db.notes.map(note => {
    const tagIds = db.noteTags
      .filter(nt => nt.note_id === note.id)
      .map(nt => nt.tag_id);
    const tags = db.tags.filter(t => tagIds.includes(t.id)).sort((a, b) => a.name.localeCompare(b.name));
    const summary = note.content.replace(/[\r\n]+/g, ' ').slice(0, 50) + (note.content.length > 50 ? '...' : '');
    return { ...note, tags, summary };
  }).sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));

  return applyFilters(allNotes, search, tag);
}

function getNotes(req, res) {
  const { page = 1, search, tag } = req.query;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const filtered = getFilteredNotes(search, tag);
  const total = filtered.length;
  const pagedNotes = filtered.slice(offset, offset + PAGE_SIZE);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 16).replace('T', ' ');
  const recentCount = filtered.filter(n => n.created_at >= sevenDaysAgoStr).length;

  res.json({
    data: pagedNotes,
    pagination: {
      total,
      page: pageNum,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE)
    },
    stats: {
      filteredTotal: total,
      recentLast7Days: recentCount
    }
  });
}

function getStats(req, res) {
  const db = loadDB();
  const { search, tag } = req.query;

  const allNoteIds = new Set(db.notes.map(n => n.id));
  let filteredNoteIds = allNoteIds;

  if (search && search.trim()) {
    const keyword = search.trim().toLowerCase();
    filteredNoteIds = new Set(
      db.notes.filter(n => n.title.toLowerCase().includes(keyword)).map(n => n.id)
    );
  }

  if (tag && tag.trim()) {
    const tagName = tag.trim();
    const targetTag = db.tags.find(t => t.name === tagName);
    if (targetTag) {
      const tagNoteIds = new Set(
        db.noteTags.filter(nt => nt.tag_id === targetTag.id).map(nt => nt.note_id)
      );
      filteredNoteIds = new Set([...filteredNoteIds].filter(id => tagNoteIds.has(id)));
    } else {
      filteredNoteIds = new Set();
    }
  }

  const totalNotes = filteredNoteIds.size;

  let totalTags;
  if (!search && !tag) {
    totalTags = db.tags.length;
  } else {
    const tagIdsFromFiltered = new Set();
    for (const noteId of filteredNoteIds) {
      db.noteTags
        .filter(nt => nt.note_id === noteId)
        .forEach(nt => tagIdsFromFiltered.add(nt.tag_id));
    }
    totalTags = tagIdsFromFiltered.size;
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 16).replace('T', ' ');
  const recentLast7Days = db.notes.filter(
    n => filteredNoteIds.has(n.id) && n.created_at >= sevenDaysAgoStr
  ).length;

  res.json({
    totalNotes,
    totalTags,
    recentLast7Days
  });
}

function getNoteById(req, res) {
  const note = getNoteWithTags(req.params.id);
  if (!note) {
    return res.status(404).json({ error: true, message: '笔记不存在' });
  }
  res.json({ data: note });
}

function syncNoteTags(noteId, tagNames) {
  const db = loadDB();
  db.noteTags = db.noteTags.filter(nt => nt.note_id !== Number(noteId));

  const uniqueTags = [...new Set(tagNames || [])];
  for (const name of uniqueTags) {
    const trimmed = name.trim();
    if (trimmed.length === 0) continue;
    let tag = db.tags.find(t => t.name === trimmed);
    if (!tag) {
      const tagId = nextTagId();
      tag = { id: tagId, name: trimmed };
      db.tags.push(tag);
    }
    if (!db.noteTags.find(nt => nt.note_id === Number(noteId) && nt.tag_id === tag.id)) {
      db.noteTags.push({ note_id: Number(noteId), tag_id: tag.id });
    }
  }
  saveDB();
}

function createNote(req, res) {
  const { title, content, tags } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: true, message: '标题不能为空' });
  }

  const db = loadDB();
  const timestamp = now();
  const noteId = nextNoteId();

  const newNote = {
    id: noteId,
    title: title.trim(),
    content: content || '',
    created_at: timestamp,
    updated_at: timestamp
  };
  db.notes.push(newNote);
  saveDB();

  syncNoteTags(noteId, tags);
  const note = getNoteWithTags(noteId);
  res.status(201).json({ data: note, message: '笔记创建成功' });
}

function updateNote(req, res) {
  const db = loadDB();
  const id = Number(req.params.id);
  const existingIndex = db.notes.findIndex(n => n.id === id);
  if (existingIndex === -1) {
    return res.status(404).json({ error: true, message: '笔记不存在' });
  }

  const { title, content, tags } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: true, message: '标题不能为空' });
  }

  const timestamp = now();
  db.notes[existingIndex] = {
    ...db.notes[existingIndex],
    title: title.trim(),
    content: content || '',
    updated_at: timestamp
  };
  saveDB();

  syncNoteTags(id, tags);
  const note = getNoteWithTags(id);
  res.json({ data: note, message: '笔记更新成功' });
}

function deleteNote(req, res) {
  const db = loadDB();
  const id = Number(req.params.id);
  const existingIndex = db.notes.findIndex(n => n.id === id);
  if (existingIndex === -1) {
    return res.status(404).json({ error: true, message: '笔记不存在' });
  }

  db.notes.splice(existingIndex, 1);
  db.noteTags = db.noteTags.filter(nt => nt.note_id !== id);
  saveDB();

  res.json({ message: '笔记删除成功' });
}

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getStats
};
