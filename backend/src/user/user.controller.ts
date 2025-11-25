import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('secure')
export class UserController {
    /**
     * 受保护的示例接口
     * GET /api/secure/ping
     * 需要在请求头中携带有效的 JWT token
     */
    @UseGuards(JwtAuthGuard)
    @Get('ping')
    async ping(@Request() req) {
        return {
            message: '🎉 认证成功!',
            user: {
                id: req.user.userId,
                email: req.user.email,
            },
            timestamp: new Date().toISOString(),
        };
    }
}
