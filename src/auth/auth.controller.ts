import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    const hashedPassword = await this.authService.hashPassword(password);
    const newUser = { name, email, password: hashedPassword };
    await this.authService.createUser(newUser);
    return { message: `Welcome, ${name}! Thank you for signing up` };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return this.authService.validateUser(email, password);
  }
}
