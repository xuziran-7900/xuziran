# AGENTS.md — Visual.x 项目协作指南

> 本文件供 AI Agent / 协作者阅读，快速理解项目结构与工作规范。
> 最后更新：2026-10-30

---

## 1. 项目简介

**Visual.x** 是一个纯静态前端作品集 / 课堂练习项目，用于展示 HTML、CSS、JavaScript 的学习成果以及艺术品牌风格的 UI 设计实践。项目按主题拆分成多个独立 HTML 页面，全部通过 `index.html`（作品集首页）串联。

- **所有者**：徐子然 (xu-ziran)
- **性质**：个人学习 + 设计作品集
- **核心定位**：艺术品牌风格 / 金属质感 / 深色主题

---

## 2. 技术栈

| 类别 | 技术 | 版本 | 备注 |
|---|---|---|---|
| 标记 | HTML5 | — | 原生语义化标签 |
| 样式 | CSS3 | — | 原生，使用 CSS Variables、Flexbox、Grid、backdrop-filter |
| 脚本 | JavaScript (ES6+) | — | 原生，无框架 |
| 图标-自定义 | iconfont | — | 4 个自定义图标，位于 `font/` |
| 图标-Font Awesome | Font Awesome | 6.5.2 | 字体图标，本地 CDN：`cdn/fontawesome/` |
| 图标-Lucide | Lucide | 0.445 | SVG symbol，本地 CDN：`cdn/lucide/` |
| 构建工具 | **无** | — | 纯静态，无需打包 |
| 包管理 | **无** | — | 无 `package.json`、无 `node_modules/` |
| 后端 | **无** | — | 纯前端静态站点 |
| 版本控制 | Git | — | 双 remote：GitHub + Gitee |

**重要**：本项目**没有任何构建/打包/编译步骤**。编辑 `.html` / `.css` / `.js` 后，直接用浏览器打开或用任意静态服务器预览即可。

---

## 3. 目录结构

```
Visual.x/                          # 项目根目录
├── index.html                     # ★ 作品集首页（核心入口）
├── 1.html / dataType.html / ...   # 课堂练习页面
├── iconfont-1.html                # Font Awesome 字体图标艺术展
├── iconfont-2.html                # Lucide SVG 图标艺术展
├── iconfont-3.html                # 移动端底部导航 · 字体图标版
├── iconfont-4.html                # 移动端底部导航 · SVG 版
├── text.html / text1.html         # 文本练习
│
├── css/                           # 独立 CSS 文件（练习用）
│   ├── 1.css
│   └── svg005.css
│
├── font/                          # ★ 自定义 iconfont 图标库
│   ├── iconfont.css               #   字体图标 CSS（.iconfont.icon-xxx）
│   ├── iconfont.js                #   SVG symbol 注入脚本
│   ├── iconfont.json              #   图标元数据（4 个图标）
│   ├── iconfont.ttf / .woff / .woff2
│   ├── demo.css
│   └── demo_index.html
│
├── cdn/                           # ★ 本地化 CDN 资源
│   ├── fontawesome/
│   │   ├── css/all.min.css
│   │   └── webfonts/              # 3 个 woff2（solid / regular / brands）
│   └── lucide/
│       └── lucide.min.js
│
├── skills/                        # 前端设计规范（frontend-design skill）
│   └── SKILL.md
│
├── .trae/skills/                  # ★ 项目级 Trae skill（入库共享）
│   ├── submit-github/SKILL.md     #   推送 GitHub（SSH）
│   └── submit-project/SKILL.md    #   推送 Gitee（token）
│
├── xzr_prompt.md                  # ★ 提示词审计日志（规则：每次追加写入）
├── AGENTS.md                      # 本文件
├── README.md / README.en.md       # Gitee 模板 README
└── .gitignore
```

### iconfont 图标清单（`font/` 下共 4 个）

| font_class | 中文名 | unicode | 用途参考 |
|---|---|---|---|
| `icon-a-ziyuan253` | 资源 | e794 | 底部导航 · 首页 |
| `icon-niuyouguo` | 牛油果 | e795 | 底部导航 · 发现 |
| `icon-gongwenbao` | 公文包 | e796 | 底部导航 · 消息 |
| `icon-dengpao` | 灯泡 | e797 | 底部导航 · 我的 |

---

## 4. 开发命令

### 4.1 本地预览

**无构建步骤**。任选其一：

