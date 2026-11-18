import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';
import {NotificationService} from '../../../core/notifications/notification.service';

/** 8 to 72 characters with at least one letter and one number. */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;
/** Optional "+" followed by 9 to 15 digits. */
export const PHONE_PATTERN = /^\+?\d{9,15}$/;

/** Passenger self-registration (US-31). */
@Component({
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './register-page.html',
  styleUrl: '../auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  protected readonly form = inject(NonNullableFormBuilder).group({
    fullName: ['', [Validators.required, Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(72),
        Validators.pattern(PASSWORD_PATTERN),
      ],
    ],
  });
  protected readonly loading = signal(false);
  protected readonly hidePassword = signal(true);

  protected submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const value = this.form.getRawValue();
    this.auth
      .register({
        fullName: value.fullName.trim(),
        email: value.email.trim(),
        phone: value.phone.trim(),
        password: value.password,
      })
      .subscribe({
        next: user => {
          this.loading.set(false);
          this.notifications.success('¡Bienvenido a ShareWay! Tu cuenta fue creada.');
          void this.router.navigateByUrl(this.auth.homeUrl(user.role));
        },
        error: () => this.loading.set(false),
      });
  }
}
