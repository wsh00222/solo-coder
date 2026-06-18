# 个人旅行计划管理器

一个功能完整的全栈 Web 应用，帮助用户规划和管理旅行计划。

## 功能特性

- 🗺️ **旅行计划管理**：创建、编辑、删除旅行计划，自动计算天数和状态
- 📅 **每日行程安排**：按日期分组展示行程，支持添加多个时间段活动
- ⚠️ **行程冲突检测**：同一时间段冲突警告，确认后可继续添加
- 📊 **统计概览**：总计划数、即将出发、进行中数量实时统计
- 🔍 **筛选与排序**：按状态筛选、目的地搜索、出发日期排序
- 📱 **响应式设计**：完美适配桌面端和移动端
- ✨ **流畅动画**：删除滑出、页面淡入、冲突警告抖动、新增行程闪烁
- 🎨 **精美UI**：深青色主色调，ZCOOL XiaoWei 手写字体标题

## 技术栈

### 前端
- **框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **样式**：Tailwind CSS 3
- **状态管理**：Zustand
- **路由**：React Router v6
- **图标**：lucide-react

### 后端
- **框架**：Express 4 + TypeScript
- **数据库**：SQLite (better-sqlite3)
- **跨域**：cors
- **类型共享**：前后端共享 TypeScript 类型定义

## 项目结构

```
├── api/                          # 后端代码
│   ├── src/
│   │   ├── controllers/          # 控制器层
│   │   │   ├── planController.ts
│   │   │   └── itineraryController.ts
│   │   ├── db/                   # 数据库层
│   │   │   └── index.ts
│   │   ├── models/               # 模型层
│   │   │   ├── Plan.ts
│   │   │   └── Itinerary.ts
│   │   ├── routes/               # 路由层
│   │   │   ├── plans.ts
│   │   │   └── itineraries.ts
│   │   ├── services/             # 服务层
│   │   │   ├── planService.ts
│   │   │   ├── itineraryService.ts
│   │   │   └── seedService.ts
│   │   └── index.ts              # Express 应用配置
│   └── server.ts                 # 服务器启动入口
├── shared/                       # 共享类型定义
│   └── types.ts
├── src/                          # 前端代码
│   ├── components/               # 通用组件
│   ├── pages/                    # 页面组件
│   ├── services/                 # API 服务层
│   ├── store/                    # 状态管理
│   ├── types/                    # 前端类型
│   ├── utils/                    # 工具函数
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

同时启动前后端（推荐）：

```bash
npm run dev
```

或者分别启动：

```bash
# 启动前端 (端口 29201)
npm run dev:web

# 启动后端 (端口 29202)
npm run dev:api
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm run start
```

## API 端点说明

### 计划 (Plans)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/plans` | 获取所有计划列表 |
| GET | `/api/plans/:id` | 获取单个计划详情（含行程） |
| POST | `/api/plans` | 创建新计划 |
| PUT | `/api/plans/:id` | 更新计划 |
| DELETE | `/api/plans/:id` | 删除计划（级联删除所有行程） |

### 行程 (Itineraries)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/plans/:planId/itineraries` | 获取计划的所有行程 |
| POST | `/api/plans/:planId/itineraries` | 添加新行程 |
| POST | `/api/itineraries/:id/copy` | 复制行程 |
| PUT | `/api/itineraries/:id` | 更新行程 |
| DELETE | `/api/itineraries/:id` | 删除行程 |

### 冲突检测

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/plans/:planId/itineraries/check-conflict` | 检测行程冲突 |

## 数据模型

### Plan (旅行计划)

```typescript
interface Plan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelPartners?: string;
  budget?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Itinerary (行程项)

```typescript
interface Itinerary {
  id: string;
  planId: string;
  date: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  activity: string;
  location: string;
  transportation?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 状态说明

- **未开始**：当前日期 < 出发日期
- **进行中**：出发日期 ≤ 当前日期 ≤ 返回日期
- **已结束**：当前日期 > 返回日期

## 示例数据

首次启动时，如果数据库为空，会自动生成 2 个示例计划：
1. **京都之旅**（未开始）：7天后出发，共9天，包含9个行程项
2. **三亚度假**（进行中）：3天前出发，5天后返回，包含9个行程项

## 特色功能

### 行程冲突检测
在添加或编辑行程时，如果同一天内已有同一时间段的行程项，会弹出抖动警告框，用户确认后仍可继续添加。

### 新增行程高亮
新增的行程项会以淡黄色背景闪烁两次（每次间隔300ms），提示用户新增成功。

### 即将出发徽章
如果计划距离出发日期不足3天，卡片右上角会显示红色"即将出发"小徽章。

### 快速复制行程
在详情页点击"复制此行"按钮，可快速复制行程项到同一日期下。

## 开发说明

- 前端开发服务器端口：29201
- 后端API服务器端口：29202
- 数据库文件：`./travel_planner.db`（首次运行自动创建）
- API代理：前端 `/api/*` 请求自动代理到后端

## 许可证

MIT
