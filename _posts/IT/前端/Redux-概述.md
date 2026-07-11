---
layout: post
title: Redux 概述
date: 2026-02-17 12:00:00 +0800
slug: IT-前端-Redux-概述-657daa5
category: IT
categories:
- IT
tags:
- 前端
- React
- 状态管理
source_path: IT/前端/Redux 概述.md
aliases:
- Redux
- Redux Toolkit
- RTK
---

> [!abstract] 一句话
> Redux 是 JavaScript 应用的**可预测状态管理库**，核心思想是**单一数据源 + 纯函数更新 + 单向数据流**。目前推荐使用 **Redux Toolkit（RTK）** 作为标准写法。

---

## 一、为什么需要 Redux？

### 没有 Redux 时的痛点

当应用变大后，组件间共享状态变得混乱：

```
      App
     / | \
    A  B  C        ← A 和 C 都需要用户信息
   /       \
  D         E      ← D 修改了数据，E 也要同步更新
```

- 状态提升到公共父组件？层级深了就要逐层传递 props（"prop drilling"）
- 用 Context？频繁更新时性能差，逻辑分散
- 兄弟组件通信？没有直接途径

### Redux 的解决思路

把**所有共享状态抽到一个全局 Store** 里，任何组件都能直接读取和更新，不需要逐层传递：

```
        Store（单一数据源）
       / | \  \
      A  B  C  D  E    ← 谁需要就直接连
```

---

## 二、三大原则

| 原则 | 含义 | 好处 |
|------|------|------|
| **单一数据源** | 整个应用的状态存在一个 Store 的对象树中 | 状态集中管理，便于调试和持久化 |
| **状态只读** | 唯一改变状态的方式是触发 Action | 防止随意修改，变更可追踪 |
| **纯函数修改** | 用 Reducer（纯函数）描述状态如何变化 | 可预测、可测试、可回放 |

---

## 三、核心概念

### 数据流

```
用户操作 → dispatch(Action) → Reducer 处理 → 生成新 State → 视图更新
```

> [!example] 类比：银行取款
> - **Store**：银行金库（存放所有资金）
> - **State**：账户余额（当前状态）
> - **Action**：填写取款单（"我要取 500 元"）
> - **Dispatch**：把取款单递给柜员
> - **Reducer**：柜员按照规则处理（余额 - 500 = 新余额）
> - 你不能自己走进金库拿钱（不能直接修改 State）

### Action

描述"发生了什么事"的普通对象：

```js
{ type: 'counter/increment' }
{ type: 'todos/add', payload: { text: '学 Redux' } }
```

- `type`：必须有，描述事件类型
- `payload`：可选，携带数据

### Reducer

接收旧 State 和 Action，返回**新 State** 的纯函数：

```js
function counterReducer(state = 0, action) {
  switch (action.type) {
    case 'counter/increment':
      return state + 1
    case 'counter/decrement':
      return state - 1
    default:
      return state
  }
}
```

> [!warning] 纯函数要求
> - 不能修改原 state（必须返回新对象）
> - 不能有副作用（不能请求 API、不能随机数）
> - 相同输入必须有相同输出

### Store

整个应用唯一的状态容器：

```js
import { createStore } from 'redux'
const store = createStore(counterReducer)

store.getState()              // 读取状态
store.dispatch({ type: 'counter/increment' })  // 触发更新
store.subscribe(() => { ... })  // 监听变化
```

---

## 四、经典 Redux 的问题

经典 Redux 虽然理念优秀，但写起来**又臭又长**：

1. **样板代码太多** — 一个功能要写 Action Type 常量、Action Creator 函数、Reducer，分散在多个文件
2. **不可变更新很啰嗦** — 深层嵌套对象要手动展开每一层 `{ ...state, a: { ...state.a, b: newValue } }`
3. **异步逻辑复杂** — 需要额外引入 redux-thunk 或 redux-saga 中间件
4. **配置繁琐** — Store 配置、中间件集成、DevTools 连接都要手动搞

> [!quote]
> "我知道 Redux 很好，但每次加一个功能要改 5 个文件……" — 无数前端开发者的心声

---

## 五、Redux Toolkit（RTK）— 现代 Redux

Redux 官方推出的工具包，解决了上述所有痛点。**现在写 Redux 就是写 RTK，不要再用经典写法了。**

### createSlice — 一个文件搞定

把 Action Type、Action Creator、Reducer **合并到一起**：

