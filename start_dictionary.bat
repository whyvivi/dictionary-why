@echo off
chcp 65001 >nul
echo ========================================
echo 启动词典应用
echo ========================================
echo.
echo 正在启动后端服务器 (端口 3000)...
start "词典后端" cmd /k "cd /d %~dp0backend && npm run dev"
echo.
echo 正在启动前端服务器 (端口 5173)...
start "词典前端" cmd /k "cd /d %~dp0frontend && npm run dev"
echo.
echo ========================================
echo 启动完成！
echo ========================================
echo 后端服务器: http://localhost:3000
echo 前端应用: http://localhost:5173
echo.
echo 请等待几秒钟让服务器完全启动...
echo 然后在浏览器中访问: http://localhost:5173
echo.
pause
