@echo off
echo ========================================
echo 本地 PostgreSQL 数据库设置脚本
echo ========================================
echo.

REM 设置 PostgreSQL 路径
set PGBIN=C:\Program Files\PostgreSQL\18\bin
set PGPASSWORD=postgres

echo 请输入你的 PostgreSQL postgres 用户密码：
set /p PGPASSWORD=密码: 

echo.
echo 正在创建数据库 dictionary_why...
"%PGBIN%\psql.exe" -U postgres -c "CREATE DATABASE dictionary_why;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✓ 数据库创建成功！
) else (
    echo ✗ 数据库可能已存在或创建失败
    echo.
    echo 你也可以使用 pgAdmin 手动创建：
    echo 1. 打开 pgAdmin 4
    echo 2. 右键点击 Databases -^> Create -^> Database
    echo 3. 名称：dictionary_why
)

echo.
echo 下一步：
echo 1. 修改 backend\.env 中的 DATABASE_URL
echo    DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/dictionary_why"
echo.
echo 2. 运行 Prisma 迁移：
echo    cd backend
echo    npx prisma generate
echo    npx prisma migrate dev --name init
echo.
echo 3. 启动服务：
echo    cd ..
echo    npm run dev
echo.
pause
