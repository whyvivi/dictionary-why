-- 创建本地开发数据库
-- 在 pgAdmin 或 psql 中执行此脚本

-- 1. 连接到 postgres 数据库（默认）

-- 2. 创建 dictionary_why 数据库（如果不存在）
CREATE DATABASE dictionary_why
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Chinese (Simplified)_China.936'
    LC_CTYPE = 'Chinese (Simplified)_China.936'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 3. 验证数据库已创建
-- \l （在 psql 中运行以列出所有数据库）
