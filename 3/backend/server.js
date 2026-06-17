/**
 * 在线问卷系统后端服务
 * 使用 Express + 内存存储
 *
 * OpenAPI 概览：
 *
 * GET    /api/surveys              - 获取问卷列表（返回全部，分页由前端处理）
 * POST   /api/surveys              - 创建新问卷（标题不可重名）
 * GET    /api/surveys/:id          - 获取单个问卷详情（含问题列表）
 * PUT    /api/surveys/:id          - 更新问卷（仅草稿状态可更新，已发布返回403）
 * POST   /api/surveys/:id/publish  - 发布问卷（状态变为已发布）
 * DELETE /api/surveys/:id          - 删除问卷（同步删除关联回答）
 *
 * POST   /api/surveys/:id/answers  - 提交一份回答
 * GET    /api/surveys/:id/stats    - 获取问卷回答统计
 * GET    /api/surveys/:id/export   - 导出问卷回答 CSV
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ==================== 内存数据存储 ====================
/**
 * 问卷表（surveys）字段说明：
 *   id         - 唯一标识
 *   title      - 问卷标题（唯一）
 *   status     - 'draft' 草稿 / 'published' 已发布
 *   createdAt  - 创建时间 ISO 字符串
 *   questions  - 问题数组
 *     questions[].id       - 问题ID
 *     questions[].type     - 'single'单选 / 'multiple'多选 / 'text'文本
 *     questions[].title    - 题干
 *     questions[].options  - 选项数组（仅选择类题目有效）
 */
const surveys = [];

/**
 * 回答表（answers）字段说明：
 *   id         - 唯一标识
 *   surveyId   - 所属问卷ID
 *   submittedAt- 提交时间
 *   data       - 回答数据对象：
 *                  key   = questionId
 *                  value = single -> 选项字符串
 *                          multiple -> 选项字符串数组
 *                          text     -> 文本字符串
 */
const answers = [];

// ==================== 工具函数 ====================
function findSurveyIndex(id) {
  return surveys.findIndex((s) => s.id === id);
}
function findSurvey(id) {
  return surveys.find((s) => s.id === id);
}
function getAnswersBySurvey(surveyId) {
  return answers.filter((a) => a.surveyId === surveyId);
}
function surveyListPayload(survey) {
  const count = getAnswersBySurvey(survey.id).length;
  return {
    id: survey.id,
    title: survey.title,
    status: survey.status,
    createdAt: survey.createdAt,
    questionCount: survey.questions.length,
    answerCount: count,
  };
}
function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = Array.isArray(val) ? val.join('; ') : String(val);
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// ==================== 测试数据初始化 ====================
(function seedData() {
  const s1 = {
    id: uuidv4(),
    title: '用户满意度调查',
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    questions: [
      {
        id: uuidv4(),
        type: 'single',
        title: '您对我们产品的整体满意度如何？',
        options: ['非常满意', '满意', '一般', '不满意', '非常不满意'],
      },
      {
        id: uuidv4(),
        type: 'multiple',
        title: '您最常使用的功能有哪些？（可多选）',
        options: ['数据分析', '报表生成', '团队协作', '消息通知', '权限管理'],
      },
      {
        id: uuidv4(),
        type: 'text',
        title: '您有什么建议想对我们说？',
        options: [],
      },
    ],
  };

  const s2 = {
    id: uuidv4(),
    title: '员工午餐偏好调查',
    status: 'draft',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    questions: [
      {
        id: uuidv4(),
        type: 'single',
        title: '您更倾向于哪种午餐方式？',
        options: ['公司食堂', '外卖', '自带便当', '外出就餐'],
      },
      {
        id: uuidv4(),
        type: 'multiple',
        title: '您喜欢的菜系有哪些？（可多选）',
        options: ['川菜', '粤菜', '湘菜', '鲁菜', '西餐', '日料'],
      },
    ],
  };

  surveys.push(s1, s2);

  // 为 s1 生成若干示例回答
  const sampleAnswers = [
    {
      [s1.questions[0].id]: '非常满意',
      [s1.questions[1].id]: ['数据分析', '报表生成'],
      [s1.questions[2].id]: '希望能增加移动端的支持！',
    },
    {
      [s1.questions[0].id]: '满意',
      [s1.questions[1].id]: ['数据分析', '团队协作', '消息通知'],
      [s1.questions[2].id]: '整体体验不错，界面很友好。',
    },
    {
      [s1.questions[0].id]: '满意',
      [s1.questions[1].id]: ['报表生成'],
      [s1.questions[2].id]: '报表导出格式可以更丰富一些。',
    },
    {
      [s1.questions[0].id]: '一般',
      [s1.questions[1].id]: ['消息通知', '权限管理'],
      [s1.questions[2].id]: '加载速度有时候比较慢。',
    },
    {
      [s1.questions[0].id]: '非常满意',
      [s1.questions[1].id]: ['数据分析', '报表生成', '团队协作', '消息通知'],
      [s1.questions[2].id]: '继续加油！期待更多功能。',
    },
    {
      [s1.questions[0].id]: '满意',
      [s1.questions[1].id]: ['团队协作'],
      [s1.questions[2].id]: '协作功能非常实用。',
    },
    {
      [s1.questions[0].id]: '不满意',
      [s1.questions[1].id]: [],
      [s1.questions[2].id]: '功能太少，需要完善。',
    },
  ];

  sampleAnswers.forEach((data) => {
    answers.push({
      id: uuidv4(),
      surveyId: s1.id,
      submittedAt: new Date().toISOString(),
      data,
    });
  });

  console.log('[Seed] 初始化测试数据：2 份问卷，' + sampleAnswers.length + ' 份回答。');
})();

