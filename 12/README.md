# 活动报名与签到管理系统

一个功能完整的全栈 Web 应用，用于管理活动发布、报名、签到及数据统计。

## 技术栈

- **前端**：React 18 + Vite + React Router + Ant Design
- **后端**：Node.js + Express
- **数据库**：SQLite（better-sqlite3，无需额外服务）

## 项目结构

```
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── models/          # 数据模型与数据库初始化
│   │   ├── services/        # 业务逻辑层
│   │   ├── controllers/     # 请求处理层
│   │   ├── routes/          # 路由定义
│   │   └── utils/           # 工具函数
│   ├── server.js            # 入口文件
│   └── package.json
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── components/      # 通用组件
│   │   ├── services/        # API 调用层
│   │   └── utils/           # 工具函数
│   ├── index.html
│   └── package.json
└── README.md
```

## 快速开始

### 启动后端服务

```bash
cd backend
npm install
npm start
```

后端服务运行在 `http://localhost:3001`

### 启动前端应用

```bash
cd frontend
npm install
npm run dev
```

前端应用运行在 `http://localhost:5173`

## 功能特性

1. **活动管理**：创建、编辑、删除活动，包含标题、时间、地点、报名截止、最大人数、描述
2. **报名功能**：在线报名，每人每活动限报一次，实时更新报名进度
3. **取消报名**：二次确认后取消报名，释放名额
4. **签到管理**：活动结束后通过手机号签到，签到记录可视化
5. **统计看板**：总活动数、报名中活动数、总报名人次、已签到人次
6. **筛选排序**：按状态筛选、按时间排序、关键词搜索
7. **活动详情**：完整信息展示、报名列表、编辑/删除操作
8. **截止提醒**：即将截止徽章、详情页倒计时
9. **进度条**：根据报名比例动态变色（蓝<60% / 橙60-80% / 红>80%）
10. **CSV 导出**：活动结束后导出报名名单

## API 端点

### 活动相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/activities` | 获取活动列表（支持筛选、排序、搜索） |
| GET | `/api/activities/:id` | 获取活动详情（含报名列表） |
| POST | `/api/activities` | 创建活动 |
| PUT | `/api/activities/:id` | 更新活动 |
| DELETE | `/api/activities/:id` | 删除活动 |

### 报名相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/activities/:id/register` | 活动报名 |
| DELETE | `/api/registrations/:id` | 取消报名 |

### 签到相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/registrations/:id/checkin` | 签到（通过手机号） |

### 统计与导出

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stats` | 获取全局统计数据 |
| GET | `/api/activities/:id/export` | 导出活动报名名单 CSV |

## 示例数据

首次启动时，系统会自动生成 2 个示例活动：
- 一个「报名中」活动（报名截止 3 天后）
- 一个「已结束」活动（活动时间 2 天前）
- 每个活动包含 3~5 条报名记录，部分已标记签到
