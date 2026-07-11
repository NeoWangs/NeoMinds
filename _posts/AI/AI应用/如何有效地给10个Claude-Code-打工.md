---
layout: post
title: 如何有效地给10个Claude Code 打工
date: 2026-02-20 12:00:00 +0800
slug: AI-AI应用-如何有效地给10个Claude-Code-打工-2084ba3
category: AI
categories:
- AI
tags:
- Claude
- AI应用
- 效率
- Vibe编程
- 工作流
source_path: AI/AI应用/如何有效地给10个Claude Code 打工.md
source: 知乎
aliases:
- 给Claude Code打工
- Agentic Coding提速
---

> [!abstract] 摘要
> Meshy AI CEO 胡渊鸣（清华姚班 / MIT 博士）分享了他如何把 Vibe coding 效率提高 10 倍的实践：从单线程 Claude Code，到并行运行 10 个实例，唯一的瓶颈变成了自己产出想法的速度。

---

## 背景：为什么要做这件事

他想用 Vibe coding 开发一套只给自己用的「CEO 支持软件」，需求包括：

- **语音输入**：随时随地记录想法（飞机、驾车、走路、睡前）
- **双端支持**：Mac + iPhone
- **双语写作**：中英文对照，可手动编辑翻译
- **自动排版**：中英文/数字间自动加半角空格，引号规范
- **AI 校对**：逻辑清晰、用词准确，不用自己 proofread
- **思维导图**：宏观检查文档结构

一开始低估了难度，问题从「如何 Vibe code 一个文档编辑器」，变成了**「如何把 Vibe coding 的速度提高 10 倍」**。

---

## 10 个提速阶段

### Step 1｜从 Cursor Agent 切换到 Claude Code

Cursor Agent 跑在带 4090 的 Ubuntu 上，3 小时重新设计了一套 GPU DSL（这事以前得花 3 周），但远程访问必须打开 RustDesk，灵感来了没法立刻派活。

切换到 Claude Code + iPhone SSH 访问，**可以 Vibe code 的时间从 8 小时扩展到 24 小时**。

---

### Step 2｜找个 Container，权限全开

切到 Claude Code 后，每十几秒就会问权限，还是不能「AI 干活，我干别的」。

在 EC2（亚马逊的云服务——开发环境放在了云端以便 Agent 能够 24 小时干活） 上开 server，使用 `--dangerously-skip-permissions`，让它收到指令后一直干，不回来问：

```bash
claude --dangerously-skip-permissions "任务描述"

# headless 非交互模式（用于脚本）
claude -p "任务描述" --dangerously-skip-permissions

# 加预算上限防止失控
claude --dangerously-skip-permissions --max-budget-usd 5.00 "任务"
```

官方称为 **Safe YOLO Mode**，适合在隔离环境（EC2 / Docker）中使用。EC2 环境坏了重开一台，不影响本地机器。

一个 prompt 能干 5 分钟左右，大大提高了 Claude Code 利用率。

**更安全的替代**：用 `allowedTools` 精确指定哪些工具免询问：

```json
{
  "allowedTools": ["Bash(git:*)", "Write", "Edit"],
  "blockedCommands": ["rm -rf", "shutdown"]
}
```

> [!warning] 温馨提示
> 如果 App 数据量不大，记得让 Claude Code 写一个每小时自动备份数据库的功能。别问我怎么知道的。

---

### Step 3｜Ralph Loop：让 Claude Code 不停地干活

脑子里的想法经常被 backlog，正在干活的 Claude Code 无法接收新任务。

**Ralph Loop**：Claude Code 从任务列表中每次拿一个活干，直到列表为空。

```
任务列表（你随时往里加）
    ↓
Claude 拿任务 #1 → 干完 → exit
    ↓
自动重启 → 拿任务 #2 → 干完 → exit
    ↓
自动重启 → 列表空了 → 停止
```

**实现**：

`CLAUDE.md` 里写 Claude 的行为规则：

```markdown
## 工作流程
1. 读取 tasks.md，取第一个 `- [ ]` 未完成任务
2. 把该任务标记为进行中：`- [~]`
3. 完成任务
4. 标记为完成：`- [x]`
5. 退出（exit 0）
每次只做一个任务，做完必须 exit，遇到不确定选最合理方案直接做。
```

`tasks.md`（你随时往里加行）：

```markdown
- [ ] 修复登录页面 bug
- [ ] 给 API 加单元测试
- [ ] 重构数据库连接模块
```

`loop.sh` 自动循环启动：

