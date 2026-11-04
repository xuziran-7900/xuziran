/*
┌──────────────────────────────────────────────────────┐
│ xzr_tab.js — 可复用 Tab 选项卡组件                     │
│ 作者: 徐子然 (xu-ziran)                               │
│ 建立时间: 2026-11-04                                  │
│ 使用大模型: Trae (proprietary model from Trae team)   │
│ 功能名称: 通用 Tab 切换逻辑（监听事件 + 清除旧态 + 设置新态） │
└──────────────────────────────────────────────────────┘
*/

/* ✅ 注释：可复用 Tab 初始化函数
 * 接收一个 Tab 容器选择器，自动为容器内的所有 tab 头绑定点击事件
 * 每个容器可独立使用，不与页面其他 Tab 互相干扰
 * @param {string} xzr_containerSelector Tab 容器的 CSS 选择器（如 '#xzr_news_tab'）
 */
function xzr_initTab(xzr_containerSelector) {
    // 获取当前 Tab 容器（限定作用域，避免多个 Tab 实例冲突）
    const xzr_container = document.querySelector(xzr_containerSelector);
    if (!xzr_container) return;

    // ✅ 注释：获取当前容器内所有 tab 头（按钮/导航项）和对应内容面板
    const xzr_tabItems = xzr_container.querySelectorAll('.xzr_tab-item');
    const xzr_tabPanes = xzr_container.querySelectorAll('.xzr_tab-pane');

    if (xzr_tabItems.length === 0 || xzr_tabPanes.length === 0) return;

    // ✅ 注释：为每个 tab 头绑定点击监听事件
    // 点击触发时：① 先清除所有 tab 头 + 所有内容面板的选中态
    //             ② 再为当前点击的 tab 头 + 对应内容面板设置选中态
    xzr_tabItems.forEach(function (xzr_item) {
        xzr_item.addEventListener('click', function () {
            // --- 第一步：先清除所有选中状态（核心复用逻辑） ---
            xzr_tabItems.forEach(function (i) {
                i.classList.remove('xzr_active');
            });
            xzr_tabPanes.forEach(function (p) {
                p.classList.remove('xzr_active');
            });

            // --- 第二步：再设置当前元素的选中状态 ---
            // 读取当前 tab 头 data-target 属性，匹配对应内容面板的 id
            const xzr_targetId = xzr_item.dataset.target;
            xzr_item.classList.add('xzr_active');
            // 使用选择器激活对应面板（作用域限定在当前容器内，避免多 Tab 冲突）
            xzr_container.querySelector('#' + xzr_targetId).classList.add('xzr_active');
        });
    });

    // ✅ 注释：初始化默认选中项
    // 优先激活带 .xzr_default 类的 tab 头（业务层标记），找不到则激活第一个
    const xzr_defaultItem = xzr_container.querySelector('.xzr_tab-item.xzr_default') || xzr_tabItems[0];
    if (xzr_defaultItem) {
        const xzr_defaultTarget = xzr_defaultItem.dataset.target;
        xzr_defaultItem.classList.add('xzr_active');
        xzr_container.querySelector('#' + xzr_defaultTarget).classList.add('xzr_active');
    }
}

/* ✅ 注释：页面加载完成后，自动初始化当前页面所有带 .xzr_tab_container 类的 Tab
 * 遍历容器数组，逐个调用 xzr_initTab，支持同一页面多个独立 Tab 实例
 */
document.addEventListener('DOMContentLoaded', function () {
    const xzr_allTabContainers = document.querySelectorAll('.xzr_tab_container');
    xzr_allTabContainers.forEach(function (xzr_container) {
        // 用容器自身的 id 作为初始化选择器（无 id 则自动跳过）
        if (xzr_container.id) {
            xzr_initTab('#' + xzr_container.id);
        }
    });
});
