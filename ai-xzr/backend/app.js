// 姓名：徐子然 | 学号：24002120223 | 时间：2026-11-25 | 大模型：GLM-5.3-Flash
// 功能名称：ai-xzr 后端入口（静态托管 + health / chat / kb 知识库 / 多模态图像与语音识别接口）

const xzr_express = require('express');
const xzr_cors = require('cors');
const xzr_path = require('path');
require('dotenv').config();

// AI 聊天/在线客服、知识库（RAG）、多模态（图像识别/语音识别）路由
const xzr_kbRoutes = require('./xzr_kb_routes');
const xzr_aiRoutes = require('./xzr_ai_routes');

const XZR_PORT = 8224;
const XZR_APP = xzr_express();

// 课程作业要求：开放全部跨域
XZR_APP.use(xzr_cors());
// 解析 JSON 请求体
XZR_APP.use(xzr_express.json());
// 托管 frontend 静态资源目录
XZR_APP.use(xzr_express.static(xzr_path.join(__dirname, '..', 'frontend')));

// 挂载知识库与多模态路由
XZR_APP.use(xzr_kbRoutes);
XZR_APP.use(xzr_aiRoutes);

// 统一 JSON 响应格式：{ code, msg, data }
// 健康检查接口：确认服务已启动
XZR_APP.get('/api/health', (xzr_req, xzr_res) => {
    xzr_res.json({
        code: 0,
        msg: 'ok',
        data: { service: 'ai-xzr', port: XZR_PORT, time: new Date().toISOString() }
    });
});

// ==================== AI 聊天 / 在线客服 ====================

// 服务商配置表：从 .env 读取三件套（baseURL / model / apiKey），换平台只改 .env 不改代码
function xzr_getProviderConfig(xzr_provider) {
    if (xzr_provider === 'qiniu') {
        return {
            name: '七牛',
            baseURL: process.env.QINIU_CUSTOMER_SERVICE_BASE_URL || 'https://api.qnaigc.com/v1',
            model: process.env.QINIU_CUSTOMER_SERVICE_MODEL || 'qiniu/conatus-free',
            apiKey: process.env.QINIU_CUSTOMER_SERVICE_API_KEY || ''
        };
    }
    return {
        name: '硅基流动',
        baseURL: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
        model: process.env.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
        apiKey: process.env.SILICONFLOW_API_KEY || ''
    };
}

// system 人设表：AI 聊天是"有用的助手"，在线客服是"中华美食街客服"（只答三类问题）
const XZR_PERSONAS = {
    assistant: '你是一个有用的助手，用中文回答，内容简洁准确。',
    foodstreet: '你是"中华美食街"在线客服。你只回答三类问题：①营业时间（每天 10:00-22:00，节假日不休）；②招牌菜（北京烤鸭 88 元、四川火锅人均 90 元、广东早茶人均 45 元、兰州拉面 18 元）；③配送范围（门店 5 公里内免费配送，超出收 5 元配送费）。遇到这三类以外的问题（闲聊、写作业、问路、其他店铺等），要礼貌说明"抱歉，我是美食街客服，只能回答营业时间、招牌菜、配送范围三类问题，其他需求请在留言板留言"，并引导用户留言。'
};

// 把大模型接口返回的 HTTP 状态码翻译成用户能看懂的中文提示（报错速查表思路）
function xzr_friendlyError(xzr_status, xzr_providerName) {
    if (xzr_status === 401) return xzr_providerName + ' API Key 无效或已失效，请检查 .env 中的 Key（注意不要带空格换行）';
    if (xzr_status === 402) return xzr_providerName + ' 账户余额不足，请先领取/充值免费额度';
    if (xzr_status === 404) return xzr_providerName + ' 模型名或 baseURL 不对，请逐字符核对 .env 配置（注意 /v1）';
    if (xzr_status === 429) return xzr_providerName + ' 免费额度限流中，请等十几秒再发一条';
    return xzr_providerName + ' 接口返回异常状态码 ' + xzr_status;
}

