# 个人学习计划与进度追踪

一个功能完整的全栈 Web 应用，帮助用户管理学习计划、追踪学习进度、保持学习习惯。

## ✨ 功能特性

### 📋 学习计划管理
- **创建计划**：名称、目标、开始/结束日期、每日学习时长目标
- **编辑计划**：可编辑除开始日期外的所有字段（结束日期不得早于今天）
- **删除计划**：二次确认，级联删除所有关联记录
- **卡片展示**：显示名称、目标、进度（已学天数/总天数）、连续学习天数

### 📝 学习记录管理
- **快速添加**：详情页顶部内联表单，日期默认今天，时长和内容必填
- **记录列表**：按日期倒序排列，支持编辑和删除
- **今日记录覆盖**：若今日已有记录，提示是否覆盖
- **新记录高亮**：添加新记录后自动高亮2秒

### 🔥 连续学习天数
- **自动计算**：每个计划的连续学习天数，中断则重置
- **全局统计**：显示所有计划中最长的连续天数
- **徽章展示**：在计划卡片上显示「连续X天」

### ⚠️ 提醒机制
- **3天未学习**：页面顶部显示黄色提醒
- **5天未学习**：显示红色警示
- 支持点击「去学习」快速跳转到计划详情

### 📊 统计看板
- 总计划数
- 进行中计划数
- 今日已学总时长
- 本月学习天数

### 🔍 筛选与排序
- 按计划状态筛选（全部/进行中/已结束）
- 按开始日期、结束日期、名称、创建时间排序
- 支持计划名称搜索

### 📈 数据可视化
- **趋势图**：详情页底部显示最近30天的每日学习时长折线图
- **空状态提示**：无数据时显示友好提示

### 📤 数据导出
- 导出学习记录为 CSV 格式
- 包含日期、时长、内容字段

### 🎯 示例数据
- 自动生成2个示例计划
  - 计划1（进行中）：Python 全栈开发，41天学习记录
  - 计划2（已结束）：英语六级备考，约40天学习记录
- 首次启动时自动初始化数据库

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript**
- **Vite** 构建工具
- **Zustand** 状态管理
- **Tailwind CSS 3** 样式框架
- **React Router** 路由管理
- **Chart.js** + **react-chartjs-2** 图表库
- **Lucide React** 图标库
- **Axios** HTTP 客户端
- **date-fns** 日期处理

### 后端
- **Node.js** + **Express 4** + **TypeScript**
- **Node.js 内置 SQLite**（`node:sqlite`）数据持久化
- **TSX** TypeScript 执行器
- **CORS** 跨域支持

## 📁 项目结构

```
study-tracker/
├── api/                          # 后端代码
│   ├── src/
│   │   ├── controllers/          # 控制层
│   │   │   ├── PlanController.ts    # 计划 API 控制器
│   │   │   ├── RecordController.ts  # 记录 API 控制器
│   │   │   └── StatsController.ts   # 统计 API 控制器
│   │   ├── repositories/         # 数据访问层
│   │   │   ├── PlanRepository.ts    # 计划 CRUD
│   │   │   └── RecordRepository.ts  # 记录 CRUD + 趋势计算
│   │   ├── services/             # 业务逻辑层
│   │   │   ├── PlanService.ts       # 计划业务逻辑（连续天数、进度）
│   │   │   ├── RecordService.ts     # 记录业务逻辑（CSV 导出）
│   │   │   └── StatsService.ts      # 统计业务逻辑（提醒计算）
│   │   ├── routes/               # 路由层
│   │   │   ├── plans.ts             # 计划和记录路由
│   │   │   └── stats.ts             # 统计路由
│   │   ├── utils/                # 工具函数
│   │   │   ├── dateUtils.ts         # 日期工具
│   │   │   └── streakUtils.ts       # 连续天数计算算法
│   │   ├── database.ts           # 数据库连接和表创建
│   │   ├── seed.ts               # 示例数据初始化
│   │   └── index.ts              # 后端入口（端口 3001）
│   ├── tsconfig.json
│   └── study-tracker.db          # SQLite 数据库文件（自动生成）
├── src/                           # 前端代码
│   ├── components/               # UI 组件
│   │   ├── StatsCard.tsx            # 统计卡片 + 统计网格
│   │   ├── AlertBanner.tsx          # 提醒横幅（3天黄/5天红）
│   │   ├── FilterBar.tsx            # 筛选搜索栏
│   │   ├── PlanCard.tsx             # 计划卡片（进度条、连续天数）
│   │   ├── PlanForm.tsx             # 计划表单（新建/编辑）
│   │   ├── RecordForm.tsx           # 快速添加记录表单
│   │   ├── RecordItem.tsx           # 记录列表项（编辑、删除）
│   │   ├── LineChart.tsx            # 学习时长趋势图
│   │   ├── Modal.tsx                # 通用弹窗
│   │   └── ConfirmDialog.tsx        # 二次确认对话框
│   ├── pages/                    # 页面组件
│   │   ├── HomePage.tsx             # 首页
│   │   └── PlanDetailPage.tsx       # 计划详情页
│   ├── services/                 # API 服务层
│   │   └── api.ts                   # 后端接口封装
│   ├── store/                    # 状态管理
│   │   └── usePlanStore.ts          # Zustand Store
│   ├── utils/                    # 前端工具函数
│   │   ├── date.ts                  # 日期格式化
│   │   └── streak.ts                # 连续天数计算
│   ├── App.tsx                   # 路由配置
│   ├── main.tsx                  # 应用入口
│   └── index.css                 # 全局样式 + Tailwind
├── shared/                        # 前后端共享
│   └── types.ts                   # TypeScript 类型定义
├── vite.config.ts                 # Vite 配置
├── tailwind.config.js             # Tailwind CSS 配置
├── package.json                   # 项目依赖和脚本
└── README.md                      # 项目说明
```

