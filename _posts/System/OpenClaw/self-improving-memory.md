---
layout: post
title: self-improving-memory
date: 2026-04-13 10:09:54 +0800
slug: System-OpenClaw-self-improving-memory-26379f1
category: System
categories:
- System
tags:
- OpenClaw
source_path: System/OpenClaw/self-improving-memory.md
---

# Self-Improving Memory

## Confirmed Preferences
<!-- Patterns confirmed by user, never decay -->
- 每次更新 `~/self-improving/memory.md` 后，同步更新 `/Users/neo/Library/Mobile Documents/iCloud~md~obsidian/Documents/知识库/System/OpenClaw/self-improving-memory.md`。
- 整理 Obsidian 笔记时，默认不要额外加文件同名的 `# 一级标题`；文件名本身已经是标题，重复通常多余。只有在用户明确要求、需要导出成独立 Markdown 文档、或正文结构确实需要顶层标题时才加。
- 整理 Obsidian 文章/剪藏笔记时，frontmatter 中 `url` 用来存原始链接地址，`source` 用来存来源名称（如 `知乎`、`公众号`、`微博`、`OpenClaw Docs`），不要把 URL 写进 `source`。
- 如果 frontmatter 里已有 `url` 但没有 `source`，默认补一个 `source` 字段；优先从现有标签或 URL 域名判断来源（如知乎、公众号等），避免只留 URL 不留来源。
- 如果发现 `source` 里写的是 URL，优先改成来源名称；如果来源不明确，就把 URL 放到 `url`，不要让 `source` 保存网址。
- 整理 Obsidian 笔记时，默认不滥用 callout；只在确实有助于扫读、强调重点、标记风险或待办时使用 `[!tip]`、`[!info]`、`[!warning]`、`[!todo]`。如果原文里本来就有很强的开门见山句子，优先保留原句并作为重点 callout；其他 callout 视内容需要再决定，不为加而加。
- 在该知识库中工作时，默认按 Obsidian 笔记整理任务处理，而不是按软件项目处理。
- 用户对任务类型的明确表述优先于文件元数据推断：如果用户说“整理笔记”，就按笔记整理，不因 `type: article`、`url`、`clipped_at` 等来源属性自动切换成“整理文章”模式；只有在用户未明确说明时，才参考元数据和内容判断。
- 处理该知识库时，优先使用 Obsidian 相关专用 skill，而不是通用原始操作。
- 遇到中文特殊字符文件名导致读取失败时，用 Python 作为读取兜底方案。
- 在 Obsidian 中区分“整理文章”和“整理笔记”：整理文章时尽量不改写原文，主要做清理、结构梳理与可读性增强（如去除推广文案、失效图片、手工目录和冗余格式）；整理笔记时可以适当做结构优化与组织调整。
- 整理笔记时避免过度压缩或过度改写；如果主旨已经清楚，就减少“作者认为 / 作者指出 / 作者列举 / 作者的判断是”这类第三视角冗余引导语，但不要为了更短而损失原意。
- 处理 Obsidian 整理任务前，先读取 `~/self-improving/memory.md`；如果用户明确说“整理笔记”，优先按笔记整理，不被 `type: article`、`url`、`clipped_at` 等元数据带偏。

## Active Patterns
<!-- Patterns observed 3+ times, subject to decay -->

## Recent (last 7 days)
<!-- New corrections pending confirmation -->
