## 概要

配合 [github-oauth-server#1](https://github.com/R1310328554/github-oauth-server/pull/1)，重做多平台 OAuth2 登录前端（Nexus Auth）。

## 功能

- 登录页：19 个社交平台入口（未配置显示「待配置」）
- 本地注册 / 登录
- 账户页：资料编辑、第三方绑定 / 解绑
- WhatsApp 手机号 OTP 面板
- 管理后台：用户列表与登录渠道统计
- httpOnly 会话探测（不再依赖可读 cookie）

## 支持平台

微博、微信、QQ、飞书、钉钉、企业微信、GitHub、Google、Gmail、Meta、Instagram、X、Telegram、WhatsApp、TikTok、抖音、Bilibili、快手、小红书

## 本地运行

```bash
npm install
npm run dev
```

需同时启动 `github-oauth-server`（默认 `8999`）。Vite 已代理 `/v1`。

## 说明

本 PR 内容与 server 仓库 `admin/` 目录保持同步。
