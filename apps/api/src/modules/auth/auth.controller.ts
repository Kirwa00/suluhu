import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  AUTH_LOGIN_RATE_LIMIT,
  AUTH_MFA_VERIFY_RATE_LIMIT,
  AUTH_OTP_REQUEST_RATE_LIMIT,
  AUTH_OTP_VERIFY_RATE_LIMIT,
  AUTH_PASSWORD_FORGOT_RATE_LIMIT,
  AUTH_RATE_LIMIT_TTL_MS,
  OTP_LENGTH,
  RATE_LIMIT_PER_USER_PER_MIN,
  changePasswordSchema,
  googleLoginSchema,
  googleRegisterSchema,
  loginSchema,
  registerSchema,
  requestOtpSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyMfaSchema,
  verifyOtpSchema,
  type ChangePasswordInput,
  type GoogleLoginInput,
  type GoogleRegisterInput,
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
import { AppException } from '../../common/exceptions/app.exception';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type { AuthenticatedRequest, RequestContext } from './types';

@ApiTags('Auth')
// Stricter rate limit on auth endpoints than the global default (anti-bruteforce).
@Throttle({ default: { limit: 10, ttl: 60_000 } })
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly notifications: NotificationsService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a patient or therapist account' })
  register(@Body(new ZodValidationPipe(registerSchema)) dto: RegisterInput, @Req() req: Request) {
    return this.auth.register(dto, ctx(req));
  }

  @Public()
  @Throttle({ default: { limit: AUTH_LOGIN_RATE_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginInput, @Req() req: Request) {
    return this.auth.login(dto, ctx(req));
  }

  @Public()
  @Throttle({ default: { limit: AUTH_LOGIN_RATE_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with a Google ID token' })
  google(
    @Body(new ZodValidationPipe(googleLoginSchema)) dto: GoogleLoginInput,
    @Req() req: Request,
  ) {
    return this.auth.loginWithGoogle(dto.credential, ctx(req));
  }

  @Public()
  @Throttle({ default: { limit: AUTH_LOGIN_RATE_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
  @Post('google/register')
  @ApiOperation({ summary: 'Create an account from a Google ID token' })
  googleRegister(
    @Body(new ZodValidationPipe(googleRegisterSchema)) dto: GoogleRegisterInput,
    @Req() req: Request,
  ) {
    return this.auth.registerWithGoogle(dto, ctx(req));
  }

  @Public()
  @Throttle({ default: { limit: AUTH_MFA_VERIFY_RATE_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete login by verifying the MFA code' })
  verifyMfa(
    @Body(new ZodValidationPipe(verifyMfaSchema)) dto: VerifyMfaInput,
    @Req() req: Request,
  ) {
    return this.auth.verifyMfa(dto.mfaToken, dto.code, ctx(req));
  }

  // Called on page loads to restore the session; the strict class limit logged users out.
  @Public()
  @Throttle({ default: { limit: RATE_LIMIT_PER_USER_PER_MIN, ttl: AUTH_RATE_LIMIT_TTL_MS } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for new tokens' })
  refresh(@Body('refreshToken') refreshToken: string, @Req() req: Request) {
    return this.auth.refresh(refreshToken, ctx(req));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the current session' })
  async logout(
    @Body('refreshToken') refreshToken: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.auth.logout(refreshToken, req.authJti);
    return { success: true };
  }

  @Throttle({ default: { limit: AUTH_OTP_REQUEST_RATE_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
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

  @Throttle({ default: { limit: AUTH_OTP_VERIFY_RATE_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
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
  @Throttle({ default: { limit: AUTH_PASSWORD_FORGOT_RATE_LIMIT, ttl: AUTH_RATE_LIMIT_TTL_MS } })
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

  @Throttle({ default: { limit: RATE_LIMIT_PER_USER_PER_MIN, ttl: AUTH_RATE_LIMIT_TTL_MS } })
  @Get('me')
  @ApiOperation({ summary: 'Return the authenticated principal' })
  me(@CurrentUser() user: AuthenticatedRequest['user']) {
    return user;
  }

  /**
   * Test-only: retrieves the OTP code last sent to `to` via a mock provider,
   * so e2e tests can complete MFA/verification flows without a real SMS/email
   * provider. Hard-gated to NODE_ENV==='test' — 404s otherwise, including in
   * development, so this never exists outside CI/test runs.
   */
  @Public()
  @Get('test/otp')
  @ApiExcludeEndpoint()
  testOtp(@Query('to') to: string) {
    if (process.env.NODE_ENV !== 'test') {
      throw AppException.notFound();
    }
    const message = this.notifications.getLastMockMessage(to);
    const match = message?.match(new RegExp(`is (\\d{${OTP_LENGTH}})\\.`));
    if (!match) {
      throw AppException.notFound('No code found for this recipient');
    }
    return { code: match[1] };
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
