---
layout: post
title: GAN（生成对抗网络）
date: 2026-03-12 12:00:00 +0800
slug: 04-GAN-生成对抗网络
category: AI
categories:
- AI
tags:
- ai
- 深度学习
- GAN
- 生成对抗网络
source_path: AI/深度学习/04 GAN（生成对抗网络）.md
---

## 是什么

GAN 是一种生成模型，由两个网络相互对抗训练：
- 生成器（Generator）
- 判别器（Discriminator）

## 核心思想

可以理解成“造假者 vs 鉴定师”：
- 生成器不断提高生成能力
- 判别器不断提高辨别能力
- 最终生成器能生成以假乱真的样本

## 发明人

- Ian Goodfellow（2014）
- Yoshua Bengio 对相关研究方向提供支持

## 典型应用

- 图像生成
- 图像修复
- 风格迁移
- DeepFake
- 数据增强

## 相关链接

- [[01 神经网络]]
- [[00 总览]]
