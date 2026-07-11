---
layout: post
title: Transformer
date: 2026-03-12 12:00:00 +0800
slug: AI-深度学习-06-Transformer-6b977c8
category: AI
categories:
- AI
tags:
- ai
- 深度学习
- Transformer
source_path: AI/深度学习/06 Transformer.md
---

## 是什么

Transformer 是 2017 年提出的深度学习架构，几乎定义了现代大模型的发展方向。

原始论文：
- Attention Is All You Need（2017）

## 它解决了什么问题

相对于 RNN / LSTM，Transformer 主要解决：
- 长程依赖弱
- 无法高效并行训练

## 核心机制

### 自注意力（Self-Attention）
处理每个 token 时，可以参考整个序列。

### Q / K / V
- Query
- Key
- Value

### 多头注意力（Multi-Head Attention）
让模型从多个角度同时关注不同关系。

### 位置编码（Positional Encoding）
补足顺序信息。

## 发明团队

- Ashish Vaswani（第一作者）
- Noam Shazeer
- Niki Parmar
- Jakob Uszkoreit
- Llion Jones
- Aidan Gomez
- Łukasz Kaiser
- Illia Polosukhin

## 影响

几乎所有现代大语言模型都是 Transformer 的变体或继承者，如 GPT、Claude、Gemini、LLaMA、DeepSeek。

## Scaling Law

### 是什么

Scaling Law（尺度定律）指的是：

> 当模型参数、训练数据、计算量持续扩大时，模型性能往往会呈现出相对稳定、可预测的提升规律。

它是现代大模型时代非常关键的经验规律之一。

### 为什么重要

Scaling Law 让研究者逐渐意识到：

- 只要架构足够稳定
- 训练流程足够成熟
- 数据和算力持续增加

模型能力就可能继续提升，而不一定每次都需要全新的架构革命。

这也是为什么 Transformer 在提出后，能够一路扩展成今天的大模型体系。

### 直观理解

可以粗略理解成：

- 模型更大
- 数据更多
- 训练更久 / 计算更多

通常就更容易得到更强的结果。

当然，这不是无限成立的“线性增长”，而是说整体上存在一类可观测、可拟合的提升趋势。

### 和大模型的关系

现代 LLM 的很多发展路径，本质上都在利用 Scaling Law：

- 扩大参数规模
- 扩大训练语料
- 增加训练算力
- 优化参数量、数据量、算力之间的配比

因此，Transformer 不只是一个“好用的架构”，它还是一个**很适合被持续放大（scale up）**的架构。

### 一句话理解

> **Scaling Law 说明：在很多情况下，把模型、数据和算力做大，性能就会按某种规律持续变好。**

## 相关链接

- [[05 MoE（混合专家模型）]]
- [[07 RNN（循环神经网络）]]
- [[08 LLM（大模型）]]
- [[09 RAG（检索增强生成）]]
- [[AI 是否毁了围棋？——从 AlphaGo 到围棋世界的重构]]
- [[00 总览]]

> [!tip]
> 与 Scaling Law 相对，大模型工程里另一条重要思路是 **Distillation（知识蒸馏）**：不是继续放大模型，而是把大模型能力压缩给更小模型。可结合 [[08 LLM（大模型）]] 一起理解。
