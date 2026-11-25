// 姓名：徐子然 | 学号：24002120223 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
// 功能名称：全站 canvas 背景动画（彩虹粒子 + 连线，适配窗口尺寸，尊重减少动效设置）
(function () {
    var xzr_canvas = document.getElementById('xzrBgCanvas');
    if (!xzr_canvas) return;

    var xzr_ctx = xzr_canvas.getContext('2d');
    var xzr_colors = ['#ff6ec7', '#ff9d5c', '#ffd93d', '#5ce0b2', '#5cb7ff', '#a78bfa'];
    var xzr_particles = [];
    var XZR_COUNT = 56;
    var XZR_LINK_DIST = 130;

    // 初始化粒子：随机位置、速度与颜色
    function xzr_init() {
        xzr_particles = [];
        for (var xzr_i = 0; xzr_i < XZR_COUNT; xzr_i++) {
            xzr_particles.push({
                x: Math.random() * xzr_canvas.width,
                y: Math.random() * xzr_canvas.height,
                vx: (Math.random() - 0.5) * 0.7,
                vy: (Math.random() - 0.5) * 0.7,
                r: 1.5 + Math.random() * 2.5,
                c: xzr_colors[xzr_i % xzr_colors.length]
            });
        }
    }

    // 按窗口大小重设画布尺寸（含高分屏放大）
    function xzr_resize() {
        var xzr_dpr = window.devicePixelRatio || 1;
        xzr_canvas.width = window.innerWidth * xzr_dpr;
        xzr_canvas.height = window.innerHeight * xzr_dpr;
        xzr_ctx.setTransform(xzr_dpr, 0, 0, xzr_dpr, 0, 0);
        xzr_init();
    }

    // 逐帧绘制：粒子漂移 + 距离近的粒子之间画连线
    function xzr_draw() {
        xzr_ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (var xzr_i = 0; xzr_i < xzr_particles.length; xzr_i++) {
            var xzr_p = xzr_particles[xzr_i];
            xzr_p.x += xzr_p.vx;
            xzr_p.y += xzr_p.vy;

            // 边缘环绕，粒子永远在场
            if (xzr_p.x < 0) xzr_p.x = window.innerWidth;
            if (xzr_p.x > window.innerWidth) xzr_p.x = 0;
            if (xzr_p.y < 0) xzr_p.y = window.innerHeight;
            if (xzr_p.y > window.innerHeight) xzr_p.y = 0;

            xzr_ctx.beginPath();
            xzr_ctx.arc(xzr_p.x, xzr_p.y, xzr_p.r, 0, Math.PI * 2);
            xzr_ctx.fillStyle = xzr_p.c;
            xzr_ctx.globalAlpha = 0.75;
            xzr_ctx.fill();
        }

        // 粒子间连线
        for (var xzr_a = 0; xzr_a < xzr_particles.length; xzr_a++) {
            for (var xzr_b = xzr_a + 1; xzr_b < xzr_particles.length; xzr_b++) {
                var xzr_pa = xzr_particles[xzr_a];
                var xzr_pb = xzr_particles[xzr_b];
                var xzr_dx = xzr_pa.x - xzr_pb.x;
                var xzr_dy = xzr_pa.y - xzr_pb.y;
                var xzr_dist = Math.sqrt(xzr_dx * xzr_dx + xzr_dy * xzr_dy);
                if (xzr_dist < XZR_LINK_DIST) {
                    xzr_ctx.beginPath();
                    xzr_ctx.moveTo(xzr_pa.x, xzr_pa.y);
                    xzr_ctx.lineTo(xzr_pb.x, xzr_pb.y);
                    xzr_ctx.strokeStyle = xzr_pa.c;
                    xzr_ctx.globalAlpha = 0.14 * (1 - xzr_dist / XZR_LINK_DIST);
                    xzr_ctx.lineWidth = 1;
                    xzr_ctx.stroke();
                }
            }
        }

        xzr_ctx.globalAlpha = 1;
        requestAnimationFrame(xzr_draw);
    }

    xzr_resize();
    window.addEventListener('resize', xzr_resize);

    // 用户开启"减少动态效果"时只画一帧静态图
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        xzr_draw();
        return;
    }
    requestAnimationFrame(xzr_draw);
})();
