// 后面所有的注释和相关说明都要用中文
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    // 创建 Nest 应用
    const app = await NestFactory.create(AppModule);

    /**
     * CORS 跨域配置
     * 
     * 从环境变量 FRONTEND_ORIGIN 读取允许的前端域名
     * 
     * 【本地开发环境】
     * - 如果未设置 FRONTEND_ORIGIN，默认允许 http://localhost:5173 访问
     * - 这是 Vite 默认的开发服务器端口
     * 
     * 【云端部署环境（Render）】
     * - 需要在 Render 环境变量中设置 FRONTEND_ORIGIN
     * - 例如：FRONTEND_ORIGIN="https://your-frontend.vercel.app"
     * - 这样可以限制只有指定的前端域名能访问后端 API，提高安全性
     */
    const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

    app.enableCors({
        origin: allowedOrigin,      // 允许的前端域名
        credentials: true,            // 允许携带凭证（cookies、authorization headers 等）
    });

    // 设置全局路由前缀为 /api
    app.setGlobalPrefix('api');

    /**
     * 端口配置
     * 
     * 【云端部署环境（Render）】
     * - Render 会通过环境变量 PORT 指定端口，优先读取
     * 
     * 【本地开发环境】
     * - 如果没有 PORT 环境变量，默认使用 3000 端口
     */
    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`应用已启动，监听端口: ${port}`);
    console.log(`允许的前端域名: ${allowedOrigin}`);
}
bootstrap();
