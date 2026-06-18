# 知识笔记 - 轻量级个人知识笔记管理工具

一款基于前后端分离架构的轻量级个人知识笔记管理工具，帮助你高效记录、整理和检索个人知识。

## 🛠 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | Vue 3 + Vite + Vue Router | 现代化前端框架，快速热更新 |
| **后端** | Node.js + Express | 轻量级高性能 Web 服务 |
| **数据库** | SQLite (better-sqlite3) | 无需额外安装服务，开箱即用，数据持久化存储 |
| **HTTP 客户端** | Axios | 前端 HTTP 请求库 |

## 📁 项目目录结构

```
.
├── backend/                          # 后端服务
│   ├── package.json
│   ├── data/                         # 数据库文件目录 (运行后自动生成)
│   │   └── notes.db                  # SQLite 数据库文件
│   └── src/
│       ├── server.js                 # 服务入口文件
│       ├── models/
│       │   └── database.js           # 数据库初始化、表结构、示例数据
│       ├── routes/
│       │   ├── notes.js              # 笔记路由
│       │   └── tags.js               # 标签路由
│       ├── controllers/
│       │   ├── notesController.js    # 笔记业务逻辑
│       │   └── tagsController.js     # 标签业务逻辑
│       └── middleware/
│           └── errorHandler.js       # 全局错误处理中间件
│
└── frontend/                         # 前端应用
    ├── package.json
    ├── vite.config.js                # Vite 配置 (含代理配置)
    ├── index.html
    └── src/
        ├── main.js                   # 应用入口
        ├── App.vue                   # 根组件
        ├── assets/
        │   └── styles.css            # 全局样式
        ├── router/
        │   └── index.js              # 路由配置
        ├── store/
        │   └── toast.js              # Toast 提示状态管理
        ├── services/
        │   └── api.js                # API 请求封装 (Axios)
        ├── utils/
        │   └── index.js              # 工具函数 (日期格式化、Markdown 渲染等)
        ├── components/               # 通用组件
        │   ├── ToastContainer.vue    # Toast 提示容器
        │   ├── ConfirmModal.vue      # 确认弹窗
        │   ├── NoteCard.vue          # 笔记卡片
        │   ├── StatsPanel.vue        # 统计信息面板
        │   ├── Pagination.vue        # 分页组件
        │   ├── TagManager.vue        # 标签管理弹窗
        │   ├── EmptyState.vue        # 空状态组件
        │   └── LoadingSkeleton.vue   # 加载骨架屏
        └── views/                    # 页面视图
            ├── NoteList.vue          # 笔记列表页
            ├── NoteDetail.vue        # 笔记详情页
            └── NoteEditor.vue        # 笔记编辑/新增页
```

## ✨ 功能特性

### 核心功能
- ✅ **笔记增删改查**：创建、编辑、删除、查看笔记
- ✅ **Markdown 渲染**：正文支持 Markdown 格式，自动识别并渲染
- ✅ **标签系统**：多标签绑定、标签筛选、标签管理
- ✅ **关键词搜索**：按标题模糊搜索，支持与标签筛选叠加
- ✅ **分页浏览**：每页 5 条，超过自动显示分页控件
- ✅ **统计信息**：笔记总数、标签总数、近 7 天新增数，筛选条件变化时同步更新
- ✅ **自动生成示例**：首次启动自动生成 3 篇示例笔记，包含不同标签

### 交互体验
- ✅ **Toast 提示**：所有操作成功/失败均有 Toast 反馈
- ✅ **加载状态**：请求超过 1.5 秒自动显示骨架屏占位
- ✅ **快速复制**：卡片一键复制笔记标题到剪贴板
- ✅ **删除确认**：删除笔记/标签均有二次确认弹窗
- ✅ **平滑滚动**：编辑保存后页面自动平滑滚动到顶部
- ✅ **URL 自动识别**：正文中的 http/https 链接自动变为可点击链接，新窗口打开

### 空状态处理
- ✅ **无笔记时**：引导友好的占位图 + "创建第一篇笔记" 按钮
- ✅ **搜索/筛选无结果时**：提示信息 + "清除筛选条件" 按钮

## 🚀 快速启动

### 环境要求
- Node.js >= 16.x

### 步骤 1：启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖 (首次运行需要)
npm install

# 启动服务 (默认端口 3000)
npm start
```

后端服务启动后可访问：
- API 健康检查：http://localhost:3000/api/health
- 笔记 API 基地址：http://localhost:3000/api/notes

### 步骤 2：启动前端服务

新开一个终端窗口：

```bash
# 进入前端目录
cd frontend

# 安装依赖 (首次运行需要)
npm install

# 启动开发服务器 (默认端口 5173)
npm run dev
```

启动成功后，在浏览器中访问：**http://localhost:5173**

## 📡 后端 API 文档

采用 RESTful 风格设计。

### 笔记接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/notes` | 获取笔记列表 (支持搜索/筛选/分页) |
| `GET` | `/api/notes/stats` | 获取统计信息 |
| `GET` | `/api/notes/:id` | 获取单篇笔记详情 |
| `POST` | `/api/notes` | 创建新笔记 |
| `PUT` | `/api/notes/:id` | 更新笔记 |
| `DELETE` | `/api/notes/:id` | 删除笔记 |

**GET /api/notes 查询参数：**
```
page     : 页码 (默认 1)
search   : 标题关键词 (模糊搜索)
tag      : 标签名称 (精确匹配)
```

**POST /api/notes 请求体示例：**
```json
{
  "title": "笔记标题",
  "content": "笔记正文，支持 Markdown",
  "tags": ["标签1", "标签2"]
}
```

### 标签接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/tags` | 获取所有标签及使用次数 |
| `DELETE` | `/api/tags/:id` | 删除标签 (不删除笔记本身) |

## 🎯 常用操作

- **创建笔记**：点击右上角「新建笔记」按钮
- **搜索笔记**：在列表页顶部搜索框输入标题关键词
- **标签筛选**：点击标签筛选区的标签名称，再次点击「全部」取消
- **编辑笔记**：进入详情页后点击「编辑」按钮
- **删除笔记**：进入详情页后点击「删除」按钮，二次确认后删除
- **管理标签**：点击顶部「标签管理」按钮查看所有标签，可删除标签
- **复制标题**：在列表页笔记卡片右上角点击复制图标

## 💾 数据存储

数据库文件默认位于：`backend/data/notes.db`

如需备份，直接复制该文件即可；如需重置数据，删除该文件后重启服务即可重新生成示例数据。

## 📝 开发说明

- 前端已配置代理，所有 `/api` 请求会自动转发到 `http://localhost:3000`
- 后端默认端口 3000，前端默认端口 5173
- 修改端口可通过环境变量 `PORT` 指定后端端口，前端端口修改 `vite.config.js`
