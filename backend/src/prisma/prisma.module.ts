import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()  // 使 PrismaService 在全局可用
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }
