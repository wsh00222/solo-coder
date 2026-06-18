# 团队提案投票决策工具

一个功能完整的团队提案投票决策 Web 应用，支持提案创建、投票、统计分析等功能。

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router
- **HTTP 客户端**: Axios

### 后端
- **运行时**: Node.js
- **框架**: Express + TypeScript
- **数据库**: SQLite (better-sqlite3)
- **跨域**: CORS

## 项目结构

```
team-proposal-voting/
├── backend/                    # 后端项目
│   ├── src/
│   │   ├── controllers/    # 控制器层 - 处理HTTP请求
│   │   │   ├── proposalController.ts
│   │   │   ├── voteController.ts
│   │   │   └── statisticsController.ts
│   │   ├── models/         # 数据模型层
│   │   │   └── database.ts    # 数据库连接和初始化
│   │   ├── routes/         # 路由层 - API接口定义
│   │   │   ├── proposalRoutes.ts
│   │   │   ├── voteRoutes.ts
│   │   │   └── statisticsRoutes.ts
│   │   ├── services/       # 服务层 - 业务逻辑
│   │   │   ├── proposalService.ts
│   │   │   ├── voteService.ts
│   │   │   └── statisticsService.ts
│   │   ├── types/          # 类型定义
│   │   │   └── index.ts
│   │   └── index.ts        # 应用入口
│   ├── data/               # 数据库文件目录
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/     # 公共组件
│   │   │   ├── Toast.tsx
│   │   │   ├── VoteProgressBar.tsx
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── ProposalCard.tsx
│   │   │   ├── ProposalModal.tsx
│   │   │   ├── StatisticsPanel.tsx
│   │   │   └── Pagination.tsx
│   │   ├── pages/          # 页面组件
│   │   │   ├── HomePage.tsx
│   │   │   └── ProposalDetailPage.tsx
│   │   ├── services/       # API服务层
│   │   │   └── api.ts
│   │   ├── utils/          # 工具函数
│   │   │   ├── date.ts
│   │   │   └── vote.ts
│   │   ├── types/          # 类型定义
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── package.json             # 根目录配置
└── README.md
└── .gitignore
```

## 核心功能

1. **提案管理**
   - 创建提案（标题、描述、提案人、截止日期、附件链接）
   - 编辑提案（标题、描述、截止日期）
   - 删除提案（带二次确认）
   - 默认截止日期为创建后7天

2. **投票功能**
   - 赞成/反对投票
   - 每人每提案限投一次
   - 投票人昵称（可选，默认匿名）
   - 实时显示投票结果
   - 投票成功Toast提示

3. **提案列表**
   - 按创建时间倒序排列
   - 状态筛选（进行中/已截止）
   - 提案人筛选
   - 分页显示（每页4条）
   - 进度条显示投票比例
   - 24小时内截止警告标识

4. **统计看板**
   - 总提案数
   - 进行中提案数
   - 总投票数
   - 参与度最高的提案

5. **便捷功能**
   - 复制提案链接
   - 附件链接（新窗口打开）
   - 响应式设计

## 启动步骤

### 前置要求
- Node.js >= 16
- npm 或 yarn

### 1. 安装依赖

```bash
# 在根目录执行，安装所有依赖
npm run install:all
```

或分别安装：
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 启动开发服务器

```bash
# 在根目录执行，同时启动前后端
npm run dev
```

或分别启动：
```bash
# 启动后端 (端口 3001)
cd backend
npm run dev

# 启动前端 (端口 5173)
cd ../frontend
npm run dev
```

### 3. 访问应用

打开浏览器访问: http://localhost:5173

### 4. 构建生产版本

```bash
npm run build
```

## API 接口文档

### 提案相关接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/proposals` | 获取提案列表（支持分页、筛选） |
| GET | `/api/proposals/:id` | 获取提案详情 |
| POST | `/api/proposals` | 创建提案 |
| PUT | `/api/proposals/:id` | 更新提案 |
| DELETE | `/api/proposals/:id` | 删除提案 |
| GET | `/api/proposals/proposers` | 获取所有提案人列表 |

### 投票相关接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/votes/:proposalId` | 获取当前用户投票 |
| POST | `/api/votes/:proposalId` | 提交投票 |
| GET | `/api/votes/:proposalId/all` | 获取提案所有投票 |

### 统计相关接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/statistics` | 获取全局统计数据 |

## 数据持久化

数据库文件存储在 `backend/data/proposals.db`，重启服务数据不会丢失。

首次启动时，如果数据库为空，会自动生成2个示例提案（一个进行中、一个已截止），每个附带3-5条投票记录。

## 注意事项

1. 投票防重复：基于用户IP地址限制，每人每提案只能投一次
2. 截止日期处理：超过截止日期的提案自动变为"已截止"状态，不再接受投票
3. 编辑提案：编辑后已有的投票记录保持不变
4. 删除提案：删除提案会级联删除所有相关投票记录
