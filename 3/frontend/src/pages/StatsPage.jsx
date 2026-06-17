import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { surveyApi } from '../api.js';
import { QUESTION_TYPE_LABEL, formatDate } from '../utils.js';

// 柱状图配色
const COLORS = [
  '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
];

/**
 * 统计页：显示回答分布 + CSV 导出
 */
export default function StatsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([surveyApi.get(id), surveyApi.stats(id)])
      .then(([surv, st]) => {
        if (cancelled) return;
        setSurvey(surv);
        setStats(st);
      })
      .catch((err) => setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleExport = () => {
    setExporting(true);
    try {
      surveyApi.exportCSV(id);
    } finally {
      // 下载是浏览器行为，立即复原按钮
      setTimeout(() => setExporting(false), 500);
    }
  };

  if (loading) return <div className="container loading">加载中...</div>;
  if (error || !stats)
    return <div className="container error-tip">加载失败：{error || '未知错误'}</div>;

  return (
    <div className="container">
      <div className="stats-header">
        <div>
          <h1 className="stats-title">{stats.title}</h1>
          <div style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 4 }}>
            创建时间：{survey ? formatDate(survey.createdAt) : '-'} &nbsp;·&nbsp;
            状态：
            <span
              className={`tag tag-${survey?.status || 'draft'}`}
              style={{ marginLeft: 4 }}
            >
              {survey?.status === 'published' ? '已发布' : '草稿'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="total-count">共 {stats.totalAnswers} 份回答</span>
          <button
            className="btn-outline"
            onClick={() => navigate('/')}
          >
            ← 返回列表
          </button>
          <button
            className="btn-primary"
            onClick={handleExport}
            disabled={exporting || stats.totalAnswers === 0}
          >
            {exporting ? '导出中...' : '📥 导出 CSV'}
          </button>
        </div>
      </div>

      {stats.totalAnswers === 0 ? (
        <div className="stats-block empty-placeholder">
          <div style={{ fontSize: 56 }}>📊</div>
          <div style={{ fontSize: 16, marginTop: 8 }}>暂无回答</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>
            当有用户提交回答后，这里会显示详细的统计数据
          </div>
        </div>
      ) : (
        stats.perQuestion.map((q, idx) => (
          <QuestionStatsBlock key={q.questionId} q={q} index={idx} />
        ))
      )}
    </div>
  );
}

// ========== 单个问题统计区块 ==========
function QuestionStatsBlock({ q, index }) {
  return (
    <div className="stats-block">
      <h3>
        <span style={{ color: 'var(--primary)', marginRight: 6 }}>Q{index + 1}.</span>
        {q.title}
        <span
          className="tag tag-draft"
          style={{ marginLeft: 10, fontWeight: 400, fontSize: 12 }}
        >
          {QUESTION_TYPE_LABEL[q.type]}
          {q.type === 'multiple' && '（按选项计数）'}
        </span>
      </h3>

      {q.type === 'single' || q.type === 'multiple' ? (
        <ChoiceQuestionStats q={q} />
      ) : (
        <TextQuestionStats q={q} />
      )}
    </div>
  );
}

// 选择题统计：图表 + 表格
function ChoiceQuestionStats({ q }) {
  const data = useMemo(
    () =>
      q.distribution.map((d, i) => ({
        name: d.option,
        count: d.count,
        percent: d.percent,
        fill: COLORS[i % COLORS.length],
      })),
    [q]
  );

  return (
    <div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              angle={-20}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              allowDecimals={false}
              label={{
                value: '选择次数',
                angle: -90,
                position: 'insideLeft',
                fill: '#6b7280',
                fontSize: 12,
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 13,
              }}
              formatter={(val, name, props) => {
                if (name === 'count') {
                  return [
                    `${val} 次 · ${props.payload.percent}%`,
                    '占比',
                  ];
                }
                return [val, name];
              }}
              labelFormatter={(l) => `选项：${l}`}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={600}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 详细分布表格 */}
      <table className="distribution-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>选项</th>
            <th>选择次数</th>
            <th style={{ width: '30%' }}>占比</th>
          </tr>
        </thead>
        <tbody>
          {q.distribution.map((d, i) => (
            <tr key={i}>
              <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: COLORS[i % COLORS.length],
                  }}
                />
                {d.option}
              </td>
              <td>{d.count}</td>
              <td>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${d.percent}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <span style={{ minWidth: 54, textAlign: 'right', fontSize: 13, color: 'var(--gray-600)' }}>
                    {d.percent}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 文本题统计：列出全部回答
function TextQuestionStats({ q }) {
  const list = q.textAnswers || [];
  const SHOW_MAX = 10;
  const showList = list.slice(0, SHOW_MAX);
  const moreCount = list.length - SHOW_MAX;

  if (list.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--gray-400)' }}>
        暂无文本回答
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
        共 {list.length} 条回答
      </div>
      <ol className="text-answers-list">
        {showList.map((text, i) => (
          <li key={i}>
            <span style={{ fontWeight: 600, color: 'var(--primary)', marginRight: 6 }}>
              #{i + 1}
            </span>
            {text}
          </li>
        ))}
      </ol>
      {moreCount > 0 && (
        <p className="text-answers-hint">
          ℹ️ 仅显示前 {SHOW_MAX} 条，还有 {moreCount} 条更多回答请导出 CSV 查看。
        </p>
      )}
    </div>
  );
}