## 🚀 快速开始

### 环境要求
- Node.js >= 22.0.0（需要支持 `node:sqlite` 内置模块）

### 安装依赖
```bash
npm install
```

### 开发模式（同时启动前端和后端）
```bash
npm run dev
```

- 前端：http://localhost:5173/
- 后端：http://localhost:3001/

### 单独启动
```bash
# 仅启动前端
npm run client:dev

# 仅启动后端
npm run server:dev
```

### 手动初始化示例数据
```bash
npm run seed
```

### 类型检查
```bash
npm run check
```

### 构建生产版本
```bash
npm run build
```

## 🔌 API 接口

### 计划接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/plans` | 获取计划列表（支持筛选、排序、搜索） |
| GET | `/api/plans/:id` | 获取单个计划详情 |
| POST | `/api/plans` | 创建新计划 |
| PUT | `/api/plans/:id` | 更新计划 |
| DELETE | `/api/plans/:id` | 删除计划（级联删除记录） |

### 记录接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/plans/:planId/records` | 获取计划的所有记录 |
| POST | `/api/plans/:planId/records` | 添加/更新记录（同日期自动更新） |
| PUT | `/api/plans/:planId/records/:recordId` | 更新记录 |
| DELETE | `/api/plans/:planId/records/:recordId` | 删除记录 |
| GET | `/api/plans/:planId/trend` | 获取趋势数据（默认30天） |
| GET | `/api/plans/:planId/export` | 导出 CSV |
| GET | `/api/plans/:planId/records/today/exists` | 检查今日是否有记录 |

### 统计接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stats/overview` | 获取统计概览 |
| GET | `/api/stats/alerts` | 获取提醒列表 |

## 💡 设计亮点

### 代码分层架构
- **Repository 层**：纯数据操作，与业务逻辑解耦
- **Service 层**：核心业务逻辑，可独立测试
- **Controller 层**：HTTP 请求处理，参数验证
- **Route 层**：路由定义，权限控制（预留）

### 连续天数算法
从今天向前遍历记录日期，遇到断档则重置，时间复杂度 O(n)。

### 示例数据初始化
应用启动时自动检测数据库是否为空，为空则自动生成2个示例计划和学习记录，无需手动执行 seed 命令。

### 前端状态管理
使用 Zustand 替代 Redux，轻量高效，代码量减少 60%。

### 类型安全
前后端共享 TypeScript 类型定义，编译时即可发现接口不匹配问题。

## 📝 开发说明

### 数据库
使用 Node.js 22+ 内置的 `node:sqlite` 模块，无需安装任何原生依赖，零配置即可使用。

数据库文件位置：`api/study-tracker.db`

### 代理配置
Vite 已配置 `/api` 代理到 `http://localhost:3001`，前端无需处理跨域。

### 热重载
- 前端：Vite HMR 热更新
- 后端：`tsx watch` 自动重启

## 🎨 UI 设计规范

- 主色调：蓝色系 `#3b82f6`
- 成功色：绿色系 `#10b981`
- 警示色：黄色系 `#f59e0b`（3天）/ 红色系 `#ef4444`（5天）
- 圆角：统一使用 `rounded-xl`（12px）
- 阴影：轻量阴影 `shadow-sm`，hover 时加深

## 📄 License

MIT