```bash
# 方式 A：Python 内置服务器（推荐，跨平台）
cd Visual.x && python3 -m http.server 8000
# 访问 http://localhost:8000

# 方式 B：PHP
php -S localhost:8000

# 方式 C：直接用浏览器打开 index.html（部分 API 可能受限）
```

### 4.2 Git 操作（双 Remote）

```bash
# 查看所有 remote
git remote -v
# github   git@github.com:xuziran-7900/xuziran.git           (SSH)
# origin   https://oauth2:...@gitee.com/neusoft_wangyao_jsj/xu-ziran-xzr.git  (HTTPS token)

# 只推 GitHub
git push github master

# 只推 Gitee
git push origin master

# 一次推两个（推荐）
git push github origin master
```

### 4.3 SSH 测试

```bash
ssh -T git@github.com     # 应显示 "Hi xuziran-7900! You've successfully authenticated"
ssh -T git@gitee.com      # 尚未配置公钥（默认 HTTPS token 方式）
```

---

## 5. 代码规范

### 5.1 命名规范（最高优先级 · 强制）

**所有 CSS 类名、id、JS 变量必须以 `xzr_` 开头**，禁止使用无前缀的通用名。

```html
<!-- ✅ 正确 -->
<div class="xzr_container" id="xzr_header">...</div>

<!-- ❌ 禁止 -->
<div class="container" id="header">...</div>
```

```css
/* ✅ 正确 */
.xzr_card { ... }
#xzr_nav { ... }

/* ❌ 禁止 */
.card { ... }
#nav { ... }
```

```javascript
// ✅ 正确
const xzr_userName = 'xu-ziran';
function xzr_renderIcons() { ... }

// ❌ 禁止
const userName = 'xu-ziran';
function renderIcons() { ... }
```

### 5.2 HTML 规范

- 使用语义化标签：`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- 移动端页面 `<meta name="viewport">` 必须包含 `viewport-fit=cover`（适配刘海屏）
- 新页面必须在 `index.html`（作品集首页）添加超链接入口卡片（规则 3）
- 新页面的顶部/底部应包含返回 `index.html` 的导航链接（双向互通）

### 5.3 CSS 规范

- 使用 CSS Variables（`--xzr-xxx`）统一设计 token
- `box-sizing: border-box;` 全局重置
- 优先 Flexbox / Grid，避免浮动布局
- 艺术品牌风格参考 `skills/SKILL.md`（frontend-design 设计指南）

### 5.4 图标引用方式

```html
<!-- 自定义 iconfont · 字体图标（方式 1） -->
<link rel="stylesheet" href="font/iconfont.css">
<i class="iconfont icon-a-ziyuan253"></i>

<!-- 自定义 iconfont · SVG symbol（方式 2） -->
<script src="font/iconfont.js"></script>
<svg class="xzr_svg-icon"><use xlink:href="#icon-a-ziyuan253"></use></svg>

<!-- Font Awesome 6.5 -->
<link rel="stylesheet" href="cdn/fontawesome/css/all.min.css">
<i class="fa-solid fa-house"></i>

<!-- Lucide SVG -->
<script src="cdn/lucide/lucide.min.js"></script>
<i data-lucide="home"></i>
<script>lucide.createIcons();</script>
```

### 5.5 提示词审计规则（强制）

**每次执行操作前，必须将用户的提示词以追加方式写入 `xzr_prompt.md`，不覆盖历史。** 写入格式：

```markdown
---

- **时间**: YYYY-MM-DD
- **模型**: Trae (proprietary model from Trae team)
- **提示词内容**:

<用户原始提示词>
```

---

## 6. 提交规范

### 6.1 Commit Message 格式

```
<type>: <中文简短描述>
```

**Type 列表**：

| Type | 用途 | 示例 |
|---|---|---|
| `feat:` | 新功能 / 新页面 | `feat: 新增移动端底部导航 iconfont-3/4` |
| `fix:` | Bug 修复 | `fix: 修正 iOS 刘海屏适配` |
| `style:` | 样式调整（不影响功能） | `style: 优化卡片 hover 动画` |
| `docs:` | 文档变更 | `docs: 更新 AGENTS.md` |
| `refactor:` | 重构 | `refactor: 统一 CSS 变量命名` |
| `chore:` | 杂项 / 构建 / 配置 | `chore: 新增 submit-github skill` |

### 6.2 Commit 流程（推荐）

```bash
git status && git diff --stat          # 1. 检查改动，确认无敏感文件
git add -A                             # 2. 添加全部
git commit -m "feat: xxx"              # 3. 提交
git push github origin master          # 4. 推送到双 remote
```

### 6.3 分支规范

- **main / master**：生产分支，直接推送（小项目无 PR 流程）
- **feature 分支**：`feat/<功能名>` · `fix/<问题名>` · `docs/<文档名>`
- **禁止 `--force`**：除非用户明确授权且理解后果

### 6.4 双 Remote 同步

项目同时托管在 **GitHub** 和 **Gitee**：

| 平台 | URL | 认证方式 | 主要用途 |
|---|---|---|---|
| GitHub | `git@github.com:xuziran-7900/xuziran.git` | SSH 公钥 | 开源展示 |
| Gitee | `https://gitee.com/neusoft_wangyao_jsj/xu-ziran-xzr.git` | HTTPS token | 学校/国内访问 |

