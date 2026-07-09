# Obsidian Jekyll Starter 中文说明

这是一个 Obsidian-first 的 Jekyll 博客模板，目标是让写作源文件保持 Markdown 友好，同时用 GitHub Actions 自动发布到 GitHub Pages。

## 快速开始

1. 复制本仓库作为新博客仓库。
2. 在 Obsidian 中打开 `_posts` 目录作为 vault。
3. 安装依赖：

   ```sh
   bundle config set path vendor/bundle
   bundle install
   ```

4. 本地预览：

   ```sh
   bundle exec jekyll serve
   ```

5. 推送到 GitHub 后，把 Pages 发布源设置为 GitHub Actions。

## 写文章

文章放在 `_posts` 里，文件名不需要 Jekyll 默认的日期前缀。发布日期写在 front matter 中：

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
permalink: "/2026/07/09/hello-world/"
---
```

如果文章有图片，建议放在文章同名目录下：

```text
_posts/hello-world.md
_posts/hello-world/cover.svg
```

正文里使用相对路径：

```markdown
![Cover](hello-world/cover.svg)
```

这样 Obsidian 可以直接预览图片，Jekyll 构建时会把图片发布到文章最终 URL 下。

## Obsidian 友好的增强语法

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

- `_posts` 直接作为 Obsidian vault。
- `_posts` 下的文章文件不需要 `YYYY-MM-DD-` 前缀。
- 文章同名素材目录会自动发布到文章 URL 下。
- 带有 `runcode` 标记的代码块会转换成网页运行框。
- `[!card]`、`[!pin]`、`[!poem]` 会转换成网页卡片。
- 标签页和分类页自动生成。
- GitHub Actions 使用 Pages artifact 部署。

