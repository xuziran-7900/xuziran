-- 文件头部注释
-- 姓名：徐子然 | 学号：24002120223 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
-- 说明：本文件按执行顺序记录所有建库、建表与插入数据的 SQL，
--       仅凭此文件即可在新机器上完整重建数据库。

-- ============================================================
-- 执行记录 1：创建数据库（2026-11-20）
-- ============================================================
CREATE DATABASE IF NOT EXISTS xzr_fullstack DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE xzr_fullstack;

CREATE TABLE IF NOT EXISTS xzr_news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    summary VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    publish_time DATETIME NOT NULL,
    cover_img VARCHAR(500) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO xzr_news (title, summary, content, source, publish_time, cover_img) VALUES
('国产大模型推理成本再降 60%，端侧部署成为可能', '多家厂商宣布新一代模型通过稀疏激活与量化技术大幅压缩推理成本，手机端离线运行大模型成为现实。', '新一代稀疏激活架构让每次推理只激活不到十分之一的参数量，配合 INT4 量化与算子融合，端侧推理速度提升约 3 倍。业内人士预计，今年内主流旗舰手机都将预置离线大模型能力。', '科技日报', '2026-11-19 09:30:00', 'https://picsum.photos/seed/xzrnews1/640/360'),
('我国新一代载人飞船试验船返回舱成功着陆', '试验船在轨飞行 3 天后精准返回东风着陆场，为后续载人登月任务积累关键数据。', '本次任务验证了新一代防热材料、群伞减速与气囊缓冲等关键技术，飞船返回舱状态的遥测数据完整回收。科研人员表示，下一次试验将进行全系统联合演练。', '新华社', '2026-11-18 16:00:00', 'https://picsum.photos/seed/xzrnews2/640/360'),
('量子计算原型机「祖冲之三号」实现 512 比特纠缠', '研究团队在新一代超导量子芯片上完成 512 比特纠缠操控，随机线路采样速度再创纪录。', '「祖冲之三号」采用三维封装工艺将比特相干时间提升至 480 微秒，随机线路采样任务在 200 秒内完成，相当于传统超算 6 亿年的运算量。相关成果发表于《自然》杂志。', '人民日报', '2026-11-17 11:00:00', 'https://picsum.photos/seed/xzrnews3/640/360'),
('苹果发布 M6 芯片：3nm 工艺，AI 算力翻倍', 'M6 芯片采用第二代 3nm 制程，神经引擎算力达到 M4 的两倍，能效比提升 40%。', 'M6 系列包含标准版、Pro 与 Max 三个版本，统一内存带宽提升至 400GB/s。搭载机型将于下月开售，首批支持端侧运行 70 亿参数模型的设备名单同步公布。', '澎湃新闻', '2026-11-16 10:00:00', 'https://picsum.photos/seed/xzrnews4/640/360'),
('世界首条跨海真空磁悬浮线路进入铺轨阶段', '设计时速 600 公里的跨海真空管道磁悬浮正式进入铺轨阶段，预计 2028 年通车试运营。', '线路全长 172 公里，其中海底真空隧道段占 121 公里。管道内气压仅为标准大气压的千分之一，列车运行阻力下降 80%。通车后两地通行时间将由 3 小时缩短至 25 分钟。', '央视新闻', '2026-11-15 08:45:00', 'https://picsum.photos/seed/xzrnews5/640/360'),
('AI 天气大模型正式接入国家气象业务系统', '风乌大模型通过业务准入评审，中期预报精度首次全面超越传统数值模式。', '风乌大模型对 10 天内的温度、降水预报平均误差较传统数值模式降低约 18%，单次全球预报计算时间由 4000 核时缩短至 10 分钟。未来将逐步承担台风路径、强对流预警等业务。', '中国气象局', '2026-11-14 14:20:00', 'https://picsum.photos/seed/xzrnews6/640/360'),
('开源 RISC-V 芯片出货量突破 100 亿颗', 'RISC-V International 宣布全球累计出货量突破 100 亿颗，中国市场占比超过 70%。', 'RISC-V 凭借开放指令集与模块化设计，在物联网、汽车与 AI 加速器领域加速渗透。国内多个城市已形成从 IP 核、EDA 工具到整机的完整产业链。', '36 氪', '2026-11-13 09:00:00', 'https://picsum.photos/seed/xzrnews7/640/360'),
('固态电池量产线投产：续航 1500 公里电车下线', '全球首条全固态电池量产线正式投产，首批搭载车型续航突破 1500 公里，充电时间缩短至 9 分钟。', '固态电池能量密度达 500Wh/kg，通过了针刺与 200°C 热箱测试。量产线规划年产能 20GWh，首批车型定位高端市场，2027 年起逐步下放至主流价位段。', '第一财经', '2026-11-12 18:30:00', 'https://picsum.photos/seed/xzrnews8/640/360');

