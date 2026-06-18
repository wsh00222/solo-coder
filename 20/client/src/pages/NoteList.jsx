import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, formatRelative, summaryOf } from '../lib/utils.js';
import { useToast } from '../components/Feedback.jsx';

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const push = p => pages.push(p);
  const addRange = (a, b) => { for (let i = a; i <= b; i++) push(i); };
  if (totalPages <= 7) {
    addRange(1, totalPages);
  } else {
    push(1);
    if (page > 3) push('...');
    const s = Math.max(2, page - 1);
    const e = Math.min(totalPages - 1, page + 1);
    addRange(s, e);
    if (page < totalPages - 2) push('...');
    push(totalPages);
  }
  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="page-ellipsis">···</span>
        ) : (
          <button
            key={p}
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        className="page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        ›
      </button>
    </div>
  );
}

export default function NoteList() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const searchParam = params.get('search') || '';
  const tagParam = params.get('tag') || '';
  const pageParam = parseInt(params.get('page') || '1');

  const [search, setSearch] = useState(searchParam);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.listNotes({
        search: searchParam,
        tag: tagParam,
        page: pageParam,
        pageSize: 5
      });
      setData(res);
    } catch (e) {
      setError(e.message || '加载失败');
      pushToast('error', '加载笔记失败');
    } finally {
      setLoading(false);
    }
  }, [searchParam, tagParam, pageParam, pushToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== searchParam) {
        updateURL({ search, page: 1 });
      }
    }, 250);
    return () => clearTimeout(t);
     
  }, [search]);

  const updateURL = next => {
    const p = {
      search: next.search ?? searchParam,
      tag: next.tag ?? tagParam,
      page: String(next.page ?? pageParam)
    };
    const q = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v && String(v).trim()) q.set(k, String(v).trim());
    });
    setParams(q, { replace: false });
  };

  const selectTag = tag => {
    updateURL({ tag: tag === tagParam ? '' : tag, page: 1 });
  };

  const clearFilters = () => {
    setSearch('');
    updateURL({ search: '', tag: '', page: 1 });
  };

  const isFiltered = Boolean(searchParam || tagParam);
  const totalCount = data?.stats?.totalNotes ?? 0;
  const tagTotal = isFiltered ? data?.stats?.tagTotal : data?.stats?.globalTagTotal;
  const last7Days = isFiltered ? data?.stats?.filteredLast7Days : data?.stats?.last7Days;

  return (
    <div>
      <div className="stats-panel">
        <div className="stat-card">
          <div className="stat-label">总笔记数{isFiltered ? '（筛选后）' : ''}</div>
          <div className="stat-value primary">{data?.stats?.totalNotes ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">标签总数{isFiltered ? '（筛选后）' : ''}</div>
          <div className="stat-value success">{tagTotal ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">最近 7 天新增{isFiltered ? '（筛选后）' : ''}</div>
          <div className="stat-value warn">{last7Days ?? 0}</div>
        </div>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="按标题关键词搜索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => { setSearch(''); updateURL({ search: '', page: 1 }); }}>
            ✕
          </button>
        )}
      </div>

      {data?.allTags?.length > 0 && (
        <div className="tag-filter">
          <span className="tag-filter-label">标签：</span>
          {data.allTags.map(t => (
            <button
              key={t}
              className={`tag-chip ${tagParam === t ? 'active' : ''}`}
              onClick={() => selectTag(t)}
            >
              {t}
            </button>
          ))}
          {tagParam && (
            <button className="tag-chip" onClick={() => selectTag(tagParam)}>
              清除标签
            </button>
          )}
        </div>
      )}

      {isFiltered && (
        <div className="filter-info">
          <span>
            正在筛选：
            {searchParam && <> 标题包含 “{searchParam}”</>}
            {searchParam && tagParam && ' +'}
            {tagParam && <> 标签 “{tagParam}”</>}
            <span className="stat-value" style={{ display: 'inline', fontWeight: 600, marginLeft: 8 }}>
              共 {totalCount} 条结果
            </span>
          </span>
          <button onClick={clearFilters}>清除所有筛选</button>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>加载中...</div>}
      {error && !loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>
          {error}
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 12 }} onClick={fetchData}>
            重试
          </button>
        </div>
      )}

      {!loading && !error && data?.notes?.length === 0 && (
        <div className="empty-state">
          {isFiltered ? (
            <>
              <div className="empty-icon">🔍</div>
              <div className="empty-title">没有符合条件的笔记</div>
              <div className="empty-desc">试试调整搜索关键词或清除标签筛选</div>
              <button className="btn btn-primary" onClick={clearFilters}>清除筛选条件</button>
            </>
          ) : (
            <>
              <div className="empty-icon">📝</div>
              <div className="empty-title">还没有任何笔记</div>
              <div className="empty-desc">点击右上角「新建笔记」开始记录你的第一篇笔记吧</div>
              <button className="btn btn-primary" onClick={() => navigate('/new')}>立即创建第一篇</button>
            </>
          )}
        </div>
      )}

      {!loading && data?.notes?.length > 0 && (
        <>
          <div className="note-list">
            {data.notes.map(note => (
              <div
                key={note.id}
                className="note-card"
                onClick={() => navigate(`/note/${note.id}`)}
              >
                <div className="note-card-head">
                  <div className="note-title">{note.title}</div>
                  <div className="note-date">{formatRelative(note.updatedAt)}</div>
                </div>
                <div className="note-summary">{summaryOf(note.content, 50)}</div>
                {note.tags?.length > 0 && (
                  <div className="note-tags">
                    {note.tags.map(t => (
                      <span key={t} className="tag-mini">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="list-footer">
            <div className="list-count">共 {totalCount} 篇</div>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onChange={p => updateURL({ page: p })}
            />
          </div>
        </>
      )}
    </div>
  );
}