```js
import { createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      state.value += 1  // ← 可以"直接修改"！RTK 内部用 Immer 处理不可变性
    },
    decrement(state) {
      state.value -= 1
    },
    incrementByAmount(state, action) {
      state.value += action.payload
    },
  },
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer
```

> [!important] 可以"直接修改" state？
> RTK 内部使用 **Immer** 库。你写的看起来是直接修改（`state.value += 1`），但 Immer 会自动帮你生成新的不可变对象。写着爽，原则不破。

### configureStore — 开箱即用

```js
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'
import todosReducer from './todosSlice'

const store = configureStore({
  reducer: {
    counter: counterReducer,
    todos: todosReducer,
  },
  // 自动集成：redux-thunk 中间件 + Redux DevTools
})
```

### createAsyncThunk — 异步逻辑

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchUser = createAsyncThunk('user/fetch', async (userId) => {
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
})

const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => { state.loading = true })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})
```

自动生成 `pending`、`fulfilled`、`rejected` 三个 Action，不用手动写。

### RTK Query — 数据请求（可选）

Redux Toolkit 自带的数据请求方案，类似 TanStack Query：

```js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getUser: builder.query({ query: (id) => `/users/${id}` }),
    updateUser: builder.mutation({ query: (user) => ({ url: `/users/${user.id}`, method: 'PUT', body: user }) }),
  }),
})

export const { useGetUserQuery, useUpdateUserMutation } = api
```

自动处理缓存、加载状态、轮询、失效重取。

---

## 六、在 React 中使用

### 连接 Store

```jsx
import { Provider } from 'react-redux'
import store from './store'

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
}
```

### 读取和更新状态

```jsx
import { useSelector, useDispatch } from 'react-redux'
import { increment, decrement } from './counterSlice'

function Counter() {
  const count = useSelector((state) => state.counter.value)  // 读
  const dispatch = useDispatch()                               // 写

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  )
}
```

| Hook | 用途 |
|------|------|
| `useSelector` | 从 Store 中选取需要的状态 |
| `useDispatch` | 获取 dispatch 函数，用来触发 Action |

---

## 七、经典 Redux vs RTK 对比

| | 经典 Redux | Redux Toolkit |
|---|-----------|---------------|
| Action Type | 手动定义字符串常量 | `createSlice` 自动生成 |
| Action Creator | 手动写函数 | `createSlice` 自动生成 |
| Reducer | switch/case，手动展开不可变更新 | 直接"修改"（Immer 代理） |
| Store 配置 | 手动组合 middleware、DevTools | `configureStore` 一行搞定 |
| 异步逻辑 | 自己接 thunk/saga | `createAsyncThunk` 内置 |
| 数据请求 | 自己写或接第三方库 | RTK Query 内置 |
| 样板代码量 | **多** | **少 60%~70%** |

---

## 八、Redux vs 其他状态管理方案

| | Redux（RTK） | Zustand | Jotai | Context API |
|---|-------------|---------|-------|-------------|
| 复杂度 | 中等 | **低** | **低** | 低 |
| 样板代码 | 中等（RTK 已大幅减少） | 极少 | 极少 | 少 |
| DevTools | **最强**（时间旅行调试） | 支持 Redux DevTools | 支持 | 无 |
| 中间件/异步 | 内置 thunk + RTK Query | 中间件支持 | 无内置 | 自己写 |
| 适合规模 | 中大型应用 | 中小型应用 | 中小型应用 | 小型 / 局部共享 |
| 学习曲线 | 较陡（概念多） | 平缓 | 平缓 | 几乎没有 |

> [!tip] 怎么选？
> - **小项目 / 简单共享状态** → Zustand 或 Jotai，轻量够用
> - **中大型项目 / 团队协作 / 需要严格规范** → Redux Toolkit，生态最全、DevTools 最强
> - **只是几个组件共享数据** → Context API 就够了，不需要第三方库

---

## 九、Redux 适合什么场景？

| 适合 | 不太适合 |
|------|----------|
| 多个组件共享大量状态 | 状态只在父子组件间传递（props 就够了） |
| 需要时间旅行调试 / 状态回放 | 简单的表单或局部 UI 状态 |
| 团队需要统一的状态管理规范 | 小型项目（引入 Redux 反而增加复杂度） |
| 复杂的异步数据流（请求、缓存、乐观更新） | 对包体积极度敏感的场景 |
| 服务端状态和客户端状态都要管理（RTK Query） | |

---

## 相关笔记

- [[React 概述]]
- [[Vue 概述]]
