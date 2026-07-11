---
layout: post
title: Vue 概述
date: 2026-02-17 12:00:00 +0800
slug: Vue-概述
category: IT
categories:
- IT
tags:
- 前端
- Vue
- JavaScript
source_path: IT/前端/Vue 概述.md
aliases:
- Vue.js
- VueJS
---

> [!abstract] 一句话
> Vue 是尤雨溪（Evan You）创建的**渐进式 JavaScript 框架**，核心思想是**响应式数据绑定 + 模板驱动**，上手简单，逐步增强。

---

## 一、核心理念

### 渐进式框架

Vue 的设计哲学是**用多少学多少**。可以只在页面局部引入 Vue 处理交互，也可以用全家桶搭建大型 SPA。不强制一步到位。

```
简单页面交互 → 组件化 → 路由（Vue Router） → 状态管理（Pinia） → SSR（Nuxt）
```

### 响应式数据绑定

数据变了，视图自动更新；视图变了（表单输入），数据也自动同步。这就是**双向绑定**，开发者不需要手动同步。

### 模板优先

Vue 使用 HTML 模板语法，对前端开发者来说几乎零学习成本：

```vue
<template>
  <h1>Hello, {{ name }}</h1>
  <button @click="count++">点了 {{ count }} 次</button>
</template>
```

---

## 二、关键概念

### 单文件组件（SFC）

Vue 的标志性设计——把模板、逻辑、样式写在一个 `.vue` 文件里：

```vue
<template>
  <h1>{{ msg }}</h1>
</template>

<script setup>
import { ref } from 'vue'
const msg = ref('Hello Vue!')
</script>

<style scoped>
h1 { color: #42b883; }
</style>
```

`scoped` 让样式只作用于当前组件，不会污染其他组件。

### 两种 API 风格

| | Options API（Vue 2 风格） | Composition API（Vue 3 主流） |
|---|--------------------------|-------------------------------|
| 组织方式 | 按选项分块（data、methods、computed…） | 按功能逻辑组织，类似 React Hooks |
| 适合 | 简单组件、入门学习 | 复杂逻辑、逻辑复用 |
| 代码复用 | Mixins（容易命名冲突） | Composables（函数组合，清晰） |

**Options API：**

```js
export default {
  data() { return { count: 0 } },
  methods: {
    increment() { this.count++ }
  }
}
```

**Composition API（`<script setup>`）：**

```js
import { ref } from 'vue'
const count = ref(0)
const increment = () => count.value++
```

### 响应式原理

| 版本 | 实现方式 | 特点 |
|------|----------|------|
| Vue 2 | `Object.defineProperty` | 对新增/删除属性需要 `Vue.set()`，数组变更有限制 |
| Vue 3 | `Proxy` | 天然支持新增/删除属性、数组索引修改，性能更好 |

### 常用响应式 API

| API | 用途 | 对标 React |
|-----|------|-----------|
| `ref()` | 基本类型响应式（通过 `.value` 访问） | `useState` |
| `reactive()` | 对象/数组响应式（直接访问） | `useState` + 对象 |
| `computed()` | 计算属性，自动缓存 | `useMemo` |
| `watch()` / `watchEffect()` | 侦听数据变化执行副作用 | `useEffect` |
| `provide()` / `inject()` | 跨层级传递数据 | `useContext` |

### 指令系统

Vue 模板中的特殊属性，以 `v-` 开头：

| 指令 | 用途 | 示例 |
|------|------|------|
| `v-bind` (`:`) | 动态绑定属性 | `:href="url"` |
| `v-on` (`@`) | 事件监听 | `@click="handler"` |
| `v-model` | 双向绑定 | `<input v-model="text">` |
| `v-if` / `v-else` | 条件渲染 | `v-if="isLogin"` |
| `v-for` | 列表渲染 | `v-for="item in list"` |
| `v-show` | 显示/隐藏（CSS display） | `v-show="visible"` |

---

## 三、生态系统

| 领域 | 方案 | 备注 |
|------|------|------|
| 路由 | Vue Router | 官方维护 |
| 状态管理 | Pinia（取代 Vuex） | 官方推荐，API 更简洁 |
| SSR / 全栈框架 | Nuxt | Vue 的 Next.js |
| 构建工具 | Vite | 尤雨溪出品，极快的 HMR |
| UI 组件库 | Element Plus、Ant Design Vue、Naive UI | |
| 移动端 | uni-app、Ionic Vue | uni-app 在国内很流行 |
| 桌面端 | Electron + Vue、Tauri + Vue | |

