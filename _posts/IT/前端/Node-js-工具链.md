---
layout: post
title: Node.js 工具链
date: 2026-03-12 12:00:00 +0800
slug: IT-前端-Node-js-工具链-d9365e9
category: IT
categories:
- IT
tags:
- Node.js
- JavaScript
- 工具链
- 开发
- 前端
source_path: IT/前端/Node.js 工具链.md
---

> [!info] 导航
> - [[OpenClaw 安装与使用]]
> - [[OpenClaw Skills 在册清单]]
> - [[大模型网关]]

这篇笔记用于快速记录 Node.js 生态里最常见的工具和命令，偏速查用途。

## 一、Node.js 体系

### Node.js

Node.js 是 JavaScript 的运行时，用来在浏览器之外运行 JS 程序。

常见用途：
- 跑本地脚本
- 启动开发服务器
- 运行前端构建工具
- 安装和运行基于 npm 的 CLI 工具

### npm

npm 是 Node.js 默认自带的包管理器。

常见用途：
- 安装依赖
- 安装全局命令行工具
- 运行 `package.json` 里的 scripts

### npx

`npx` 用来直接运行 npm 包里的可执行命令，适合临时执行。

### pnpm

`pnpm` 是更高效的包管理器，安装速度和磁盘利用率通常比 npm 更好。

### yarn

`yarn` 也是常见包管理器之一，现在不少项目仍在使用。

## 二、Bun

### Bun 是什么

`bun` 是一个更现代的一体化 JavaScript / TypeScript 工具。

它**主要对标 Node.js**，但同时又**内置了 npm 这一类包管理能力**，所以很多原本需要“Node.js + npm + 其他工具”组合完成的事情，可以直接由 bun 一套完成。

可以粗略理解成：

- **Node.js**：偏运行时
- **npm**：偏包管理器
- **bun**：把运行时、包管理、测试、打包等能力合在一起

### Bun 内置的能力

- 运行时
- 包管理器
- 脚本执行
- 测试工具
- 打包工具

### 什么时候会用 Bun

常见场景：
- 想要更快的安装和执行速度
- 想减少工具数量
- 新项目直接用更现代的一套工具链
- TypeScript / 前端项目希望更省事

## 三、常见命令速查

### 查看版本

```bash
node -v
npm -v
npx -v
pnpm -v
yarn -v
bun -v
```

### 初始化项目

使用 npm：

```bash
npm init
npm init -y
```

使用 bun：

```bash
bun init
```

### 安装依赖

使用 npm：

```bash
npm install <package>
npm install -D <package>
npm install -g <package>
```

使用 bun：

```bash
bun add <package>
bun add -d <package>
```

### 删除依赖

使用 npm：

```bash
npm uninstall <package>
```

使用 bun：

```bash
bun remove <package>
```

### 运行脚本

使用 npm：

```bash
npm run dev
npm run build
npm run test
```

使用 bun：

```bash
bun run dev
bun run build
bun run test
```

### 临时执行命令

使用 npx：

```bash
npx <command>
```

例如：

```bash
npx create-next-app@latest
npx tsc --init
```

bun 体系里常见的是：

```bash
bunx <command>
```

## 四、常见文件

### package.json

项目的核心配置文件，通常包含：
- 项目名称和版本
- scripts
- dependencies
- devDependencies

### package-lock.json

npm 自动生成的锁文件，用于固定依赖版本。

### bun.lock / bun.lockb

bun 的锁文件，用于固定依赖版本。

### node_modules

依赖安装目录。

通常：
- 不手动修改
- 不提交大多数临时生成内容
- 出问题时可删掉后重装

## 五、常见包管理器对比

### npm

优点：
- Node.js 默认自带
- 通用性最强
- 几乎所有项目都支持

### pnpm

优点：
- 更省磁盘
- 安装通常更快
- 依赖管理更严格

### yarn

优点：
- 一些老项目和前端工程仍在大量使用
- 历史生态较成熟

### bun

优点：
- 主要对标 Node.js，但同时内置包管理能力
- 启动和执行速度通常很快
- 同时覆盖运行、安装依赖、测试等多种用途
- 对 TypeScript 和现代前端开发体验较友好

## 六、版本管理

如果机器上要维护多个 Node.js 版本，通常会用版本管理工具。

常见方案：
- **nvm**
- **fnm**
- **mise**

常见场景：
- 老项目要求 Node 18
- 新项目要求 Node 22+
- 不同项目的运行环境不同

## 七、常见排查动作

### 1. 先看版本

```bash
node -v
npm -v
bun -v
```

### 2. 删除依赖重装

npm 项目：

```bash
rm -rf node_modules package-lock.json
npm install
```

bun 项目：

```bash
rm -rf node_modules bun.lockb bun.lock
bun install
```

### 3. 检查脚本是否存在

```bash
cat package.json
```

重点看：
- `scripts`
- `dependencies`
- `devDependencies`

### 4. 看报错是不是版本不兼容

典型问题：
- Node 版本过低
- 包要求更新版本的 Node
- ESM / CommonJS 不兼容
- 工具链混用导致锁文件或依赖异常

## 八、常见场景

### 安装一个 CLI 工具

```bash
npm install -g <tool>
```

### 在项目里安装依赖

```bash
npm install
```

或：

```bash
bun install
```

### 运行开发环境

```bash
npm run dev
```

或：

```bash
bun run dev
```

### 打包构建

```bash
npm run build
```

或：

```bash
bun run build
```

## 九、简版记忆

可以先粗略记成这样：

- **node**：运行 JavaScript
- **npm**：安装包、管理依赖
- **npx**：临时执行包里的命令
- **pnpm / yarn**：npm 的替代包管理器
- **bun**：主要对标 Node.js，但同时内置包管理、测试、打包等能力
- **package.json**：项目配置核心文件
- **node_modules**：依赖目录

## 相关链接

- [[OpenClaw 安装与使用]]
- [[大模型网关]]
- [[OpenClaw Skills 在册清单]]
