---
layout: post
title: Flutter 概述
date: 2026-02-17 12:00:00 +0800
slug: IT-前端-Flutter-概述-ae46cc9
category: IT
categories:
- IT
tags:
- 前端
- Flutter
- 移动端
- 跨平台
source_path: IT/前端/Flutter 概述.md
aliases:
- Flutter
- Dart
---

> [!abstract] 一句话
> Flutter 是 Google 开源的**跨平台 UI 框架**，用 Dart 语言编写，核心特点是**自绘引擎（Skia/Impeller）渲染一切**，不依赖平台原生组件，实现像素级跨平台一致性。

---

## 一、核心理念

### 自绘一切

Flutter 不映射原生组件，而是自己带了一个**渲染引擎**，直接在画布上一个像素一个像素地画出所有 UI。这意味着：

- 在 iOS 和 Android 上**看起来完全一样**（除非你主动做平台适配）
- 不受系统 UI 更新的影响
- 理论上可以画出任何你想要的效果

> [!example] 类比
> React Native 像是翻译官——把你说的话翻译给 iOS/Android 各自的原生组件听。Flutter 像是自带画板——不管在哪个平台，都自己画，画出来一模一样。

### Everything is a Widget

Flutter 中一切都是 **Widget**——文字是 Widget、按钮是 Widget、布局是 Widget、动画也是 Widget。整个界面就是一棵 Widget 树。

```
MaterialApp
  └── Scaffold
        ├── AppBar
        │     └── Text("标题")
        └── Center
              └── Column
                    ├── Text("Hello")
                    └── ElevatedButton
```

### 声明式 UI

和 React 一样，Flutter 也是声明式的——描述"UI 应该长什么样"，而不是命令式地"一步步操作 UI"。状态变了，框架自动算出差异并更新。

---

## 二、Dart 语言

Flutter 用的不是 JavaScript，而是 Google 自研的 **Dart** 语言。

### 为什么选 Dart？

| 特性 | 好处 |
|------|------|
| AOT 编译（Ahead of Time） | 发布时编译为原生机器码，运行速度快 |
| JIT 编译（Just in Time） | 开发时支持热重载，改完立刻看效果 |
| 强类型 + 空安全 | 编译期就能发现很多错误 |
| 单线程 + Isolate | 没有锁的烦恼，需要并发时用 Isolate（类似 Web Worker） |
| 语法接近 Java/TypeScript | 前端或移动端开发者上手不难 |

### Dart 长什么样？

```dart
class Counter extends StatefulWidget {
  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('点了 $count 次', style: TextStyle(fontSize: 24)),
        SizedBox(height: 16),
        ElevatedButton(
          onPressed: () => setState(() => count++),
          child: Text('点击'),
        ),
      ],
    );
  }
}
```

> [!info] 观感
> 如果你写过 Java 或 TypeScript，会觉得 Dart 很眼熟。但对纯前端/JS 开发者来说，需要适应类、注解、类型声明这些东西。

---

## 三、架构

### 三层结构

```
┌─────────────────────────────┐
│  Framework（Dart）            │  ← Widget、Material/Cupertino、动画、手势
├─────────────────────────────┤
│  Engine（C++）                │  ← Skia/Impeller 渲染、Dart 运行时、平台通道
├─────────────────────────────┤
│  Embedder（平台相关）           │  ← iOS/Android/Web/Desktop 的嵌入层
└─────────────────────────────┘
```

- **Framework 层**：开发者接触的部分，全部用 Dart 写
- **Engine 层**：核心渲染和运行时，C++ 实现
- **Embedder 层**：把 Engine 嵌入到各平台的壳里

### 渲染引擎

| | Skia | Impeller（Flutter 3.16+ 默认） |
|---|------|-------------------------------|
| 类型 | 2D 图形库（Chrome 也在用） | Flutter 专门定制的渲染引擎 |
| Shader 编译 | 运行时编译，首次可能卡顿（Jank） | 预编译所有 Shader，消除卡顿 |
| 性能 | 好 | 更好，动画更流畅 |

