# NeoXMind

NeoXMind 是一个个人 Obsidian 数字资源发布平台。

它以 `MyMind` 作为 Obsidian vault，把日常积累的文章、笔记、图片、PDF 和其他附件保存在同一套目录中，再通过 Jekyll 与 GitHub Pages 发布为可搜索、可浏览的个人数字花园。

## 功能特点

- 在 Obsidian 中直接管理文章和资源；
- 保留目录分类、双链、图片嵌入、Callout 等 Obsidian 写作体验；
- 自动生成首页、分类、标签、归档、搜索和知识图谱；
- Markdown 文件不需要 Jekyll 默认的日期文件名前缀；
- 图片、PDF 等资源与笔记放在同一个 vault 中；
- 支持设置仅保留在本地、不渲染也不提交 Git 的私有目录；
- 推送到 GitHub 后由 GitHub Actions 自动构建和发布。

## 内容目录

```text
MyMind/
├── index.md              # 唯一的首页内容源
├── AI/                   # 分类目录
├── IT/
├── 生活/
├── _resources/          # 全局图片和附件
├── .gitignore           # 私有目录规则
└── ...
```

文章文件名只保留文章自身标题，分类信息由所在目录表达。例如：

```text
MyMind/生活/健康/睡了等于没睡-这样睡觉-危害堪比熬夜-内附改善大法.md
```

## 本地使用

本地预览需要 Ruby 和 Bundler。部署工作流使用 Ruby 3.2。

```sh
bundle config set path vendor/bundle
bundle install
bundle exec jekyll serve
```

访问终端输出的本地地址即可预览。只使用 GitHub Pages 发布时，可以不安装本地 Ruby 环境。

知识图谱使用 [PixiJS](https://pixijs.com/) 渲染、[d3-force](https://d3js.org/d3-force) 计算力导向布局，浏览器 bundle 已提交到仓库。修改 `_javascript/knowledge-graph.js` 后需要用 Node.js 重新构建：

```sh
npm install
npm run build:graph
```

## 写文章

直接用 Obsidian 打开 `MyMind` 目录作为 vault，或者使用内置命令创建文章：

```sh
bin/obsidian-jekyll new-post my-first-post \
  --title "我的第一篇文章" \
  --category "思维"
```

命令会创建：

```text
MyMind/思维/my-first-post.md
MyMind/思维/my-first-post/
```

文章 front matter 示例：

```yaml
---
layout: post
title: 我的第一篇文章
date: 2026-07-11 09:00:00 +0800
slug: my-first-post
category: 思维
categories:
  - 思维
tags:
  - Obsidian
---
```

最终网址由 `_config.yml` 中的 `/:year/:month/:day/:slug/` 规则生成。移动或重命名 Markdown 文件时，只要保留原有 `slug`，网页地址就不会变化。

## 首页

[MyMind/index.md](MyMind/index.md) 是唯一的首页内容源，会直接渲染到网站根路径 `/`。

修改首页时只需编辑这个文件，不需要维护另一份根目录 `index.html`。

## 图片与附件

全局资源可以放在：

```text
MyMind/_resources/
```

也可以放在文章或分类旁边：

```text
MyMind/生活/外语/日语五十音.pdf
MyMind/思维/my-first-post/cover.svg
```

推荐使用 Obsidian 原生嵌入：

```markdown
![[_resources/example/image.png]]
![[日语五十音.pdf]]
```

也支持普通 Markdown 图片：

```markdown
![封面](my-first-post/cover.svg)
```

构建时，这些资源会自动发布到网页可访问的路径，同时保持在 Obsidian 中可直接预览。

## 私有目录

在 [MyMind/.gitignore](MyMind/.gitignore) 中添加目录规则，即可让目录同时满足：

- 不被 Git 提交；
- 不被 Jekyll 渲染；
- 不进入归档、搜索、订阅和知识图谱；
- 目录中的附件不发布到网站。

例如：

```gitignore
/Neo
/private/
/AI/drafts/
```

规则必须以 `/` 开头，末尾的 `/` 可以省略。

如果目录以前已经提交过，需要执行一次：

```sh
git rm -r --cached MyMind/目录路径
```

该命令只会从 Git 索引中移除文件，不会删除本地内容。

## 迁移已有 Obsidian Vault

项目提供可重复执行的迁移脚本：

```sh
python3 scripts/migrate_obsidian.py /path/to/your/vault --clean
bundle exec jekyll build
```

迁移脚本会：

- 跳过 Obsidian 配置、Agent 和 Skill 等本地目录；
- 保留原有目录层级；
- 将 Markdown 文章整理到 `MyMind`；
- 将图片、PDF 等资源复制到 `MyMind` 中的对应位置；
- 直接以文件名生成简洁的网页 slug（不包含目录前缀或哈希后缀）；
- 检测规范化后的同名文章，避免生成冲突网址；
- 保留 `MyMind/.gitignore` 中的私有目录配置。

迁移不会修改源 vault。

## Obsidian 兼容语法

项目支持常用 Obsidian 语法：

```markdown
[[相关笔记]]
[[相关笔记|显示文字]]
![[图片.png]]
![[文档.pdf]]

> [!note] 提示
> 这是一段 Callout。
```

另外支持可运行 HTML 代码块：

````markdown
```html runcode
<!doctype html>
<html>
<body>
  <h1>Hello NeoXMind</h1>
</body>
</html>
```
````

## 发布

推送到 GitHub 后，将仓库的 Pages 发布源设置为 GitHub Actions。工作流会自动完成 Jekyll 构建并部署网站。

发布前可以在本地检查：

```sh
bundle exec jekyll build
```

## 主要目录

```text
.
├── MyMind/                 # Obsidian vault、文章与资源
├── _plugins/               # Obsidian 与 Jekyll 兼容插件
├── _layouts/               # 页面布局
├── _includes/              # 页面公共组件
├── assets/                 # 站点 CSS 和 JavaScript
├── archive/                # 归档入口
├── scripts/                # Vault 迁移脚本
└── .github/workflows/      # GitHub Pages 发布流程
```

## 配置

主要站点配置位于 [_config.yml](_config.yml)：

- `title`、`description`、`author`；
- `url`、`baseurl`；
- 分类和分组；
- MathJax、主题与页面行为。

网站内容以 `MyMind` 中的 Obsidian 数据为准，Jekyll 只负责将这套个人知识与数字资源发布到 Web。
