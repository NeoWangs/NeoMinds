---
layout: post
title: Karpathy强推的-92-个信息源
date: 2026-03-03 12:00:00 +0800
slug: Karpathy强推的-92-个信息源
category: 思维
categories:
- 思维
tags:
- AI
- 信息源
- RSS
- 工具
source_path: 思维/Karpathy强推的-92-个信息源.md
author: 知乎
source: 知乎
---

> [!abstract] 摘要
> Andrej Karpathy 在 X 上分享了一份 OPML 订阅文件，收录了 2025 年 Hacker News 最受欢迎的 92 个博客，涵盖深度技术、编程、数学与科学研究。他倡导用 RSS 对抗算法信息茧房，回归人类撰写的高质量长文。

---

## Andrej Karpathy 是谁

- OpenAI 创始成员
- 曾被马斯克挖走，领导**特斯拉自动驾驶**团队
- 回归 OpenAI 后参与 GPT-4 研发
- 现创立 AI 教育公司 **Eureka Labs**，在 X 和 YouTube 活跃
- YouTube 频道是目前学习 AI 技术原理的最佳路径之一

![[_resources/超级-ai-大神强推的-92-个信息源，在-github-上开源了。/4f9558894a2470ad14e78e8f335139e9_MD5.webp]]

---

## 他的开源项目

### nanoGPT

> 理解大语言模型原理的入门神作

剥离工业级工程包装，只保留 Transformer 核心逻辑。两个约 300 行的文件：
- `model.py`：定义 Transformer 数学结构
- `train.py`：实现完整训练循环

支持分布式训练、混合精度加速（Flash Attention）、与 OpenAI 官方权重兼容。

开源地址：https://github.com/karpathy/nanoGPT

### nanochat

> 从预训练到对话模型的全链路框架，约 100 美元可训练一个小型 ChatGPT

约 8000 行代码实现端到端系统，涵盖：
- 分词器训练
- 有监督微调（SFT）
- 强化学习（RLHF）
- 自带 Web 聊天界面

---

## 92 个信息源：HN 热门博客 OPML

Karpathy 认为当前社交媒体充斥 AI 生成垃圾内容，RSS 是对抗信息茧房和算法操控的最后堡垒。

OPML 文件：https://gist.github.com/emschwartz/e6d2bf860ccc367fe37ff953ba6de66b#file-hn-popular-blogs-2025-opml

### 如何使用

1. 下载上方 OPML 文件
2. 安装 RSS 阅读器：
   - **Folo**（开源）：https://github.com/RSSNext/Folo
   - **NetNewsWire**（开源，macOS/iOS）：https://github.com/Ranchero-Software/NetNewsWire
   - 当前在用 Lire
1. 导入 OPML 文件，即可订阅全部 92 个博客

---

## 值得关注的博主

| 博主 | 背景 | 特点 |
|------|------|------|
| **Simon Willison** | Django 框架联合创始人 | 务实使用 AI，手写代码测试新模型，分享 Prompt 工程和 API 心得 |
| **Paul Graham** | YC 创始人 | 更新不频繁，但每篇必火 |
| **John Gruber** | Daring Fireball | 苹果生态深度评论 |
| **Julia Evans** | — | 用漫画解释 Linux 内核 / 网络协议 |
| **Terence Tao** | 菲尔兹奖得主 | 陶哲轩博客，数学界顶流 |
| **Neal Agarwal** | — | 用代码做好玩的网页，代表作《Stimulation Clicker》 |
