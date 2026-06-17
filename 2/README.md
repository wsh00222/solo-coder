# 在线问卷调查系统

一个基于 **Node.js + Express + React + Ant Design** 的简易在线问卷调查系统，数据使用 JSON 文件存储。

## 功能特性

- ✅ 创建/编辑问卷（支持单选题、多选题、文本题）
- ✅ 动态增删题目和选项
- ✅ 问卷发布/关闭控制
- ✅ 独立填写路由（匿名/实名填写）
- ✅ 前端表单校验
- ✅ 统计结果可视化（柱状图 + 进度条）
- ✅ 全局异常处理与错误提示
- ✅ 删除二次确认与淡出动画
- ✅ 一键清空重置数据接口

## 技术栈

| 模块 | 技术 |
|------|------|
| 后端 | Node.js + Express + uuid |
| 前端 | React 18 + Vite + React Router v6 |
| UI 组件 | Ant Design 5 |
| 图表库 | Ant Design Charts (@ant-design/charts) |
| HTTP 客户端 | Axios |
| 数据存储 | JSON 文件（surveys.json / responses.json） |

## 目录结构

```
.
├── server/                  # 后端
│   ├── data/                # JSON 数据文件
│   │   ├── surveys.json     # 问卷数据
│   │   └── responses.json   # 回答数据
│   ├── routes/
│   │   └── surveys.js       # API 路由
│   ├── utils/
│   │   └── store.js         # JSON 文件读写工具
│   ├── index.js             # 入口文件
│   └── package.json
└── client/                  # 前端
    ├── src/
    │   ├── api/
    │   │   └── request.js   # Axios 封装
    │   ├── context/
    │   │   └── AlertContext.jsx  # 全局 Alert 状态
    │   ├── pages/
    │   │   ├── SurveyList.jsx    # 问卷列表
    │   │   ├── CreateSurvey.jsx  # 创建/编辑问卷
    │   │   ├── FillSurvey.jsx    # 填写问卷
    │   │   └── Statistics.jsx    # 统计结果
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 快速开始

### 环境要求

- Node.js >= 16
- npm 或 yarn

### 1. 启动后端

```bash
cd server
npm install
npm start
```

后端服务运行在 `http://localhost:3001`

### 2. 启动前端

（另开一个终端）

```bash
cd client
npm install
npm run dev
```

前端运行在 `http://localhost:5173`，已配置代理转发 `/api` 到后端 3001 端口。

### 3. 访问系统

打开浏览器访问 `http://localhost:5173`

系统默认包含 2 份示例问卷：
1. **用户满意度调查**（已发布）- 3 道题
2. **员工工作环境调查**（未发布）- 3 道题

## 主要页面路由

| 路由 | 页面 |
|------|------|
| `/` | 问卷列表页 |
| `/create` | 创建问卷 |
| `/edit/:id` | 编辑问卷（未发布的才能编辑） |
| `/fill/:id` | 填写问卷（独立路由，可分享链接） |
| `/statistics/:id` | 查看统计结果 |

## 清空所有数据

后端提供重置接口，会清空所有问卷和回答，并恢复为 2 份示例问卷：

```bash
curl -X POST http://localhost:3001/api/clear
```

调用时后端控制台会输出警告日志。

---

详细 API 文档请见 [API.md](./API.md)。
