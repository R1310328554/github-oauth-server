# Nexus Auth Admin（github-oauth-admin）

多平台 OAuth2 登录前端，配合 [github-oauth-server](https://github.com/R1310328554/github-oauth-server) 使用。

## 功能

- 精美登录页，一键跳转各社交平台 OAuth
- 额外支持 QQ / 飞书 / 钉钉 / 企业微信 / X / Telegram / WhatsApp OTP
- 本地注册 / 登录
- 账户页：资料编辑、账号绑定 / 解绑
- 管理后台：用户列表与登录渠道统计
- Vite 代理 `/v1` 到本地后端 `8999`

## 开发

```bash
npm install
npm run dev
```

默认打开 `http://localhost:8080`。请先启动后端服务。

## 配置第三方登录

在后端 `.env` 填写各平台 Client ID / Secret，并在开放平台配置回调：

```text
http://localhost:8999/v1/oauth/<provider>/callback
```

前端会自动从 `GET /v1/oauth/providers` 读取可用提供方；未配置的显示为「待配置」。
