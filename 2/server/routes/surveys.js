const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {
  readSurveys,
  writeSurveys,
  readResponses,
  writeResponses
} = require('../utils/store');

const router = express.Router();

const DEFAULT_SURVEYS = [
  {
    id: 'sample-1',
    title: '用户满意度调查',
    description: '感谢您抽出宝贵时间参与我们的用户满意度调查，您的反馈对我们非常重要！',
    anonymous: true,
    published: true,
    createdAt: '2024-01-15T10:30:00.000Z',
    questions: [
      { id: 'q1', type: 'single', title: '您对我们产品的整体满意度如何？', required: true, options: ['非常满意', '满意', '一般', '不满意', '非常不满意'] },
      { id: 'q2', type: 'multiple', title: '您最常使用我们产品的哪些功能？（可多选）', required: true, options: ['数据统计', '任务管理', '团队协作', '文件存储', '消息通知'] },
      { id: 'q3', type: 'text', title: '您对我们有什么建议或意见？', required: false }
    ]
  },
  {
    id: 'sample-2',
    title: '员工工作环境调查',
    description: '为了更好地了解大家的工作状态，我们组织了这次匿名调查，请如实填写。',
    anonymous: true,
    published: false,
    createdAt: '2024-02-20T14:00:00.000Z',
    questions: [
      { id: 'q1', type: 'single', title: '您对当前办公环境的满意度？', required: true, options: ['非常满意', '满意', '一般', '不满意'] },
      { id: 'q2', type: 'multiple', title: '您认为公司需要改善哪些方面？（可多选）', required: true, options: ['办公设备', '休息区域', '食堂餐饮', '交通补贴', '培训机会'] },
      { id: 'q3', type: 'text', title: '请分享您的其他想法：', required: false }
    ]
  }
];

function success(data = null, msg = 'success') {
  return { code: 0, data, msg };
}

function fail(msg = 'error', code = 1) {
  return { code, data: null, msg };
}

function validateSurvey(survey) {
  if (!survey.title || !survey.title.trim()) return '问卷标题不能为空';
  if (!Array.isArray(survey.questions) || survey.questions.length < 2) return '问卷至少包含2个题目';
  for (let i = 0; i < survey.questions.length; i++) {
    const q = survey.questions[i];
    if (!q.title || !q.title.trim()) return `第${i + 1}题题干不能为空`;
    if ((q.type === 'single' || q.type === 'multiple') && (!Array.isArray(q.options) || q.options.length < 2)) {
      return `第${i + 1}题选项至少2个`;
    }
  }
  return null;
}

router.get('/surveys', (req, res) => {
  const surveys = readSurveys();
  const responses = readResponses();
  const list = surveys.map(s => ({
    ...s,
    responseCount: responses.filter(r => r.surveyId === s.id).length
  }));
  res.json(success(list));
});

router.get('/surveys/stats', (req, res) => {
  const surveys = readSurveys();
  const responses = readResponses();
  const total = surveys.length;
  const publishedCount = surveys.filter(s => s.published).length;
  const totalResponses = responses.length;
  const recoveryRate = publishedCount > 0 ? ((totalResponses / publishedCount) * 100).toFixed(2) + '%' : '0%';
  res.json(success({ total, publishedCount, totalResponses, recoveryRate }));
});

router.get('/surveys/:id', (req, res) => {
  const { id } = req.params;
  const surveys = readSurveys();
  const survey = surveys.find(s => s.id === id);
  if (!survey) return res.json(fail('问卷不存在', 404));
  res.json(success(survey));
});

router.post('/surveys', (req, res) => {
  const surveys = readSurveys();
  const body = req.body;
  const errMsg = validateSurvey(body);
  if (errMsg) return res.json(fail(errMsg));
  const newSurvey = {
    id: uuidv4(),
    title: body.title,
    description: body.description || '',
    anonymous: body.anonymous !== undefined ? body.anonymous : true,
    published: false,
    createdAt: new Date().toISOString(),
    questions: body.questions.map(q => ({
      id: uuidv4(),
      type: q.type,
      title: q.title,
      required: q.required !== undefined ? q.required : true,
      options: q.options || []
    }))
  };
  surveys.push(newSurvey);
  writeSurveys(surveys);
  res.json(success(newSurvey));
});

router.put('/surveys/:id', (req, res) => {
  const { id } = req.params;
  const surveys = readSurveys();
  const idx = surveys.findIndex(s => s.id === id);
  if (idx === -1) return res.json(fail('问卷不存在', 404));
  if (surveys[idx].published) return res.json(fail('已发布问卷不允许编辑'));
  const body = req.body;
  const errMsg = validateSurvey(body);
  if (errMsg) return res.json(fail(errMsg));
  surveys[idx] = {
    ...surveys[idx],
    title: body.title,
    description: body.description || '',
    anonymous: body.anonymous !== undefined ? body.anonymous : true,
    questions: body.questions.map(q => ({
      id: q.id || uuidv4(),
      type: q.type,
      title: q.title,
      required: q.required !== undefined ? q.required : true,
      options: q.options || []
    }))
  };
  writeSurveys(surveys);
  res.json(success(surveys[idx]));
});

