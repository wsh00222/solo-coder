# 设备借用登记系统

一个完整的全栈 Web 应用，用于企业内部设备的借用登记管理。前端基于 **Vue 3 + Vite + Element Plus**，后端基于 **Node.js + Express + SQLite**，无需额外安装数据库服务。

---

## 功能特性

1. **设备管理**：添加/编辑/删除设备，包含设备名称、编号（唯一）、型号、位置、状态
2. **借用与归还**：支持发起借用申请、填写归还信息；归还时可选择直接转为"维修中"
3. **借用记录**：每台设备的完整借用历史，按日期倒序排列
4. **逾期检测**：自动检测超期未归还设备，红色高亮逾期标记
5. **统计看板**：总设备数、可用、已借出、维修中、逾期数的实时统计
6. **筛选搜索**：按状态筛选、按名称/编号搜索、按位置分组折叠显示
7. **设备详情**：完整信息展示、借用历史表格、借用统计（总次数、平均/最长借用天数）
8. **快速借用**：列表页一键借用 Modal，支持 Enter 键快速提交
9. **空状态与示例数据**：首次启动自动生成 4 台示例设备（含逾期借用记录）
10. **批量导出**：导出当前筛选结果为 CSV 文件（文件名含日期）

---

## 项目目录结构

```
14/
├── backend/                          # 后端项目
│   ├── package.json
│   └── src/
│       ├── index.js                  # Express 服务器入口
│       ├── models/
│       │   └── database.js           # SQLite 数据库初始化 + 示例数据
│       ├── routes/
│       │   ├── equipment.js          # 设备相关路由
│       │   └── borrow.js             # 借用相关路由
│       ├── controllers/
│       │   ├── equipmentController.js
│       │   └── borrowController.js
│       ├── services/
│       │   ├── equipmentService.js   # 设备业务逻辑
│       │   └── borrowService.js      # 借用业务逻辑
│       ├── utils/
│       │   └── helpers.js            # 通用工具函数
│       └── data/
│           └── equipment.db          # SQLite 数据文件（首次启动自动生成）
│
└── frontend/                         # 前端项目
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.js                   # 应用入口
        ├── App.vue                   # 根组件（布局/导航）
        ├── router/
        │   └── index.js              # Vue Router 配置
        ├── services/
        │   ├── request.js            # Axios 封装（拦截器）
        │   ├── equipmentApi.js       # 设备 API 调用
        │   └── borrowApi.js          # 借用 API 调用
        ├── utils/
        │   └── index.js              # 前端工具函数
        ├── components/
        │   ├── StatsBoard.vue        # 顶部统计看板
        │   ├── EquipmentFormModal.vue # 添加/编辑设备弹窗
        │   ├── QuickBorrowModal.vue  # 快速借用弹窗
        │   └── ReturnModal.vue       # 归还弹窗
        └── views/
            ├── EquipmentList.vue     # 设备列表页
            └── EquipmentDetail.vue   # 设备详情页
```

---

## 快速启动

### 环境要求

- Node.js >= 16.x
- npm 或 yarn 或 pnpm

### 步骤 1：启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动服务（默认端口 3001）
npm start
```

启动成功后将看到：

```
============================================
  设备借用登记系统 - 后端服务
============================================
  服务地址:  http://localhost:3001
  健康检查:  http://localhost:3001/api/health
  API 前缀:  http://localhost:3001/api
============================================
  数据库: SQLite (backend/src/data/equipment.db)
============================================
```

首次启动时，数据库为空会自动初始化 4 台示例设备和若干借用记录（含逾期数据）。

### 步骤 2：启动前端开发服务器

**打开一个新的终端窗口**，执行：

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器（默认端口 5173）
npm run dev
```

启动成功后访问 **http://localhost:5173** 即可进入系统。

---

## API 端点说明

所有 API 均以 `/api` 为前缀，默认响应格式：

```json
{ "success": true, "data": {}, "message": "成功信息" }
```

错误响应：`{ "success": false, "message": "错误信息" }`，HTTP 状态码 4xx/5xx。

### 一、设备管理

| 方法   | 路径 | 说明 |
|--------|------|------|
| GET    | `/api/equipment` | 获取设备列表。Query 参数：`status`（available/borrowed/maintenance），`keyword`（按名称/编号搜索） |
| GET    | `/api/equipment/statistics` | 获取全局统计看板数据 |
| GET    | `/api/equipment/refresh-overdue` | 强制刷新所有设备逾期状态，返回最新列表 + 统计 |
| GET    | `/api/equipment/export` | 导出设备 CSV 文件，Query 参数同列表接口 |
| GET    | `/api/equipment/:id` | 获取单台设备详情（含借用记录 + 借用统计） |
| POST   | `/api/equipment` | 创建设备。Body：`{ name, code, model?, location?, status? }` |
| PUT    | `/api/equipment/:id` | 更新设备信息（不可修改编号）。Body：`{ name?, model?, location?, status? }` |
| DELETE | `/api/equipment/:id` | 删除设备（仅"可用"状态允许），级联删除其借用记录 |

### 二、借用管理

| 方法   | 路径 | 说明 |
|--------|------|------|
| GET    | `/api/borrow` | 查询借用记录列表。Query：`equipmentId`（可选，按设备过滤） |
| GET    | `/api/borrow/stats/:id` | 获取指定设备的借用统计数据 |
| POST   | `/api/borrow/:id/borrow` | 对 ID 为 `:id` 的设备发起借用。Body：`{ borrower, reason, expectedReturnDate }` |
| POST   | `/api/borrow/:id/return` | 归还 ID 为 `:id` 的设备。Body：`{ actualReturnDate?, toMaintenance?:boolean }` |

### 三、状态常量

| 设备状态值 | 中文含义 |
|------------|----------|
| `available` | 可用（绿色） |
| `borrowed`  | 已借出（红色） |
| `maintenance` | 维修中（灰色） |

| 借用记录状态值 | 中文含义 |
|----------------|----------|
| `borrowing`    | 借用中（黄色） |
| `returned`     | 已归还（绿色） |
| `overdue`      | 逾期（红色，仅 displayStatus 字段使用） |

---

## 数据格式约定

所有日期统一使用 **YYYY-MM-DD** 格式，日期时间使用 **YYYY-MM-DD HH:mm:ss** 格式。

数据库文件位于 `backend/src/data/equipment.db`，如需重置数据，停止服务后删除该文件再重启即可（会自动重新生成示例数据）。

---

## 生产部署建议

1. 前端：运行 `cd frontend && npm run build`，将 `dist/` 目录交由 Nginx 等静态服务器托管
2. 后端：使用 PM2 等进程管理工具常驻运行 `node src/index.js`
3. 安全：生产环境可在 Nginx 层启用 HTTPS，并为后端添加请求频率限制

---

## 技术栈

- **前端**：Vue 3 (Composition API)、Vue Router 4、Vite 5、Element Plus 2、Axios、dayjs
- **后端**：Node.js、Express 4、better-sqlite3、dayjs、cors
- **数据库**：SQLite（零配置、单文件持久化）

