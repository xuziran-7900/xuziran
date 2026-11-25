// 姓名：徐子然 | 学号：24002120223 | 时间：2026-11-25 | 大模型：GLM-5.3-Flash
// 功能名称：知识库（RAG）路由——文件上传解析(txt/pdf/docx/pptx)、分块入库、文件管理、基于知识库的问答

const xzr_express = require('express');
const xzr_multer = require('multer');
const xzr_mysql = require('mysql2/promise');
const xzr_admzip = require('adm-zip');
const xzr_mammoth = require('mammoth');

// pdf-parse v2 用 PDFParse 类解析
const xzr_pdf = require('pdf-parse');
const XZR_PDFParse = xzr_pdf.PDFParse || xzr_pdf.default && xzr_pdf.default.PDFParse;

const XZR_ROUTER = xzr_express.Router();

// 上传用内存存储：文件不落盘，解析完直接进数据库
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

// 允许上传的扩展名 → 文件类型
const XZR_ALLOWED = { '.txt': 'txt', '.pdf': 'pdf', '.doc': 'doc', '.docx': 'docx', '.ppt': 'ppt', '.pptx': 'pptx' };

// 复用 app.js 的数据库连接池与 .env 配置（dotenv 已在入口加载）
function xzr_getPool() {
    return xzr_mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'xzr_fullstack',
        waitForConnections: true,
        connectionLimit: 5
    });
}
const xzr_pool = xzr_getPool();

// 把上传的文件缓冲区按类型解析成纯文本（txt 直接读 / pdf 用 pdf-parse / docx 用 mammoth / pptx 解 zip 抽幻灯片 XML）
async function xzr_extractText(xzr_type, xzr_buffer) {
    if (xzr_type === 'txt') return xzr_buffer.toString('utf8');

    if (xzr_type === 'pdf') {
        const xzr_parser = new XZR_PDFParse({ data: new Uint8Array(xzr_buffer) });
        const xzr_result = await xzr_parser.getText();
        await xzr_parser.destroy();
        return xzr_result.text || '';
    }

    if (xzr_type === 'docx') {
        const xzr_result = await xzr_mammoth.extractRawText({ buffer: xzr_buffer });
        return xzr_result.value || '';
    }

    // pptx / docx(zip) 与老格式 ppt 的兜底：pptx 本质是 zip，抽 ppt/slides/*.xml 去标签
    if (xzr_type === 'pptx' || xzr_type === 'doc' || xzr_type === 'ppt') {
        const xzr_zip = new xzr_admzip(xzr_buffer);
        const xzr_entries = xzr_zip.getEntries();
        const xzr_parts = [];
        xzr_entries.forEach(function (xzr_e) {
            // pptx 文本在 ppt/slides/slideN.xml；docx（zip 兜底）文本在 word/document.xml
            if (/ppt\/slides\/slide\d+\.xml$/.test(xzr_e.entryName) || xzr_e.entryName === 'word/document.xml') {
                const xzr_xml = xzr_e.getData().toString('utf8');
                // <a:t>文本</a:t> 是 pptx 的文本节点；w:t 是 docx 的
                const xzr_matches = xzr_xml.match(/<(?:a|w):t>[^<]*<\/(?:a|w):t>/g) || [];
                xzr_parts.push(xzr_matches.map(function (xzr_m) {
                    return xzr_m.replace(/<[^>]+>/g, '');
                }).join('\n'));
            }
        });
        return xzr_parts.join('\n');
    }
    throw new Error('不支持的文件类型');
}

// 把长文本切成约 500 字的分块（尽量在句号/换行处断开，保证块内语义完整）
function xzr_chunkText(xzr_text) {
    const XZR_SIZE = 500;
    const xzr_chunks = [];
    let xzr_rest = xzr_text.replace(/\r/g, '').trim();
    while (xzr_rest.length > 0) {
        if (xzr_rest.length <= XZR_SIZE) {
            xzr_chunks.push(xzr_rest);
            break;
        }
        // 在前 500 字里找最后一个句号/问号/换行作为切断点
        let xzr_cut = xzr_rest.lastIndexOf('。', XZR_SIZE);
        const xzr_alt = Math.max(xzr_rest.lastIndexOf('！', XZR_SIZE), xzr_rest.lastIndexOf('？', XZR_SIZE), xzr_rest.lastIndexOf('\n', XZR_SIZE));
        if (xzr_alt > xzr_cut) xzr_cut = xzr_alt;
        if (xzr_cut < 100) xzr_cut = XZR_SIZE; // 实在没断点就硬切
        xzr_chunks.push(xzr_rest.slice(0, xzr_cut + 1).trim());
        xzr_rest = xzr_rest.slice(xzr_cut + 1).trim();
    }
    return xzr_chunks.filter(function (xzr_c) { return xzr_c.length > 0; });
}

