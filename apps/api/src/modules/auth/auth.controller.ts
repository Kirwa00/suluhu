import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  requestOtpSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyMfaSchema,
  verifyOtpSchema,
  type ChangePasswordInput,
  type LoginInput,
  type RegisterInput,
  type RequestOtpInput,
  type RequestPasswordResetInput,
  type ResetPasswordInput,
  type VerifyMfaInput,
  type VerifyOtpInput,
} from '@suluhu/shared';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type { AuthenticatedRequest, RequestContext } from './types';

@ApiTags('Auth')
// Stricter rate limit on auth endpoints than the global default (anti-bruteforce).
@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a patient or therapist account' })
  register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterInput,
    @Req() req: Request,
  ) {
    return this.auth.register(dto, ctx(req));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginInput, @Req() req: Request) {
    return this.auth.login(dto, ctx(req));
  }

  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete login by verifying the MFA code' })
  verifyMfa(@Body(new ZodValidationPipe(verifyMfaSchema)) dto: VerifyMfaInput, @Req() req: Request) {
    return this.auth.verifyMfa(dto.mfaToken, dto.code, ctx(req));
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for new tokens' })
  refresh(@Body('refreshToken') refreshToken: string, @Req() req: Request) {
    return this.auth.refresh(refreshToken, ctx(req));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the current session' })
  async logout(@Body('refreshToken') refreshToken: string | undefined, @Req() req: AuthenticatedRequest) {
    await this.auth.logout(refreshToken, req.authJti);
    return { success: true };
  }

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a verification code (phone/email)' })
  async requestOtp(
    @Body(new ZodValidationPipe(requestOtpSchema)) dto: RequestOtpInput,
    @CurrentUser('id') userId: string,
  ) {
    await this.auth.requestOtp(userId, dto.purpose);
    return { sent: true };
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a phone/email code' })
  verifyOtp(
    @Body(new ZodValidationPipe(verifyOtpSchema)) dto: VerifyOtpInput,
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ) {
    return this.auth.verifyOtp(userId, dto.purpose, dto.code, ctx(req));
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password-reset code' })
  async forgotPassword(
    @Body(new ZodValidationPipe(requestPasswordResetSchema)) dto: RequestPasswordResetInput,
  ) {
    await this.auth.requestPasswordReset(dto.email);
    return { sent: true };
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using a code' })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordInput,
    @Req() req: Request,
  ) {
    await this.auth.resetPassword(dto.email, dto.code, dto.password, ctx(req));
    return { reset: true };
  }

  @Post('password/change')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password while authenticated' })
  async changePassword(
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordInput,
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ) {
    await this.auth.changePassword(userId, dto, ctx(req));
    return { changed: true };
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the authenticated principal' })
  me(@CurrentUser() user: AuthenticatedRequest['user']) {
    return user;
  }
}

/** Builds the request context (IP + user agent) for audit logging. */
function ctx(req: Request): RequestContext {
  const forwarded = req.headers['x-forwarded-for'];
  const ipAddress = Array.isArray(forwarded)
    ? forwarded[0]
    : (forwarded?.split(',')[0]?.trim() ?? req.socket.remoteAddress ?? null);
  return { ipAddress, userAgent: req.headers['user-agent'] ?? null };
}
