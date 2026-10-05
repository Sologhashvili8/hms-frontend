import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { ApiResponse } from '../models/api-response.model';
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest
} from '../models/auth.model';

const TOKEN_KEY = 'hms_token';
const ROLES_KEY = 'hms_roles';
const EMAIL_KEY = 'hms_email';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/auth`;

  private readonly rolesSignal = signal<string[]>(this.readRoles());
  private readonly emailSignal = signal<string | null>(localStorage.getItem(EMAIL_KEY));

  readonly roles = this.rolesSignal.asReadonly();
  readonly email = this.emailSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.rolesSignal().length > 0);
  readonly isAdmin = computed(() => this.rolesSignal().includes('Admin'));
  readonly isManager = computed(() => this.rolesSignal().includes('Manager'));
  readonly isGuest = computed(() => this.rolesSignal().includes('Guest'));

  login(dto: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, dto)
      .pipe(
        map((res) => res.data),
        tap((auth) => this.persistSession(auth))
      );
  }

  register(dto: RegisterRequest): Observable<void> {
    return this.http
      .post<ApiResponse<object>>(`${this.baseUrl}/register`, dto)
      .pipe(map(() => undefined));
  }

  verifyEmail(dto: VerifyEmailRequest): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/verify-email`, dto)
      .pipe(
        map((res) => res.data),
        tap((auth) => this.persistSession(auth))
      );
  }

  resendVerification(email: string): Observable<void> {
    return this.http
      .post<ApiResponse<object>>(`${this.baseUrl}/resend-verification`, { email })
      .pipe(map(() => undefined));
  }

  forgotPassword(dto: ForgotPasswordRequest): Observable<void> {
    return this.http
      .post<ApiResponse<object>>(`${this.baseUrl}/forgot-password`, dto)
      .pipe(map(() => undefined));
  }

  resetPassword(dto: ResetPasswordRequest): Observable<void> {
    return this.http
      .post<ApiResponse<object>>(`${this.baseUrl}/reset-password`, dto)
      .pipe(map(() => undefined));
  }

  sendChangePasswordCode(): Observable<void> {
    return this.http
      .post<ApiResponse<object>>(`${this.baseUrl}/change-password/send-code`, {})
      .pipe(map(() => undefined));
  }

  changePassword(dto: ChangePasswordRequest): Observable<void> {
    return this.http
      .post<ApiResponse<object>>(`${this.baseUrl}/change-password`, dto)
      .pipe(map(() => undefined));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLES_KEY);
    localStorage.removeItem(EMAIL_KEY);
    this.rolesSignal.set([]);
    this.emailSignal.set(null);
  }

  private persistSession(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(ROLES_KEY, JSON.stringify(auth.roles));
    localStorage.setItem(EMAIL_KEY, auth.email);
    this.rolesSignal.set(auth.roles);
    this.emailSignal.set(auth.email);
  }

  private readRoles(): string[] {
    try {
      const raw = localStorage.getItem(ROLES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
