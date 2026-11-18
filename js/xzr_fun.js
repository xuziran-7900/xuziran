/* ===========================================================================
   彩虹糖果主题 · 趣味粒子
   作者：徐子然 (xu-ziran)
   建立时间：2026-11-18
   说明：在指定元素中心撒出彩纸纸屑；并提供录屏占位槽的显隐切换
   =========================================================================== */

(function () {
    var xzr_colors = ['#ff5fa2', '#ffa94d', '#ffd93d', '#37d67a', '#45a8ff', '#9b6bff'];

    // 在目标元素中心撒出彩色纸屑，xzr_amount 为数量（默认 14）
    function xzr_burst(xzr_target, xzr_amount) {
        if (!xzr_target) return;

        // 尊重系统「减少动态效果」设置，开启时不撒纸屑
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var xzr_rect = xzr_target.getBoundingClientRect();
        var xzr_cx = xzr_rect.left + xzr_rect.width / 2;
        var xzr_cy = xzr_rect.top + xzr_rect.height / 2;
        var xzr_count = xzr_amount || 14;

        for (var xzr_i = 0; xzr_i < xzr_count; xzr_i++) {
            var xzr_piece = document.createElement('span');
            xzr_piece.className = 'xzr_confetti';

            var xzr_w = 6 + Math.random() * 7;
            xzr_piece.style.width = xzr_w + 'px';
            xzr_piece.style.height = xzr_w * (0.6 + Math.random() * 0.8) + 'px';
            xzr_piece.style.background = xzr_colors[xzr_i % xzr_colors.length];
            xzr_piece.style.left = xzr_cx + 'px';
            xzr_piece.style.top = xzr_cy + 'px';
            xzr_piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
            document.body.appendChild(xzr_piece);

            // 以 360 度均匀散开，附加随机偏移避免整齐得像刻度盘
            var xzr_angle = (Math.PI * 2 * xzr_i) / xzr_count + Math.random() * 0.7;
            var xzr_dist = 60 + Math.random() * 95;
            var xzr_dx = Math.cos(xzr_angle) * xzr_dist;
            var xzr_dy = Math.sin(xzr_angle) * xzr_dist - 26;
            var xzr_rotate = (Math.random() - 0.5) * 360;

            var xzr_anim = xzr_piece.animate([
                { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
                {
                    transform: 'translate(calc(-50% + ' + xzr_dx + 'px), calc(-50% + ' + xzr_dy + 'px)) scale(1) rotate(' + xzr_rotate + 'deg)',
                    opacity: 0.95,
                    offset: 0.55
                },
                {
                    transform: 'translate(calc(-50% + ' + xzr_dx + 'px), calc(-50% + ' + (xzr_dy + 90) + 'px)) scale(0.75) rotate(' + xzr_rotate * 1.6 + 'deg)',
                    opacity: 0
                }
            ], {
                duration: 700 + Math.random() * 320,
                easing: 'cubic-bezier(0.16, 0.8, 0.3, 1)'
            });

            // 动画结束后移除节点，避免页面里堆积无用元素
            xzr_anim.onfinish = (function (xzr_node) {
                return function () {
                    if (xzr_node.parentNode) xzr_node.parentNode.removeChild(xzr_node);
                };
            })(xzr_piece);
        }
    }

    window.xzr_burst = xzr_burst;

    // 录屏占位槽：视频能播放时自动替换占位图，放不出来就保留占位提示
    function xzr_setupVideoSlot(xzr_slotId) {
        var xzr_slot = document.getElementById(xzr_slotId);
        if (!xzr_slot) return;

        var xzr_video = xzr_slot.querySelector('video');
        var xzr_empty = xzr_slot.querySelector('.xzr_video-empty');
        if (!xzr_video || !xzr_empty) return;

        // 显示视频并隐藏占位文字
        function xzr_showVideo() {
            xzr_video.hidden = false;
            xzr_empty.hidden = true;
        }

        // 视频已就绪（例如缓存过）直接显示
        if (xzr_video.readyState >= 2) {
            xzr_showVideo();
            return;
        }

        // 加载成功显示视频；加载失败保留占位，不报错不白屏
        xzr_video.addEventListener('loadeddata', xzr_showVideo);
        xzr_video.addEventListener('error', function () {
            xzr_video.hidden = true;
            xzr_empty.hidden = false;
        });
    }

    window.xzr_setupVideoSlot = xzr_setupVideoSlot;
})();
