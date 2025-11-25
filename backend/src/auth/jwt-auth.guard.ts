import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT 认证守卫
 * 用于保护需要登录才能访问的接口
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
