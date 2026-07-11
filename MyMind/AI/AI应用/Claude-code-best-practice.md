---
layout: post
title: Claude Code 最佳实践
date: 2026-02-28 12:00:00 +0800
slug: Claude-code-best-practice
category: AI
categories:
- AI
tags:
- AI工具
- 开发工具
- 工作流
- AI应用
source_path: AI/AI应用/Claude-code-best-practice.md
type: article
source_url: https://github.com/shanraisshan/claude-code-best-practice
---

> [!abstract] 简介
> 来自 [shanraisshan/claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice) 的整理笔记，涵盖 Claude Code 核心概念、实战工作流经验、MCP 服务器推荐及架构设计模式。

## 核心概念

| 功能 | 说明 |
|------|------|
| **Skills** | 可复用的知识/工作流/斜杠命令，存放于 `.claude/skills/`，按需加载或用 `/skill-name` 调用 |
| **Agents** | 自定义子代理，存放于 `.claude/agents/`，可独立配置工具、权限、模型 |
| **Memory** | 通过 CLAUDE.md 和 `@path` 引入的持久上下文，每次会话自动加载 |
| **Rules** | `.claude/rules/*.md` 中的模块化指令，支持按路径作用域 |
| **Hooks** | 在特定事件触发的确定性脚本，运行在 agentic loop 之外 |
| **MCP Servers** | 通过 Model Context Protocol 连接外部工具、数据库、API |
| **Plugins** | 可分发包，捆绑 skills、subagents、hooks、MCP servers |
| **Sandboxing** | 文件和网络隔离运行时，减少权限提示同时提升安全性 |
| **Output Styles** | 响应风格配置：Explanatory（解释型）/ Learning（教学型）/ Custom |
| **Permissions** | 细粒度工具访问控制，支持通配符语法 |

> [!tip] 各功能如何配合使用，见官方文档：[Extend Claude Code](https://code.claude.com/docs/en/features-overview)

---

## 实战经验

### 工作流原则

- CLAUDE.md **不要超过 150 行**
- 工作流优先用 **commands**，而不是 agents
- 子代理应功能专一（聚焦额外上下文）+ skills（渐进式信息披露），不要用泛用的"QA 工程师"/"后端工程师"
- `/memory`、`/rules`、`constitution.md` **不能保证被执行**，不要依赖它们
- 上下文用到 **50%** 时手动执行 `/compact`
- **永远从 plan mode 开始**
- 子任务要拆得足够小，单个任务消耗 **< 50% 上下文**即可完成
- 小任务场景下，原生 Claude Code 优于任何复杂工作流
- **勤提交**：任务完成即 commit

### 实用工具

- 终端用 **iTerm**（避免 IDE crash 问题）
- **Wispr Flow** 语音输入（效率 10x）
- `claude-code-voice-hooks` 获取 Claude 语音反馈
- **status line** 感知上下文用量，便于及时压缩
- **git worktrees** 并行开发多任务
- `/permissions` 配合通配符（如 `Bash(npm run *)`、`Edit(/docs/**)`)，替代危险的 `--dangerously-skip-permissions`
- `/sandbox` 通过文件和网络隔离减少权限提示
- Output styles：学新代码库用 **Explanatory**，需要辅导时用 **Learning**
- `/keybindings` 重映射按键，设置支持热重载

### 调试技巧

- `/doctor` 检查环境状态
- 需要看日志的命令，让 Claude **以后台任务方式运行**，便于实时观察输出
- 用 MCP（Claude in Chrome / Playwright / Chrome DevTools）让 Claude 自主查看 Chrome 控制台日志
- **提供截图**来描述 UI 问题

---

## Command + Skill + Subagent 架构
[[_resources/Claude-code-best-practice/Pasted image 20260228102606.jpg|Open: Pasted image 20260228102606.png]]
![[_resources/Claude-code-best-practice/Pasted image 20260228102606.jpg]]

| 组件 | 角色 | 示例 |
|------|------|------|
| **Command** | 入口点，负责用户交互 | `/weather-orchestrator` |
| **Agent** | 编排工作流，启动时预加载 skills | `weather` agent |
| **Skills** | 注入领域知识 | `weather-fetcher`, `weather-transformer` |

**适用场景**：多步骤工作流 · 领域知识注入 · 顺序任务 · 可复用组件

**核心优势**：渐进式信息披露 · 单一执行上下文 · 关注点分离 · 可复用性

---

## 每日必用 MCP 服务器

> [!quote] "装了 15 个 MCP 以为越多越好，最后每天只用 4 个。" — Reddit（682 赞）

| MCP 服务器                                                                                     | 用途                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [**Context7**](https://github.com/upstash/context7)                                         | 拉取最新库文档到上下文，防止因训练数据过时导致的 API 幻觉                                                                                                                                                            |
| [**Playwright**](https://github.com/microsoft/playwright-mcp)                               | 浏览器自动化，自主实现/测试/验证 UI，支持截图、导航、表单测试                                                                                                                                                          |
| **Claude in Chrome**（官方内置，`claude --chrome`）                                                | 官方 Chrome 集成，可读控制台、截图、自动填表；需安装 [Chrome 扩展](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)，文档见 [code.claude.com](https://code.claude.com/docs/en/chrome) |
| [**Chrome DevTools MCP**](https://github.com/ChromeDevTools/chrome-devtools-mcp)（Google 官方） | Google Chrome DevTools 团队出品，`npx chrome-devtools-mcp@latest` 安装，支持控制台日志、网络、DOM 检查                                                                                                          |
| [**DeepWiki**](https://github.com/devanshusemwal/deepwiki-mcp)                              | 获取任意 GitHub 仓库的结构化 wiki 文档（架构、API、模块关系）                                                                                                                                                    |
| [**Excalidraw**](https://github.com/antonpk1/excalidraw-mcp-app)                            | 从提示词生成架构图、流程图、系统设计草图                                                                                                                                                                       |

工作链：**研究**（Context7 / DeepWiki）→ **调试**（Playwright / Chrome）→ **文档**（Excalidraw）

---

## 常用命令速查

### CLI 启动参数

| | | | | |
|--|--|--|--|--|
| `--dangerously-skip-permissions` | `--model` | `--print` | `--resume` | `--continue` |
| `--system-prompt` | `--verbose` | `--debug` | `--init` | `--max-turns` |

### 斜杠命令

| | | | | |
|--|--|--|--|--|
| `/compact` | `/context` | `/model` | `/plan` | `/config` |
| `/clear` | `/cost` | `/memory` | `/doctor` | `/rewind` |

---

## 延伸阅读

- [Boris Cherny（Claude Code 作者）的 12 条使用技巧（Feb 2026）](https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-boris-tips-feb-26.md)
- [如何写好 CLAUDE.md —— Humanlayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [大型 Monorepo 的 CLAUDE.md 加载机制](https://github.com/shanraisshan/claude-code-best-practice/blob/main/reports/claude-md-for-larger-mono-repos.md)
- [RPI 工作流（Research → Plan → Implement）](https://github.com/shanraisshan/claude-code-best-practice/blob/main/workflow/rpi/rpi-workflow.md)
- [完整参考文档（reports/）](https://github.com/shanraisshan/claude-code-best-practice/tree/main/reports)
