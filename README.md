# Obsidian Jekyll Starter

An Obsidian-first Jekyll starter for people who want one Markdown source of truth:

- write posts in Obsidian;
- keep source files in Git;
- build and deploy with GitHub Actions;
- use plain Markdown-friendly patterns for images, callouts, and runnable code.

Chinese guide: [docs/zh-CN.md](docs/zh-CN.md)

## Quick Start

Prerequisites: Ruby with Bundler (`ruby -v`, `bundle -v`). The deploy workflow builds with Ruby 3.2, so a local Ruby 3.x via [rbenv](https://github.com/rbenv/rbenv) or Homebrew is recommended; the preinstalled macOS system Ruby also works. On Ubuntu/Debian: `sudo apt install ruby-full build-essential`, then `gem install bundler`.

Ruby is only needed for local preview. If you don't plan to preview locally, skip steps 2-3 — GitHub Actions builds and deploys the site on every push.

1. Copy this directory into a new repository.
2. Install dependencies:

   ```sh
   bundle config set path vendor/bundle
   bundle install
   ```

3. Preview locally:

   ```sh
   bundle exec jekyll serve
   ```

4. Push to GitHub and set Pages to deploy from GitHub Actions.

## Writing Posts

Write posts in Obsidian — open `_posts` as a vault — or scaffold a post template with the bundled CLI:

```sh
bin/obsidian-jekyll new-post my-first-post --title "My First Post"
```

This creates `_posts/my-first-post.md` with ready-to-edit front matter plus the asset directory `_posts/my-first-post/`. Use `--category` to pick a category (defaults to `notes`).

Posts live in `_posts`, but filenames do not need the usual Jekyll date prefix. Put the publish date in front matter instead:

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

There is no need to write a `permalink`. The final URL is assembled from the global pattern in `_config.yml` (`/:year/:month/:day/:slug/`) using the post's `date` and `slug`. The `slug` itself is also optional — it defaults to the filename.

The `slug` should match the optional asset folder beside the post:

```text
_posts/hello-world.md
_posts/hello-world/cover.svg
```

Then reference assets with a local path that Obsidian can preview:

```markdown
![Cover](hello-world/cover.svg)
```

During the Jekyll build, the asset is published under the final post URL.

## Obsidian-Friendly Blocks

Runnable code uses a normal fenced code block:

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

Cards use Obsidian callouts:

```markdown
> [!card] A Short Note
> This reads naturally in Obsidian and becomes a styled card on the site.
```

`[!pin]` and `[!poem]` are aliases for `[!card]`.

## Repository Shape

```text
.
├── _posts/                 # Open this folder as the Obsidian vault
├── _plugins/               # Jekyll compatibility helpers
├── _layouts/               # Minimal blog layouts
├── _includes/              # Shared HTML
├── assets/                 # CSS and JavaScript
├── archive/                # Archive page
└── .github/workflows/      # GitHub Pages deployment
```

## Customization

Edit `_config.yml` first:

- `title`, `description`, `author`, `url`, `baseurl`;
- `obsidian_jekyll.categories`;
- `obsidian_jekyll.mathjax`;
- `obsidian_jekyll.default_theme`.

The starter intentionally keeps the theme small. Replace the layouts and CSS freely while keeping the `_plugins` folder if you want to preserve the Obsidian-friendly writing workflow.
