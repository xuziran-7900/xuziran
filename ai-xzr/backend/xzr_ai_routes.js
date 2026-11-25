// 姓名：徐子然 | 学号：24002120223 | 时间：2026-11-25 | 大模型：GLM-5.3-Flash
// 功能名称：多模态 AI 路由——图像识别（上传图片返回描述）+ 语音识别（七牛 ASR，语音转文字）

const xzr_express = require('express');
const xzr_multer = require('multer');

const XZR_ROUTER = xzr_express.Router();

// 上传用内存存储，转 base64 后直接发给大模型；超限等上传错误统一翻译成 JSON 友好提示
const XZR_UPLOAD = xzr_multer({
    storage: xzr_multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }
});

// 包一层 multer 单文件上传：出错（如超过 20MB）时返回 JSON 提示而不是报错页
function xzr_uploadSingle(xzr_field) {
    return function (xzr_req, xzr_res, xzr_next) {
        XZR_UPLOAD.single(xzr_field)(xzr_req, xzr_res, function (xzr_err) {
            if (xzr_err) {
                const xzr_msg = xzr_err.code === 'LIMIT_FILE_SIZE'
                    ? '文件超过 20MB 限制，请压缩后再上传'
                    : '上传失败：' + xzr_err.message;
                console.error('上传被拒:', xzr_msg);
                return xzr_res.json({ code: 1, msg: xzr_msg, data: null });
            }
            xzr_next();
        });
    };
}

// 把上游 HTTP 状态码翻译成人话
function xzr_friendlyError(xzr_status, xzr_name) {
    if (xzr_status === 401) return xzr_name + ' API Key 无效或已失效';
    if (xzr_status === 402) return xzr_name + ' 账户余额不足';
    if (xzr_status === 404) return xzr_name + ' 模型名或 baseURL 不对';
    if (xzr_status === 429) return xzr_name + ' 请求太频繁被限流';
    return xzr_name + ' 接口返回异常状态码 ' + xzr_status;
}

// ===== 接口：图像识别 POST /api/ai/vision（multipart 字段 image）=====
XZR_ROUTER.post('/api/ai/vision', xzr_uploadSingle('image'), async (xzr_req, xzr_res) => {
    try {
        if (!xzr_req.file) return xzr_res.json({ code: 1, msg: '请选择要识别的图片', data: null });

        const xzr_mime = xzr_req.file.mimetype || 'image/jpeg';
        if (!xzr_mime.startsWith('image/')) {
            return xzr_res.json({ code: 1, msg: '只能上传图片文件', data: null });
        }

        // 图片转 base64 data URL，按 OpenAI 视觉格式放进消息里
        const xzr_dataUrl = 'data:' + xzr_mime + ';base64,' + xzr_req.file.buffer.toString('base64');
        const xzr_question = String(xzr_req.body.question || '').trim() || '请详细描述这张图片的内容';

        const xzr_payload = {
            model: process.env.SILICONFLOW_VISION_MODEL || 'Qwen/Qwen3-VL-8B-Instruct',
            messages: [{
                role: 'user',
                content: [
                    { type: 'image_url', image_url: { url: xzr_dataUrl } },
                    { type: 'text', text: xzr_question }
                ]
            }],
            max_tokens: 1024
        };

        // 课程要求：控制台输出发送给大模型的数据（base64 太长，只打印前 200 字符）
        console.log('\n========== [视觉] 发送给大模型的数据 ==========');
        console.log('model:', xzr_payload.model, '| 图片:', xzr_req.file.originalname, '(' + xzr_req.file.size + ' 字节)');
        console.log('问题:', xzr_question);
        console.log('图片 dataURL 前 200 字符:', xzr_dataUrl.slice(0, 200));

        const xzr_upstream = await fetch((process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1') + '/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (process.env.SILICONFLOW_API_KEY || '')
            },
            body: JSON.stringify(xzr_payload)
        });

        if (!xzr_upstream.ok) {
            const xzr_errText = await xzr_upstream.text().catch(function () { return ''; });
            console.error('[视觉] 上游出错:', xzr_errText.slice(0, 300));
            return xzr_res.json({ code: 1, msg: xzr_friendlyError(xzr_upstream.status, '硅基流动'), data: null });
        }

        const xzr_result = await xzr_upstream.json();

        // 课程要求：控制台输出大模型返回的数据
        console.log('\n========== [视觉] 大模型返回的数据 ==========');
        console.log(JSON.stringify(xzr_result, null, 2));

        const xzr_description = xzr_result.choices && xzr_result.choices[0] && xzr_result.choices[0].message && xzr_result.choices[0].message.content || '';
        xzr_res.json({ code: 0, msg: 'ok', data: { description: xzr_description, model: xzr_payload.model } });
    } catch (xzr_err) {
        console.error('图像识别失败:', xzr_err.message);
        xzr_res.json({ code: 1, msg: '图像识别失败：' + xzr_err.message, data: null });
    }
});