```bash
#!/bin/bash
while true; do
  if ! grep -q "^\- \[ \]" tasks.md; then
    echo "✅ 所有任务完成"; break
  fi
  claude --dangerously-skip-permissions
  sleep 2
done
```

EC2 后台运行（断开 SSH 不停）：

```bash
tmux new -s ralph
./loop.sh
# Ctrl+B, D 离开；tmux attach -t ralph 回来看进度
```

> [!info] 官方原生方案（v2.1.16+）
> Claude Code 新版已内置 **Tasks** 功能，支持任务依赖图（DAG）和多实例协作，数据持久化在 `~/.claude/tasks/`。用 `export CLAUDE_CODE_TASK_LIST_ID="my-project"` 让多个实例共享任务列表。当前限制：headless 模式（`-p`）下暂不可用，修复中。EC2 无人值守场景目前仍推荐 Ralph Loop。

---

### Step 4｜Git Worktree 实现并行化

单线程很快满足不了需求。用 **Git worktree** 搭建容器里的容器，每个 worktree 开一个独立的 Claude Code。

开 5 个 Claude Code，每个 5 分钟提交一个 commit，相当于在 Git 上**实现 1 分钟一个 commit**。

```bash
# 新建 worktree（基于当前 HEAD 创建独立分支）
git worktree add ../feature-branch-1 -b feature/task-1
git worktree add ../feature-branch-2 -b feature/task-2

# 查看所有 worktree
git worktree list

# 完成后移除
git worktree remove ../feature-branch-1
```

---

### Step 5｜CLAUDE.md + PROGRESS.md，让 AI 长记性

`CLAUDE.md` 不适合频繁修改，容易改坏。经验教训让 Claude Code 总结到 `PROGRESS.md`：

> "现在把你的经验教训沉淀到 `PROGRESS.md` 里面，总结提炼升华，同样的错误下次不要再犯。"

**三层分工**：

| 文件 | 由谁写 | 内容 |
|------|--------|------|
| `CLAUDE.md` | 你 | 稳定规则，不频繁改 |
| `PROGRESS.md` | Claude（按指令） | 当前项目进度与经验教训 |
| Auto Memory | Claude（自动） | 跨项目工作经验，持久化在 `~/.claude/projects/<project>/memory/` |

> [!info] 官方 Auto Memory
> v2.1.16+ 内置，Claude 自动把经验教训写入 `~/.claude/projects/<project>/memory/MEMORY.md`（每次 session 自动加载前 200 行）。在 Claude Code 里输入 `/memory` 查看和编辑。经验教训的职责交给 Auto Memory，就不用担心 CLAUDE.md 被改坏了。

---

### Step 6｜Web Manager：干掉 SSH

Claude Code 在 SSH 下会不停刷新 terminal，巨卡；手机屏幕太小，tmux 极难操作。

用 `claude -p [prompt] --dangerously-skip-permissions` 把 Claude Code 做成**非交互式组件**，用 Python subprocess 调度，起一个 Claude Code Web Manager。在 iPhone 上用 Safari 包装成 App。

输出格式用 stream-json，方便 manager 检查每个 CC 实例的日志：

```bash
claude -p [prompt] --dangerously-skip-permissions --output-format stream-json --verbose
```

**最省事：直接用 ClaudeCodeUI（开源，6.2k star）**

```bash
npx @siteboon/claude-code-ui    # EC2 上一行启动
# 手机 Safari 访问 http://EC2:3001，加到主屏幕变 PWA
pm2 start cloudcli --name "claude-code-ui"   # 后台守护
```

**自建：Python subprocess + FastAPI**（需要定制 Ralph Loop 调度逻辑时）

```python
@app.post("/run")
async def run_task(prompt: str, instance_id: str):
    proc = await asyncio.create_subprocess_exec(
        "claude", "-p", prompt,
        "--dangerously-skip-permissions",
        "--output-format", "stream-json", "--verbose",
        stdout=asyncio.subprocess.PIPE,
    )
    instances[instance_id] = proc
    return {"pid": proc.pid}
```

stream-json 事件类型：`assistant`（回复）、`tool_use`（执行命令）、`result`（完成）。

> [!tip] 关键洞察
> 能显著提升 agent 效果的事：给它提供一个**闭环**——能写代码 / 运行 / 检查 / 调试。未来只要能在闭环环境中让 AI 端到端获得反馈的任务，都是简单的任务。

派活成功率从 20% 提升到了 95%（靠 CLAUDE.md、PROGRESS.md 和 Python task dispatcher 的迭代）。

---

### Step 8｜自然语言编程（语音输入）

