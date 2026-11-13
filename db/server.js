/*
┌─────────────────────────────────────────────────┐
│ 作者: 徐子然 (xu-ziran)                         │
│ 建立时间: 2026-11-13                            │
│ 使用大模型: Trae (proprietary model from Trae team) │
│ 功能名称: 诗词数据服务器 · 提供 /api/poems 与 /api/authors 两个接口 │
└─────────────────────────────────────────────────┘
*/
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const xzr_port = 3004;

// 读取并解析同目录下的 db.json，返回整个对象（含 poems 与 authors）
function xzr_readDb() {
  const xzr_raw = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8');
  return JSON.parse(xzr_raw);
}

// 允许 file:// 直接打开的页面跨域请求本服务（省去前端启动服务器的麻烦）
app.use(function (req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

// 接口一：返回诗词数组
app.get('/api/poems', function (req, res) {
  const xzr_db = xzr_readDb();
  res.json(xzr_db.poems);
});

// 接口二：返回作者数组（任务二新增）
app.get('/api/authors', function (req, res) {
  const xzr_db = xzr_readDb();
  res.json(xzr_db.authors);
});

// 启动服务并打印两个接口地址，方便直接点开验证
app.listen(xzr_port, function () {
  console.log('数据服务器已启动：http://localhost:' + xzr_port + '/api/poems');
  console.log('作者接口：http://localhost:' + xzr_port + '/api/authors');
});
