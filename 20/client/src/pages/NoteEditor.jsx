import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/utils.js';
import { useToast } from '../components/Feedback.jsx';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const note = await api.getNote(id);
        setTitle(note.title);
        setContent(note.content);
        setTagsInput((note.tags || []).join(', '));
      } catch (e) {
        setLoadError(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim()) {
      setFormError('标题不能为空');
      return;
    }
    const tags = tagsInput
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        saved = await api.updateNote(id, { title, content, tags });
        pushToast('success', '笔记已保存');
      } else {
        saved = await api.createNote({ title, content, tags });
        pushToast('success', '笔记创建成功');
      }
      navigate(`/note/${saved.id}`);
    } catch (err) {
      setFormError(err.message || '保存失败');
      pushToast('error', err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>加载中...</div>;
  }
  if (loadError) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <div className="empty-title">加载失败</div>
        <div className="empty-desc">{loadError}</div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>返回列表</button>
      </div>
    );
  }

  return (
    <div>
      <div className="back-link" onClick={() => navigate(-1)}>← 取消返回</div>
      <form className="form-wrap" onSubmit={handleSubmit}>
        <div className="form-title">{isEdit ? '编辑笔记' : '新建笔记'}</div>

        <div className="form-group">
          <label className="form-label" htmlFor="title">标题</label>
          <input
            id="title"
            className="form-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="输入笔记标题..."
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tags">
            标签
            <span className="form-hint">用逗号分隔，例如：工作, 学习, 生活</span>
          </label>
          <input
            id="tags"
            className="form-input"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="工作, 学习"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="content">正文</label>
          <textarea
            id="content"
            className="form-textarea"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="写下你的想法... 正文中的 URL 会自动变成可点击链接。"
          />
        </div>

        {formError && <div className="form-error">{formError}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? '保存中...' : (isEdit ? '保存修改' : '创建笔记')}
          </button>
        </div>
      </form>
    </div>
  );
}
