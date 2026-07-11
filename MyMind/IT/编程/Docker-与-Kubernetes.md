---
layout: post
title: Docker 与 Kubernetes
date: 2026-02-17 12:00:00 +0800
slug: Docker-与-Kubernetes
category: IT
categories:
- IT
tags:
- Docker
- Kubernetes
- 容器
- 运维
- 编程
source_path: IT/编程/Docker 与 Kubernetes.md
aliases:
- K8S
- 容器化
---

---

## 一、从虚拟机到容器

在 Docker 之前，虚拟化技术的代表是**虚拟机**（VMWare、OpenStack）。Docker 这样的容器技术也是虚拟化技术，但属于**轻量级虚拟化**。

| | 虚拟机 | 容器（Docker） |
|---|--------|---------------|
| 虚拟化层级 | 虚拟整个操作系统 | 共享宿主机内核，只隔离应用环境 |
| 启动速度 | 分钟级 | **秒级** |
| 体积 | GB 级（完整 OS） | **MB 级**（只有应用和依赖） |
| 性能损耗 | 较大（多了一层 OS） | **几乎没有** |
| 隔离性 | 强（完全独立的 OS） | 较弱（共享内核） |
| 代表 | VMWare、VirtualBox、OpenStack | Docker、containerd、Podman |

> [!example] 类比
> - **虚拟机**像独栋别墅——每家有自己的地基、水电管网、围墙，安全但占地大
> - **容器**像公寓套间——共享地基和水电管网，每家只有自己的房间和家具，轻便高效

---

## 二、Docker

> [!abstract]
> **"Build, Ship and Run"** — 搭建、发送、运行
> **"Build once, Run anywhere"** — 搭建一次，到处能用

Docker **本身不是容器**，它是创建容器的工具，是**应用容器引擎**。

### 三大核心概念

| 概念 | 说明 | 类比 |
|------|------|------|
| **镜像（Image）** | 只读的应用模板，包含代码、运行时、依赖、配置 | 安装光盘 |
| **容器（Container）** | 镜像的运行实例，可启动、停止、删除 | 用光盘装好的电脑 |
| **仓库（Repository）** | 存放和分发镜像的地方 | 应用商店（Docker Hub） |

### 基本工作流

```
编写 Dockerfile → 构建镜像（build）→ 推送到仓库（push）→ 拉取镜像（pull）→ 运行容器（run）
```

### 常用命令速查

```bash
docker build -t myapp .           # 根据 Dockerfile 构建镜像
docker images                     # 列出本地镜像
docker run -d -p 8080:80 myapp    # 后台运行容器，映射端口
docker ps                         # 列出运行中的容器
docker stop <container_id>        # 停止容器
docker rm <container_id>          # 删除容器
docker logs <container_id>        # 查看容器日志
docker exec -it <id> /bin/bash    # 进入容器内部
docker push myapp                 # 推送镜像到仓库
docker pull myapp                 # 拉取镜像
```

### Dockerfile 示例

```dockerfile
FROM node:18-alpine          # 基础镜像
WORKDIR /app                 # 工作目录
COPY package*.json ./        # 复制依赖描述
RUN npm install              # 安装依赖
COPY . .                     # 复制源码
EXPOSE 3000                  # 声明端口
CMD ["node", "index.js"]     # 启动命令
```

---

## 三、Kubernetes（K8S）

> [!abstract]
> K8S 是基于容器的**集群管理平台**，用于对 Docker 及容器进行更高级、更灵活的管理。全称 kubernetes（k 和 s 之间有 8 个字母，所以简称 K8S）。

### 为什么需要 K8S？

Docker 解决了**单个容器**的问题，但生产环境中有成百上千个容器需要管理：

