# 在线问卷系统（全栈 Demo）

一个基于 **React (Vite) + Express + 内存存储** 的快速在线问卷创建与发布系统，支持多题型、拖拽排序、实时统计、CSV 导出。

## 功能特性

- 📝 **问卷管理**：创建、编辑、发布、删除问卷（草稿 / 已发布双状态）
- 🔢 **多题型**：单选题、多选题、文本题，支持动态添加/删除问题与选项
- 🎯 **拖拽排序**：使用原生 HTML5 DnD 调整问题顺序（前端实现，持久化存储）
- 🔗 **短链接发布**：发布后生成 `/answer/:id` 路径可直接分享填写
- ✅ **表单校验**：单选必选 / 多选至少一项 / 文本非空（前后端双重校验）
- 📊 **数据统计**：Recharts 柱状图展示选项分布，进度条显示占比，0 选择项正常显示
- 📄 **CSV 导出**：一键导出全部回答数据（UTF-8 with BOM，Excel 可直接打开）
- 🎨 **UI 细节**：卡片悬停边框渐变、状态标签（草稿灰 / 发布绿）、二次确认弹窗
- 📄 **前端分页**：问卷列表每页 5 条，支持上一页 / 下一页
- 🗂️ **示例数据**：启动即预置 2 份示例问卷 + 7 份回答数据，便于演示

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | React 18 + Hooks、React Router v6、Recharts、Vite 5 |
| 后端 | Express 4、CORS、UUID（内存存储，无数据库） |
| 通信 | RESTful API + JSON，前端通过 Vite proxy `/api` 转发到后端 |

## 目录结构

```
.
├── backend/                    # Express 后端
│   ├── package.json
│   └── server.js               # 全部 API + 内存数据 + 测试数据
├── frontend/                   # React 前端 (Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js          # 含 /api 代理配置
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             # 路由 + 导航栏
│       ├── api.js              # Fetch API 封装
│       ├── utils.js            # 日期、分页、题型映射等
│       ├── styles.css          # 全局样式
│       ├── components/
│       │   └── ConfirmModal.jsx
│       └── pages/
│           ├── SurveyList.jsx      # 首页：问卷列表（分页）
│           ├── SurveyEditor.jsx    # 新建 / 编辑 / 预览问卷
│           ├── AnswerPage.jsx      # 回答填写页
│           ├── ThankYouPage.jsx    # 提交成功感谢页
│           └── StatsPage.jsx       # 统计页 + 图表 + CSV 导出
└── README.md
```

## 快速开始

### 1. 安装依赖

需要两个终端分别安装（或一次性安装）：

```bash
# 后端
cd backend
npm install

# 前端（新开一个终端）
cd ../frontend
npm install
```

### 2. 启动服务

**后端**（默认端口 5000）：

```bash
cd backend
npm run server
# 或 npm start
```

**前端**（新开终端，默认端口 3000，自动代理 `/api` 到后端）：

```bash
cd frontend
npm start
# 或 npm run dev
```

### 3. 访问

浏览器打开：**http://localhost:3000**

默认会看到预置的两份问卷：

- **用户满意度调查**（已发布，含 7 份示例回答 → 可直接进入"查看统计"看图表）
- **员工午餐偏好调查**（草稿状态 → 可编辑、发布）

## 后端 API 一览

> 所有接口前缀 `/api`，在代码内有详细 JSDoc + OpenAPI 注释。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/surveys` | 获取问卷列表（全量，分页前端处理） |
| POST | `/surveys` | 创建问卷（标题唯一校验） |
| GET | `/surveys/:id` | 问卷详情（含问题列表） |
| PUT | `/surveys/:id` | 更新问卷（已发布 → **403 Forbidden**） |
| POST | `/surveys/:id/publish` | 发布问卷（状态 draft → published，至少 1 题） |
| DELETE | `/surveys/:id` | 删除问卷及全部关联回答 |
| POST | `/surveys/:id/answers` | 提交一份回答（含校验） |
| GET | `/surveys/:id/stats` | 回答统计（每题分布 / 文本列表） |
| GET | `/surveys/:id/export` | 导出 CSV（Content-Disposition 触发下载） |

## 前端路由

| 路径 | 页面 |
| --- | --- |
| `/` | 问卷列表（首页） |
| `/new` | 新建问卷 |
| `/edit/:id` | 编辑 / 预览问卷（按状态区分） |
| `/answer/:id` | 回答填写页（短链接） |
| `/thanks` | 提交成功感谢页 |
| `/stats/:id` | 统计页（含图表 + CSV 导出） |

## 关键实现说明

### 数据存储
使用 Node.js 内存数组 `surveys` 与 `answers`。服务重启会清空，已内置启动脚本自动注入示例数据。

### 已发布问卷不可编辑
- **前端**：`SurveyEditor` 根据 `original.status === 'published'` 切换 `readOnly` 模式，隐藏"保存/发布"按钮，改为"查看统计 / 打开填写链接"。
- **后端**：`PUT /surveys/:id` 对已发布问卷直接返回 `403 { error: '已发布的问卷不可修改' }`。

### 多选题统计口径
按**选项计数**（每个选项被选次数），百分比 = 选项次数 / 总回答数。即便总回答数为 0，也会正确显示所有选项的 0%。

### CSV 编码
响应体以 `\uFEFF`（UTF-8 BOM）开头，Excel 打开中文不乱码；字段中的逗号、引号、换行自动转义。

### 跨域
开发环境通过 Vite `server.proxy` 将 `/api/**` 转发至 `http://localhost:5000`；生产可自行配置 Nginx 反向代理。

## 可能的扩展方向

- 将内存存储替换为 MongoDB / MySQL / SQLite
- 接入鉴权（JWT），支持多用户
- 问卷主题皮肤、逻辑跳转、必答题配置等高级功能
- 回答统计支持饼图、折线图等更多维度
- 问卷链接访问密码、过期时间
