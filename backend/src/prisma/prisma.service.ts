import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    // 模块初始化时连接数据库
    async onModuleInit() {
        await this.$connect();
        console.log('✅ 数据库连接成功');
    }

    // 模块销毁时断开数据库连接
    async onModuleDestroy() {
        await this.$disconnect();
        console.log('👋 数据库连接已断开');
    }
}
