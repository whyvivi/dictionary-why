// 后面所有的注释和相关说明都要用中文
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    // 创建 Nest 应用
    const app = await NestFactory.create(AppModule);

    // 启用 CORS，先允许所有来源，方便本地 + Vercel 联调
    app.enableCors({
        origin: true,          // true 表示接受任意 Origin，后续上线可以改成指定域名数组
        credentials: true,     // 如果后面要用到 cookie，可以保留
    });

    // 设置全局路由前缀为 /api
    app.setGlobalPrefix('api');

    // Render 会通过环境变量 PORT 指定端口，这里要优先读取
    const port = process.env.PORT || 3000;
    await app.listen(port);
}
bootstrap();
