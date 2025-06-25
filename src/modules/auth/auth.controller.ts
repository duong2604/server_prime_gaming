import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) throw new Error('Invalid credentials');
    return this.authService.login(user);
  }

  @Post('refresh')
  refresh(@Headers('authorization') authHeader: string) {
    const refreshToken = authHeader?.split(' ')[1];

    if (!refreshToken) throw new UnauthorizedException('Missing token');

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const accessToken = this.jwtService.sign({
        sub: payload.sub,
        username: payload.username,
      });

      return { access_token: accessToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