---

## 四、Widget 体系

### StatelessWidget vs StatefulWidget

| | StatelessWidget | StatefulWidget |
|---|-----------------|----------------|
| 有无内部状态 | 没有，纯展示 | 有，通过 `setState()` 更新 |
| 重建频率 | 父组件重建时才重建 | 调用 `setState()` 时重建 |
| 类比 | React 的纯函数组件 | React 的带 `useState` 的组件 |

### 设计风格组件

| 风格 | 组件集 | 对应平台 |
|------|--------|----------|
| Material Design | `MaterialApp`、`Scaffold`、`AppBar`… | Android 风格 |
| Cupertino | `CupertinoApp`、`CupertinoNavigationBar`… | iOS 风格 |

可以混用，也可以根据平台自动切换。

### 常用 Widget 速查

| 类别 | Widget |
|------|--------|
| 布局 | `Row`、`Column`、`Stack`、`Flex`、`Wrap` |
| 容器 | `Container`、`Padding`、`Center`、`SizedBox` |
| 列表 | `ListView`、`GridView`、`ListTile` |
| 输入 | `TextField`、`Checkbox`、`Switch`、`Slider` |
| 导航 | `Navigator`、`BottomNavigationBar`、`TabBar` |
| 动画 | `AnimatedContainer`、`Hero`、`AnimationController` |

---

## 五、生态系统

| 领域 | 主流方案 |
|------|----------|
| 包管理 | pub.dev（Dart 官方包仓库） |
| 状态管理 | Riverpod、Bloc、Provider、GetX |
| 路由 | GoRouter（官方推荐）、auto_route |
| 网络请求 | Dio、http |
| 本地存储 | shared_preferences、Hive、sqflite |
| 国际化 | flutter_localizations + intl |
| 测试 | 内置 Widget 测试、集成测试框架 |
| 桌面端 | 官方支持 Windows、macOS、Linux |
| Web | 官方支持（适合内部工具，SEO 场景不理想） |

---

## 六、发展脉络

| 时间 | 里程碑 |
|------|--------|
| 2017 | Flutter Alpha 发布 |
| 2018 | Flutter 1.0，正式支持 iOS + Android |
| 2021 | Flutter 2.0，正式支持 Web + 桌面 |
| 2023 | Flutter 3.16，Impeller 成为 iOS 默认渲染引擎 |
| 2024 | Impeller 在 Android 上也成为默认引擎 |
| 2025 | Flutter 持续优化 Web 和桌面平台体验 |

---

## 七、Flutter vs React Native 详细对比

### 技术本质

| | Flutter | React Native |
|---|---------|-------------|
| 语言 | Dart | JavaScript / TypeScript |
| 渲染方式 | **自绘引擎**，自己画每个像素 | **映射为原生组件**，翻译给系统渲染 |
| UI 一致性 | 两端**完全一致**（自己画的当然一样） | 跟随平台原生风格，**两端可能有差异** |
| 平台外观融合 | 需要手动适配平台风格（Material vs Cupertino） | 天然融入平台（本来就是原生组件） |

> [!info] 一个关键取舍
> Flutter 保证了"跨平台一致性"，但可能**看起来不太像原生应用**。React Native 天然是原生风格，但两端**可能有细微差异**。哪个更重要取决于你的产品需求。

### 性能

| | Flutter | React Native |
|---|---------|-------------|
| 渲染 | Impeller 直接绘制，无中间层 | 新架构（JSI）直接调用原生，但仍有一层映射 |
| 动画 | 渲染引擎直接处理，天然流畅 | 需要 Reanimated 库在 UI 线程执行才能流畅 |
| 启动速度 | AOT 编译为机器码，启动快 | JS 引擎需要加载和解析，稍慢 |
| 包体积 | 基础包 ~5-8MB（自带渲染引擎） | 基础包 ~2-4MB |
| 内存占用 | 较高（自带引擎） | 较低 |

