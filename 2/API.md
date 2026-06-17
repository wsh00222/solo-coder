# API 文档

所有接口前缀：`/api`

统一返回格式：

```json
{
  "code": 0,
  "data": any,
  "msg": "success"
}
```

- `code: 0` 表示成功，非 0 表示失败
- `msg` 为错误信息或提示信息
- 前端已统一处理非 0 code，会自动弹出红色警告条（5 秒后消失）

---

## 1. 问卷相关接口

### 1.1 获取问卷列表

`GET /api/surveys`

**响应示例：**

```json
{
  "code": 0,
  "data": [
    {
      "id": "sample-1",
      "title": "用户满意度调查",
      "description": "...",
      "anonymous": true,
      "published": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "questions": [...],
      "responseCount": 10
    }
  ],
  "msg": "success"
}
```

---

### 1.2 获取问卷统计概览

`GET /api/surveys/stats`

**响应示例：**

```json
{
  "code": 0,
  "data": {
    "total": 5,
    "publishedCount": 3,
    "totalResponses": 42,
    "recoveryRate": "1400.00%"
  },
  "msg": "success"
}
```

- `recoveryRate` = (总回答数 / 已发布数 * 100%)，发布数为 0 时返回 `"0%"`

---

### 1.3 获取单个问卷详情

`GET /api/surveys/:id`

**路径参数：**
- `id` - 问卷 ID

**响应示例：**

```json
{
  "code": 0,
  "data": {
    "id": "sample-1",
    "title": "用户满意度调查",
    "description": "...",
    "anonymous": true,
    "published": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "questions": [
      {
        "id": "q1",
        "type": "single",
        "title": "您对我们产品的整体满意度如何？",
        "required": true,
        "options": ["非常满意", "满意", "一般", "不满意", "非常不满意"]
      },
      {
        "id": "q2",
        "type": "multiple",
        "title": "您最常使用哪些功能？（可多选）",
        "required": true,
        "options": ["数据统计", "任务管理", "团队协作"]
      },
      {
        "id": "q3",
        "type": "text",
        "title": "您有什么建议？",
        "required": false
      }
    ]
  },
  "msg": "success"
}
```

题目类型：
- `single` - 单选题
- `multiple` - 多选题
- `text` - 文本题

---

### 1.4 创建问卷

`POST /api/surveys`

**请求体：**

```json
{
  "title": "新问卷标题",
  "description": "问卷描述（可选）",
  "anonymous": true,
  "questions": [
    {
      "type": "single",
      "title": "题干内容",
      "required": true,
      "options": ["选项A", "选项B", "选项C"]
    },
    {
      "type": "multiple",
      "title": "多选题目",
      "required": true,
      "options": ["选项1", "选项2"]
    },
    {
      "type": "text",
      "title": "文本题目",
      "required": false
    }
  ]
}
```

**校验规则：**
- 标题不能为空
- 至少 2 道题目
- 每道题题干不能为空
- 单选/多选题选项至少 2 个，且不能为空

**响应示例：**

```json
{
  "code": 0,
  "data": { "id": "xxx-uuid", "title": "...", ... },
  "msg": "success"
}
```

---

### 1.5 修改问卷

`PUT /api/surveys/:id`

请求体同创建问卷。

**注意：** 已发布的问卷不允许编辑，会返回错误：

```json
{
  "code": 1,
  "data": null,
  "msg": "已发布问卷不允许编辑"
}
```

---

### 1.6 删除问卷

`DELETE /api/surveys/:id`

**说明：**
- 已发布的问卷不允许删除
- 删除问卷同时会级联删除该问卷的所有回答数据

---

### 1.7 发布/关闭问卷

`POST /api/surveys/:id/publish`

**说明：** 切换发布状态，已发布 → 未发布，未发布 → 已发布。

**响应示例：**

```json
{
  "code": 0,
  "data": { "published": true },
  "msg": "success"
}
```

---

## 2. 回答相关接口

### 2.1 提交问卷回答

`POST /api/responses`

**请求体：**

```json
{
  "surveyId": "sample-1",
  "respondentName": "张三",
  "answers": {
    "q1": "满意",
    "q2": ["数据统计", "任务管理"],
    "q3": "希望增加导出功能"
  }
}
```

**字段说明：**
- `surveyId` - 问卷 ID（必填）
- `respondentName` - 回答者姓名，仅当问卷为实名（`anonymous: false`）时必填
- `answers` - 题目 ID → 答案的映射对象
  - 单选题：字符串（选中的选项值）
  - 多选题：字符串数组（选中的多个选项值）
  - 文本题：字符串（回答文本）

**后端校验：**
- 问卷必须已发布
- 若实名，`respondentName` 非空
- 标记为 `required` 的题目必须作答

---

### 2.2 获取问卷统计结果

`GET /api/surveys/:id/statistics`

**响应示例：**

```json
{
  "code": 0,
  "data": {
    "survey": { "id": "...", "title": "...", ... },
    "totalResponses": 15,
    "questionStats": [
      {
        "questionId": "q1",
        "type": "single",
        "title": "整体满意度？",
        "options": ["非常满意", "满意", "一般"],
        "counts": { "非常满意": 5, "满意": 8, "一般": 2 },
        "total": 15
      },
      {
        "questionId": "q2",
        "type": "multiple",
        "title": "常用功能？",
        "options": ["数据统计", "任务管理", "团队协作"],
        "counts": { "数据统计": 10, "任务管理": 12, "团队协作": 6 },
        "total": 15
      },
      {
        "questionId": "q3",
        "type": "text",
        "title": "建议？",
        "answers": [
          { "text": "希望增加导出", "respondentName": null },
          { "text": "界面可以更美观", "respondentName": null }
        ]
      }
    ]
  },
  "msg": "success"
}
```

**说明：**
- 单选题 `counts` 的各项之和等于 `totalResponses`
- 多选题 `counts` 的各项之和可能大于 `totalResponses`（因为可多选）
- 文本题 `respondentName`：匿名问卷为 `null`，实名问卷为填写者姓名

---

## 3. 工具接口

### 3.1 清空所有数据并重置

`POST /api/clear`

**说明：**
- 删除所有问卷和回答
- 恢复为 2 份初始示例问卷
- 调用时后端控制台会输出 `⚠️ WARNING` 警告日志

**响应示例：**

```json
{
  "code": 0,
  "data": null,
  "msg": "数据已重置为示例数据"
}
```