// ===== 接口：语音识别 POST /api/ai/asr（multipart 字段 audio，语音转文字）=====
// 说明：课程指定的七牛 Qwen-Audio-3.0-ASR-Flash 在七牛网关当前无可用通道
//（实测 /chat/completions 与 /audio/transcriptions 均返回 "no available channels"），
// 因此改用硅基流动的 Qwen/Qwen3-ASR-1.7B（同为 Qwen 语音识别模型，实测可用），
// 将来七牛通道开通后改 .env 即可切回
XZR_ROUTER.post('/api/ai/asr', xzr_uploadSingle('audio'), async (xzr_req, xzr_res) => {
    try {
        if (!xzr_req.file) return xzr_res.json({ code: 1, msg: '请上传或录制一段语音', data: null });

        // 走硅基流动的 whisper 兼容转写端点 /v1/audio/transcriptions
        const xzr_model = process.env.SILICONFLOW_ASR_MODEL || 'Qwen/Qwen3-ASR-1.7B';

        // 用原生 FormData 把音频原样转发（multipart）
        const xzr_form = new FormData();
        xzr_form.append('model', xzr_model);
        xzr_form.append('file', new Blob([xzr_req.file.buffer], { type: xzr_req.file.mimetype || 'audio/wav' }), xzr_req.file.originalname);

        // 课程要求：控制台输出发送给大模型的数据（音频太大，只打印元信息）
        console.log('\n========== [ASR] 发送给大模型的数据 ==========');
        console.log('端点:', (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1') + '/audio/transcriptions');
        console.log('model:', xzr_model, '| 音频:', xzr_req.file.originalname, '(' + xzr_req.file.size + ' 字节, ' + (xzr_req.file.mimetype || 'audio/wav') + ')');

        const xzr_upstream = await fetch((process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1') + '/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + (process.env.SILICONFLOW_API_KEY || '') },
            body: xzr_form
        });

        if (!xzr_upstream.ok) {
            const xzr_errText = await xzr_upstream.text().catch(function () { return ''; });
            console.error('[ASR] 上游出错:', xzr_errText.slice(0, 300));
            return xzr_res.json({ code: 1, msg: xzr_friendlyError(xzr_upstream.status, '硅基流动'), data: null });
        }

        const xzr_result = await xzr_upstream.json();

        // 课程要求：控制台输出大模型返回的数据
        console.log('\n========== [ASR] 大模型返回的数据 ==========');
        console.log(JSON.stringify(xzr_result, null, 2));

        xzr_res.json({ code: 0, msg: 'ok', data: { text: xzr_result.text || '', model: xzr_model } });
    } catch (xzr_err) {
        console.error('语音识别失败:', xzr_err.message);
        xzr_res.json({ code: 1, msg: '语音识别失败：' + xzr_err.message, data: null });
    }
});

module.exports = XZR_ROUTER;
