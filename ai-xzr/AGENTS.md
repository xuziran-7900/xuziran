# AGENTS.md — ai-xzr AI 应用项目协作规则

> 本文件是 AI 的"项目宪法"，AI 每次开始工作前必须先读本文件。
> 所有者：徐子然 (xu-ziran) | 学号：24002120223

## 项目定位

- 本项目是**独立的 AI 应用项目**（LLM 聊天 / 在线客服 / RAG 知识库 / 图像识别 / 语音识别）
- 与全栈项目 `fullstack-xzr` **同级、互相独立**：fullstack-xzr 端口 8223，本项目端口 **8224**（8223 + 端口偏移 1，避免同时运行冲突）

## 项目结构与技术栈

- 前端：`frontend/` 目录
  - 原生 HTML、CSS、JavaScript，禁止使用任何第三方库、框架、CDN 链接
  - 页面：index.html（首页）、ai-chat.html、customer-service.html、knowledge-base.html、vision.html、asr.html、llm-task.html（作业文档）
- 后端：`backend/` 目录，Node.js + Express，所有接口以 `/api/` 为前缀，端口固定为 **8224**
- 使用 `express.static` 托管 `frontend/` 静态资源目录
- 后端通过 cors 中间件开放全部跨域访问，本配置仅用于课程作业
- 依赖：express、cors、mysql2、dotenv、multer、mammoth（docx 解析）、adm-zip（pptx 解析）、pdf-parse（PDF 解析）
- 大模型平台：硅基流动（主）+ 七牛（客服/ASR），均走 OpenAI 兼容接口

## 密钥安全（最高优先级）

- 所有 API Key 只写入 `backend/.env`（已被 .gitignore 排除），不得出现在代码、文档、AGENTS.md、Git 里
- 前端永远不直接请求大模型平台，一律走自己的后端 `/api/` 转发

## 数据库

- MySQL 用户名 root，真实密码只写 `backend/.env`
- 知识库两张表 `xzr_kb_files` / `xzr_kb_chunks` 建在 `xzr_fullstack` 库中（建表 SQL 见 `backend/xzr_database.md`，可独立重建）

## 命名与注释

- CSS 类名、JS 变量名、JS 函数名、数据库表名一律以 `xzr_` 开头
- 每个文件头部包含注释块：姓名：徐子然 | 学号：24002120223 | 时间：yyyy-mm-dd | 大模型：{名称}

## 记录文件（一律追加写入，禁止覆盖）

- `xuziran_prompt.md`（项目根目录）：每次开发指令后追加：时间 | 提示词全文 | 大模型名称
- `backend/xzr_interface.md`：每次新建/修改接口后追加完整记录
- `backend/xzr_database.md`：每次建表/改表/插数据后按执行顺序追加 SQL
- 统一 JSON 响应格式：`{ "code": 0, "msg": "...", "data": {...} }`

## 前端约定

- 服务器返回的数据和错误信息输出到浏览器控制台
- 新建 HTML 页面后在 `frontend/index.html` 追加导航卡入口
- 双击 HTML 用 file:// 打开时，`js/xzr_guard.js` 会自动跳转到 http://localhost:8224 对应页面
