# Why Dictionary - 后端服务

个人英语词典应用的后端服务,基于 NestJS + TypeScript + Prisma + SQLite 构建。
部署1

## 技术栈

- **框架**: NestJS 10.x
- **语言**: TypeScript 5.x
- **数据库**: SQLite (开发环境) / PostgreSQL (生产环境)
- **ORM**: Prisma 5.x
- **认证**: JWT (JSON Web Token)
- **密码加密**: bcrypt

## 功能特性

- ✅ 用户注册与登录
- ✅ JWT 认证与授权
- ✅ 密码加盐哈希存储
- ✅ 自动生成用户昵称和头像
- ✅ 受保护的 API 接口
- ✅ 查词功能(免费字典 API)
- ✅ 单词数据本地缓存
- ✅ 搜索建议(前缀匹配)

## 环境配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env`:

```bash
cp .env.example .env
```

默认配置使用 SQLite 数据库,无需额外配置。如需使用 PostgreSQL,请修改 `DATABASE_URL`:

```env
# SQLite (默认,开发环境推荐)
DATABASE_URL="file:./dev.db"

# PostgreSQL (生产环境推荐)
# DATABASE_URL="postgresql://用户名:密码@localhost:5432/数据库名"

# JWT 密钥(生产环境请务必修改!)
JWT_SECRET="dev-secret-key-please-change-in-production"

# JWT 过期时间
JWT_EXPIRES_IN="7d"

# 服务端口
PORT=3000

# 硅基流动 LLM 配置（用于生成中文释义和例句）
SILICONFLOW_API_KEY="sk-your-api-key-here"
SILICONFLOW_BASE_URL="https://api.siliconflow.cn/v1"
LLM_MODEL_ID="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"
```

#### 硅基流动 LLM 配置说明

硅基流动 LLM 用于为查询的单词自动生成中文释义和英文例句（带中文翻译）。

**获取 API Key：**

1. 访问硅基流动官网：https://cloud.siliconflow.cn
2. 注册并登录账号
3. 进入 API 密钥管理页面：https://cloud.siliconflow.cn/account/ak
4. 创建新的 API Key 并复制

**本地开发配置：**

在 `.env` 文件中添加以下配置（替换为你的真实 API Key）：

```env
SILICONFLOW_API_KEY=sk-rcmhbkcgxcbtpsekzfkwluxaadqpvvgclbczohsuvofvvyfq
```

> **安全提示**：不要将真实的 API Key 提交到 Git 仓库！

**云端部署配置：**

在 Render 的环境变量设置中添加：
- `SILICONFLOW_API_KEY`：你的硅基流动 API Key
- `SILICONFLOW_BASE_URL`：（可选）默认为 `https://api.siliconflow.cn/v1`
- `LLM_MODEL_ID`：（可选）默认为 `deepseek-ai/DeepSeek-R1-0528-Qwen3-8B`

### 3. 初始化数据库

生成 Prisma 客户端:

```bash
npm run prisma:generate
```

执行数据库迁移(创建表结构):

```bash
npm run prisma:migrate
```

> 💡 首次运行时会提示输入迁移名称,可以输入 `init` 或 `initial_migration`

### 4. 启动开发服务器

```bash
npm run dev
```

服务将在 `http://localhost:3000` 启动。

## 云端部署配置

### Render 部署

将后端部署到 Render 时,需要在 Render 控制台配置以下环境变量:

#### 必需环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | JWT 加密密钥(请使用强随机密码) | `your-super-secret-key-change-this` |
| `FRONTEND_ORIGIN` | 允许访问的前端域名(CORS 配置) | `https://your-frontend.vercel.app` |

#### 可选环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |
| `PORT` | 服务端口(Render 会自动设置) | `3000` |
| `SILICONFLOW_API_KEY` | 硅基流动 API Key（用于 LLM 生成例句） | 无，需手动配置 |
| `SILICONFLOW_BASE_URL` | 硅基流动 API 地址 | `https://api.siliconflow.cn/v1` |
| `LLM_MODEL_ID` | LLM 模型 ID | `deepseek-ai/DeepSeek-R1-0528-Qwen3-8B` |

#### 配置步骤

