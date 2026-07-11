---
layout: post
title: RNN（循环神经网络）
date: 2026-03-12 12:00:00 +0800
slug: 07-RNN-循环神经网络
category: AI
categories:
- AI
tags:
- ai
- 深度学习
- RNN
- LSTM
- GRU
source_path: AI/深度学习/07 RNN（循环神经网络）.md
---

## 是什么

RNN 用于处理序列数据，核心思想是让信息在时间步之间传递，也就是给网络加入“记忆”。

## 代表发展路线

- Elman RNN（1990）
- LSTM（1997）
- GRU（2014）

## 优点

- 适合时序 / 序列数据
- 参数共享
- 早期 NLP / 语音任务非常重要

## 局限

- 梯度消失 / 梯度爆炸
- 长程依赖能力有限
- 无法并行，训练慢

## 历史地位

RNN 是 Transformer 之前序列建模的主流方案，后来被大规模取代，但其时序记忆思想仍然重要。

## 相关链接

- [[06 Transformer]]
- [[02 反向传播]]
- [[00 总览]]
