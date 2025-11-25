import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 设置全局路由前缀
    app.setGlobalPrefix('api');

    // 启用全局验证管道
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,  // 自动移除未定义的属性
            transform: true,  // 自动转换类型
        }),
    );

    // 启用 CORS,允许前端跨域请求
    app.enableCors({
        origin: ['http://localhost:5173', 'http://localhost:3000'],  // 允许的前端地址
        credentials: true,
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 后端服务已启动: http://localhost:${port}`);
    console.log(`📚 API 文档: http://localhost:${port}/api`);
}

bootstrap();
