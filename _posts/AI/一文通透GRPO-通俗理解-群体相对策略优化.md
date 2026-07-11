---
layout: post
title: 一文通透GRPO——通俗理解“群体相对策略优化”
date: 2025-02-17 12:00:00 +0800
slug: AI-一文通透GRPO-通俗理解-群体相对策略优化-698f335
category: AI
categories:
- AI
tags:
- AI
- 强化学习
- DeepSeek
- LLM
source_path: AI/一文通透GRPO——通俗理解“群体相对策略优化”.md
aliases:
- GRPO
- Group Relative Policy Optimization
source_url: https://blog.csdn.net/v_JULY_v/article/details/136656918
---

> [!abstract] 一句话总结
> GRPO（Group Relative Policy Optimization）是 DeepSeek 在 DeepSeekMath 中提出的强化学习算法，核心思想是**丢掉 PPO 中的 Critic 模型**，转而通过对同一问题采样多个输出，用**群体平均奖励作为基线**来计算优势函数，大幅降低训练资源需求。

---

## 一、背景：PPO 的问题

### PPO 回顾

PPO 是一种 actor-critic 的 RL 算法，训练中需要 **4 个模型**：

| 模型 | 作用 |
|------|------|
| Actor（策略模型） | 生成输出 |
| Critic（价值模型） | 输出 value，估计基线 |
| Reward Model | 对输出打分 |
| Reference Model | 约束策略不偏离太远 |

### PPO 的痛点

- Critic 模型通常与策略模型**规模相当**，带来巨大的内存和计算负担
- 优势函数需要通过 GAE（广义优势估计）计算，涉及复杂的 value 估计和 returns 拟合
- 两个层面的迭代：策略迭代 + 价值估计迭代

---

## 二、GRPO 的核心思想

### 关键改变：用群体平均代替 Critic

GRPO 只需要 **3 个模型**（去掉了 Critic），通过以下方式计算优势：

1. 对每个问题 $q$，从旧策略采样 **G 个输出** $\{o_1, o_2, \cdots, o_G\}$
2. 用奖励模型对每个输出打分，得到 G 个奖励 $\{r_1, r_2, \cdots, r_G\}$
3. 计算群体均值和标准差，**归一化奖励即为优势值**

$$\hat{A}_i = \frac{r_i - \text{mean}(\mathbf{r})}{\text{std}(\mathbf{r})}$$

> [!tip] 直觉理解
> 怎么评判一个员工是否优秀？拿他去和所有员工的平均水准对比——高于平均水准的便是好员工。GRPO 的优势函数就是这个逻辑。

### 实例：7 + 3*7 = ?

假设模型生成 4 个输出（G=4）：

| 输出 | 内容 | 准确性奖励 | 格式奖励 | 总奖励 |
|------|------|-----------|---------|--------|
| o1 | 运算顺序错误，答案 70 | 0 | 0.1 | 0.1 |
| o2 | 正确推理，答案 28 | 1 | 0.1 | **1.1** |
| o3 | 答案正确但缺少 think 标签 | 1 | 0 | 1.0 |
| o4 | 推理混乱，答案 7 | 0 | 0.1 | 0.1 |

- 均值 = 0.575，标准差 $\approx$ 0.5
- o2 和 o3 优势为正 → 鼓励
- o1 和 o4 优势为负 → 抑制

---

## 三、GRPO 目标函数

$$\mathcal{J}_{GRPO}(\theta) = \mathbb{E} \left[ \frac{1}{G} \sum_{i=1}^{G} \frac{1}{|o_i|} \sum_{t=1}^{|o_i|} \left\{ \min\left[ \frac{\pi_\theta}{\pi_{\theta_{old}}} \hat{A}_{i,t},\ \text{clip}\left(\frac{\pi_\theta}{\pi_{\theta_{old}}}, 1-\varepsilon, 1+\varepsilon\right) \hat{A}_{i,t} \right] - \beta \mathbb{D}_{KL}[\pi_\theta \| \pi_{ref}] \right\} \right]$$

目标函数包含**两层约束**：

| 部分 | 约束对象 | 作用 |
|------|----------|------|
| 前半部分（clip） | 新策略 vs 旧策略 | 策略迭代不要太激进 |
| 后半部分（KL） | 新策略 vs reference 策略 | 不要偏离 SFT 模型太远 |

### 与 PPO 的 KL 处理差异

- **PPO**：在奖励函数中添加 KL 惩罚（约束旧策略与 reference 之间），导致优势计算更复杂
- **GRPO**：直接将 KL 散度加到目标函数中，避免了复杂的 GAE 优势计算

---

## 四、优势函数的三种设计

### 1. 结果监督（Outcome Supervision）

- 奖励模型只看**最终输出结果**
- 输出中所有 token 的优势值 = 归一化后的奖励
- $\hat{A}_{i,t} = \tilde{r}_i = \frac{r_i - \text{mean}(\mathbf{r})}{\text{std}(\mathbf{r})}$

### 2. 过程监督（Process Supervision）

- 奖励模型在**每个推理步骤**结束时提供奖励
- 每个 token 的优势 = 后续所有步骤归一化奖励之和
- 更适合复杂数学任务（需要 step-by-step 监督）

### 3. 迭代强化学习（Iterative RL）

- 随着训练进展，旧的奖励模型可能不足以监督当前策略
- 周期性地用新数据重新训练奖励模型

---

## 五、PPO vs GRPO 对比

| 维度 | PPO | GRPO |
|------|-----|------|
| 模型数量 | 4 个（Actor + Critic + RM + Ref） | 3 个（Actor + RM + Ref） |
| 基线计算 | Critic 网络拟合 value | 群体平均奖励 |
| 优势函数 | GAE（复杂） | 归一化群体奖励（简单） |
| KL 约束位置 | 奖励函数中 | 目标函数中 |
| 训练资源 | 高（需训练 Critic） | 低（无 Critic） |
| 核心取舍 | 用 Critic 降低方差 | 用多次采样（G 个输出）降低方差 |

---

## 六、统一范式

SFT、RFT、DPO、PPO、GRPO 的梯度都可以写成统一形式：

$$\nabla_\theta \mathcal{J}(\theta) = \mathbb{E}_{(q,o) \sim \mathcal{D}} \left[ \frac{1}{|o|} \sum_{t=1}^{|o|} GC(q, o, t, \pi_{ref}) \cdot \nabla_\theta \log \pi_\theta(o_t | q, o_{<t}) \right]$$

三个关键组成部分：

| 组成部分 | 含义 |
|----------|------|
| 数据来源 $\mathcal{D}$ | 训练数据从哪来 |
| 奖励函数 | 训练奖励信号的来源 |
| 梯度系数 $GC$ | 对数据惩罚或强化的幅度 |

---

## 七、DeepSeekMath 训练流程

```
DeepSeek-Coder-Base-v1.5 7B
    ↓ 预训练（120B 数学 token）
DeepSeekMath-Base 7B
    ↓ 指令微调（CoT + program-of-thought + tool-integrated reasoning）
DeepSeekMath-Instruct 7B
    ↓ GRPO 强化学习（144K 问题，G=64，lr=1e-6，KL系数=0.04）
DeepSeekMath-RL 7B
```

## 相关概念

- [[如何理解-deepseek-最新提出的-mhc-架构？]]
