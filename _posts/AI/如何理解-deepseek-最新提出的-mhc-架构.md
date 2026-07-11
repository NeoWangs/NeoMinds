---
layout: post
title: 如何理解-deepseek-最新提出的-mhc-架构？
date: 2026-01-02 12:00:00 +0800
slug: AI-如何理解-deepseek-最新提出的-mhc-架构-017f58e
category: AI
categories:
- AI
tags:
- AI
- DeepSeek
- 深度学习
- 模型架构
source_path: AI/如何理解-deepseek-最新提出的-mhc-架构？.md
author:
- 程墨Morgan
source: 知乎
aliases:
- mHC
- Manifold-constrained Hyper-Connections
---

> [!abstract] 认知递进
> Deep Neural Network → Residuals → HC → mHC

---

## 一、深度神经网络（DNN）

DNN 由很多层构成，每一层可以表示为一个函数：$y = f(x)$

![[_resources/如何理解-deepseek-最新提出的-mhc-架构？---程墨morgan-的回答/396f43bd9cca079d406f0e67254b5db7_MD5.png]]

很多 $f$ 函数叠加在一起，可以表达复杂的函数关系。但原本的输入在逐层传递过程中，**特征会逐渐衰减**。

> [!example] 比喻：公司指令链
> CEO → CTO → VP → Director → Team Lead → 基层组员。在这个传递链中，CEO 的想法会被逐层模糊化、曲解，最后基层组员理解的可能与 CEO 原意大相径庭。

---

## 二、残差连接（Residuals）

将每一层的函数改为：$y = f(x) + x$

即输出 $y$ 不只是这一层处理过的 $f(x)$，还包含**原始输入 $x$**。

![[_resources/如何理解-deepseek-最新提出的-mhc-架构？---程墨morgan-的回答/37b50c1a4ec02a52dadc7d3f73fd0afd_MD5.png]]

> [!example] 比喻
> CTO 把自己的理解传给 VP 的同时，也把 CEO 原本的指令一并传下去。这样每一层不光知道上一层的理解，还知道上上层的指令，信息更保真。

---

## 三、HC（Hyper-Connections）

HC 是残差连接的强化版——不只是越级传达，还有**更多样的信息传递渠道**。

![[_resources/如何理解-deepseek-最新提出的-mhc-架构？---程墨morgan-的回答/51cc43ffbfa7427d1a9847f264cfdc40_MD5.png]]

> [!example] 比喻
> CTO 可以**选择性传递**：技术无关的信息降低权重，技术相关的信息增加权重。CTO 甚至可以把重要指令**直接越级传递**给 Director 甚至 Team Lead。

---

## 四、mHC（Manifold-Constrained Hyper-Connections）

### 什么是流形（Manifold）

> **近看是 N-1 维的东西，实际是 N 维东西的投影，这就是 N 维流形。**

例如：地球是三维的，但看局部地区时可以用二维地图表示——虽然不是全貌，但包含了该维度所需的所有信息。

![[_resources/如何理解-deepseek-最新提出的-mhc-架构？---程墨morgan-的回答/1f25c8f4bb492bdab5de38c9882e8101_MD5.png]]

### mHC = HC + 流形约束

![[_resources/如何理解-deepseek-最新提出的-mhc-架构？---程墨morgan-的回答/e67aa48503228537588bddb688bb74ae_MD5.png]]

HC 打破了层级壁垒，信息传递更充分，但**容易带来不稳定性**。

> [!example] 比喻
> CEO 直接给基层程序员下达指令，程序员会很疑惑——大家不在一个层面上。CEO 的 KPI 是"提高产品质量"，翻译成基层语言就是"减少 Bug"，这个能理解；但"扩大融资额"和基层完全不相关，看不懂就不要听了。
>
> **mHC 就是给 HC 加上约束：信息要换成接收方能理解的形式，才有参考意义。**

---

## 五、总结

| 阶段 | 核心思想 | 比喻 |
|------|----------|------|
| **DNN** | 多层函数叠加 | 指令逐级传递，容易失真 |
| **Residuals** | $y = f(x) + x$，保留原始输入 | 附带原始指令一起传下去 |
| **HC** | 多通道、可学习权重的信息传递 | 选择性传递 + 越级传达 |
| **mHC** | HC + 流形约束，防止不稳定 | 加上"智能理线器"防止信息混乱 |

> [!quote] 给爷爷奶奶的版本
> 就像织毛衣一样，以前手工织只用一根线，效率不高。然后发明了一种机器，使用多股线一起编织（HC），效率高多了，但容易缠绕。现在用 mHC 方法，添加了一个智能理线器来防止线缠绕。这样织出的毛衣更加结实耐用，而且更加美观。

> [!info] 备注
> Residuals、HC 和 mHC 全都由中国人贡献。