// ==================== API 路由 ====================

/**
 * @openapi
 * /api/surveys:
 *   get:
 *     summary: 获取全部问卷列表（分页由前端处理）
 *     responses:
 *       200:
 *         description: 返回问卷列表数组
 */
app.get('/api/surveys', (req, res) => {
  res.json(surveys.map(surveyListPayload));
});

/**
 * @openapi
 * /api/surveys:
 *   post:
 *     summary: 创建新问卷
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               title: { type: string, description: "问卷标题，必填且唯一" }
 *               questions: { type: array, description: "问题数组" }
 *     responses:
 *       201: { description: "创建成功" }
 *       400: { description: "标题为空或已存在" }
 */
app.post('/api/surveys', (req, res) => {
  const { title, questions } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: '问卷标题不能为空' });
  }
  if (surveys.some((s) => s.title === title.trim())) {
    return res.status(400).json({ error: '问卷标题已存在，请更换一个' });
  }

  const newSurvey = {
    id: uuidv4(),
    title: title.trim(),
    status: 'draft',
    createdAt: new Date().toISOString(),
    questions: Array.isArray(questions) ? questions : [],
  };

  surveys.push(newSurvey);
  res.status(201).json(newSurvey);
});

/**
 * @openapi
 * /api/surveys/{id}:
 *   get:
 *     summary: 获取单个问卷详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "问卷详情对象" }
 *       404: { description: "问卷不存在" }
 */
app.get('/api/surveys/:id', (req, res) => {
  const survey = findSurvey(req.params.id);
  if (!survey) return res.status(404).json({ error: '问卷不存在' });
  res.json(survey);
});

/**
 * @openapi
 * /api/surveys/{id}:
 *   put:
 *     summary: 更新问卷（仅草稿可更新，已发布返回403）
 *     responses:
 *       200: { description: "更新成功" }
 *       400: { description: "标题为空或重名" }
 *       403: { description: "已发布问卷不可修改" }
 *       404: { description: "问卷不存在" }
 */
app.put('/api/surveys/:id', (req, res) => {
  const idx = findSurveyIndex(req.params.id);
  if (idx === -1) return res.status(404).json({ error: '问卷不存在' });

  const survey = surveys[idx];
  if (survey.status === 'published') {
    return res.status(403).json({ error: '已发布的问卷不可修改' });
  }

  const { title, questions } = req.body || {};

  if (title !== undefined) {
    const trimmed = String(title).trim();
    if (trimmed === '') return res.status(400).json({ error: '问卷标题不能为空' });
    if (surveys.some((s) => s.id !== survey.id && s.title === trimmed)) {
      return res.status(400).json({ error: '问卷标题已存在，请更换一个' });
    }
    survey.title = trimmed;
  }

  if (questions !== undefined && Array.isArray(questions)) {
    survey.questions = questions;
  }

  res.json(survey);
});

/**
 * @openapi
 * /api/surveys/{id}/publish:
 *   post:
 *     summary: 发布问卷（状态变为已发布）
 *     responses:
 *       200: { description: "发布成功" }
 *       400: { description: "至少需要一个问题" }
 *       404: { description: "问卷不存在" }
 */
app.post('/api/surveys/:id/publish', (req, res) => {
  const survey = findSurvey(req.params.id);
  if (!survey) return res.status(404).json({ error: '问卷不存在' });

  if (!survey.questions || survey.questions.length === 0) {
    return res.status(400).json({ error: '至少添加一个问题才能发布' });
  }

  for (const q of survey.questions) {
    if (q.type === 'single' || q.type === 'multiple') {
      if (!q.options || q.options.length < 2) {
        return res.status(400).json({ error: `选择类题目"${q.title}"至少需要两个选项` });
      }
    }
  }

  survey.status = 'published';
  res.json(survey);
});

/**
 * @openapi
 * /api/surveys/{id}:
 *   delete:
 *     summary: 删除问卷及其所有关联回答
 *     responses:
 *       204: { description: "删除成功" }
 *       404: { description: "问卷不存在" }
 */
app.delete('/api/surveys/:id', (req, res) => {
  const idx = findSurveyIndex(req.params.id);
  if (idx === -1) return res.status(404).json({ error: '问卷不存在' });

  const id = req.params.id;
  surveys.splice(idx, 1);

  // 同步删除关联回答
  for (let i = answers.length - 1; i >= 0; i--) {
    if (answers[i].surveyId === id) answers.splice(i, 1);
  }

  res.status(204).end();
});