// 中文关键词检索打分：把问题切成 2 字滑窗（bigram），统计每个分块命中的次数
function xzr_scoreChunks(xzr_question, xzr_chunks) {
    const xzr_terms = [];
    const xzr_clean = xzr_question.replace(/\s+/g, '');
    for (let i = 0; i < xzr_clean.length - 1; i++) {
        xzr_terms.push(xzr_clean.slice(i, i + 2));
    }
    return xzr_chunks.map(function (xzr_c) {
        let xzr_score = 0;
        xzr_terms.forEach(function (xzr_t) {
            let xzr_pos = xzr_c.content.indexOf(xzr_t);
            while (xzr_pos !== -1) { xzr_score++; xzr_pos = xzr_c.content.indexOf(xzr_t, xzr_pos + 1); }
        });
        return xzr_score;
    });
}

// ===== 接口 1：上传知识库文件（multipart 字段名 file）=====
XZR_ROUTER.post('/api/kb/upload', xzr_uploadSingle('file'), async (xzr_req, xzr_res) => {
    try {
        if (!xzr_req.file) return xzr_res.json({ code: 1, msg: '请选择要上传的文件', data: null });

        const xzr_name = xzr_req.file.originalname || 'untitled';
        const xzr_ext = ('.' + (xzr_name.split('.').pop() || '').toLowerCase());
        const xzr_type = XZR_ALLOWED[xzr_ext];

        if (!xzr_type) {
            return xzr_res.json({ code: 1, msg: '不支持的格式：' + xzr_ext + '（仅支持 txt / pdf / doc / docx / ppt / pptx）', data: null });
        }

        // 解析文本并切块
        const xzr_text = await xzr_extractText(xzr_type, xzr_req.file.buffer);
        if (!xzr_text.trim()) {
            return xzr_res.json({ code: 1, msg: '文件解析后没有提取到文字（可能是扫描件或空文件）', data: null });
        }
        const xzr_chunks = xzr_chunkText(xzr_text);

        // 文件表 + 分块表一起入库
        const [xzr_fileResult] = await xzr_pool.query(
            'INSERT INTO xzr_kb_files (filename, file_type, file_size, chunk_count, status) VALUES (?, ?, ?, ?, ?)',
            [xzr_name, xzr_type, xzr_req.file.size, xzr_chunks.length, 'ready']
        );
        const xzr_fileId = xzr_fileResult.insertId;
        for (let i = 0; i < xzr_chunks.length; i++) {
            await xzr_pool.query('INSERT INTO xzr_kb_chunks (file_id, seq, content) VALUES (?, ?, ?)', [xzr_fileId, i, xzr_chunks[i]]);
        }

        console.log('知识库上传成功:', xzr_name, '→', xzr_chunks.length, '个分块');
        xzr_res.json({
            code: 0, msg: '上传并解析成功',
            data: { fileId: xzr_fileId, filename: xzr_name, fileType: xzr_type, chunks: xzr_chunks.length, chars: xzr_text.length }
        });
    } catch (xzr_err) {
        console.error('知识库上传失败:', xzr_err.message);
        xzr_res.json({ code: 1, msg: '解析失败：' + xzr_err.message, data: null });
    }
});

// ===== 接口 2：知识库文件列表 =====
XZR_ROUTER.get('/api/kb/files', async (xzr_req, xzr_res) => {
    try {
        const [xzr_rows] = await xzr_pool.query(
            'SELECT id, filename, file_type, file_size, chunk_count, status, create_time FROM xzr_kb_files ORDER BY id DESC'
        );
        xzr_res.json({ code: 0, msg: '查询成功', data: xzr_rows });
    } catch (xzr_err) {
        xzr_res.json({ code: 1, msg: '查询失败：' + xzr_err.message, data: null });
    }
});

