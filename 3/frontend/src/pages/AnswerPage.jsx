import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { surveyApi } from '../api.js';
import { QUESTION_TYPE_LABEL } from '../utils.js';

/**
 * 问卷填写页（短链接对应页面）
 * - 加载问卷详情
 * - 校验：单选必选、多选至少一个、文本非空
 * - 提交后跳转到感谢页
 */
export default function AnswerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 回答数据 key=questionId, value=string | string[]
  const [answers, setAnswers] = useState({});
  // 每题错误提示
  const [errors, setErrors] = useState({});

  useEffect(() => {
    surveyApi
      .get(id)
      .then((data) => {
        if (data.status !== 'published') {
          setLoadError('该问卷尚未发布，暂时无法填写');
          setSurvey(null);
          return;
        }
        setSurvey(data);
        // 初始化回答数据
        const init = {};
        data.questions.forEach((q) => {
          if (q.type === 'multiple') init[q.id] = [];
          else init[q.id] = '';
        });
        setAnswers(init);
      })
      .catch((err) => {
        if (err.message.includes('不存在')) setLoadError('问卷不存在或已被删除');
        else setLoadError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const setSingle = (qid, val) => {
    setAnswers((p) => ({ ...p, [qid]: val }));
    if (errors[qid]) setErrors((p) => ({ ...p, [qid]: '' }));
  };

  const toggleMultiple = (qid, opt) => {
    setAnswers((p) => {
      const arr = p[qid] || [];
      const exists = arr.includes(opt);
      const next = exists ? arr.filter((x) => x !== opt) : [...arr, opt];
      return { ...p, [qid]: next };
    });
    if (errors[qid]) setErrors((p) => ({ ...p, [qid]: '' }));
  };

  const setText = (qid, val) => {
    setAnswers((p) => ({ ...p, [qid]: val }));
    if (errors[qid]) setErrors((p) => ({ ...p, [qid]: '' }));
  };

  const validate = useCallback(() => {
    if (!survey) return false;
    const newErrors = {};
    let ok = true;
    survey.questions.forEach((q) => {
      const v = answers[q.id];
      if (q.type === 'single') {
        if (!v) {
          newErrors[q.id] = '请选择一个选项';
          ok = false;
        }
      } else if (q.type === 'multiple') {
        if (!Array.isArray(v) || v.length === 0) {
          newErrors[q.id] = '请至少选择一个选项';
          ok = false;
        }
      } else if (q.type === 'text') {
        if (!v || typeof v !== 'string' || v.trim() === '') {
          newErrors[q.id] = '请填写回答内容';
          ok = false;
        }
      }
    });
    setErrors(newErrors);
    return ok;
  }, [survey, answers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      // 滚动到第一个错误
      const firstError = Object.keys(errors)[0] || survey?.questions[0]?.id;
      const el = document.querySelector(`[data-qid="${firstError}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      setSubmitting(true);
      await surveyApi.submitAnswer(id, answers);
      navigate('/thanks');
    } catch (err) {
      alert('提交失败：' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container loading">加载中...</div>;
  if (loadError || !survey) {
    return (
      <div className="container">
        <div className="thanks-card">
          <div className="thanks-icon" style={{ background: '#fee2e2', color: 'var(--danger)' }}>!</div>
          <h1>无法访问</h1>
          <p>{loadError || '该问卷不可用'}</p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <form className="answer-survey-card" onSubmit={handleSubmit}>
        <h1 className="answer-survey-title">{survey.title}</h1>
        <p className="answer-survey-desc">
          共 {survey.questions.length} 题，请认真填写，感谢您的参与！
        </p>

        {survey.questions.map((q, idx) => (
          <div
            key={q.id}
            className="answer-question"
            data-qid={q.id}
            style={{
              borderColor: errors[q.id] ? 'var(--danger)' : undefined,
              border: errors[q.id] ? '1px solid' : undefined,
            }}
          >
            <div className="answer-question-title">
              <span style={{ color: 'var(--primary)', marginRight: 4 }}>
                {idx + 1}.
              </span>
              <span>{q.title}</span>
              <span className="required-star">*</span>
              <span
                className="tag tag-draft"
                style={{ marginLeft: 'auto', fontWeight: 400 }}
              >
                {QUESTION_TYPE_LABEL[q.type]}
              </span>
            </div>

            {q.type === 'single' && (
              <div>
                {q.options.map((opt) => (
                  <label key={opt} className="answer-option">
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => setSingle(q.id, opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'multiple' && (
              <div>
                {q.options.map((opt) => {
                  const checked = (answers[q.id] || []).includes(opt);
                  return (
                    <label key={opt} className="answer-option">
                      <input
                        type="checkbox"
                        value={opt}
                        checked={checked}
                        onChange={() => toggleMultiple(q.id, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === 'text' && (
              <textarea
                className="form-textarea"
                rows={4}
                value={answers[q.id] || ''}
                onChange={(e) => setText(q.id, e.target.value)}
                placeholder="请在此输入您的回答..."
              />
            )}

            {errors[q.id] && (
              <div className="answer-required-hint">⚠ {errors[q.id]}</div>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ padding: '12px 32px', fontSize: 15 }}
          >
            {submitting ? '提交中...' : '提交问卷'}
          </button>
        </div>
      </form>
    </div>
  );
}
