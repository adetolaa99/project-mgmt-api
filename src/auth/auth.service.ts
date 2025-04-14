import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //hashing the user password
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  //validating password
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  //generating JWT token
  async generateJwtToken(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  //creating a new user
  async createUser(userDto: Partial<User>) {
    const newUser = this.userRepository.create(userDto);
    return this.userRepository.save(newUser);
  }

  //validating user details
  async validateUser(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await this.validatePassword(password, user.password))) {
      throw new UnauthorizedException(
        'Invalid email or password! Please try again',
      );
    }

    return this.generateJwtToken(user);
  }

  //find a user by ID
  async findUserById(userId: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