| 问题 | Docker 能力 | K8S 能力 |
|------|-------------|----------|
| 一个容器挂了怎么办？ | 手动重启 | **自动重启、自动迁移** |
| 流量变大需要扩容？ | 手动启动更多容器 | **自动扩缩容** |
| 多个容器怎么通信？ | 手动配置网络 | **内置服务发现和负载均衡** |
| 滚动升级不停服？ | 自己写脚本 | **内置滚动更新和回滚** |
| 几百台机器怎么调度？ | 无能为力 | **自动调度到合适的节点** |

### 集群架构

一个 K8S 系统称为一个**集群（Cluster）**，由两部分组成：

```
                    K8S 集群
        ┌──────────────┬──────────────┐
    Master 节点         Node 节点      Node 节点
    （控制平面）         （计算节点）    （计算节点）
```

### Master 节点组件
[[_resources/Docker 与 Kubernetes/Pasted image 20260218214114.jpg|Open: Pasted image 20260218214114.png]]
![[_resources/Docker 与 Kubernetes/Pasted image 20260218214114.jpg]]

| 组件 | 职责 | 类比 |
|------|------|------|
| **API Server** | 整个系统的对外接口，供客户端和其它组件调用 | 营业厅 |
| **Scheduler** | 对集群内部的资源进行调度，决定 Pod 运行在哪个 Node | 调度室 |
| **Controller Manager** | 管理各种控制器（副本、节点、端点等） | 大总管 |
| **etcd** | 分布式键值存储，保存集群所有配置和状态数据 | 档案室 |

### Node 节点组件
[[_resources/Docker 与 Kubernetes/Pasted image 20260218214136.jpg|Open: Pasted image 20260218214136.png]]
![[_resources/Docker 与 Kubernetes/Pasted image 20260218214136.jpg]]

| 组件                    | 职责                               |
| --------------------- | -------------------------------- |
| **容器运行时（containerd）** | 创建和运行容器（K8S 1.24 起默认 containerd） |
| **Kubelet**           | 监视指派到本 Node 的 Pod，负责创建、修改、监控、删除  |
| **Kube-proxy**        | 为 Pod 提供网络代理和负载均衡   

> [!info] 日志收集
> 早期文档常把 Fluentd 列为 Node 核心组件，但它实际上是**可选的附加组件（add-on）**，通常以 DaemonSet 形式部署。K8S 本身不内置日志收集方案，常见选择包括 Fluentd、Fluent Bit、Promtail 等。

### 核心概念

| 概念 | 说明 |
|------|------|
| **Pod** | K8S 最小调度单位，一个 Pod 包含一个或多个紧密关联的容器 |
| **Deployment** | 管理 Pod 的副本数量、滚动更新和回滚 |
| **Service** | 为一组 Pod 提供稳定的访问地址和负载均衡 |
| **Namespace** | 集群内的逻辑隔离（如 dev、staging、production） |
| **ConfigMap / Secret** | 配置管理（明文 / 加密） |
| **Ingress** | HTTP/HTTPS 路由入口，类似反向代理 |

> [!tip] Pod 和容器的关系
> Pod 是"豌豆荚"，容器是"豌豆"。一个豌豆荚里的豌豆共享网络和存储，一起被调度到同一台机器上。大多数情况下一个 Pod 只跑一个容器。

---

## 四、Docker vs K8S 的关系

```
Docker：造集装箱、装货、封箱
K8S：  管理码头上成千上万个集装箱——该放哪、坏了换哪个、怎么调度
```

| | Docker | K8S |
|---|--------|-----|
| 解决什么 | 单个应用的打包和运行 | 大规模容器的编排和管理 |
| 粒度 | 单个容器 | 集群（成百上千个容器） |
| 关系 | K8S **管理** Docker 创建的容器 | Docker 是 K8S 支持的容器运行时之一 |

> [!info] 补充
> K8S 从 1.24 版本起不再直接支持 Docker，转而使用 **containerd** 作为默认容器运行时。但 Docker 构建的镜像完全兼容，开发流程不受影响。

---

## 相关笔记

- [[分布式系统与中间件]]
- [[命令行与工具速查]]
- [[私有云与公共云]]