**重要**：Gitee 的 token 存储在本地 git remote URL 中（`git remote -v` 可见），**已入库到 `.git/config`，未提交到仓库**。定期轮换。

---

## 7. 依赖清单

### 7.1 本地 CDN 资源（无需联网加载）

| 资源 | 版本 | 路径 | 用途 |
|---|---|---|---|
| Font Awesome | 6.5.2 | `cdn/fontawesome/` | 通用字体图标（170+） |
| Lucide | 0.445 | `cdn/lucide/` | SVG 矢量图标库（100+） |
| iconfont 自定义 | — | `font/` | 项目专属图标（4 个） |

### 7.2 外部依赖

**无**。所有图标资源已本地化，无 npm / CDN 运行时依赖。

---

## 8. 测试命令

**无**。项目无自动化测试框架。

**验证方式**：
- 打开页面手动查看视觉效果
- 浏览器 DevTools Console 检查 JS 错误
- `git ls-tree -r github/master --name-only | wc -l` 验证远程文件数

---

## 9. 注意事项

### 9.1 必须遵守的三条硬规则

1. **命名前缀**：所有 CSS 类名 / id / JS 变量 → `xzr_` 开头
2. **提示词审计**：每次执行前 → 提示词追加写入 `xzr_prompt.md`
3. **首页入口**：新建 HTML → 必须在 `index.html` 添加超链接卡片

### 9.2 iconfont 使用注意

- CSS 方式：必须同时加载 `font/iconfont.css` + 字体文件（ttf/woff/woff2）才能显示
- SVG 方式：必须加载 `font/iconfont.js`（它会注入 SVG `<symbol>` 到 body）
- 两种方式不要在同一页面混用同一个图标，避免冲突

### 9.3 移动端适配

- 使用 `viewport-fit=cover` + `env(safe-area-inset-*)` 适配 iPhone 刘海/底部 Home Indicator
- 底部导航预留安全区：`padding-bottom: calc(72px + env(safe-area-inset-bottom))`

### 9.4 隐私与安全

- Gitee token 在本地 `~/.git/config` 的 remote URL 中，**不要提交 `.git/config` 到仓库**
- SSH 私钥 `~/.ssh/id_ed25519` 绝对不要上传
- `.gitignore` 已排除 `.DS_Store`、`node_modules/`、`.env`

### 9.5 艺术品牌风格参考

项目设计遵循 `skills/SKILL.md` 中的 frontend-design 指南：
- 深色金属质感背景 + 暖色（金色 / 紫铜 / 翡翠）点缀
- 3D 浮雕标题 + CSS 渐变 + text-shadow
- 环境光晕 + 金属网格纹理（`body::before` / `body::after`）
- 克制的动效：单页 1-2 个 orchestrated moment 即可

### 9.6 本地 CDN 更新

如需升级 Font Awesome / Lucide 版本：

```bash
# Font Awesome 6.x
curl -o cdn/fontawesome/css/all.min.css "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/<VERSION>/css/all.min.css"
# 同时更新 webfonts/ 下对应的 woff2 文件

# Lucide
curl -o cdn/lucide/lucide.min.js "https://unpkg.com/lucide@<VERSION>/dist/umd/lucide.min.js"
```

更新后请同步修改本文件的技术栈表格。

---

## 10. 快速速查

```bash
# 本地预览
cd Visual.x && python3 -m http.server 8000

# 推送到双 remote
git add -A && git commit -m "feat: xxx" && git push github origin master

# 验证双 remote 同步
git ls-tree -r github/master --name-only | wc -l
git ls-tree -r origin/master --name-only | wc -l

# 查看项目级 skill
cat .trae/skills/submit-github/SKILL.md
cat .trae/skills/submit-project/SKILL.md
```

---

*本文件由项目扫描自动生成，AI Agent 和人类协作者都应遵守以上规范。*
