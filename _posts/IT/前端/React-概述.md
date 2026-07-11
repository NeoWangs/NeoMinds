---
layout: post
title: React 概述
date: 2026-02-17 12:00:00 +0800
slug: IT-前端-React-概述-85e7c99
category: IT
categories:
- IT
tags:
- 前端
- React
- JavaScript
source_path: IT/前端/React 概述.md
aliases:
- React.js
- ReactJS
---

> [!abstract] 一句话
> React 是 Facebook（现 Meta）开源的 **JavaScript UI 库**，核心思想是**用组件构建界面，用状态驱动渲染**。

---

## 一、核心理念

### UI = f(state)

界面是状态的函数——状态变了，React 自动算出界面该怎么变，开发者不需要手动操作 DOM。

### 组件化

把页面拆成一个个**可复用的组件**，每个组件管自己的状态和渲染逻辑。像搭积木一样组合出完整页面。

### 单向数据流

数据从父组件通过 **props** 向下传递给子组件，子组件不能直接修改父组件的数据。数据流向清晰，容易追踪 bug。

---

## 二、关键概念

### JSX

在 JavaScript 里写类似 HTML 的语法，本质上会被编译为 `React.createElement()` 调用：

```jsx
// 写起来像 HTML
const element = <h1>Hello, {name}</h1>;

// 实际编译为
const element = React.createElement('h1', null, `Hello, ${name}`);
```

### 组件

两种写法（现在几乎只用函数组件）：

```jsx
// 函数组件（主流）
function Welcome({ name }) {
  return <h1>Hello, {name}</h1>;
}

// 类组件（旧写法）
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### Props vs State

| | Props | State |
|---|-------|-------|
| 谁控制 | 父组件传入 | 组件自己管理 |
| 能否修改 | 只读 | 可通过 setter 修改 |
| 用途 | 组件间通信 | 组件内部状态 |

### Hooks（React 16.8+）

让函数组件也能用状态和生命周期，是现代 React 的核心：

| Hook | 用途 | 类比 |
|------|------|------|
| `useState` | 管理状态 | 组件的"记忆" |
| `useEffect` | 副作用（请求数据、订阅、操作 DOM） | 生命周期的统一替代 |
| `useContext` | 跨层级共享数据 | 避免 props 逐层传递 |
| `useRef` | 保存可变引用（不触发重新渲染） | 组件的"便签纸" |
| `useMemo` | 缓存计算结果 | 性能优化 |
| `useCallback` | 缓存函数引用 | 性能优化 |

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>点了 {count} 次</button>;
}
```

---

## 三、渲染机制

### Virtual DOM

React 在内存中维护一棵**虚拟 DOM 树**。状态变化时，React 先在虚拟 DOM 上算出差异（Diff），再把最小的变更一次性应用到真实 DOM 上——比直接操作 DOM 高效得多。

### 渲染流程

```
state 变化 → 生成新的虚拟 DOM → Diff 算法比较新旧树 → 计算最小变更 → 更新真实 DOM
```

### React Fiber（React 16+）

重写了调和（Reconciliation）引擎，把渲染工作拆成小块，可以**中断和恢复**，不再一口气跑完。好处：

- 高优先级更新（用户输入）可以打断低优先级更新（数据加载）
- 界面不会因为大量计算而卡顿

---

## 四、生态系统

| 领域 | 主流方案 |
|------|----------|
| 路由 | React Router |
| 状态管理 | Zustand、Redux Toolkit、Jotai |
| 服务端渲染（SSR） | Next.js |
| 静态生成（SSG） | Next.js、Astro |
| 样式方案 | Tailwind CSS、CSS Modules、styled-components |
| 数据请求 | TanStack Query（React Query） |
| 表单 | React Hook Form |
| UI 组件库 | Ant Design、shadcn/ui、Material UI |
| 移动端 | React Native |

---

## 五、发展脉络

| 时间 | 里程碑 |
|------|--------|
| 2013 | React 开源 |
| 2015 | React Native 发布（用 React 写移动端） |
| 2016 | React Fiber 架构开始重写 |
| 2018 | React 16.8 引入 **Hooks**，函数组件成为主流 |
| 2022 | React 18 发布，引入**并发模式**（Concurrent Mode） |
| 2024 | React 19 发布，引入 **Server Components**、Actions |

### Server Components（RSC）

React 19 的重大变化——组件可以在**服务端运行**，只把渲染结果发送给客户端：

- 减少客户端 JavaScript 体积
- 可以直接在组件中访问数据库、文件系统
- 与客户端组件可以混合使用
- Next.js App Router 是目前最主流的 RSC 实践

---

## 六、React 适合什么场景？

| 适合 | 不太适合 |
|------|----------|
| 交互复杂的单页应用（SPA） | 简单的静态页面（用原生 HTML 就够了） |
| 需要组件复用的中大型项目 | 对包体积极度敏感的场景（考虑 Svelte/Solid） |
| 跨平台（Web + Mobile） | SEO 为主的内容站（可用 Next.js 弥补） |
| 团队协作，需要规范化的开发模式 | |

---

## 相关笔记

- [[Vue 概述]]
