import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get('/')
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
