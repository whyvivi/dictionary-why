import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    /**
     * 用户注册
     * @param registerDto 注册信息
     * @returns 包含 JWT token 的用户信息
     */
    async register(registerDto: RegisterDto) {
        const { email, password } = registerDto;

        // 检查邮箱是否已存在
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('该邮箱已被注册');
        }

        // 生成密码哈希(加盐 10 轮)
        const passwordHash = await bcrypt.hash(password, 10);

        // 生成默认昵称(使用邮箱前缀)
        const nickname = email.split('@')[0];

        // 默认头像(使用占位图片服务)
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nickname)}&background=random`;

        // 创建用户
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                nickname,
                avatarUrl,
            },
        });

        // 签发 JWT
        const token = this.signToken(user.id, user.email);

        return {
            user: {
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
            },
            token,
        };
    }

    /**
     * 用户登录
     * @param loginDto 登录信息
     * @returns 包含 JWT token 的用户信息
     */
    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // 查找用户
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('邮箱或密码错误');
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('邮箱或密码错误');
        }

        // 签发 JWT
        const token = this.signToken(user.id, user.email);

        return {
            user: {
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
            },
            token,
        };
    }

    /**
     * 获取当前用户信息
     * @param userId 用户 ID
     * @returns 用户信息
     */
    async getCurrentUser(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                nickname: true,
                avatarUrl: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('用户不存在');
        }

        return user;
    }

    /**
     * 签发 JWT token
     * @param userId 用户 ID
     * @param email 用户邮箱
     * @returns JWT token
     */
    private signToken(userId: number, email: string): string {
        const payload = { sub: userId, email };
        return this.jwtService.sign(payload);
    }
}
