# xuziran_prompt.md — ai-xzr 提示词记录（追加写入，禁止覆盖）

---

- **时间**: 2026-11-25
- **大模型**: GLM-5.3-Flash
- **提示词**: 你把今天让你做的ai的项目拿出来，这个应该是和全站项目fillstack-xzr同级的一个项目（端口确认为 8224）
- **执行内容**: 从 fullstack-xzr 拆分迁移 AI 功能为独立项目 ai-xzr：迁移 ai-chat/customer-service/knowledge-base/vision/asr/llm-task 六个页面 + xzr_kb_routes/xzr_ai_routes 两个路由模块 + css/js 资源；新建 app.js（health + /api/chat + 挂载）与项目首页；端口改 8224；fullstack-xzr 同步移除 AI 部分回归纯全栈项目
