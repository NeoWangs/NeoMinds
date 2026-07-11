# Obsidian Jekyll Starter 中文说明

这是一个 Obsidian-first 的 Jekyll 博客模板，为想要「一份 Markdown 源文件」的写作者准备：

- 在 Obsidian 中写文章；
- 源文件用 Git 管理；
- 用 GitHub Actions 构建并部署；
- 图片、callout、可运行代码都采用纯 Markdown 友好的写法。

## 快速开始

前置条件：本机需要 Ruby 和 Bundler（用 `ruby -v`、`bundle -v` 确认）。部署工作流使用 Ruby 3.2 构建，本地建议通过 [rbenv](https://github.com/rbenv/rbenv) 或 Homebrew 安装 Ruby 3.x；macOS 自带的系统 Ruby 也可以运行。Ubuntu/Debian 可执行 `sudo apt install ruby-full build-essential`，再 `gem install bundler`。

Ruby 环境只用于本地预览。如果不打算在本地预览，可以跳过第 2、3 步——每次 push 后 GitHub Actions 会自动构建并部署站点。

1. 复制本仓库作为新博客仓库。
2. 安装依赖：

   ```sh
   bundle config set path vendor/bundle
   bundle install
   ```

3. 本地预览：

   ```sh
   bundle exec jekyll serve
   ```

4. 推送到 GitHub 后，把 Pages 发布源设置为 GitHub Actions。

## 写文章

可以在 Obsidian 中打开 `MyMind` 目录作为 vault 直接写作，也可以用自带的 CLI 快速创建文章模板：

```sh
bin/obsidian-jekyll new-post my-first-post --title "我的第一篇文章"
```

命令会生成 `MyMind/notes/my-first-post.md`（front matter 已填好）和同名资源目录 `MyMind/notes/my-first-post/`，`--category` 可指定分类文件夹（默认 `notes`）。

文章按分类目录放在 `MyMind` 里，文件名不需要 Jekyll 默认的日期前缀。发布日期写在 front matter 中：

`MyMind/index.md` 是唯一的首页内容源，会直接渲染到 `/`，不再维护另一份根目录 `index.html`。

### 不发布的私有目录

需要让某个目录只保留在本地、既不渲染也不提交到 Git 时，把它相对于 `MyMind` 的完整路径写入 `MyMind/.gitignore`：

```gitignore
/private/
/AI/drafts/
```

规则必须以 `/` 开头，末尾的 `/` 可以省略。Git 会忽略这些目录，站点读取器也会用同一份名单将其排除在归档、搜索、订阅和构建结果之外。如果目录里的文件以前已经提交过，需要执行一次 `git rm -r --cached MyMind/目录路径`，将其从 Git 索引移除但保留本地文件。

```yaml
---
layout: post
title: "Hello World"
date: "2026-07-09 09:00:00 +0800"
slug: "hello-world"
category: "notes"
categories:
  - "notes"
tags:
  - "Obsidian"
  - "Jekyll"
---
```

不需要手写 `permalink`：最终 URL 由 `_config.yml` 里的全局规则（`/:year/:month/:day/:slug/`）根据文章的 `date` 和 `slug` 自动组装。`slug` 也可以省略，默认取文件名。

如果文章有图片，建议放在文章同名目录下：

```text
MyMind/notes/hello-world.md
MyMind/notes/hello-world/cover.svg
```

正文里使用相对路径：

```markdown
![Cover](hello-world/cover.svg)
```

这样 Obsidian 可以直接预览图片，Jekyll 构建时会把图片发布到文章最终 URL 下。

全局资源也可以直接放在 `MyMind/_resources/` 或对应分类目录中。这样 Obsidian 能从 vault 内直接解析，Jekyll 构建时则会将它们发布到兼容旧链接的 `/assets/obsidian/` 地址。

## Obsidian 友好的增强语法

模板预先集成了两个内容插件：`runcode` 把代码块变成可在浏览器中直接运行 HTML 的运行框，`pin`/`card` 把 callout 变成用于展示短句、诗词的样式卡片。两者都用纯 Markdown 语法书写，在 Obsidian 里保持原生可读——转换只发生在构建阶段。

可运行代码使用普通 fenced code block：

````markdown
```html runcode
<!doctype html>
<html>
<body>
  <h1>Hello from a code block</h1>
</body>
</html>
```
````

卡片使用 Obsidian callout：

```markdown
> [!card] 一张卡片
> 在 Obsidian 里保持可读，在网页上转换成卡片样式。
```

`[!pin]` 和 `[!poem]` 也会按卡片处理。

## 这个模板抽象了什么

- `MyMind` 直接作为 Obsidian vault。
- `MyMind` 下的文章文件不需要 `YYYY-MM-DD-` 前缀。
- 文章同名素材目录会自动发布到文章 URL 下。
- 带有 `runcode` 标记的代码块会转换成网页运行框。
- `[!card]`、`[!pin]`、`[!poem]` 会转换成网页卡片。
- 标签页和分类页自动生成。
- GitHub Actions 使用 Pages artifact 部署。
