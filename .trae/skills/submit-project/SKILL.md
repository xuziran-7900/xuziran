---
name: submit-project
description: Commit and push current project to the configured Gitee remote. Use when the user asks to submit, commit, push, or publish changes to the Gitee repository for this project.
---

# Submit Project — Gitee Push

提交当前项目到已配置的 Gitee 远程仓库。

## 前置条件

在执行前确认：

1. 当前目录是一个 git 仓库（`git rev-parse --is-inside-work-tree`）。
2. 远程 origin 已指向 Gitee 仓库，格式为：
   `https://oauth2:<TOKEN>@gitee.com/<OWNER>/<REPO>.git`
   - 查看：`git remote -v`
   - 如未配置，设置命令：
     `git remote add origin https://oauth2:<TOKEN>@gitee.com/<OWNER>/<REPO>.git`
3. 工作区有变更（`git status --porcelain` 非空）。

## 执行步骤

### 1. 查看改动

```bash
git status
git diff --stat
```

确认没有误提的敏感文件（`.env`、密钥、`.DS_Store`）。如果有，先补充 `.gitignore`。

### 2. 添加文件

```bash
git add -A
```

### 3. 编写 commit message

使用中文，结构化格式：
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

### 4. 推送到 Gitee

**首选安全方式**（远程可能有初始提交需要合并）：

```bash
git pull origin master --rebase --allow-unrelated-histories
# 如有冲突：手动解决 → git add <冲突文件> → git rebase --continue
git push -u origin master
```

**如果需要新建分支推送**（避免与远程 master 冲突）：

```bash
git branch -M <feature-branch-name>
git push -u origin <feature-branch-name>
```

**禁止**：使用 `--force` 或 `--force-with-lease` 覆盖远程历史，除非用户明确授权且理解后果。

### 5. 验证

```bash
git status           # 应为 working tree clean
git log --oneline -3
git ls-tree -r --name-only origin/master | wc -l
```

## 本项目的 Gitee 配置（已预设）

| 项 | 值 |
|---|---|
| 仓库地址 | `https://gitee.com/neusoft_wangyao_jsj/xu-ziran-xzr.git` |
| 远程名 | `origin` |
| 默认分支 | `master` |
| 认证方式 | `oauth2:<GITEE_TOKEN>` |

令牌已在 git remote URL 中配置，执行 push 时无需再次输入。
