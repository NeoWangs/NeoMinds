# new-post CLI Design

Date: 2026-07-09
Status: approved

## Goal

A repo-local command that scaffolds a new post, so authors do not handwrite
front matter. First subcommand of a future `obsidian-jekyll` CLI; `init`,
`check`, and a publish command are explicitly out of scope for now.

## Command

```sh
bin/obsidian-jekyll new-post <slug> [--title "标题"] [--category notes]
```

- Single-file Ruby script at `bin/obsidian-jekyll` (executable, `#!/usr/bin/env ruby`),
  no gem dependencies beyond the Ruby standard library.
- Subcommand dispatch so later commands can be added to the same script.
- Running it with no/unknown subcommand prints usage and exits non-zero.

## Behavior

1. Validate `<slug>`: must match `\A[a-z0-9]+(-[a-z0-9]+)*\z`. Reject otherwise
   with a clear error (exit 1).
2. Refuse to overwrite: if `MyMind/<slug>.md` exists, error and exit 1.
3. Create `MyMind/<slug>.md` with front matter:
   - `title`: `--title` value, defaulting to the slug;
   - `date`: current local time formatted `YYYY-MM-DD HH:MM:SS +ZZZZ`;
   - `category` and `categories` (single-item list): `--category` value,
     defaulting to `notes`;
   - `tags`: empty list.
   - No `layout` (config default) and no `slug`/`permalink` (derived from
     filename and the global permalink pattern).
   - Front matter is emitted via Ruby's YAML library so titles containing
     quotes/colons are escaped correctly.
4. Create the asset directory `MyMind/<slug>/` (empty; used for post images).
5. Print the created file path and asset directory.

## Error handling

- Unknown options or missing slug → usage message, exit 1.
- The script resolves paths relative to the repository root (its own location,
  `bin/..`), so it works when invoked from any cwd inside the repo.

## Testing

- Manual verification: create a post, confirm `jekyll build` renders it at
  `/:year/:month/:day/:slug/`; confirm duplicate slug and invalid slug are
  rejected; confirm a quoted/colon title round-trips through the front matter.

## Docs

- README and docs/zh-CN.md gain a short "Creating a post" snippet showing the
  command.
