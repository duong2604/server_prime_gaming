import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { comparedPassword, hashPassword } from 'src/common/utils/password';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && (await comparedPassword(pass, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async register(dto: RegisterDto): Promise<any> {
    const user = await this.userService.findByEmail(dto.email);
    if (user) {
      throw new UnauthorizedException('This email is taken!');
    }
    const hashedPassword = await hashPassword(dto.password);
    const newUser = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    return {
      msg: 'Registered',
      data: { ...newUser },
    };
  }

  async login(user: any) {
    const payload = { sub: user.id, username: user.username };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
