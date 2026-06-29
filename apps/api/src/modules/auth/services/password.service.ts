import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AppConfigService } from '../../../config/app-config.service';

/** Password hashing with bcrypt at the configured cost factor (SDLC §7). */
@Injectable()
export class PasswordService {
  private readonly saltRounds: number;

  constructor(config: AppConfigService) {
    this.saltRounds = config.security.saltRounds;
  }

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
