---
layout: post
title: MoE（混合专家模型）
date: 2026-03-12 12:00:00 +0800
slug: 05-MoE-混合专家模型
category: AI
categories:
- AI
tags:
- ai
- 深度学习
- MoE
- 混合专家模型
source_path: AI/深度学习/05 MoE（混合专家模型）.md
---

## 是什么

MoE（Mixture of Experts）的核心思想是：

> 不同输入，交给不同专家处理，而不是每次都激活全部参数。

核心组成：
- Experts：多个专家网络
- Router / Gating Network：决定路由给哪些专家

## 为什么重要

MoE 让模型拥有很大的总参数量，但每次推理只激活少数专家，因此更有机会兼顾能力和成本。

## 代表发展脉络

- Michael Jordan & Robert Jacobs（1991）：最早提出思想
- Noam Shazeer 等（2017）：稀疏门控 MoE
- Google（2021）：Switch Transformer
- Mistral AI（2023）：Mixtral 8×7B
- DeepSeek（2024）：DeepSeek-V2 / V3

## 技术难点

- 专家负载均衡
- 路由质量
- 显存占用高
- 工程实现复杂

## 相关链接

- [[06 Transformer]]
- [[08 LLM（大模型）]]
- [[10 大模型工程化关键概念]]
- [[00 总览]]
