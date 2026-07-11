---
layout: post
title: OpenClaw Skills 在册清单
date: 2026-03-12 12:00:00 +0800
slug: OpenClaw-Skills-在册清单
category: AI
categories:
- AI
tags:
- OpenClaw
- Skills
- 工具
- AI
source_path: AI/OpenClaw/OpenClaw Skills 在册清单.md
---

> [!info] 导航
> - [[OpenClaw 安装与使用]]
> - [[大模型网关]]
> - [[Node.js 工具链]]

这篇笔记用于记录 Jarvis 当前环境中可用、且实际可能调用的 skills。按用途分组，方便后续查询、补充和维护。

## 说明

- 这里记录的是 **当前环境里可调用的 skills / 常用能力**。
- 是否真正触发，取决于任务类型，而不是固定每次都调用。
- 后续可以继续补充：触发关键词、常用命令、使用示例、注意事项、风险等级。

## 一、笔记与知识库

### Obsidian 相关

- **obsidian**：处理 Obsidian vault 中的普通 Markdown 笔记
- **obsidian-cli**：通过 Obsidian CLI 读写、搜索、管理笔记
- **obsidian-markdown**：编写符合 Obsidian 风格的 Markdown（wikilinks、callouts、frontmatter 等）
- **obsidian-bases**：处理 `.base` 数据视图
- **json-canvas**：处理 `.canvas` 画布文件

### 其他笔记工具

- **apple-notes**：管理 Apple Notes
- **bear-notes**：管理 Bear 笔记

## 二、文档与办公文件

- **docx**：创建、编辑、整理 Word 文档
- **pptx**：创建、读取、修改 PowerPoint 演示文稿
- **nano-pdf**：按自然语言编辑 PDF
- **feishu-doc**：处理飞书文档读写
- **feishu-drive**：处理飞书云盘文件
- **feishu-perm**：管理飞书文档/文件权限
- **feishu-wiki**：处理飞书知识库 / wiki

## 三、网页阅读、搜索与信息获取

- **defuddle**：提取网页正文，适合把网页转成干净 Markdown
- **summarize**：总结 URL、文件、播客、视频、转录内容
- **weather**：查询天气和预报
- **tavily**：做 AI 友好的网页搜索
- **blogwatcher**：监控博客 / RSS 更新
- **find-skills**：帮助发现适合的新 skill

## 四、开发、GitHub 与代码相关

### GitHub / 协作

- **github**：通过 `gh` CLI 处理 GitHub issue、PR、CI 等
- **gh-issues**：围绕 GitHub issue 的修复、PR、review 跟进流程

### 编码 / 工程能力

- **coding-agent**：把较重的编码任务交给外部 coding agent
- **frontend-design**：做前端页面、组件和高质量界面设计
- **skill-creator**：创建、整理、审查 Agent skill
- **skill-vetter**：安装第三方 skill 前做安全审查
- **clawhub**：从公共 skill 仓库搜索、安装、更新 skill
- **mcporter**：调用 MCP server / tools
- **tmux**：操作 tmux 会话

## 五、OpenClaw 平台与运行维护

- **skillhub**：优先使用 SkillHub 作为 skill 搜索、安装、更新来源的注册表策略插件；不可用时再回退到 clawhub
- **healthcheck**：做 OpenClaw 主机 / 环境健康检查与安全加固建议
- **model-usage**：查看模型使用情况 / cost 数据
- **Self-Improving Agent (Proactive Self-Reflection)**：用于自我复盘和改进执行质量

## 六、图像、音视频与媒体处理

### 图像

- **nano-banana-pro**：生成或编辑图片
- **gifgrep**：搜索和下载 GIF

### 视频 / 摄像头

- **video-frames**：从视频中抽帧或截片段
- **camsnap**：抓取摄像头画面
- **bilidown**：下载 Bilibili 和微博视频，适合保存本地素材或做后续转写、抽帧、剪辑处理

### 平台内容浏览

- **bilibili-cli**：通过 CLI 浏览 Bilibili 内容，适合搜索视频、查看热门、用户、动态、收藏夹等信息

### 音频

- **songsee**：生成音频频谱和特征图

## 七、Apple 本地效率工具

- **apple-reminders**：管理 Apple Reminders
- **things-mac**：管理 Things 任务
- **peekaboo**：自动化 macOS UI
- **imsg**：通过 Messages 读取/发送 iMessage / SMS

## 八、邮件、社交与通讯

### 邮件

- **himalaya**：处理邮件（IMAP / SMTP）

### 社交 / 消息平台

- **wacli**：处理 WhatsApp 历史或发送消息
- **xurl**：调用 X（Twitter）API

## 九、账号、云服务与外部平台

- **1password**：配置和使用 1Password CLI
- **gog**：Google Workspace CLI（Gmail / Calendar / Drive / Docs 等）
- **notebooklm**：调用 NotebookLM CLI

## 十、设备与家庭 / 外设类能力

- **openhue**：控制 Philips Hue 灯光
- **sonoscli**：控制 Sonos 音箱
- **blucli**：控制 BluOS 设备
- **eightctl**：控制 Eight Sleep
- **camsnap**：抓取 RTSP / ONVIF 摄像头画面
- **ordercli**：查看 Foodora 订单状态

## 十一、后续可以继续补充的内容

后面可以给每个 skill 增加这些信息：

- 适用场景
- 触发关键词
- 常用命令
- 使用示例
- 注意事项
- 风险等级
- 是否需要额外配置 / API Key

## 十二、维护建议

> [!tip] 推荐：SkillHub
> 如果你要搜索、安装、更新 skill，当前环境建议**优先使用 SkillHub**；不可用、限流或无结果时，再回退到 clawhub。

如果后续想把这篇长期维护下去，比较适合的做法是：

- 保留这篇作为总索引
- 再单独拆出一篇 `OpenClaw Skills 实战手册`
- 把常用 skill 的例子、命令、坑点写进去

这样索引和手册分开，会更清楚。

## 相关链接

- [[OpenClaw 安装与使用]]
- [[大模型网关]]
- [[Node.js 工具链]]
