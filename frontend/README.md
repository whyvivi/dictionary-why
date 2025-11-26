# Why Dictionary - 前端应用

个人英语词典应用的前端,基于 React + TypeScript + Vite + Tailwind CSS 构建。

## 技术栈

- **框架**: React 18.x
- **语言**: TypeScript 5.x
- **构建工具**: Vite 5.x
- **路由**: React Router 6.x
- **HTTP 客户端**: Axios
- **样式**: Tailwind CSS 3.x
- **设计风格**: 新海诚 + 小清新(天空渐变 + 玻璃拟态)

## 功能特性

- ✅ 用户登录与注册
- ✅ JWT 认证与路由守卫
- ✅ 新海诚风格的视觉设计
- ✅ 玻璃拟态效果
- ✅ 响应式布局
- ✅ 三个主要页面:查词、单词本、闪卡(占位)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

> 💡 确保后端服务已在 `http://localhost:3000` 运行

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 4. 预览生产版本

```bash
npm run preview
```

## 可用脚本

- `npm run dev` - 启动开发服务器(热重载)
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产版本

## 项目结构

```
frontend/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Header.tsx       # 顶部导航栏
│   │   ├── TabBar.tsx       # 底部导航栏
│   │   └── ProtectedRoute.tsx  # 路由守卫
│   ├── pages/               # 页面组件
│   │   ├── AuthPage.tsx     # 登录/注册页
│   │   ├── MainLayout.tsx   # 主布局
│   │   ├── SearchPage.tsx   # 查词页(占位)
│   │   ├── WordbookPage.tsx # 单词本页(占位)
│   │   └── FlashcardPage.tsx # 闪卡页(占位)
│   ├── utils/               # 工具函数
│   │   ├── api.ts           # Axios 配置
│   │   └── auth.ts          # 认证工具
│   ├── App.tsx              # 根组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── tailwind.config.js       # Tailwind 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目配置
```

## 设计风格

### 新海诚风格

应用采用「新海诚 + 小清新」的视觉风格:

- **天空渐变背景**:柔和的蓝色、浅紫、淡橙色渐变,带有动画效果
- **玻璃拟态**:半透明白色背景 + 模糊效果 + 柔和阴影
- **大圆角**:所有卡片和按钮使用大圆角设计
- **悬浮效果**:卡片和按钮带有轻微的悬浮动画

### 颜色方案

```css
/* 天空色 */
sky-light: #E8F4F8
sky: #B8E1F5
sky-dark: #89C4E1

/* 薰衣草紫 */
lavender-light: #E8D5F2
lavender: #D4B5E8
lavender-dark: #B895D4

/* 桃色 */
peach-light: #FFE5D9
peach: #FFCDB2
peach-dark: #FFB088
```

## 路由结构

```
/auth              - 登录/注册页(公开)
/                  - 主布局(受保护)
  ├── /search      - 查词页(默认)
  ├── /wordbook    - 单词本页
  └── /flashcard   - 闪卡页
```

## API 调用

前端通过 Axios 调用后端 API,所有请求自动添加 JWT token:

```typescript
// 示例:获取当前用户信息
import api from './utils/api';

const response = await api.get('/auth/me');
const user = response.data;
```

### API 代理

开发环境下,Vite 会自动将 `/api` 请求代理到 `http://localhost:3000`:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```

## 环境变量配置

### 配置说明

前端使用 `VITE_API_BASE_URL` 环境变量来指定后端 API 的根地址。

**重要：** 环境变量中只存储后端的**根域名**，不要包含 `/api` 路径，代码会自动拼接。

**工作原理:**
- **本地开发**: 如果未设置 `VITE_API_BASE_URL`，默认使用 `http://localhost:3000`，代码自动拼接为 `http://localhost:3000/api`
- **云端部署**: 设置 `VITE_API_BASE_URL` 为后端根域名（如 `https://dictionary-backend-z9k0.onrender.com`），代码自动拼接为 `https://dictionary-backend-z9k0.onrender.com/api`