/**
 * @openapi
 * /api/surveys/{id}/answers:
 *   post:
 *     summary: 提交一份问卷回答
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               data: { type: object, description: "回答数据，key=questionId" }
 *     responses:
 *       201: { description: "提交成功" }
 *       400: { description: "校验失败" }
 *       404: { description: "问卷不存在或未发布" }
 */
app.post('/api/surveys/:id/answers', (req, res) => {
  const survey = findSurvey(req.params.id);
  if (!survey) return res.status(404).json({ error: '问卷不存在' });
  if (survey.status !== 'published') {
    return res.status(400).json({ error: '问卷尚未发布，无法提交回答' });
  }

  const { data } = req.body || {};
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: '回答数据格式错误' });
  }

  // 简单校验（前端也会校验，后端再次兜底）
  for (const q of survey.questions) {
    const answer = data[q.id];
    if (q.type === 'single') {
      if (!answer || typeof answer !== 'string') {
        return res.status(400).json({ error: `请完成单选题：${q.title}` });
      }
    } else if (q.type === 'multiple') {
      if (!Array.isArray(answer) || answer.length === 0) {
        return res.status(400).json({ error: `请至少选择一项多选题：${q.title}` });
      }
    } else if (q.type === 'text') {
      if (!answer || typeof answer !== 'string' || answer.trim() === '') {
        return res.status(400).json({ error: `请填写文本题：${q.title}` });
      }
    }
  }

  const newAnswer = {
    id: uuidv4(),
    surveyId: survey.id,
    submittedAt: new Date().toISOString(),
    data,
  };
  answers.push(newAnswer);
  res.status(201).json(newAnswer);
});

/**
 * @openapi
 * /api/surveys/{id}/stats:
 *   get:
 *     summary: 获取问卷回答统计
 *     responses:
 *       200: { description: "统计数据" }
 *       404: { description: "问卷不存在" }
 */
app.get('/api/surveys/:id/stats', (req, res) => {
  const survey = findSurvey(req.params.id);
  if (!survey) return res.status(404).json({ error: '问卷不存在' });

  const ansList = getAnswersBySurvey(survey.id);
  const total = ansList.length;

  const perQuestion = survey.questions.map((q) => {
    if (q.type === 'single' || q.type === 'multiple') {
      const counter = {};
      q.options.forEach((opt) => (counter[opt] = 0));

      if (q.type === 'single') {
        ansList.forEach((a) => {
          const v = a.data[q.id];
          if (typeof v === 'string' && counter.hasOwnProperty(v)) counter[v]++;
        });
      } else {
        // 多选题：按选项计数
        ansList.forEach((a) => {
          const v = a.data[q.id];
          if (Array.isArray(v)) {
            v.forEach((opt) => {
              if (counter.hasOwnProperty(opt)) counter[opt]++;
            });
          }
        });
      }

      const distribution = q.options.map((opt) => ({
        option: opt,
        count: counter[opt],
        percent: total === 0 ? 0 : Number(((counter[opt] / total) * 100).toFixed(2)),
      }));

      return {
        questionId: q.id,
        type: q.type,
        title: q.title,
        options: q.options,
        distribution,
      };
    } else {
      // 文本题：列出全部回答
      const list = ansList
        .map((a) => a.data[q.id])
        .filter((v) => typeof v === 'string' && v.trim() !== '');
      return {
        questionId: q.id,
        type: q.type,
        title: q.title,
        textAnswers: list,
      };
    }
  });

  res.json({
    surveyId: survey.id,
    title: survey.title,
    totalAnswers: total,
    perQuestion,
  });
});

/**
 * @openapi
 * /api/surveys/{id}/export:
 *   get:
 *     summary: 导出问卷回答 CSV（浏览器触发下载）
 *     responses:
 *       200: { description: "CSV 文件" }
 *       404: { description: "问卷不存在" }
 */
app.get('/api/surveys/:id/export', (req, res) => {
  const survey = findSurvey(req.params.id);
  if (!survey) return res.status(404).json({ error: '问卷不存在' });

  const ansList = getAnswersBySurvey(survey.id);

  // 表头
  const header = ['提交时间', ...survey.questions.map((q) => q.title)];
  const rows = [header];

  ansList.forEach((a) => {
    const row = [a.submittedAt];
    survey.questions.forEach((q) => {
      row.push(a.data[q.id] ?? '');
    });
    rows.push(row);
  });

  const csv = '\uFEFF' + rows.map((r) => r.map(escapeCSV).join(',')).join('\n');
  const filename = encodeURIComponent(`${survey.title}-回答数据.csv`);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
  res.send(csv);
});

// ==================== 启动 ====================
app.listen(PORT, () => {
  console.log(`[Server] 问卷系统后端已启动：http://localhost:${PORT}`);
});