打字速度是瓶颈：敲键盘慢，很多时候也不方便敲。好的想法转瞬即逝，没有快速记录方式是巨大的浪费。

给所有输入框加上**语音识别 API**，实现走在马路上也可以 Vibe coding。

**方案一：Web Speech API**（零成本，Safari iOS 原生支持）

```javascript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'zh-CN';
recognition.continuous = true;
recognition.interimResults = true;
recognition.onresult = (e) => {
  // 实时把中间结果+最终结果显示到输入框
};
```

**方案二：Whisper API**（准确率高，中英混说不乱，约 $0.006/分钟）

```python
# FastAPI 端点
@app.post("/transcribe")
async def transcribe(audio: UploadFile):
    result = openai.OpenAI().audio.transcriptions.create(
        model="whisper-1",
        file=(audio.filename, await audio.read(), audio.content_type),
        language="zh",
        prompt="Claude Code 任务描述，代码相关",
    )
    return {"text": result.text}
```

> [!tip] iOS 注意
> 两种方案都需要 **HTTPS**（Let's Encrypt 免费）。iOS Safari 录音格式用 `audio/mp4`，不是 `audio/webm`。

| | Web Speech | Whisper |
|-|-----------|---------|
| 成本 | 免费 | ~$0.006/分钟 |
| 延迟 | 实时 | 录完后处理 |
| 中英混说 | 容易乱 | 准确 |
| 嘈杂环境 | 差 | 好 |

> 2026 年，任何一个人类学英语的速度，都赶不上 AI 中英文翻译能力提升的速度。

---

### Step 9｜给任务管理加入 Plan Mode

Claude Code 的 Plan 模式在任务开始时明确意图，Claude 只读不写，完成分析规划后由你审批再执行。

在任务管理器里把 Plan mode 封装一层，便于同时 kick off 大量 Plan 任务再统一 review。

```bash
Shift+Tab        # 循环切换：Normal → Auto-Accept → Plan Mode
/plan            # 会话内直接进入
claude --permission-mode plan -p "分析认证系统安全漏洞"  # headless
```

关键快捷键：`Ctrl+G` 在编辑器里直接修改计划，`Ctrl+T` 查看任务列表。

**Plan + Tasks 最强组合**：Plan Mode 里规划 → 自动创建任务列表 → 批准后切回 Normal → Claude 按任务逐一执行，context 压缩后任务不丢失。

---

### Step 10｜坚持不去看除了 CLAUDE.md 以外的代码

杜绝对 AI 的 micromanagement。把时间放在：

- 更好地提问，更清楚地描述需求——**Context, not control**
- 从第一性原理出发，目标是什么？Speed of light 在哪里？
- 如何给 AI 铺路才能让 AI 效率更高？
- 如何在 AI 写的 repo 里实现科学的版本控制与测试驱动开发？
- 如何不断提高自己的杠杆，放大 AI 的有效产出？

---

## 标准化软件的终结

> [!important] 核心判断
> Agentic Coding 使软件开发成本无限趋近于零，让标准化软件逐渐失去意义。

以前标准化软件的逻辑：大量有共性需求的用户均摊开发成本 → 生意成立。

现在的逻辑：有一定开发能力的人，都会认为只有定制化软件才能最好地解决自己的需求。有什么需求，Vibe code 一下，几分钟就能用。

- 产品经理的工作会被重新定义——「和 100 个客户聊天提炼共性需求」不再需要了
- 软件工程师的工作会被重新定义——从手敲代码，变成**给 AI 铺路和兜底**，设计方便 AI 开发的框架
- 工程师的日常：给 AI 提供好用的框架、环境、Reward，让 AI 在闭环中驰骋

---

## 人类的黄昏

> 我压榨 AI，是因为我希望唯一的产能限制是我的思维；AI 压榨我，是因为 Vibe coding 给我提供了比原来手动写代码更快、更强 10 倍以上的正反馈，成瘾性很强。

- 传统企业管理的垂直 delegation、水平跨团队协作会变成「如何用 AI 解决问题」
- 按人头记的 Headcount 会变成按 T 记的 **token count**
- AI 的优点：**理性、直接**——和 AI 沟通就事论事，不用照顾自尊心，更接近事实与真相
- **管 AI 比管人更能提高领导力**：反馈太快，所有目标定义不清晰的问题 5 分钟内就会暴露

> AI 技术发展的速度，比一个人类专心学习的速度更快——我们要重新审视「学习」的意义。

---

## 相关笔记

- [[品味是 AI 时代的护城河]]
- [[AI 提高效率，但不提高胜率]]