### 本地开发环境

本地开发时，通常不需要设置环境变量。前端会默认使用 `http://localhost:3000`:

```bash
# .env.development (可选，默认不需要设置)
# VITE_API_BASE_URL="http://localhost:3000"
```

如果想在本地前端测试云端后端，可以创建 `.env.development.local` 文件:

```bash
# 连接云端后端进行测试（只填根域名，不要加 /api）
VITE_API_BASE_URL="https://dictionary-backend-z9k0.onrender.com"
```

### Vercel 部署环境

部署到 Vercel 时，需要在 Vercel 控制台配置环境变量:

1. 打开 Vercel 项目设置页面
2. 进入 **Settings** → **Environment Variables**
3. 添加环境变量:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: 后端的根域名（例如 `https://dictionary-backend-z9k0.onrender.com`）
   - **Environment**: 选择 `Production`、`Preview` 或 `Development`

> **重要提示**: 
> - ✅ 正确：`https://dictionary-backend-z9k0.onrender.com`
> - ❌ 错误：`https://dictionary-backend-z9k0.onrender.com/api`
> - 代码会自动拼接 `/api` 路径，不要手动添加

配置完成后，重新部署前端即可。

### 环境变量文件说明

- `.env.development` - 开发环境配置(已在 `.gitignore` 中忽略)
- `.env.production` - 生产环境配置(已在 `.gitignore` 中忽略)
- `.env.example` - 配置示例文件(提交到 Git)
- `.env.development.local` - 本地开发覆盖配置(已在 `.gitignore` 中忽略)


```

## 认证流程

### 1. 登录

1. 用户在 `/auth` 页面输入邮箱和密码
2. 调用 `POST /api/auth/login`
3. 后端返回 JWT token 和用户信息
4. 前端保存到 `localStorage`
5. 跳转到 `/search` 页面

### 2. 路由守卫

所有受保护的路由都使用 `ProtectedRoute` 组件包裹:

```tsx
<Route
  path="/"
  element={
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  }
/>
```

未登录用户访问受保护路由时,自动重定向到 `/auth`。

### 3. 自动添加 Token

Axios 请求拦截器自动从 `localStorage` 读取 token 并添加到请求头:

```typescript
config.headers.Authorization = `Bearer ${token}`;
```

### 4. Token 过期处理

响应拦截器检测 401 错误,自动清除 token 并跳转到登录页:

```typescript
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/auth';
}
```

## 组件说明

### AuthPage

登录/注册页面,包含:
- Tab 切换(登录/注册)
- 表单验证
- 错误提示
- 玻璃拟态卡片

### MainLayout

主布局组件,包含:
- 固定的顶部 Header
- 可滚动的中间内容区
- 固定的底部 TabBar

### Header

顶部导航栏,包含:
- Logo 和应用名称
- 用户头像和昵称
- 下拉菜单(个人资料、退出登录)

### TabBar

底部导航栏,包含:
- 3 个 Tab:查词、单词本、闪卡
- 图标 + 文本
- 选中状态指示器

### ProtectedRoute

路由守卫组件,保护需要登录的路由。

## 样式工具类

### 玻璃拟态

```html
<!-- 轻度玻璃效果 -->
<div class="glass">...</div>

<!-- 强玻璃效果 -->
<div class="glass-strong">...</div>
```

### 天空渐变背景

```html
<div class="sky-gradient">...</div>
```

### 按钮悬停效果

```html
<button class="btn-hover">...</button>
```

### 卡片悬浮效果

```html
<div class="card-float">...</div>
```

## 下一步

前端已完成基础布局和认证功能,后续可以添加:

- 查词功能(调用后端 API)
- 单词本管理(CRUD 操作)
- 闪卡学习(间隔重复算法)
- 词生文(AI 生成例句)
- 词生图(AI 生成配图)
- 个人资料编辑
- 主题切换(日间/夜间模式)

## 许可证

MIT
