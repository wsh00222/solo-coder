# 个人书单与阅读记录管理器

一个功能完整的全栈 Web 应用，用于管理个人书籍收藏和阅读进度。

## 技术栈

- **前端**: React 18 + Vite + React Router + TailwindCSS
- **后端**: Node.js + Express
- **数据库**: SQLite (通过 better-sqlite3 持久化存储)

## 项目结构

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/      # 控制器层
│   │   ├── routes/           # 路由层
│   │   ├── services/         # 业务逻辑层
│   │   ├── models/           # 数据模型层
│   │   ├── middleware/       # 中间件
│   │   ├── db.js             # 数据库初始化
│   │   └── seed.js           # 示例数据种子
│   ├── server.js             # 入口文件
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   ├── components/       # 通用组件
│   │   ├── services/         # API 调用层
│   │   ├── utils/            # 工具函数
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## 启动方式

### 1. 启动后端服务

```bash
cd backend
npm install
npm start
```

后端服务将运行在 http://localhost:3001

### 2. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将运行在 http://localhost:5173

## 主要接口说明

### 书籍相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/books | 获取书籍列表（支持筛选、排序、分页） |
| GET | /api/books/:id | 获取书籍详情（含阅读历史） |
| POST | /api/books | 添加新书籍 |
| POST | /api/books/quick | 快速添加书籍 |
| PUT | /api/books/:id | 更新书籍信息 |
| DELETE | /api/books/:id | 删除书籍 |
| PATCH | /api/books/:id/rating | 更新书籍评分 |
| PATCH | /api/books/:id/progress | 更新阅读进度 |

### 统计相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/stats | 获取全局统计数据 |

### 查询参数说明

- `status`: 按状态筛选 (want_to_read / reading / finished)
- `genre`: 按类型筛选 (novel / tech / life / other)
| 字段 | 类型 | 说明 |
|------|------|------|
| status | string | 筛选：want_to_read / reading / finished |
| genre | string | 筛选：novel / tech / life / other |
| sort | string | 排序：title / rating |
| page | number | 页码，默认 1 |
| limit | number | 每页数量，默认 6 |
