import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateToken } from '../middleware/auth';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { validateEmail } from '../utils/validation';
import logger from '../utils/logger';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '../types';

class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { email, password, name } = data;

    // Validate email
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ValidationError('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        role: 'USER',
      },
    });

    logger.info(`New user registered: ${user.email}`);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        role: user.role,
        workspaceId: user.workspaceId || undefined,
      },
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    logger.info(`User logged in: ${user.email}`);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        role: user.role,
        workspaceId: user.workspaceId || undefined,
      },
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
      workspaceId: user.workspaceId || undefined,
    };
  }
}

export default new AuthService();
