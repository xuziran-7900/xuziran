#!/bin/bash
# ai-xzr 一键启动（徐子然 24002120223）：启动后端并自动打开浏览器
cd "$(dirname "$0")/backend"
npm run dev &
sleep 2
open http://localhost:8224
wait
