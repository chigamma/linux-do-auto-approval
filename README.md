# LINUX DO AUTO APPROVAL

## 功能说明

入组申请功能支持用户通过以下两种方式提交申请：

1. **手动填写**：直接在表单中填写用户 ID 和申请理由
2. **OIDC 登录**：通过 LINUX DO CONNECT 登录，自动填充用户 ID，同时符合自动审核条件的用户可直接通过审核

## 环境变量配置

复制 `.env.local.example` 为 `.env.local`，并填写以下配置：

```bash
# Telegram 机器人配置
TELEGRAM_BOT_API_KEY="YOUR_TELEGRAM_BOT_API_KEY"
#TELEGRAM_API_URL="YOUR_TELEGRAM_API_URL" # 可选，自定义 Telegram API URL

# Telegram 推送 USER ID（频道用户群组均可）
TELEGRAM_USER_ID="YOUR_TELEGRAM_USER_ID"

# Linux.do OIDC 配置
LINUX_DO_CLIENT_ID="YOUR_LINUX_DO_CLIENT_ID"
LINUX_DO_CLIENT_SECRET="YOUR_LINUX_DO_CLIENT_SECRET"

# NextAuth 配置
AUTH_SECRET="YOUR_AUTH_SECRET"
NEXTAUTH_URL="http://localhost:3000"

# 自动审核和信任等级设置
NEXT_PUBLIC_AUTO_APPROVE=true
NEXT_PUBLIC_MIN_TRUST_LEVEL=0

# 版主登录凭证
LINUX_DO_COOKIE=your_linux_do_cookie
LINUX_DO_CSRF_TOKEN=your_csrf_token
LINUX_DO_GROUP_ID=your_group_id # 版主所在的组 ID
```

### 配置说明

#### 1. Telegram 配置

- `TELEGRAM_BOT_API_KEY`: Telegram Bot Token，从 @BotFather 获取
- `TELEGRAM_USER_ID`: 接收消息的 Telegram 用户 ID

#### 2. NextAuth 配置

- `NEXTAUTH_SECRET`: 随机生成的密钥，用于加密 session
  - 生成方法：`openssl rand -base64 32`
- `NEXTAUTH_URL`: 应用的基础 URL
  - 开发环境：`http://localhost:3000`
  - 生产环境：`https://yourdomain.com`

#### 3. LINUX DO CONNECT OIDC 配置

前往 [connect.linux.do](https://connect.linux.do/) 创建应用：

1. 访问 [connect.linux.do](https://connect.linux.do/)
2. 创建新的应用
3. 配置回调 URL：
   - 开发环境：`http://localhost:3000/api/auth/callback/linux-do`
   - 生产环境：`https://yourdomain.com/api/auth/callback/linux-do`
4. 获取 Client ID 和 Client Secret
5. 填入 `.env`:
   - `LINUX_DO_CLIENT_ID`: 你的 Client ID
   - `LINUX_DO_CLIENT_SECRET`: 你的 Client Secret

#### 4. 自动审核和信任等级设置

- `NEXT_PUBLIC_AUTO_APPROVE`: 是否启用自动审核（`true` 或 `false`）
- `NEXT_PUBLIC_MIN_TRUST_LEVEL`: 自动审核所需的最低信任等级（整数）
- `LINUX_DO_COOKIE`: 版主登录凭证 Cookie（F12 后获取）
- `LINUX_DO_CSRF_TOKEN`: 版主登录凭证 CSRF Token（同上）
- `LINUX_DO_GROUP_ID`: 版主所在的组 ID（从请求 URL 获取）

## 功能流程

### 用户流程

1. **选择登录方式**：
   - 点击「登录」按钮通过 Linux.do 登录（推荐）
   - 或直接手动填写用户 ID
2. **填写申请理由**
3. **提交申请**

### 管理员流程

1. 用户提交申请后，指定的 Telegram 用户会收到消息
2. 消息格式：

   ```
   入组申请

   用户 ID: username

   申请理由:
   用户填写的申请理由内容...
   ```

## 部署

直接 Vercel.com
