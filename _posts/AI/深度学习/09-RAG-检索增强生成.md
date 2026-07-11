---
layout: post
title: RAG（检索增强生成）
date: 2026-03-12 12:00:00 +0800
slug: AI-深度学习-09-RAG-检索增强生成-558b64f
category: AI
categories:
- AI
tags:
- ai
- RAG
- 检索增强生成
- 大模型
- 深度学习
source_path: AI/深度学习/09 RAG（检索增强生成）.md
---

## 是什么

RAG（Retrieval-Augmented Generation）是一种让大模型先检索外部知识，再基于检索结果生成答案的方法。

一句话理解：

> 让模型从闭卷考试变成开卷考试。

## 核心结构

- Retriever（检索器）
- Generator（生成器）

典型流程：

```text
用户问题 → 检索 → 召回文档片段 → 拼接上下文 → LLM 生成答案
```

## 为什么重要

RAG 主要解决：
- 知识截止
- 幻觉
- 无法引用来源
- 对私有知识库不了解

## 常见组件

- 文档切块（Chunking）
- Embedding 模型
- 向量数据库
- 检索排序 / 重排序

## 发明人

- Patrick Lewis 等（Meta，2020）

## 典型应用

- 企业知识库问答
- 客服机器人
- 法律 / 医疗 / 金融问答
- 代码助手
- 学术检索

## 相关链接

- [[06 Transformer]]
- [[08 LLM（大模型）]]
- [[10 大模型工程化关键概念]]
- [[RAG优化字典：20种RAG优化方法全解析]]
- [[大模型网关]]
- [[00 总览]]
