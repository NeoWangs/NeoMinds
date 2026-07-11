---
layout: post
title: OpenClaw 安装与使用
date: 2026-03-11 12:00:00 +0800
slug: AI-OpenClaw-OpenClaw-安装与使用-ecbb4c0
category: AI
categories:
- AI
tags:
- 工具
- CLI
- AI
- 开发工具
- OpenClaw
source_path: AI/OpenClaw/OpenClaw 安装与使用.md
source: OpenClaw Docs
source_url: https://docs.openclaw.ai/zh-CN
---

OpenClaw 是一个本地优先的 AI agent / gateway 工具，提供网关服务、CLI、Control UI、会话/消息路由、skills 扩展，以及自动化能力。

> [!tip] 前置条件
> 先确认已安装 **Node.js**（建议 v22+）：`node -v`

## 前置依赖
如果是新机器，建议先完成基础开发环境准备：
- [[搭建前端开发环境]]
- [[Node.js 工具链]]

其中 OpenClaw CLI 依赖 Node.js 运行环境，安装前先确认：
```bash
node -v
```

## 一、安装

### 安装 CLI

```bash
npm install -g openclaw
```

### 首次初始化

```bash
openclaw onboard --install-daemon
```

作用：
- 初始化配置
- 创建 workspace
- 安装并注册 Gateway 后台服务

> [!info]
> `--install-daemon` 会把 OpenClaw 注册为系统后台服务，通常无需每次手动启动。

## 二、速查表

| 场景           | 命令                                  |
| ------------ | ----------------------------------- |
| 首次初始化        | `openclaw onboard --install-daemon` |
| 查看整体状态       | `openclaw status`                   |
| 查看网关状态       | `openclaw gateway status`           |
| 启动网关         | `openclaw gateway start`            |
| 停止网关         | `openclaw gateway stop`             |
| 重启网关         | `openclaw gateway restart`          |
| 安装网关服务       | `openclaw gateway install`          |
| 重新配置         | `openclaw configure`                |
| 健康检查         | `openclaw doctor`                   |
| 自动修复         | `openclaw doctor --fix`             |
| 打开 Dashboard | `openclaw dashboard`                |
| 打开 TUI       | `openclaw tui`                      |
| 查看版本         | `openclaw --version`                |
| 查看帮助         | `openclaw help`                     |

## 三、网关管理

### 安装网关服务

```bash
openclaw gateway install
```

> [!warning]
> 如果已经执行过 `openclaw onboard --install-daemon`，通常不需要再单独执行一次。

### 启动网关

```bash
openclaw gateway start
```

### 停止网关

```bash
openclaw gateway stop
```

### 重启网关

```bash
openclaw gateway restart
```

### 查看网关状态

```bash
openclaw gateway status
```

常看信息：
- 服务是否运行
- 监听地址和端口
- Dashboard 地址
- probe / 连通性结果

## 四、状态查看

### 查看整体状态

```bash
openclaw status
```

通常可看到：
- 当前使用模型
- token 用量
- 上下文占用
- 当前 session 状态

### 聊天内快速查看

```text
/status
```

> [!tip]
> 想快速确认当前到底在用哪个模型，优先看 `openclaw status` 或 `/status`。

## 五、配置与日常使用

### 修改配置

```bash
openclaw configure
```

### 打开 TUI

```bash
openclaw tui
```

### 打开 Dashboard

```bash
openclaw dashboard
```

## 六、排障

### 健康检查

```bash
openclaw doctor
```

### 自动修复

```bash
openclaw doctor --fix
```

### 版本与帮助

```bash
openclaw --version
openclaw help
```

## 七、常见流程

### 首次安装后

```bash
npm install -g openclaw
openclaw onboard --install-daemon
openclaw gateway status
openclaw status
openclaw dashboard
```

### 修改配置后

```bash
openclaw configure
openclaw gateway restart
openclaw gateway status
```

## 相关链接

- [[搭建前端开发环境]]
- [[OpenClaw Skills 在册清单]]
- [[大模型网关]]
- [[Node.js 工具链]]
