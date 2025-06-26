import {
  Body,
  Controller,
  Headers,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
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

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logOut(@Request() req) {
    const id = req.user.userId;
    await this.userService.updateRefreshToken(id, null);
  }

  @Post('refresh')
  async refresh(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];

    if (!token) throw new UnauthorizedException('Missing token');

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.userService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('Invalid token');

      const isMatched = await bcrypt.compare(token, user.refreshToken);
      if (!isMatched) throw new UnauthorizedException('Invalid token');

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