CREATE TABLE IF NOT EXISTS xzr_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(500) NOT NULL,
    img_url VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL,
    create_time DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO xzr_gallery (title, description, img_url, category, create_time) VALUES
('天宫空间站凌月', '空间站从月球正面掠过的瞬间，凌月历时仅 0.7 秒，需要提前计算轨道精准预判。', 'https://picsum.photos/seed/xzrg1/640/420', '太空探索', '2026-11-19 10:00:00'),
('生成式 AI 绘画的算力足迹', '一张 AI 生成的图片背后约消耗 0.3Wh 电能，数据中心正在转向液冷与绿电。', 'https://picsum.photos/seed/xzrg2/640/420', '人工智能', '2026-11-18 15:30:00'),
('RISC-V 开发板全家福', '从 1 元钱的拇指开发板到 64 核服务器芯片，RISC-V 生态在过去一年扩大了三倍。', 'https://picsum.photos/seed/xzrg3/640/420', '硬件', '2026-11-17 09:15:00'),
('量子比特的低温世界', '超导量子芯片工作在接近绝对零度的稀释制冷机中，内部温度比深空还要冷。', 'https://picsum.photos/seed/xzrg4/640/420', '前沿科学', '2026-11-16 11:40:00'),
('深海机器人下潜马里亚纳', '全海深自主水下机器人完成 10909 米下潜，拍摄到深海热液喷口的生物群落。', 'https://picsum.photos/seed/xzrg5/640/420', '海洋科技', '2026-11-15 16:00:00'),
('固态电池剖面结构', '固态电解质取代易燃液态电解液，能量密度提升一倍，是电动车续航革命的关键。', 'https://picsum.photos/seed/xzrg6/640/420', '新能源', '2026-11-14 13:20:00'),
('星链卫星过境轨迹', '长曝光下低轨卫星星座在夜空中划出一串光带，天文台正在与运营商协调规避方案。', 'https://picsum.photos/seed/xzrg7/640/420', '太空探索', '2026-11-13 20:45:00'),
('人形机器人装配车间', '人形机器人开始参与汽车装配线作业，单台成本已降至整车价格的一半以内。', 'https://picsum.photos/seed/xzrg8/640/420', '机器人', '2026-11-12 09:00:00');

---

## 知识库两张表（2026-11-25 · RAG 功能）

```sql
-- 知识库文件表：记录上传并解析过的文件
CREATE TABLE IF NOT EXISTS xzr_kb_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
  file_type VARCHAR(20) NOT NULL COMMENT 'txt/pdf/docx/pptx',
  file_size INT NOT NULL DEFAULT 0 COMMENT '文件字节数',
  chunk_count INT NOT NULL DEFAULT 0 COMMENT '切分出的分块数',
  status VARCHAR(20) NOT NULL DEFAULT 'ready' COMMENT 'ready/failed',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文件表';

-- 知识库分块表：文件解析后切出的文本块（RAG 检索的最小单位）
CREATE TABLE IF NOT EXISTS xzr_kb_chunks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT NOT NULL COMMENT '所属文件 id',
  seq INT NOT NULL DEFAULT 0 COMMENT '分块序号',
  content TEXT NOT NULL COMMENT '分块文本内容',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_xzr_kb_file (file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库分块表';
```

已执行成功（SHOW TABLES 确认两张表存在）。
