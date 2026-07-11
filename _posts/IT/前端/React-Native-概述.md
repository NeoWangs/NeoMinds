---
layout: post
title: React Native 概述
date: 2026-02-17 12:00:00 +0800
slug: IT-前端-React-Native-概述-2406556
category: IT
categories:
- IT
tags:
- 前端
- React
- 移动端
- 跨平台
source_path: IT/前端/React Native 概述.md
aliases:
- RN
- React Native
---

> [!abstract] 一句话
> React Native 是 Meta 开源的**跨平台移动应用框架**，用 React 和 JavaScript/TypeScript 编写代码，渲染的是**原生组件**而非 WebView。

---

## 一、核心理念

### Learn Once, Write Anywhere

不是"Write Once, Run Anywhere"——React Native 不追求一套代码完全通用，而是让你**学会一套技术栈**后，能分别为 iOS 和 Android 编写接近原生体验的应用。实际上大部分代码（80%~95%）确实可以跨平台复用。

### 原生渲染，不是 WebView

和 Cordova/Ionic 等 Hybrid 方案不同，React Native 的组件最终映射为**平台原生 UI 组件**：

| React Native 组件 | iOS | Android |
|-------------------|-----|---------|
| `<View>` | `UIView` | `android.view.View` |
| `<Text>` | `UILabel` | `TextView` |
| `<Image>` | `UIImageView` | `ImageView` |
| `<ScrollView>` | `UIScrollView` | `ScrollView` |
| `<TextInput>` | `UITextField` | `EditText` |

所以 React Native 应用的外观和手感跟原生应用一致，不是套了个浏览器壳。

### React 的开发体验

如果你会 [[React 概述|React]]，上手 React Native 非常快——组件、JSX、Hooks、状态管理全都一样，只是把 `<div>` 换成 `<View>`，`<span>` 换成 `<Text>`。

---

## 二、架构演进

### 旧架构（Bridge）

```
JS 线程 ←→ Bridge（JSON 序列化）←→ Native 线程
```

- JS 和 Native 之间通过一个**异步 Bridge** 通信，所有数据都要 JSON 序列化/反序列化
- 瓶颈：大量数据传输时 Bridge 成为性能瓶颈，动画和手势容易卡顿

### 新架构（2024 年起默认启用）

| 模块 | 作用 | 替代 |
|------|------|------|
| **JSI**（JavaScript Interface） | JS 直接调用 C++ 对象，不再需要 JSON 序列化 | 替代 Bridge |
| **Fabric** | 新的渲染引擎，支持同步渲染 | 替代旧渲染器 |
| **Turbo Modules** | 原生模块按需懒加载，启动更快 | 替代旧 Native Modules |
| **Codegen** | 编译时生成类型安全的 JS↔Native 接口 | 新增 |

> [!important] 新架构的核心变化
> JS 和 Native 之间从**异步消息传递**变成了**同步直接调用**，性能提升显著，尤其是动画和手势交互场景。

---

## 三、开发体验

### 快速开始

目前官方推荐使用 **Expo** 框架来创建项目：

```bash
npx create-expo-app MyApp
cd MyApp
npx expo start
```

Expo 提供了大量开箱即用的 API（相机、推送通知、文件系统等），大部分场景不需要自己写原生代码。

### Expo vs 纯 React Native

| | Expo | 纯 React Native（Bare） |
|---|------|------------------------|
| 上手难度 | 极低，开箱即用 | 需要配置 Xcode/Android Studio |
| 原生模块 | 通过 Expo Modules 或 Config Plugins 接入 | 完全自由，直接写 Objective-C/Swift/Kotlin |
| OTA 更新 | 内置 EAS Update，热更新无需发版 | 需要自己搭建热更新方案（Microsoft CodePush 已于 2025 年停止服务） |
| 构建 | 云端构建（EAS Build），无需本地环境 | 本地构建，需要 Mac（iOS） |
| 适合 | 大多数应用 | 深度定制原生功能的场景 |

> [!tip]
> 2024 年起 Expo 已经是 React Native 官方推荐的开发方式。除非有非常特殊的原生需求，否则优先选 Expo。

