import {ChangeDetectionStrategy, Component, inject, input, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';
import {Role} from '../../model/auth.model';
import {BrandLogo} from '../../../shared/components/brand-logo/brand-logo';
import {NoticeBanner} from '../../../shared/components/notice-banner/notice-banner';
import {ButtonVariantDirective} from '../../../shared/components/button/button-variant';

/** Login and public landing (US-32). */
@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    BrandLogo,
    NoticeBanner,
    ButtonVariantDirective,
  ],
  templateUrl: './login-page.html',
  styleUrl: '../auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Query param set by authGuard. */
  readonly returnUrl = input<string>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly loading = signal(false);
  protected readonly hidePassword = signal(true);
  protected readonly adminNotice = signal(false);

  protected submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.adminNotice.set(false);
    const {email, password} = this.form.getRawValue();
    this.auth.login({email: email.trim(), password}).subscribe({
      next: user => {
        this.loading.set(false);
        if (user.role === 'ADMIN') {
          this.auth.logout({redirect: false});
          this.adminNotice.set(true);
          return;
        }
        void this.router.navigateByUrl(this.targetUrl(user.role));
      },
      error: () => this.loading.set(false),
    });
  }

  /** Honors the returnUrl only when it belongs to the user's own area. */
  private targetUrl(role: Role): string {
    const area = role === 'DRIVER' ? '/driver/' : '/passenger/';
    const url = this.returnUrl();
    return url?.startsWith(area) ? url : this.auth.homeUrl(role);
  }
}