// ===== 接口 3：删除知识库文件（连同它的全部分块）=====
XZR_ROUTER.delete('/api/kb/files/:id', async (xzr_req, xzr_res) => {
    try {
        const xzr_id = Number(xzr_req.params.id);
        await xzr_pool.query('DELETE FROM xzr_kb_chunks WHERE file_id = ?', [xzr_id]);
        const [xzr_result] = await xzr_pool.query('DELETE FROM xzr_kb_files WHERE id = ?', [xzr_id]);
        if (xzr_result.affectedRows === 0) return xzr_res.json({ code: 1, msg: '文件不存在', data: null });
        console.log('知识库文件已删除: id =', xzr_id);
        xzr_res.json({ code: 0, msg: '删除成功', data: { id: xzr_id } });
    } catch (xzr_err) {
        xzr_res.json({ code: 1, msg: '删除失败：' + xzr_err.message, data: null });
    }
});

// ===== 接口 4：基于知识库的问答（RAG：检索相关分块 → 拼进提示词 → 大模型回答）=====
XZR_ROUTER.post('/api/kb/chat', async (xzr_req, xzr_res) => {
    try {
        const xzr_question = String(xzr_req.body.question || '').trim();
        if (!xzr_question) return xzr_res.json({ code: 1, msg: '问题不能为空', data: null });

        // 1. 检索：取全部分块做关键词打分（课程规模数据量小，全表打分足够）
        const [xzr_all] = await xzr_pool.query(
            'SELECT c.id, c.file_id, c.seq, c.content, f.filename FROM xzr_kb_chunks c JOIN xzr_kb_files f ON f.id = c.file_id'
        );
        if (xzr_all.length === 0) {
            return xzr_res.json({ code: 1, msg: '知识库还是空的，请先上传文件', data: null });
        }
        const xzr_scores = xzr_scoreChunks(xzr_question, xzr_all);
        // 取分最高的 3 块（分数为 0 说明完全没命中，也照样取前 3 块兜底）
        const xzr_top = xzr_all
            .map(function (xzr_c, xzr_i) { return { chunk: xzr_c, score: xzr_scores[xzr_i] }; })
            .sort(function (xzr_a, xzr_b) { return xzr_b.score - xzr_a.score; })
            .slice(0, 3);

        // 2. 组装提示词：system 角色 + 检索到的参考资料 + 用户问题（RAG 核心）
        const xzr_context = xzr_top.map(function (xzr_t, xzr_i) {
            return '【参考片段' + (xzr_i + 1) + ' · 来自 ' + xzr_t.chunk.filename + ' 第' + (xzr_t.chunk.seq + 1) + '块】\n' + xzr_t.chunk.content;
        }).join('\n\n');

        const xzr_messages = [
            { role: 'system', content: '你是知识库问答助手。请只依据下面的参考资料回答用户问题；如果资料里没有相关内容，就如实回答"知识库中没有找到相关内容"。回答用中文，简洁准确。' },
            { role: 'user', content: '参考资料：\n' + xzr_context + '\n\n用户问题：' + xzr_question }
        ];

        const xzr_payload = {
            model: process.env.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
            messages: xzr_messages,
            temperature: 0.2,
            max_tokens: 1024
        };

        // 3. 课程要求：在控制台完整输出发送给大模型的数据
        console.log('\n========== [RAG] 发送给大模型的数据 ==========');
        console.log(JSON.stringify(xzr_payload, null, 2));

        // 4. 调用大模型
        const xzr_upstream = await fetch((process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1') + '/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (process.env.SILICONFLOW_API_KEY || '')
            },
            body: JSON.stringify(xzr_payload)
        });
        const xzr_result = await xzr_upstream.json();

        // 课程要求：在控制台完整输出大模型返回的数据
        console.log('\n========== [RAG] 大模型返回的数据 ==========');
        console.log(JSON.stringify(xzr_result, null, 2));

        const xzr_reply = xzr_result.choices && xzr_result.choices[0] && xzr_result.choices[0].message && xzr_result.choices[0].message.content || '';
        xzr_res.json({
            code: 0, msg: 'ok',
            data: {
                reply: xzr_reply,
                sources: xzr_top.map(function (xzr_t) {
                    return { filename: xzr_t.chunk.filename, seq: xzr_t.chunk.seq + 1, score: xzr_t.score };
                })
            }
        });
    } catch (xzr_err) {
        console.error('知识库问答失败:', xzr_err.message);
        xzr_res.json({ code: 1, msg: '问答失败：' + xzr_err.message, data: null });
    }
});

module.exports = XZR_ROUTER;
