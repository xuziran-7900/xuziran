// 姓名：徐子然 | 学号：24002120223 | 时间：2026-11-25 | 大模型：GLM-5.3-Flash
// 功能名称：打开方式守卫（用 file:// 双击打开时：后端在跑就自动跳转正确地址 http://localhost:8224，没跑才显示提示）
(function () {
    if (location.protocol !== 'file:') return;

    // 显示红色提示条
    function xzr_showBar() {
        var xzr_bar = document.createElement('div');
        xzr_bar.style.cssText =
            'position:fixed;top:0;left:0;right:0;z-index:99999;' +
            'background:#c0392b;color:#fff;padding:10px 14px;font-size:13px;' +
            'line-height:1.6;text-align:center;font-family:sans-serif;';
        xzr_bar.innerHTML =
            '⚠️ 后端服务没有启动。请先双击项目根目录的 <b>start.command</b> 启动服务，' +
            '再用浏览器访问 <b>http://localhost:8224</b>';
        document.body.appendChild(xzr_bar);
    }

    // 计算当前页面在服务上的路径（file:///…/frontend/news.html → /news.html）
    var xzr_idx = location.pathname.lastIndexOf('/frontend/');
    var xzr_page = xzr_idx >= 0 ? location.pathname.slice(xzr_idx + '/frontend'.length) : '/index.html';

    // 探测本地后端：在运行就直接跳过去，用户不用手动换地址
    fetch('http://localhost:8224/api/health')
        .then(function (xzr_res) {
            if (xzr_res.ok) location.replace('http://localhost:8224' + xzr_page);
            else xzr_showBar();
        })
        .catch(function () {
            xzr_showBar();
        });
})();