### 开发体验

| | Flutter | React Native |
|---|---------|-------------|
| 热重载 | 极快，状态保持 | 快，状态保持 |
| 类型安全 | Dart 强类型 + 空安全，编译期报错 | TypeScript 可选，不用也能跑 |
| 调试工具 | DevTools（Widget 树、性能分析、内存） | React DevTools / Expo Dev Tools |
| IDE | Android Studio / VS Code（官方插件优秀） | VS Code（生态更丰富） |
| 学习曲线 | 需要学 Dart + Widget 概念 | 会 React 就会大半，JS/TS 开发者零门槛 |

### 生态与社区

| | Flutter | React Native |
|---|---------|-------------|
| 包生态 | pub.dev，~4 万+ 包 | npm，百万级包（但不全是 RN 的） |
| 原生模块 | 通过 Platform Channel 自己写 | 社区桥接丰富，Expo Modules 覆盖面广 |
| UI 库 | 内置 Material + Cupertino，第三方较少 | 社区 UI 库丰富（Paper、gluestack-ui、Tamagui） |
| Web 知识复用 | 几乎不能复用 Web 前端经验 | React + npm 生态大量复用 |
| 社区规模 | 增长快，Google 背书 | 历史更长，Meta 背书，社区更大 |
| 市场份额 | 在中大厂和新项目中增长快 | 存量项目多，Web 团队转移动端首选 |

### 跨平台覆盖

| 平台 | Flutter | React Native |
|------|---------|-------------|
| iOS | 官方支持 | 官方支持 |
| Android | 官方支持 | 官方支持 |
| Web | 官方支持（适合内部工具，SEO 弱） | 第三方（React Native Web），或直接用 React |
| 桌面（Windows/macOS/Linux） | 官方支持 | 社区方案（react-native-windows 等） |

> [!tip] 跨平台广度
> 如果你需要**一套代码覆盖手机+桌面+Web**，Flutter 官方支持更全面。如果只做手机端且团队有 Web 背景，React Native 更高效。

### 代码风格对比

同一个计数器：

**Flutter（Dart）：**

```dart
class Counter extends StatefulWidget {
  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('点了 $count 次', style: TextStyle(fontSize: 24)),
          SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => setState(() => count++),
            child: Text('点击'),
          ),
        ],
      ),
    );
  }
}
```

**React Native（TypeScript）：**

```tsx
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

> [!info] 直观感受
> Flutter 代码更"深"——Widget 嵌套层级多，括号多。React Native 更"平"——JSX 语法让结构一目了然。Flutter 更像写 Java/Kotlin，React Native 就是写 React。

### 怎么选？

| 场景 | 推荐 | 原因 |
|------|------|------|
| 团队是 Web/React 开发者 | React Native | 知识复用最大化，上手零门槛 |
| 团队是移动端原生开发者 | Flutter | Dart 的 OOP 风格更接近 Swift/Kotlin |
| 要求两端 UI 像素级一致 | Flutter | 自绘引擎天然保证 |
| 要求融入平台原生风格 | React Native | 本来就是原生组件 |
| 需要覆盖桌面端 | Flutter | 官方支持，成熟度更高 |
| 需要频繁热更新发版 | React Native | JS bundle OTA 推送更灵活 |
| 重度动画/自定义绘制 | Flutter | 渲染引擎直接控制每个像素 |
| 项目需要快速找人 | 看市场 | 国内 Flutter 岗位增长快，RN 存量多；海外 RN 更主流 |

> [!quote]
> Flutter 和 React Native 都是成熟的跨平台方案。Flutter 是"自己带画笔"——控制力强、一致性好；React Native 是"借平台的画笔"——融合度高、Web 团队友好。没有绝对的优劣，只有适不适合你的团队和项目。

---

## 相关笔记

- [[React Native 概述]]
- [[React 概述]]
- [[Vue 概述]]
