import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            // 从请求头的 Authorization Bearer token 中提取 JWT
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // 使用环境变量中的密钥
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    /**
     * 验证 JWT payload
     * @param payload JWT 载荷
     * @returns 用户信息(会被注入到 request.user)
     */
    async validate(payload: any) {
        return {
            id: payload.sub,
            email: payload.email,
        };
    }
}