1. 在 Render 创建 PostgreSQL 数据库服务
2. 复制 PostgreSQL 的 `External Database URL`,设置为 `DATABASE_URL` 环境变量
3. 生成一个强随机密钥作为 `JWT_SECRET`
4. 设置 `FRONTEND_ORIGIN` 为前端 Vercel 域名(例如 `https://your-app.vercel.app`)
5. 部署完成后,复制 Render 提供的后端 URL(例如 `https://your-backend.onrender.com`)

### Vercel + Render 联合部署

前端(Vercel)和后端(Render)需要配合配置环境变量:

**后端(Render):**
```bash
FRONTEND_ORIGIN="https://your-frontend.vercel.app"
```

**前端(Vercel):**
```bash
VITE_API_BASE_URL="https://your-backend.onrender.com"
```

> **注意**: 
> - `FRONTEND_ORIGIN` 应设置为前端的完整域名,不要包含尾部斜杠
> - `VITE_API_BASE_URL` 应设置为后端的完整 URL,不要包含 `/api` 路径
> - 后端会自动添加全局前缀 `/api`,前端会自动拼接路径

### 安全建议

1. **JWT_SECRET**: 使用至少 32 位的强随机密钥
2. **DATABASE_URL**: 确保数据库密码足够复杂
3. **FRONTEND_ORIGIN**: 只允许特定的前端域名访问,不要使用通配符
4. **环境变量**: 所有敏感信息都通过环境变量配置,不要硬编码到代码中



## 可用脚本

- `npm run dev` - 启动开发服务器(热重载)
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run prisma:generate` - 生成 Prisma 客户端
- `npm run prisma:migrate` - 执行数据库迁移
- `npm run prisma:studio` - 打开 Prisma Studio(可视化数据库管理工具)

## API 接口

### 认证相关

#### 1. 用户注册

**请求:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "user",
    "avatarUrl": "https://ui-avatars.com/api/?name=user&background=random"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. 用户登录

**请求:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "user",
    "avatarUrl": "https://ui-avatars.com/api/?name=user&background=random"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. 获取当前用户信息

**请求:**
```http
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

