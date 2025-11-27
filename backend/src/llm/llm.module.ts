import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SiliconFlowProvider } from './siliconflow.provider';

/**
 * LLM 模块
 * 封装所有与大语言模型相关的功能
 * 
 * 当前支持：
 * - 硅基流动的 DeepSeek 模型（用于生成例句）
 */
@Module({
    imports: [ConfigModule], // 导入 ConfigModule 以便读取环境变量
    providers: [SiliconFlowProvider], // 注册 SiliconFlowProvider
    exports: [SiliconFlowProvider],   // 导出 SiliconFlowProvider，供其他模块使用
})
export class LlmModule { }
