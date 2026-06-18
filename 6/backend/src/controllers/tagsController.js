const {
  loadDB,
  saveDB,
  getTagUsageCount
} = require('../models/database');

function getAllTags(req, res) {
  const db = loadDB();
  const tags = db.tags
    .map(tag => ({
      id: tag.id,
      name: tag.name,
      usage_count: getTagUsageCount(tag.id)
    }))
    .sort((a, b) => {
      if (b.usage_count !== a.usage_count) return b.usage_count - a.usage_count;
      return a.name.localeCompare(b.name);
    });

  res.json({ data: tags });
}

function deleteTag(req, res) {
  const db = loadDB();
  const id = Number(req.params.id);
  const existingIndex = db.tags.findIndex(t => t.id === id);
  if (existingIndex === -1) {
    return res.status(404).json({ error: true, message: '标签不存在' });
  }

  const tagName = db.tags[existingIndex].name;
  db.tags.splice(existingIndex, 1);
  db.noteTags = db.noteTags.filter(nt => nt.tag_id !== id);
  saveDB();

  res.json({ message: `标签「${tagName}」已删除` });
}

module.exports = {
  getAllTags,
  deleteTag
};
