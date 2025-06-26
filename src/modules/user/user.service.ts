// src/modules/user/user.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.save(dto);
    return user;
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOneBy({
      username,
    });
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({
      email,
    });

    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id: id });

    if (!user) {
      throw new BadRequestException('User no found');
    }

    await this.userRepository.update(id, dto);

    return { msg: 'updated' };
  }

  async remove(id: number): Promise<null> {
    await this.userRepository.delete(id);
    return null;
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<null> {
    const id = userId;

    await this.userRepository.update(id, { refreshToken });

    return null;
  }
}
