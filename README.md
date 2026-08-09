# Nexus OAuth Hub（github-oauth-server）

安全、可扩展的多平台 OAuth2 第三方登录服务。支持国内与国际主流社交账号，统一回调、账号绑定、JWT 会话与管理端 API。

## 功能

- 多平台登录：GitHub、微博、微信、QQ、飞书、钉钉、企业微信、Google、Gmail、Meta、Instagram、X、Telegram、WhatsApp（OTP）、TikTok、抖音、B站、快手、小红书
- CSRF `state` + 可选 PKCE（Google / TikTok 等）
- 本地账号注册 / 登录（bcrypt）
- 第三方账号绑定 / 解绑（至少保留一种登录方式）
- httpOnly Cookie 会话 + Bearer Token
- 速率限制、安全响应头、CORS 白名单
- Provider access token 加密落库
- 管理端用户列表 / 登录渠道统计
- 开发环境无 MongoDB 时自动使用内存数据库

## 快速开始

```bash
cp .env.example .env
npm install
npm start
```

健康检查：`GET http://localhost:8999/v1/health`  
提供方列表：`GET http://localhost:8999/v1/oauth/providers`

## 关键 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/v1/oauth/providers` | 列出全部/已启用提供方 |
| GET | `/v1/oauth/:provider/authorize` | 开始授权（支持 `mode=bind`） |
| GET | `/v1/oauth/:provider/callback` | 统一回调 |
| DELETE | `/v1/oauth/:provider/unbind` | 解绑 |
| POST | `/v1/auth/register` | 本地注册 |
| POST | `/v1/auth/login` | 本地登录 |
| GET | `/v1/auth/me` | 当前用户 |
| GET | `/v1/auth/logout` | 退出 |
| PATCH | `/v1/auth/profile` | 更新资料 |
| GET | `/v1/users` | 用户列表（管理员） |
| GET | `/v1/users/stats` | 渠道统计（管理员） |

前端发起登录示例：

```text
GET /v1/oauth/github/authorize?return_to=http://localhost:8080
```

## 配置提供方

在各开放平台创建应用，将 **回调地址** 配成：

```text
http://localhost:8999/v1/oauth/<provider>/callback
```

例如 GitHub：`http://localhost:8999/v1/oauth/github/callback`  
然后把 Client ID / Secret 写入 `.env`（见 `.env.example`）。未配置密钥的提供方会在接口中标记为 `enabled: false`，前端可展示为「待配置」。

> 说明：
> - Gmail 复用 Google OAuth
> - X 为原 Twitter，使用 OAuth 2.0 + PKCE
> - Telegram 使用 Login Widget 签名校验
> - WhatsApp 无标准网站 OAuth，使用 Cloud API 手机号验证码登录（开发环境验证码会在接口/`console` 返回）
> - 企业微信需配置 `WECOM_CORP_ID` / `WECOM_SECRET` / `WECOM_AGENT_ID`
> - 小红书通常需要企业资质，字段以官方最新文档为准

## 安全建议

1. 生产环境必须设置高强度 `JWT_SECRET` 与 `TOKEN_ENCRYPT_KEY`
2. HTTPS 下开启 `COOKIE_SECURE=true`
3. 收紧 `CORS_ORIGINS`
4. 不要把 Client Secret 提交到仓库
5. 定期轮换 OAuth 应用密钥

## 测试

```bash
npm test
```

## 配套前端

独立仓库：[github-oauth-admin](https://github.com/R1310328554/github-oauth-admin)。  
本仓库同步了一份可运行前端于 `admin/`（便于单 PR 评审）：

```bash
cd admin
npm install
npm run dev
```

默认 `http://localhost:8080`，通过 Vite 代理访问本服务 `/v1`。