**响应:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "user",
  "avatarUrl": "https://ui-avatars.com/api/?name=user&background=random",
  "createdAt": "2025-11-24T15:30:00.000Z"
}
```

### 查词相关(需要登录)

#### 1. 搜索单词(前缀匹配)

**请求:**
```http
GET /api/words/search?query=app
Authorization: Bearer <your-jwt-token>
```

**响应:**
```json
[
  {
    "id": 1,
    "spelling": "apple"
  },
  {
    "id": 2,
    "spelling": "application"
  }
]
```

#### 2. 获取单词详情

**请求:**
```http
GET /api/words/apple
Authorization: Bearer <your-jwt-token>
```

**响应:**
```json
{
  "spelling": "apple",
  "phoneticUk": "/ˈæpl/",
  "phoneticUs": "/ˈæpl/",
  "audioUkUrl": "https://api.dictionaryapi.dev/media/pronunciations/en/apple-uk.mp3",
  "audioUsUrl": "https://api.dictionaryapi.dev/media/pronunciations/en/apple-us.mp3",
  "senses": [
    {
      "senseOrder": 1,
      "partOfSpeech": "noun",
      "definitionEn": "A round fruit with red or green skin and firm white flesh",
      "definitionZh": null,
      "examples": [
        {
          "sentenceEn": "I eat an apple every day",
          "sentenceZh": null
        }
      ]
    }
  ]
}
```

> **注意**: 查词功能当前使用免费字典 API (https://api.dictionaryapi.dev) 仅作开发/演示用途。首次查询会调用外部 API 并缓存到本地数据库,后续查询直接从本地读取。

### 受保护接口示例

#### 测试接口

**请求:**
```http
GET /api/secure/ping
Authorization: Bearer <your-jwt-token>
```

**响应:**
```json
{
  "message": "🎉 认证成功!",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "timestamp": "2025-11-24T15:30:00.000Z"
}
```

## 数据库结构

### users 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键,自增 |
| email | TEXT | 用户邮箱,唯一 |
| password_hash | TEXT | 密码哈希值 |
| nickname | TEXT | 用户昵称 |
| avatar_url | TEXT | 头像 URL,可为空 |
| created_at | DATETIME | 创建时间 |

### words 表(单词缓存表)

本地缓存的单词基础信息,减少外部 API 调用次数。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键,自增 |
| spelling | TEXT | 单词拼写(小写),唯一索引 |
| phonetic_uk | TEXT | 英式音标,可为空 |
| phonetic_us | TEXT | 美式音标,可为空 |
| audio_uk_url | TEXT | 英式发音音频地址,可为空 |
| audio_us_url | TEXT | 美式发音音频地址,可为空 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### word_senses 表(义项表)

单词的各个义项(词性、释义)。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键,自增 |
| word_id | INTEGER | 外键,关联 words.id |
| sense_order | INTEGER | 义项顺序(从 1 开始) |
| part_of_speech | TEXT | 词性(如 "noun"、"verb") |
| definition_en | TEXT | 英文释义 |
| definition_zh | TEXT | 中文释义,可为空 |
| created_at | DATETIME | 创建时间 |

### examples 表(例句表)

义项的例句。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键,自增 |
| sense_id | INTEGER | 外键,关联 word_senses.id |
| sentence_en | TEXT | 英文例句,可为空 |
| sentence_zh | TEXT | 中文例句翻译,可为空 |

> **注意**: 新增的 words、word_senses、examples 表用于缓存查词结果,减少外部 API 调用。当前阶段中文释义和翻译可能为空,后续可通过翻译 API 或大模型补全。

## 项目结构

```
backend/
├── prisma/
│   └── schema.prisma          # Prisma 数据模型定义
├── src/
│   ├── auth/                  # 认证模块
│   │   ├── dto/               # 数据传输对象
│   │   │   ├── register.dto.ts
│   │   │   └── login.dto.ts
│   │   ├── auth.controller.ts # 认证控制器
│   │   ├── auth.service.ts    # 认证服务
│   │   ├── auth.module.ts     # 认证模块
│   │   ├── jwt.strategy.ts    # JWT 策略
│   │   └── jwt-auth.guard.ts  # JWT 守卫
│   ├── prisma/                # Prisma 模块
│   │   ├── prisma.service.ts  # Prisma 服务
│   │   └── prisma.module.ts   # Prisma 模块
│   ├── user/                  # 用户模块
│   │   ├── user.controller.ts # 用户控制器
│   │   └── user.module.ts     # 用户模块
│   ├── app.module.ts          # 根模块
│   └── main.ts                # 应用入口
├── .env                       # 环境变量
├── .env.example               # 环境变量示例
├── package.json               # 项目配置
├── tsconfig.json              # TypeScript 配置
└── nest-cli.json              # NestJS CLI 配置
```

## 常见问题

### 1. 如何切换到 PostgreSQL?

修改 `prisma/schema.prisma` 中的 `datasource`:

```prisma
datasource db {
  provider = "postgresql"  // 改为 postgresql
  url      = env("DATABASE_URL")
}
```

然后修改 `.env` 中的 `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dictionary_why"
```

最后重新执行迁移:

```bash
npm run prisma:migrate
```

### 2. 如何查看数据库内容?

使用 Prisma Studio:

```bash
npm run prisma:studio
```

浏览器会自动打开 `http://localhost:5555`,可以可视化查看和编辑数据。

### 3. 如何重置数据库?

删除数据库文件(SQLite):

```bash
rm dev.db
```

然后重新执行迁移:

```bash
npm run prisma:migrate
```

## 功能状态

### 已完成

- ✅ 用户注册与登录
- ✅ JWT 认证与授权
- ✅ 密码加盐哈希存储
- ✅ 查词功能(免费字典 API + 本地缓存)
- ✅ 单词数据本地缓存

### 后续计划

- 🔜 中文释义补全(翻译 API 或大模型)
- 🔜 单词本管理(收藏、分类、标签)
- 🔜 闪卡学习(间隔重复算法)
- 🔜 词生文(AI 生成例句)
- 🔜 词生图(AI 生成配图)
- 🔜 本地词典数据导入

## 许可证

MIT