### 热重载（Hot Reload）

修改代码后**即时刷新**，不丢失组件状态，开发效率接近 Web 开发。这是相比原生开发的巨大优势——原生开发每次改动都要重新编译。

---

## 四、代码示例

```jsx
import { useState } from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <View style={styles.container}>
      <Text style={styles.text}>点了 {count} 次</Text>
      <Button title="点击" onPress={() => setCount(count + 1)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, marginBottom: 16 },
})
```

> [!info] 和 React 的区别
> - 没有 CSS 文件，用 `StyleSheet.create()` 写样式（类似 inline style，但有优化）
> - 布局默认是 **Flexbox**，而且默认 `flexDirection: 'column'`（Web 默认是 row）
> - 没有 `<div>`、`<p>`、`<span>`，对应的是 `<View>`、`<Text>`

---

## 五、样式与布局

### 样式系统

- 没有 CSS，用 JavaScript 对象写样式
- 属性名用驼峰命名：`backgroundColor` 而不是 `background-color`
- 单位默认是**密度无关像素（dp）**，不用写 `px`
- 不支持 CSS 继承（`<Text>` 内嵌套的 `<Text>` 除外）

### Flexbox 布局

React Native 的布局几乎全靠 Flexbox，但有几个和 Web 不同的默认值：

| 属性 | Web 默认值 | React Native 默认值 |
|------|-----------|---------------------|
| `flexDirection` | `row` | `column` |
| `alignContent` | `stretch` | `flex-start` |
| `flexShrink` | `1` | `0` |

---

## 六、生态系统

| 领域 | 主流方案 |
|------|----------|
| 开发框架 | Expo |
| 导航/路由 | React Navigation、Expo Router |
| 状态管理 | Zustand、Redux Toolkit、Jotai |
| 数据请求 | TanStack Query |
| UI 组件库 | React Native Paper、gluestack-ui、Tamagui |
| 动画 | React Native Reanimated |
| 手势 | React Native Gesture Handler |
| 存储 | AsyncStorage、MMKV、SQLite |
| 推送通知 | Expo Notifications、Firebase Cloud Messaging |
| OTA 热更新 | EAS Update |

---

## 七、跨平台方案对比

|        | React Native            | Flutter               | 原生开发         |
| ------ | ----------------------- | --------------------- | ------------ |
| 语言     | JavaScript / TypeScript | Dart                  | Swift/Kotlin |
| 渲染方式   | 映射为原生组件                 | 自绘引擎（Skia）            | 原生组件         |
| 外观     | 跟随系统原生风格                | 自绘，iOS/Android 上看起来一样 | 完全原生         |
| 性能     | 接近原生（新架构后更好）            | 接近原生                  | 最佳           |
| 热重载    | 支持                      | 支持                    | 不支持          |
| Web 复用 | React 知识完全复用            | 需要学 Dart              | 无法复用         |
| 生态     | npm 生态 + 原生模块           | pub.dev 生态            | 各平台独立生态      |
| 适合     | Web 团队做移动端、快速迭代         | 追求跨平台 UI 一致性          | 极致性能和深度系统集成  |

> [!quote]
> React Native 最大的优势不是性能，而是**让 Web 开发团队以最低成本进入移动端开发**。如果团队已经在用 React，那 React Native 几乎是自然的选择。

---

## 八、适用场景

| 适合 | 不太适合 |
|------|----------|
| 团队已经熟悉 React | 重度 3D/游戏（用 Unity/Unreal） |
| 快速迭代、频繁发版（OTA 热更新） | 需要极致动画性能（考虑 Flutter 或原生） |
| 两个平台共用一套业务逻辑 | 深度依赖平台特有 API 且无社区桥接 |
| 内容型/工具型/社交型应用 | 超大型应用要求每个像素可控 |

> [!example] 知名应用
> Meta（Facebook、Instagram、Threads）、Shopify、Discord、Microsoft（Outlook、Teams）、Bloomberg、Coinbase 等都在使用 React Native。

---

## 相关笔记

- [[React 概述]]
- [[Vue 概述]]
- [[Flutter 概述]]