router.delete('/surveys/:id', (req, res) => {
  const { id } = req.params;
  let surveys = readSurveys();
  const idx = surveys.findIndex(s => s.id === id);
  if (idx === -1) return res.json(fail('问卷不存在', 404));
  if (surveys[idx].published) return res.json(fail('已发布问卷不允许删除'));
  surveys = surveys.filter(s => s.id !== id);
  writeSurveys(surveys);
  let responses = readResponses();
  responses = responses.filter(r => r.surveyId !== id);
  writeResponses(responses);
  res.json(success(null));
});

router.post('/surveys/:id/publish', (req, res) => {
  const { id } = req.params;
  const surveys = readSurveys();
  const idx = surveys.findIndex(s => s.id === id);
  if (idx === -1) return res.json(fail('问卷不存在', 404));
  surveys[idx].published = !surveys[idx].published;
  writeSurveys(surveys);
  res.json(success({ published: surveys[idx].published }));
});

router.post('/responses', (req, res) => {
  const { surveyId, respondentName, answers } = req.body;
  const surveys = readSurveys();
  const survey = surveys.find(s => s.id === surveyId);
  if (!survey) return res.json(fail('问卷不存在', 404));
  if (!survey.published) return res.json(fail('问卷未发布'));
  if (!survey.anonymous && (!respondentName || !respondentName.trim())) {
    return res.json(fail('请填写姓名'));
  }
  for (const q of survey.questions) {
    const a = answers[q.id];
    if (q.required) {
      if (q.type === 'single' && (a === undefined || a === null || a === '')) {
        return res.json(fail(`"${q.title}" 为必填项`));
      }
      if (q.type === 'multiple' && (!Array.isArray(a) || a.length === 0)) {
        return res.json(fail(`"${q.title}" 为必填项`));
      }
      if (q.type === 'text' && (a === undefined || a === null || String(a).trim() === '')) {
        return res.json(fail(`"${q.title}" 为必填项`));
      }
    }
  }
  const responses = readResponses();
  const newResponse = {
    id: uuidv4(),
    surveyId,
    respondentName: survey.anonymous ? null : respondentName,
    anonymous: survey.anonymous,
    submittedAt: new Date().toISOString(),
    answers
  };
  responses.push(newResponse);
  writeResponses(responses);
  res.json(success(newResponse));
});

router.get('/surveys/:id/statistics', (req, res) => {
  const { id } = req.params;
  const surveys = readSurveys();
  const survey = surveys.find(s => s.id === id);
  if (!survey) return res.json(fail('问卷不存在', 404));
  const responses = readResponses().filter(r => r.surveyId === id);
  const result = {
    survey,
    totalResponses: responses.length,
    questionStats: []
  };
  for (const q of survey.questions) {
    if (q.type === 'single') {
      const counts = {};
      q.options.forEach(opt => counts[opt] = 0);
      responses.forEach(r => {
        const v = r.answers[q.id];
        if (v !== undefined && v !== null && v !== '') counts[v] = (counts[v] || 0) + 1;
      });
      result.questionStats.push({
        questionId: q.id,
        type: 'single',
        title: q.title,
        options: q.options,
        counts,
        total: responses.length
      });
    } else if (q.type === 'multiple') {
      const counts = {};
      q.options.forEach(opt => counts[opt] = 0);
      responses.forEach(r => {
        const arr = r.answers[q.id];
        if (Array.isArray(arr)) arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
      });
      result.questionStats.push({
        questionId: q.id,
        type: 'multiple',
        title: q.title,
        options: q.options,
        counts,
        total: responses.length
      });
    } else if (q.type === 'text') {
      const list = responses
        .filter(r => r.answers[q.id] !== undefined && r.answers[q.id] !== null && String(r.answers[q.id]).trim() !== '')
        .map(r => ({
          text: String(r.answers[q.id]).trim(),
          respondentName: survey.anonymous ? null : r.respondentName
        }));
      result.questionStats.push({
        questionId: q.id,
        type: 'text',
        title: q.title,
        answers: list
      });
    }
  }
  res.json(success(result));
});

router.post('/clear', (req, res) => {
  console.warn('⚠️  WARNING: /api/clear called — all data will be reset to sample data!');
  writeSurveys(DEFAULT_SURVEYS);
  writeResponses([]);
  res.json(success(null, '数据已重置为示例数据'));
});

module.exports = router;
