import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyApi } from '../api.js';
import { formatDate, paginate } from '../utils.js';
import ConfirmModal from '../components/ConfirmModal.jsx';

const PAGE_SIZE = 5;

export default function SurveyList() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  // 删除确认弹窗
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 发布确认
  const [pubOpen, setPubOpen] = useState(false);
  const [pubTarget, setPubTarget] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const loadList = useCallback(() => {
    setLoading(true);
    surveyApi
      .list()
      .then((data) => {
        // 按创建时间倒序显示
        data.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        setSurveys(data);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  // 总页数
  const totalPages = Math.max(1, Math.ceil(surveys.length / PAGE_SIZE));
  const displayList = paginate(surveys, page, PAGE_SIZE);

  const handleCardClick = (s) => {
    // 根据状态跳转：未发布 -> 编辑页；已发布 -> 统计页
    if (s.status === 'draft') {
      navigate(`/edit/${s.id}`);
    } else {
      navigate(`/stats/${s.id}`);
    }
  };

  const handleEdit = (e, s) => {
    e.stopPropagation();
    navigate(`/edit/${s.id}`);
  };

  const handlePublishClick = (e, s) => {
    e.stopPropagation();
    setPubTarget(s);
    setPubOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (!pubTarget) return;
    setPublishing(true);
    try {
      await surveyApi.publish(pubTarget.id);
      setPubOpen(false);
      setPubTarget(null);
      loadList();
    } catch (err) {
      alert(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleStats = (e, s) => {
    e.stopPropagation();
    navigate(`/stats/${s.id}`);
  };

  const handleDeleteClick = (e, s) => {
    e.stopPropagation();
    setDelTarget(s);
    setDelOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await surveyApi.remove(delTarget.id);
      setDelOpen(false);
      setDelTarget(null);
      // 如果删除后当前页无数据，跳回上一页
      if (surveys.length - 1 <= (page - 1) * PAGE_SIZE && page > 1) {
        setPage(page - 1);
      }
      loadList();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="container loading">加载中...</div>;
  if (error) return <div className="container error-tip">加载失败：{error}</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>问卷列表</h1>
        <button className="btn-primary" onClick={() => navigate('/new')}>
          + 新建问卷
        </button>
      </div>

      {surveys.length === 0 ? (
        <div className="empty-placeholder">
          <div style={{ fontSize: 60 }}>📋</div>
          <div>暂无问卷，点击右上角"新建问卷"开始</div>
        </div>
      ) : (
        <>
          <div className="card-grid">
            {displayList.map((s) => (
              <div
                key={s.id}
                className="survey-card"
                onClick={() => handleCardClick(s)}
              >
                <div className="survey-card-header">
                  <div className="survey-card-title">{s.title}</div>
                  <span className={`tag tag-${s.status}`}>
                    {s.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </div>
                <div className="survey-card-meta">
                  <div>创建时间：</div>
                  <div>{formatDate(s.createdAt)}</div>
                  <div>问题数量：</div>
                  <div>{s.questionCount} 题</div>
                  <div>回收份数：</div>
                  <div>{s.answerCount} 份</div>
                </div>
                <div className="survey-card-footer">
                  {s.status === 'draft' && (
                    <>
                      <button
                        className="btn-outline"
                        onClick={(e) => handleEdit(e, s)}
                      >
                        编辑
                      </button>
                      <button
                        className="btn-success"
                        onClick={(e) => handlePublishClick(e, s)}
                      >
                        发布
                      </button>
                    </>
                  )}
                  <button
                    className="btn-outline"
                    onClick={(e) => handleStats(e, s)}
                  >
                    查看统计
                  </button>
                  <button
                    className="btn-danger"
                    onClick={(e) => handleDeleteClick(e, s)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </button>
              <span className="page-info">
                第 {page} / {totalPages} 页
              </span>
              <button
                className="btn-outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}

      {/* 发布确认弹窗 */}
      <ConfirmModal
        open={pubOpen}
        title="确认发布问卷？"
        desc={`问卷"${pubTarget?.title}"发布后将无法再编辑内容，但可以收集回答与查看统计。`}
        confirmText={publishing ? '发布中...' : '确认发布'}
        onConfirm={handleConfirmPublish}
        onCancel={() => setPubOpen(false)}
      />

      {/* 删除确认弹窗 */}
      <ConfirmModal
        open={delOpen}
        title="确认删除问卷？"
        desc={`删除问卷"${delTarget?.title}"将同时删除所有关联的回答数据，此操作不可撤销。`}
        confirmText={deleting ? '删除中...' : '确认删除'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDelOpen(false)}
        danger
      />
    </div>
  );
}
