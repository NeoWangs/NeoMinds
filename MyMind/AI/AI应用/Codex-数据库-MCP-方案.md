---
layout: post
title: Codex 数据库 MCP 方案
date: 2026-02-25 12:00:00 +0800
slug: Codex-数据库-MCP-方案
category: AI
categories:
- AI
tags:
- ai
- mcp
- codex
- database
- postgresql
- mysql
- AI应用
source_path: AI/AI应用/Codex 数据库 MCP 方案.md
type: note
---

## 方案选型

### 1. 只读查询（推荐起步）

**适用场景**：数据分析、排障查数、生成报表 SQL、读 schema——不需要模型改库。

| 方案 | 说明 |
|------|------|
| [`@modelcontextprotocol/postgresql`](https://www.modelscope.cn/mcp/servers/%40modelcontextprotocol/postgresql) | 官方社区实现，主打 schema 检查 + 只读查询 |
| [sqlitecloud-mcp-server](https://github.com/sqlitecloud/sqlitecloud-mcp-server) | 托管 SQLite，含 schema 管理、慢查询/plan 分析 |

> 把 MCP 能力限制在"看得见、查得到"，风险最低；多数团队给 Codex 接库的第一步。

---

### 2. 研发 / DBA 增强型（Postgres）

**适用场景**：不仅查数，还需要索引建议、性能诊断、运维辅助（仍建议默认只读，按需逐步放开）。

| 方案 | 说明 |
|------|------|
| [Postgres MCP Pro](https://github.com/crystaldba/postgres-mcp) | 开源，面向全流程开发/调优/维护 |
| [PG-MCP](https://github.com/stuzero/pg-mcp-server) | 资源化架构，偏"让 agent 理解/探索 Postgres" |

---

### 3. 企业 / 云数仓：厂商官方 MCP

**适用场景**：BigQuery / Snowflake / MongoDB Atlas 等，需要标准鉴权、审计与托管能力。

| 方案 | 文档 |
|------|------|
| BigQuery 官方 MCP | [Google Cloud Docs](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp) |
| Snowflake Managed MCP | [Snowflake Docs](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp) |
| MongoDB MCP Server | [MongoDB 官方](https://www.mongodb.com/products/tools/mcp-server)，支持连接串或 Atlas 账号，可设只读 |

---

### 4. MySQL 生态

社区实现：[mysql_mcp_server](https://github.com/designcomputer/mysql_mcp_server)（Python，需 3.11+）

> **注意**：MySQL 可写场景，强烈建议先做"只读账号 + 只读工具集"，再考虑放开写入。

#### 4.1 安装

```bash
pip install mysql-mcp-server
# 依赖：mcp>=1.0.0, mysql-connector-python>=9.1.0
```

#### 4.2 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `MYSQL_HOST` | 否 | `localhost` | 数据库主机名 |
| `MYSQL_PORT` | 否 | `3306` | 数据库端口 |
| `MYSQL_USER` | **是** | — | 数据库用户名 |
| `MYSQL_PASSWORD` | **是** | — | 数据库密码 |
| `MYSQL_DATABASE` | **是** | — | 目标数据库名 |

#### 4.3 只读账号（推荐先建专用账号）

```sql
-- 创建只读账号
CREATE USER 'codex_ro'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT ON your_database.* TO 'codex_ro'@'localhost';
FLUSH PRIVILEGES;

-- 若后续需要写入，单独再授权（建议用不同账号）
-- GRANT INSERT, UPDATE, DELETE ON your_database.* TO 'codex_rw'@'localhost';
```

#### 4.4 Codex config.toml 配置

```toml
# ~/.codex/config.toml  或  .codex/config.toml（项目级）

[mcp_servers.mysql]
type    = "stdio"
command = "python"
args    = ["-m", "mysql_mcp_server"]

[mcp_servers.mysql.env]
MYSQL_HOST     = "localhost"
MYSQL_PORT     = "3306"
MYSQL_USER     = "codex_ro"
MYSQL_PASSWORD = "strong_password"
MYSQL_DATABASE = "your_database"
```

> **敏感信息建议**：生产环境不要把密码明文写入 config.toml，改用 shell 环境变量注入：
> ```bash
> export MYSQL_PASSWORD="strong_password"
> ```
> 然后在 config.toml 中引用变量名（Codex 会从环境中查找并传递给 MCP server）。

#### 4.5 可用工具（Tools）

| Tool | 说明 |
|------|------|
| `list_resources()` | 列举数据库所有表 |
| `read_resource(uri)` | 读取表数据（默认限 100 行） |
| `list_tools()` | 显示可用操作 |
| `execute_sql(query)` | 执行自定义 SQL（只读账号下只能跑 SELECT） |

---

## Codex 侧配置

Codex 从以下位置读取 MCP 配置（项目级配置仅在 **trusted projects** 生效）：

```
~/.codex/config.toml          # 全局
.codex/config.toml            # 项目级
```

将对应 MCP server 以 **stdio** 或 **HTTP** 方式挂进去即可。参考：[OpenAI 开发者文档](https://developers.openai.com/codex/mcp)

---

## 安全与治理

> MCP 生态出现过恶意 MCP server 与已知漏洞，高权限能力交给 MCP server 会放大供应链/注入/组合漏洞的影响面。

按优先级落地护栏：

1. **权限最小化**：数据库专用账号，默认只读；写入需求拆成单独 server/账号（建议加审批）
2. **网络隔离**：MCP server 跑在同 VPC/内网，只对 Codex 运行环境开放
3. **SQL 防护**：
   - 只允许 `SELECT`
   - 限制可访问的库/表
   - 限制返回行数与执行超时
   - 强制参数化、禁多语句
4. **审计与回放**：记录每次 tool 调用（用户、SQL、耗时、影响行数），接到告警
5. **供应链**：只用可信仓库/镜像；锁版本、做 hash 校验；定期安全扫描（npm/py 包）

---

## 快速选型

| 需求 | 推荐方案 |
|------|---------|
| 查数 / 看表结构 | PostgreSQL 只读 MCP 或 SQLite Cloud MCP |
| 索引建议 / DBA 辅助 | Postgres MCP Pro 或 PG-MCP（先只读） |
| BigQuery / Snowflake / MongoDB | 对应厂商官方/托管 MCP |
| MySQL | 社区 MySQL MCP（严格只读账号） |
