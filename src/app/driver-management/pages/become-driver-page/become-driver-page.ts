import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {Router} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';
import {NotificationService} from '../../../core/notifications/notification.service';
import {PHONE_PATTERN} from '../../../shared/validation/patterns';
import {DriverProfileApiService} from '../../services/driver-profile-api.service';

/** 8 to 12 uppercase letters or digits. */
export const LICENSE_PATTERN = /^[A-Z0-9]{8,12}$/;

type Step = 'profile' | 'relogin';

/**
 * Creates the driver profile (US-16). The backend turns the user into a
 * DRIVER, but the current token still says PASSENGER, so the user must log in
 * again: the second step asks for the password and refreshes the session.
 */
@Component({
  selector: 'app-become-driver-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './become-driver-page.html',
  styleUrl: './become-driver-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BecomeDriverPage {
  private readonly api = inject(DriverProfileApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly step = signal<Step>('profile');
  protected readonly loading = signal(false);

  protected readonly form = this.fb.group({
    licenseNumber: ['', [Validators.required, Validators.pattern(LICENSE_PATTERN)]],
    emergencyContact: this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/\S/)]],
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      relationship: ['', [Validators.required, Validators.pattern(/\S/)]],
    }),
  });

  protected readonly reloginForm = this.fb.group({
    password: ['', Validators.required],
  });

  /** Keeps the license in uppercase while typing. */
  protected upperCaseLicense(): void {
    const control = this.form.controls.licenseNumber;
    const value = control.value.toUpperCase().replace(/\s/g, '');
    if (value !== control.value) {
      control.setValue(value);
    }
  }

  protected submitProfile(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    const {licenseNumber, emergencyContact} = this.form.getRawValue();
    this.loading.set(true);
    this.api
      .create({
        licenseNumber,
        emergencyContact: {
          name: emergencyContact.name.trim(),
          phone: emergencyContact.phone.trim(),
          relationship: emergencyContact.relationship.trim(),
        },
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.step.set('relogin');
        },
        error: () => this.loading.set(false),
      });
  }

  protected relogin(): void {
    const email = this.auth.currentUser()?.email;
    if (!email) {
      this.logoutAndLogin();
      return;
    }
    if (this.reloginForm.invalid || this.loading()) {
      this.reloginForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.login({email, password: this.reloginForm.getRawValue().password}).subscribe({
      next: user => {
        this.loading.set(false);
        this.notifications.success('¡Listo! Ahora eres conductor. Sube tus documentos.');
        void this.router.navigateByUrl(this.auth.homeUrl(user.role));
      },
      error: () => this.loading.set(false),
    });
  }

  protected logoutAndLogin(): void {
    this.auth.logout();
  }
}
