import { IsEmail, IsString } from 'class-validator';

// 登录请求数据传输对象
export class LoginDto {
    @IsEmail({}, { message: '请输入有效的邮箱地址' })
    email: string;

    @IsString({ message: '密码必须是字符串' })
    password: string;
}
