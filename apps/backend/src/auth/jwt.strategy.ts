import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Структура JWT токена
interface JwtPayload {
  sub?: string;
  id?: string;
  role?: string;
  [key: string]: any;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
      throw new Error(
        'NEXTAUTH_SECRET is not defined in environment variables',
      );
    }

    // Конфигурация стратегии
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // Валидация и получение токена
  async validate(payload: JwtPayload): Promise<{ id: string; role: string }> {
    const userId = payload.sub || payload.id;
    const userRole = payload.role || 'USER';

    return Promise.resolve({
      id: String(userId),
      role: String(userRole),
    });
  }
}
