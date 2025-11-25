import { IsEmail, IsString, MinLength } from 'class-validator';

// 注册请求数据传输对象
export class RegisterDto {
    @IsEmail({}, { message: '请输入有效的邮箱地址' })
    email: string;

    @IsString({ message: '密码必须是字符串' })
    @MinLength(6, { message: '密码长度至少为 6 位' })
    password: string;
}
