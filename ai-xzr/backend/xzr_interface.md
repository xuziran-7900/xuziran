# 接口记录文件

> 姓名：徐子然 | 学号：24002120223 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
> 每次创建或修改接口后按下方格式追加，禁止覆盖已有内容。

## 接口清单

### 1. GET /api/health
- 修改时间：2026-11-20
- 请求参数：无
- 响应格式：
```json
{ "code": 0, "msg": "ok", "data": { "service": "fullstack-xzr", "port": 8223, "time": "2026-11-20T00:00:00.000Z" } }
```

### 2. POST /api/db-test
- 修改时间：2026-11-20
- 请求参数（JSON body）：`{ "user": "root", "password": "你的密码" }`
- 响应格式（成功）：
```json
{ "code": 0, "msg": "数据库连接成功", "data": { "version": "8.4.8" } }
```
- 响应格式（失败）：
```json
{ "code": 1, "msg": "Access denied for user 'root'@'localhost' (using password: YES)" }
```

### 3. GET /api/news
- 修改时间：2026-11-20
- 请求参数：无
- 响应格式：
```json
{ "code": 0, "msg": "查询成功", "data": [ { "id": 1, "title": "…", "summary": "…", "content": "…", "source": "…", "publish_time": "2026-11-20T08:00:00.000Z", "cover_img": "…" } ] }
```
- 说明：返回全部科技新闻，按 publish_time 倒序

### 4. GET /api/gallery
- 修改时间：2026-11-20
- 请求参数：无
- 响应格式：
```json
{ "code": 0, "msg": "查询成功", "data": [ { "id": 1, "title": "…", "description": "…", "img_url": "…", "category": "…", "create_time": "2026-11-20T00:00:00.000Z" } ] }
```
- 说明：返回全部图文数据

---

## POST /api/chat（AI 对话接口 · 2026-11-25 新增）

- **路径**: `/api/chat`
- **HTTP 方法**: POST
- **功能**: AI 聊天 / 在线客服。前端传对话历史，后端带 Key 转发给大模型平台（硅基流动 / 七牛），把回答原路返回。Key 只存于 backend/.env，前端永远接触不到。
- **请求参数（JSON body）**:

```json
{
  "messages": [
    { "role": "user", "content": "你好，我叫徐子然" },
    { "role": "assistant", "content": "你好！徐子然你好呀" },
    { "role": "user", "content": "我刚才说我叫什么名字？" }
  ],
  "provider": "siliconflow",
  "persona": "assistant"
}
```

| 字段 | 必填 | 说明 |
|---|---|---|
| messages | 是 | 对话历史数组（多轮对话的关键：全部历史一起发） |
| provider | 否 | `siliconflow`（默认）/ `qiniu`，对应 .env 里两组配置 |
| persona | 否 | `assistant`（默认，AI 聊天）/ `foodstreet`（中华美食街在线客服） |

- **响应格式（成功）**:

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "reply": "你刚才说你叫徐子然。",
    "provider": "siliconflow",
    "provider_name": "硅基流动",
    "model": "Qwen/Qwen2.5-7B-Instruct"
  }
}
```

- **响应格式（失败，均为人话提示）**:

```json
{ "code": 1, "msg": "七牛 的 API Key 还没有配置，请到 backend/.env 里填写后再切换", "data": null }
{ "code": 1, "msg": "硅基流动 API Key 无效或已失效，请检查 .env 中的 Key（注意不要带空格换行）", "data": null }
```

- **错误码映射**: 401→Key 无效 · 402→余额不足 · 404→模型名/baseURL 错 · 429→限流
- **前端页面**: `ai-chat.html`（AI 聊天 + 服务商下拉切换）、`customer-service.html`（美食街客服）
- **实测记录（2026-11-25）**: 多轮对话通过（第 2 轮能答出"你叫徐子然"）；客服 5 问 3 答 2 拒全部符合预期；qiniu 未配 Key 时返回友好提示

---

## 知识库与多模态接口（2026-11-25 新增）

| 接口 | 方法 | 参数 | 返回 |
|---|---|---|---|
| /api/kb/upload | POST (multipart, 字段 file) | 文件（txt/pdf/doc/docx/ppt/pptx ≤20MB） | `{code:0, data:{fileId, filename, fileType, chunks, chars}}` |
| /api/kb/files | GET | — | 文件列表（含分块数/大小/时间） |
| /api/kb/files/:id | DELETE | 路径参数 id | 删除文件及其全部分块 |
| /api/kb/chat | POST (JSON) | `{question:"问题"}` | `{code:0, data:{reply, sources:[{filename,seq,score}]}}`，控制台打印发给大模型/大模型返回的完整数据 |
| /api/ai/vision | POST (multipart, 字段 image) | 图片 + 可选 question | `{code:0, data:{description, model}}`（Qwen3-VL），控制台打印收发数据 |
| /api/ai/asr | POST (multipart, 字段 audio) | 音频（wav/mp3/m4a 等） | `{code:0, data:{text, model}}`（七牛 Qwen-Audio-3.0-ASR-Flash，需先配 Key） |

实测记录（2026-11-25）：
- 4 种格式上传解析全部成功（txt 194 字/docx 180 字/pptx 160 字/pdf 124 字，各切 1 块）
- RAG 问答：营业时间→答对（来源 txt）；摊位租金→答对（来源 pptx）；超纲问题→如实回答"知识库中没有找到相关内容"
- 图像识别：壁纸测试图返回准确中文描述（Qwen3-VL-8B-Instruct）
- 语音识别：未配七牛 Key 时返回友好提示；前端支持麦克风录音（MediaRecorder）与文件上传两种方式

---

### ASR 接口变更（2026-11-25）

- 七牛 `Qwen-Audio-3.0-ASR-Flash`：模型广场有展示，但网关实测返回 `no available channels`（chat/completions 与 audio/transcriptions 两个端点都试过），当前无可用部署
- **改用硅基流动 `Qwen/Qwen3-ASR-1.7B`**，端点 `POST /api/ai/asr`（multipart 字段 audio）→ 后端转发 `https://api.siliconflow.cn/v1/audio/transcriptions`（whisper 兼容）
- 实测：say 合成语音"大家好，我是徐子然，今天测试七牛语音识别功能" → 识别返回"大家好，我是徐子然，今天测试犀牛语音识别功能。"（"七牛"被听成"犀牛"，属模型听写误差，功能正常）
- 将来七牛通道开通：改 `.env` 的 `SILICONFLOW_ASR_MODEL` 并恢复七牛端点即可
- 上传超 20MB 现在返回 JSON 友好提示（之前是 Express 报错页）
