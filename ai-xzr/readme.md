# ai-xzr · AI 应用项目

大模型应用课程作业 · 徐子然 24002120223 · 端口 **8224**

## 功能

| 页面 | 功能 | 模型 |
|---|---|---|
| ai-chat.html | AI 聊天（多轮对话、服务商切换） | 硅基流动 Qwen2.5-7B-Instruct |
| customer-service.html | 中华美食街在线客服 | 同上（只换 system 人设） |
| knowledge-base.html | RAG 知识库（TXT/PDF/DOCX/PPTX 上传解析、管理、问答） | 同上 + mysql2 存储 |
| vision.html | 图像识别（上传图片返回描述） | Qwen/Qwen3-VL-8B-Instruct |
| asr.html | 语音识别（录音/上传音频转文字） | 七牛 Qwen-Audio-3.0-ASR-Flash |

## 启动

双击 `start.command`（macOS）或 `start.bat`（Windows），自动启动后端并打开浏览器；
或手动：

```bash
cd backend && npm run dev
# 访问 http://localhost:8224
```

## 安全

- 所有 API Key 只存 `backend/.env`（已被 .gitignore 排除），前端代码与 Git 中无任何 Key
- 前端不直接请求大模型平台，一律走本项目后端 `/api/` 转发
