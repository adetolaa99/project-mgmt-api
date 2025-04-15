import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            createUser: jest.fn().mockResolvedValue({ name: 'John Doe' }),
            validateUser: jest
              .fn()
              .mockResolvedValue({ access_token: 'mocked_token' }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should register a user and return a welcome message', async () => {
    const registerDto: RegisterDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const result = await authController.register(registerDto);
    expect(result).toEqual({
      message: 'Welcome, John Doe! Thank you for signing up.',
    });
    expect(authService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'john@example.com' }),
    );
  });

  it('should return access token on login', async () => {
    const loginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    const result = await authController.login(loginDto);
    expect(result).toEqual({ access_token: 'mocked_token' });
    expect(authService.validateUser).toHaveBeenCalledWith(
      'john@example.com',
      'password123',
    );
  });
});