// AI 对话接口：收前端 messages 数组 → 带上 Key 转发给大模型 → 原样返回回答
// 请求体：{ messages: [{role:'user',content:'你好'},...], provider?: 'siliconflow'|'qiniu', persona?: 'assistant'|'foodstreet' }
XZR_APP.post('/api/chat', async (xzr_req, xzr_res) => {
    const xzr_messages = xzr_req.body.messages;
    const xzr_provider = xzr_req.body.provider === 'qiniu' ? 'qiniu' : 'siliconflow';
    const xzr_persona = xzr_req.body.persona === 'foodstreet' ? 'foodstreet' : 'assistant';

    // 参数校验：messages 必须是非空数组
    if (!Array.isArray(xzr_messages) || xzr_messages.length === 0) {
        return xzr_res.json({ code: 1, msg: 'messages 不能为空', data: null });
    }

    const xzr_cfg = xzr_getProviderConfig(xzr_provider);

    // Key 未配置（如七牛还是占位符）时给出友好提示
    if (!xzr_cfg.apiKey || xzr_cfg.apiKey === '你的key') {
        return xzr_res.json({
            code: 1,
            msg: xzr_cfg.name + ' 的 API Key 还没有配置，请到 backend/.env 里填写后再切换',
            data: null
        });
    }

    // 多轮对话的关键：system 人设 + 全部历史消息一起发过去（最多带 20 条防止超长）
    const xzr_payload_messages = [{ role: 'system', content: XZR_PERSONAS[xzr_persona] }]
        .concat(xzr_messages.slice(-20).map(function (xzr_m) {
            return { role: xzr_m.role === 'assistant' ? 'assistant' : 'user', content: String(xzr_m.content || '') };
        }));

    try {
        // 七牛免费模型全局限流很紧（429 free_campaign_global_limit），
        // 遇到 429 自动等待重试最多 2 次（间隔 3s、6s），用户无需手动重发
        let xzr_upstream = null;
        const xzr_maxRetry = xzr_provider === 'qiniu' ? 2 : 0;
        for (let xzr_attempt = 0; ; xzr_attempt++) {
            xzr_upstream = await fetch(xzr_cfg.baseURL + '/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + xzr_cfg.apiKey
                },
                body: JSON.stringify({
                    model: xzr_cfg.model,
                    messages: xzr_payload_messages,
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });
            if (xzr_upstream.status === 429 && xzr_attempt < xzr_maxRetry) {
                const xzr_wait = 3000 * (xzr_attempt + 1);
                console.log('[' + xzr_cfg.name + '] 429 限流，' + (xzr_wait / 1000) + ' 秒后自动重试（第 ' + (xzr_attempt + 1) + ' 次）…');
                await new Promise(function (xzr_r) { setTimeout(xzr_r, xzr_wait); });
                continue;
            }
            break;
        }

        if (!xzr_upstream.ok) {
            const xzr_errText = await xzr_upstream.text().catch(function () { return ''; });
            console.error('大模型接口出错 [' + xzr_upstream.status + ']:', xzr_errText.slice(0, 300));
            return xzr_res.json({ code: 1, msg: xzr_friendlyError(xzr_upstream.status, xzr_cfg.name), data: null });
        }

        const xzr_result = await xzr_upstream.json();
        const xzr_reply = xzr_result.choices && xzr_result.choices[0] &&
            xzr_result.choices[0].message && xzr_result.choices[0].message.content || '';
        console.log('AI 对话成功 provider=' + xzr_provider + ' model=' + xzr_cfg.model);
        xzr_res.json({
            code: 0,
            msg: 'ok',
            data: { reply: xzr_reply, provider: xzr_provider, provider_name: xzr_cfg.name, model: xzr_cfg.model }
        });
    } catch (xzr_err) {
        console.error('请求大模型失败:', xzr_err.message);
        xzr_res.json({ code: 1, msg: '无法连接 ' + xzr_cfg.name + ' 接口：' + xzr_err.message, data: null });
    }
});

// 启动服务
XZR_APP.listen(XZR_PORT, () => {
    console.log(`ai-xzr Server running at http://localhost:${XZR_PORT}`);
});
