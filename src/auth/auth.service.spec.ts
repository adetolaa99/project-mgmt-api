import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked_token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should hash a password correctly', async () => {
    const password = 'password123';
    const hashedPassword = await authService.hashPassword(password);

    expect(hashedPassword).not.toEqual(password);
    expect(hashedPassword).toMatch(/^\$2b\$/);
  });

  it('should validate passwords correctly', async () => {
    const password = 'password123';
    const hashedPassword = await authService.hashPassword(password);

    const isValid = await authService.validatePassword(
      password,
      hashedPassword,
    );
    expect(isValid).toBe(true);
  });

  it('should throw ConflictException if email already exists', async () => {
    jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValue({ id: 1, email: 'existing@example.com' } as User);

    await expect(
      authService.createUser({
        email: 'existing@example.com',
        name: 'John Doe',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw UnauthorizedException for invalid login credentials', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(
      authService.validateUser('invalid@example.com', 'wrongpassword'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return an access token on successful login', async () => {
    const user = {
      id: 1,
      name: 'John Doe',
      email: 'valid@example.com',
      password: await authService.hashPassword('password123'),
    };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(authService, 'validatePassword').mockResolvedValue(true);

    const result = await authService.validateUser(
      'valid@example.com',
      'password123',
    );
    expect(result).toEqual({ access_token: 'mocked_token' });
  });
});
