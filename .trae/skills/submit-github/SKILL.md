---
name: submit-github
description: Commit and push current project to the configured GitHub remote (SSH). Use when the user asks to submit, commit, push, or publish changes to the GitHub repository for this project.
---

# Submit Project — GitHub Push (SSH)

提交当前项目到已配置的 GitHub 远程仓库，使用 SSH 公钥认证。

## 前置条件

在执行前确认：

1. 当前目录是一个 git 仓库（`git rev-parse --is-inside-work-tree`）。
2. GitHub SSH key 存在：`ls ~/.ssh/id_ed25519.pub`。
3. SSH 已授权：`ssh -T git@github.com` 应显示 `Hi <username>! You've successfully authenticated`。
4. 远程 `github` 已指向 SSH 地址（不是 HTTPS + token）：
   - 查看：`git remote -v`
   - 格式应为：`git@github.com:<OWNER>/<REPO>.git`
   - 如未配置：`git remote add github git@github.com:<OWNER>/<REPO>.git`
5. 工作区有变更（`git status --porcelain` 非空）。

## 执行步骤

### 1. 查看改动

```bash
git status
git diff --stat
```

确认没有误提的敏感文件（`.env`、密钥、token、`.DS_Store`）。如果有，补充 `.gitignore`。

### 2. 添加文件

```bash
git add -A
```

### 3. 编写 commit message（中文，结构化）

```bash
git commit -m "类型: 简短描述"
```

类型前缀：
- `feat:` 新功能
- `fix:` 修复
- `style:` 样式调整
- `docs:` 文档
- `refactor:` 重构
- `chore:` 杂项 / 构建

示例：`feat: 新增移动端底部导航页面 iconfont-3/4`

### 4. 推送到 GitHub（SSH）

**首选安全方式**（远程可能有新提交需要合并）：

```bash
git pull github master --rebase --allow-unrelated-histories
# 如有冲突：手动解决 → git add <冲突文件> → git rebase --continue
git push -u github master
```

**新建分支推送**（避免与远程 master 冲突时）：

```bash
git branch -M <feature-branch-name>
git push -u github <feature-branch-name>
```

**禁止**：使用 `--force` 覆盖远程历史，除非用户明确授权。

### 5. （可选）同时同步到 Gitee（如果项目配置了双 remote）

```bash
git push origin master
```

### 6. 验证

```bash
git status           # 应为 working tree clean
git log --oneline -3
git ls-tree -r github/master --name-only | wc -l
```

## SSH 问题排查

| 现象 | 解决 |
|---|---|
| `Permission denied (publickey)` | 确认公钥已添加到 GitHub Settings → SSH Keys；`ssh-add ~/.ssh/id_ed25519` |
| `Host key verification failed` | `ssh-keyscan -H github.com >> ~/.ssh/known_hosts` |
| 仍然失败 | 用 `ssh -vT git@github.com` 查看详细 debug |

## 本项目的 GitHub 配置（已预设）

| 项 | 值 |
|---|---|
| 仓库地址 | `https://github.com/xuziran-7900/xuziran.git` |
| SSH remote | `git@github.com:xuziran-7900/xuziran.git` |
| 远程名 | `github` |
| 默认分支 | `master` |
| 认证方式 | SSH 公钥（`~/.ssh/id_ed25519`） |
| GitHub 用户名 | `xuziran-7900` |

## 双 remote 管理速查

```bash
git remote -v                          # 查看所有 remote
git push github master                 # 只推 GitHub
git push origin master                 # 只推 Gitee
git push github origin master          # 同时推两个
```