> [!tip] Vite
> Vite 虽然由 Vue 作者创建，但它是**框架无关**的，React、Svelte 等都能用。现在已经成为前端构建工具的主流选择。

---

## 四、发展脉络

| 时间 | 里程碑 |
|------|--------|
| 2014 | Vue 1.0 发布，主打轻量易用 |
| 2016 | Vue 2.0，引入虚拟 DOM、组件系统成熟 |
| 2020 | Vite 发布，改变前端构建体验 |
| 2020 | Vue 3.0 发布，Composition API、Proxy 响应式、性能大幅提升 |
| 2023 | Vue 3 成为默认版本，Pinia 取代 Vuex |
| 2025 | Vue Vapor Mode 探索（编译时优化，去掉虚拟 DOM） |

---

## 五、Vue vs React 对比

### 设计哲学

| | Vue | React |
|---|-----|-------|
| 定位 | **框架**（自带模板、指令、双向绑定） | **库**（只管渲染，其他自己选） |
| 理念 | 渐进式，官方提供全家桶 | 最小核心，社区驱动生态 |
| 模板 vs JSX | HTML 模板优先（也支持 JSX） | JSX 优先（JS 里写标记） |
| 数据流 | 双向绑定（`v-model`） | 单向数据流（受控组件） |
| 上手曲线 | 平缓，对 HTML/CSS 开发者友好 | 稍陡，需要理解 JSX + Hooks 心智模型 |

### 响应式机制

| | Vue | React |
|---|-----|-------|
| 核心原理 | **自动追踪依赖**（Proxy 拦截读写） | **不可变状态 + 重新渲染**（调用 setter 触发整棵组件树 re-render） |
| 数据更新 | 直接修改 `count.value++` | 必须调用 `setCount(count + 1)`，不能直接改 |
| 精确更新 | 自动只更新依赖了该数据的地方 | 默认整个组件重新渲染，需要 `memo`/`useMemo` 手动优化 |
| 心智负担 | 低——改了就生效 | 需要注意闭包陷阱、依赖数组、重渲染性能 |

### 代码风格对比

同样一个计数器：

**Vue（`<script setup>`）：**

```vue
<template>
  <button @click="count++">{{ count }}</button>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
```

**React（Hooks）：**

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

> [!info] 对比
> Vue 可以直接 `count++`，React 必须 `setCount()`。Vue 模板和逻辑分离，React 用 JSX 混在一起。各有取舍。

### 性能

| | Vue | React |
|---|-----|-------|
| 虚拟 DOM | 有（Vue 3），编译时优化标记静态节点 | 有，Fiber 架构支持并发渲染 |
| 编译优化 | **模板编译时**就能分析出哪些是静态的、哪些会变，运行时跳过不变的部分 | JSX 过于灵活，编译时难以优化，运行时兜底 |
| 未来方向 | Vapor Mode（编译时生成直接 DOM 操作，去掉虚拟 DOM） | React Compiler（自动 memo 化，减少手动优化） |

### 生态与社区

| | Vue | React |
|---|-----|-------|
| 核心团队 | 尤雨溪 + 小团队，官方维护路由/状态管理/构建工具 | Meta 团队，核心库之外由社区驱动 |
| 市场份额 | 中国、东南亚市场份额高 | 全球最大市场份额，欧美主流 |
| 就业市场 | 国内中小公司、外包项目多 | 国内外大厂均有，海外机会更多 |
| 学习资源 | 官方中文文档质量极高 | 英文资源最丰富，社区庞大 |
| SSR 框架 | Nuxt | Next.js |
| 移动端 | uni-app（国内流行） | React Native（全球流行） |

### 怎么选？

| 场景 | 推荐 | 原因 |
|------|------|------|
| 快速上手、中小型项目 | Vue | 上手快，官方全家桶省心 |
| 大型复杂应用、团队多人协作 | 都可以 | Vue 3 Composition API 和 React Hooks 能力已经接近 |
| 国内就业、快速出活 | Vue | 国内 Vue 岗位多，中文生态好 |
| 海外就业、跨平台（Web + Mobile） | React | 全球市场大，React Native 成熟 |
| 追求极致性能 | Vue | 编译时优化天然优势 |
| 函数式编程偏好、灵活度要求高 | React | JSX 就是 JavaScript，没有约束 |

> [!quote]
> 两者都是优秀的工具。Vue 像一把好用的瑞士军刀——开箱即用；React 像一套乐高积木——自由组合。选哪个取决于你的团队、项目和个人偏好。

---

## 相关笔记

- [[React 概述]]
