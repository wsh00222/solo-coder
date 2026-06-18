import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MovieCard from '../components/MovieCard.jsx';
import Modal from '../components/Modal.jsx';
import MovieForm from '../components/MovieForm.jsx';
import RatingHistogram from '../components/RatingHistogram.jsx';
import { movieApi } from '../services/movieApi.js';
import { renderStars, exportCSV, todayStr } from '../utils/helpers.js';

const GENRES = ['剧情', '喜剧', '动作', '科幻', '其他'];
const STATUSES = ['想看', '已看', '二刷'];

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [stats, setStats] = useState({ total: 0, watched: 0, avgRating: 0, topMovie: null });
  const [distribution, setDistribution] = useState({});
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: 'all',
    genre: 'all',
    sortBy: 'createdAt',
    keyword: ''
  });

  const [selected, setSelected] = useState(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(null);
  const [batchDelOpen, setBatchDelOpen] = useState(false);
  const [recOpen, setRecOpen] = useState(false);
  const [recommend, setRecommend] = useState(null);
  const [recEmpty, setRecEmpty] = useState(false);
  const [batchStatus, setBatchStatus] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [list, s, d] = await Promise.all([
        movieApi.list(filters),
        movieApi.stats(),
        movieApi.distribution()
      ]);
      setMovies(list);
      setStats(s);
      setDistribution(d);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = useMemo(() => movies, [movies]);

  const allSelected = filtered.length > 0 && filtered.every(m => selected.has(m.id));

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelected(new Set(filtered.map(m => m.id)));
    } else {
      setSelected(new Set());
    }
  };

  const handleSelect = (id, checked) => {
    const ns = new Set(selected);
    if (checked) ns.add(id); else ns.delete(id);
    setSelected(ns);
  };

  const handleUpdate = (updated) => {
    setMovies(prev => prev.map(m => m.id === updated.id ? updated : m));
    loadAll();
  };

  const handleAdd = async (data) => {
    try {
      await movieApi.create(data);
      setAddOpen(false);
      showToast('添加成功', 'success');
      loadAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const doDelete = async () => {
    if (!delOpen) return;
    try {
      await movieApi.remove(delOpen);
      setDelOpen(null);
      const ns = new Set(selected);
      ns.delete(delOpen);
      setSelected(ns);
      showToast('删除成功', 'success');
      loadAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const doBatchDelete = async () => {
    try {
      await movieApi.batchDelete(Array.from(selected));
      setBatchDelOpen(false);
      setSelected(new Set());
      setBatchStatus('');
      showToast(`已删除 ${selected.size} 部电影`, 'success');
      loadAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const doBatchStatus = async () => {
    if (!batchStatus) {
      showToast('请选择目标状态', 'info');
      return;
    }
    try {
      await movieApi.batchUpdateStatus(Array.from(selected), batchStatus);
      setSelected(new Set());
      setBatchStatus('');
      showToast('已批量修改状态', 'success');
      loadAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRecommend = async () => {
    try {
      const m = await movieApi.recommend();
      if (!m) {
        setRecEmpty(true);
        setRecommend(null);
      } else {
        setRecommend(m);
        setRecEmpty(false);
      }
      setRecOpen(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleExportCSV = () => {
    const fname = `我的电影_${todayStr()}.csv`;
    exportCSV(filtered, fname);
    showToast(`已导出 ${filtered.length} 部电影到 ${fname}`, 'success');
  };

  const changeFilter = (k, v) => {
    setFilters(prev => ({ ...prev, [k]: v }));
    setSelected(new Set());
  };

  return (
    <div>
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}

      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-label">总电影数</div>
          <div className="stat-value"><span className="highlight">{stats.total}</span><span className="unit">部</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">已观看</div>
          <div className="stat-value"><span className="good">{stats.watched}</span><span className="unit">部</span></div>
          <div className="stat-sub">占比 {stats.total ? Math.round(stats.watched / stats.total * 100) : 0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">平均评分</div>
          <div className="stat-value">{stats.avgRating || '—'}<span className="unit">分</span></div>
          <div className="stat-sub">{renderStars(Math.round(stats.avgRating * 2))}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">最高评分</div>
          <div className="stat-value" style={{ fontSize: 22 }}>
            {stats.topMovie ? (
              <>
                <span className="good">{stats.topMovie.rating}★</span>
              </>
            ) : '—'}
          </div>
          <div className="stat-sub">
            {stats.topMovie ? `《${stats.topMovie.title}》` : '暂无评分数据'}
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-row">
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>＋ 添加电影</button>
          <button className="btn btn-warning" onClick={handleRecommend}>🎲 随机推荐一部</button>
          <button className="btn btn-outline" onClick={handleExportCSV}>📥 导出 CSV</button>
          <div style={{ flex: 1 }} />
          <input
            type="text"
            className="input search-input"
            placeholder="🔍 搜索片名..."
            value={filters.keyword}
            onChange={(e) => changeFilter('keyword', e.target.value)}
          />
        </div>
        <div className="toolbar-row">
          <div style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>筛选：</div>
          <select className="select w-auto" value={filters.status}
            onChange={(e) => changeFilter('status', e.target.value)}>
            <option value="all">全部状态</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select w-auto" value={filters.genre}
            onChange={(e) => changeFilter('genre', e.target.value)}>
            <option value="all">全部类型</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <div style={{ margin: '0 8px', color: '#cbd5e1' }}>|</div>
          <div style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>排序：</div>
          <select className="select w-auto" value={filters.sortBy}
            onChange={(e) => changeFilter('sortBy', e.target.value)}>
            <option value="createdAt">最近添加</option>
            <option value="rating-desc">评分 高→低</option>
            <option value="rating-asc">评分 低→高</option>
            <option value="year-desc">年份 新→旧</option>
            <option value="year-asc">年份 旧→新</option>
          </select>
          <div style={{ flex: 1 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => toggleSelectAll(e.target.checked)}
              style={{ accentColor: '#667eea', width: 16, height: 16 }}
            />
            批量选择
          </label>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="bulk-bar">
          <div className="bulk-info">已选 {selected.size} 部电影</div>
          <div className="bulk-actions">
            <select
              className="select w-auto"
              value={batchStatus}
              onChange={(e) => setBatchStatus(e.target.value)}
            >
              <option value="">批量修改状态为...</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={doBatchStatus}>应用状态</button>
            <button className="btn btn-danger btn-sm" onClick={() => setBatchDelOpen(true)}>
              🗑 批量删除
            </button>
            <button className="btn btn-sm" onClick={() => setSelected(new Set())}>取消选择</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>加载中...</div>
      ) : (
        <div className="page-layout">
          <div>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎬</div>
                <div className="empty-title">
                  {filters.status !== 'all' || filters.genre !== 'all' || filters.keyword
                    ? '没有匹配的电影'
                    : '片单还是空的'}
                </div>
                <div className="empty-desc">
                  {filters.status !== 'all' || filters.genre !== 'all' || filters.keyword
                    ? '试试调整筛选条件或清除关键词。'
                    : '点击上方"添加电影"开始收藏你喜欢的电影吧。（首次启动已自动插入示例数据，刷新即可看到）'}
                </div>
                <button className="btn btn-primary" onClick={() => setAddOpen(true)}>＋ 添加第一部电影</button>
              </div>
            ) : (
              <>
                <div className="movie-grid">
                  {filtered.map(m => (
                    <MovieCard
                      key={m.id}
                      movie={m}
                      selectable={selected.size > 0 || allSelected}
                      selected={selected.has(m.id)}
                      onSelect={handleSelect}
                      onUpdate={handleUpdate}
                      onToast={showToast}
                    />
                  ))}
                </div>
                <div className="list-footer">共 <strong>{filtered.length}</strong> 部电影</div>
              </>
            )}
          </div>

          <aside className="sidebar">
            <div className="side-card">
              <div className="section-title">📊 评分分布</div>
              <RatingHistogram distribution={distribution} />
            </div>
            <div className="side-card">
              <div className="section-title">💡 小提示</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8 }}>
                <div>· 状态为「想看」的电影可直接标记已看</div>
                <div>· 勾选卡片可进行批量操作</div>
                <div>· 观影当天满 N 年会显示周年徽章</div>
                <div>· 评分≥7 的已看电影可被随机推荐</div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <Modal
        open={addOpen}
        title="添加电影"
        onClose={() => setAddOpen(false)}
      >
        <MovieForm
          submitText="添加电影"
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      <Modal
        open={!!delOpen}
        title="确认删除"
        onClose={() => setDelOpen(null)}
        footer={
          <>
            <button className="btn" onClick={() => setDelOpen(null)}>取消</button>
            <button className="btn btn-danger" onClick={doDelete}>确认删除</button>
          </>
        }
      >
        <p className="confirm-msg">
          确定要删除电影 <strong>《{delOpen ? (movies.find(m => m.id === delOpen)?.title || '') : ''}》</strong>？
          <br />此操作无法撤销。
        </p>
      </Modal>

      <Modal
        open={batchDelOpen}
        title="确认批量删除"
        onClose={() => setBatchDelOpen(false)}
        footer={
          <>
            <button className="btn" onClick={() => setBatchDelOpen(false)}>取消</button>
            <button className="btn btn-danger" onClick={doBatchDelete}>删除 {selected.size} 部</button>
          </>
        }
      >
        <p className="confirm-msg">
          确定要删除选中的 <strong>{selected.size} 部</strong>电影？<br />
          此操作无法撤销。
        </p>
      </Modal>

      <Modal
        open={recOpen}
        title={recEmpty ? '随机推荐' : '🎬 为你推荐'}
        onClose={() => setRecOpen(false)}
      >
        {recEmpty ? (
          <div className="recommend-box">
            <div className="recommend-emoji">🤔</div>
            <div style={{ fontSize: 16, color: '#64748b' }}>暂无推荐</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 8 }}>
              尚未有评分 ≥ 7 分的已看电影。
            </div>
          </div>
        ) : recommend && (
          <div className="recommend-box">
            <div className="recommend-emoji">🍿</div>
            <div className="recommend-title">《{recommend.title}》</div>
            <div className="recommend-meta">
              {recommend.director} · {recommend.year} · {recommend.genre}
            </div>
            <div className="recommend-rating">
              {recommend.rating} <span style={{ fontSize: 16, color: '#f59e0b' }}>★</span>
            </div>
            <div className="recommend-tip">✨ 重温一下？</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
