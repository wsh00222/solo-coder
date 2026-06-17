import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyApi } from '../api.js';
import { uid, QUESTION_TYPE_LABEL, formatDate } from '../utils.js';

/**
 * 新建/编辑问卷页（共用）
 * - 有 URL id -> 编辑；无 -> 新建
 * - 已发布问卷进入时以只读预览方式展示
 */
export default function SurveyEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // 表单状态
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [titleError, setTitleError] = useState('');

  // 服务器返回的源数据（用于判断是否已发布）
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // 拖拽状态
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const isPublished = original?.status === 'published';
  const readOnly = isPublished;

  // 加载已有问卷
  useEffect(() => {
    if (!isEdit) return;
    surveyApi
      .get(id)
      .then((data) => {
        setOriginal(data);
        setTitle(data.title);
        setQuestions(JSON.parse(JSON.stringify(data.questions || [])));
      })
      .catch((err) => {
        alert('加载问卷失败：' + err.message);
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [isEdit, id, navigate]);

  // ========== 标题校验 ==========
  const handleTitleChange = (v) => {
    setTitle(v);
    if (titleError) setTitleError('');
  };

  // ========== 问题操作 ==========
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: uid(),
        type: 'single',
        title: '',
        options: ['', ''],
      },
    ]);
  };

  const removeQuestion = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx, patch) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...patch } : q))
    );
  };

  /** 切换题型时，保证数据结构正确 */
  const changeQuestionType = (idx, newType) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== idx) return q;
        if (newType === 'text') {
          return { ...q, type: newType, options: [] };
        }
        // 切回选择题，至少两个空选项
        const opts =
          q.options && q.options.length >= 2
            ? q.options
            : ['', ''];
        return { ...q, type: newType, options: opts };
      })
    );
  };

  const addOption = (qIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: [...(q.options || []), ''] } : q
      )
    );
  };

  const removeOption = (qIdx, optIdx) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = q.options.filter((_, k) => k !== optIdx);
        return { ...q, options: opts };
      })
    );
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...q.options];
        opts[optIdx] = value;
        return { ...q, options: opts };
      })
    );
  };

  // ========== 拖拽（HTML5 DnD） ==========
  const onDragStart = (e, idx) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox 需要 setData
    e.dataTransfer.setData('text/plain', String(idx));
  };
  const onDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== idx) setDragOverIndex(idx);
  };
  const onDragLeave = () => {
    // 不立即清空，避免抖动
  };
  const onDrop = (e, idx) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setQuestions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const onDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // ========== 保存 / 发布 ==========
  const validateBeforeSubmit = useCallback(() => {
    // 清除之前的错误
    setTitleError('');

    if (!title.trim()) {
      setTitleError('问卷标题不能为空');
      return false;
    }
    return true;
  }, [title]);

  const handleSave = async (asPublish = false) => {
    if (readOnly) return;
    if (!validateBeforeSubmit()) return;

    // 组装 payload：过滤空题干，选项 trim 去重
    const cleanQuestions = questions
      .filter((q) => q.title.trim() !== '')
      .map((q) => {
        if (q.type === 'text') {
          return {
            id: q.id,
            type: q.type,
            title: q.title.trim(),
            options: [],
          };
        }
        // 选择类：选项去重（按出现顺序），过滤空值
        const seen = new Set();
        const opts = [];
        q.options.forEach((o) => {
          const t = o.trim();
          if (t && !seen.has(t)) {
            seen.add(t);
            opts.push(t);
          }
        });
        return {
          id: q.id,
          type: q.type,
          title: q.title.trim(),
          options: opts,
        };
      });

    try {
      setSaving(true);
      let surveyId = id;

      if (isEdit) {
        await surveyApi.update(id, { title, questions: cleanQuestions });
      } else {
        const created = await surveyApi.create({
          title,
          questions: cleanQuestions,
        });
        surveyId = created.id;
      }

      if (asPublish) {
        setPublishing(true);
        // 先发布再跳转
        await surveyApi.publish(surveyId);
        setPublishing(false);
      }

      navigate('/');
    } catch (err) {
      if (err.message.includes('标题')) {
        setTitleError(err.message);
      } else {
        alert(err.message);
      }
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  // ========== 短链接 ==========
  const shortLink = useMemo(() => {
    if (!original || original.status !== 'published') return null;
    const base = `${window.location.protocol}//${window.location.host}`;
    return `${base}/answer/${original.id}`;
  }, [original]);

  const copyShortLink = () => {
    if (!shortLink) return;
    navigator.clipboard?.writeText(shortLink).then(
      () => alert('短链接已复制到剪贴板'),
      () => prompt('请手动复制链接：', shortLink)
    );
  };

  if (loading) return <div className="container loading">加载中...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>{isEdit ? (readOnly ? '预览问卷' : '编辑问卷') : '新建问卷'}</h1>
        <button className="btn-ghost" onClick={() => navigate('/')}>
          ← 返回列表
        </button>
      </div>

      <div className="form-layout">
        {/* 短链接提示（已发布显示） */}
        {readOnly && original && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 8,
              padding: '14px 16px',
              marginBottom: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: 14, color: '#065f46' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                问卷已于 {formatDate(original.createdAt)} 发布
              </div>
              <div>
                回答链接：<code style={{ background: 'white', padding: '2px 6px', borderRadius: 4 }}>{shortLink}</code>
              </div>
            </div>
            <button className="btn-outline" onClick={copyShortLink}>
              📋 复制链接
            </button>
          </div>
        )}

        {/* 标题 */}
        <div className="form-row">
          <label className="form-label">
            问卷标题 <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            className="form-input"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="请输入问卷标题（不可与已有问卷重名）"
            disabled={readOnly}
            style={{ fontSize: 18, padding: '12px 14px' }}
          />
          {titleError && <div className="form-error">{titleError}</div>}
        </div>

        {/* 问题列表 */}
        <div className="questions-section">
          <div className="questions-header">
            <h2>
              问题列表 <span style={{ color: 'var(--gray-400)', fontSize: 14, fontWeight: 400 }}>（共 {questions.length} 题）</span>
            </h2>
            {!readOnly && (
              <button className="btn-outline" onClick={addQuestion}>
                + 添加问题
              </button>
            )}
          </div>

          {questions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--gray-400)',
                background: 'var(--gray-50)',
                borderRadius: 8,
                border: '2px dashed var(--gray-200)',
              }}
            >
              {readOnly ? '该问卷暂无问题' : '尚未添加问题，点击上方"添加问题"按钮开始'}
            </div>
          ) : (
            questions.map((q, idx) => {
              const isDragging = dragIndex === idx;
              const isOver = dragOverIndex === idx && dragIndex !== idx;
              return (
                <div
                  key={q.id}
                  className={`question-block ${isDragging ? 'dragging' : ''} ${
                    isOver ? 'drag-over' : ''
                  }`}
                  draggable={!readOnly}
                  onDragStart={(e) => !readOnly && onDragStart(e, idx)}
                  onDragOver={(e) => !readOnly && onDragOver(e, idx)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => !readOnly && onDrop(e, idx)}
                  onDragEnd={onDragEnd}
                >
                  <div className="question-block-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {!readOnly && (
                        <span className="drag-handle" title="拖拽排序">⋮⋮</span>
                      )}
                      <span className="question-index">Q{idx + 1}.</span>
                    </div>
                    {!readOnly && (
                      <div className="question-block-actions">
                        <button
                          className="btn-ghost"
                          onClick={() => removeQuestion(idx)}
                          style={{ color: 'var(--danger)' }}
                          title="删除此题"
                        >
                          ✕ 删除
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="question-type-row">
                    <input
                      className="form-input"
                      type="text"
                      value={q.title}
                      onChange={(e) => updateQuestion(idx, { title: e.target.value })}
                      placeholder="请输入题干"
                      disabled={readOnly}
                    />
                    {!readOnly && (
                      <select
                        className="form-select"
                        value={q.type}
                        onChange={(e) => changeQuestionType(idx, e.target.value)}
                      >
                        <option value="single">{QUESTION_TYPE_LABEL.single}</option>
                        <option value="multiple">{QUESTION_TYPE_LABEL.multiple}</option>
                        <option value="text">{QUESTION_TYPE_LABEL.text}</option>
                      </select>
                    )}
                    {readOnly && (
                      <span className="tag tag-draft" style={{ flexShrink: 0 }}>
                        {QUESTION_TYPE_LABEL[q.type]}
                      </span>
                    )}
                  </div>

                  {(q.type === 'single' || q.type === 'multiple') && (
                    <>
                      <ul className="options-list">
                        {q.options.map((opt, optIdx) => (
                          <li key={optIdx} className="option-item">
                            <span
                              style={{
                                color: 'var(--gray-400)',
                                fontSize: 14,
                                width: 20,
                                flexShrink: 0,
                              }}
                            >
                              {q.type === 'single'
                                ? String.fromCharCode(65 + optIdx) + '.'
                                : '☑'}
                            </span>
                            <input
                              className="form-input"
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                              placeholder={`选项 ${String.fromCharCode(65 + optIdx)}`}
                              disabled={readOnly}
                            />
                            {!readOnly && q.options.length > 2 && (
                              <button
                                className="option-item-remove"
                                onClick={() => removeOption(idx, optIdx)}
                                title="删除此选项"
                              >
                                ✕
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                      {!readOnly && (
                        <button
                          className="btn-ghost"
                          onClick={() => addOption(idx)}
                          style={{ marginTop: 4, fontSize: 13 }}
                        >
                          + 添加选项
                        </button>
                      )}
                    </>
                  )}

                  {q.type === 'text' && (
                    <div
                      style={{
                        padding: '12px 14px',
                        background: 'white',
                        borderRadius: 6,
                        border: '1px dashed var(--gray-200)',
                        color: 'var(--gray-400)',
                        fontSize: 13,
                      }}
                    >
                      【文本题】回答者将自由填写文字
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 底部操作 */}
        <div className="form-actions">
          <button className="btn-ghost" onClick={() => navigate('/')}>
            取消
          </button>
          {!readOnly && (
            <>
              <button
                className="btn-outline"
                onClick={() => handleSave(false)}
                disabled={saving || publishing}
              >
                {saving ? '保存中...' : '保存草稿'}
              </button>
              <button
                className="btn-success"
                onClick={() => handleSave(true)}
                disabled={saving || publishing}
              >
                {publishing ? '发布中...' : '发布问卷'}
              </button>
            </>
          )}
          {readOnly && (
            <>
              <button
                className="btn-outline"
                onClick={() => navigate(`/stats/${id}`)}
              >
                查看统计
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  const w = window.open();
                  w.location.href = `/answer/${id}`;
                }}
              >
                打开填写链接
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
