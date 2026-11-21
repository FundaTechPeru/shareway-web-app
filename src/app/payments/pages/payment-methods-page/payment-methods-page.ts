import {ChangeDetectionStrategy, Component, OnInit, inject, signal} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSelectModule} from '@angular/material/select';
import {environment} from '../../../../environments/environment';
import {NotificationService} from '../../../core/notifications/notification.service';
import {
  CARD_BRANDS,
  CARD_BRAND_LABELS,
  CardBrand,
  PaymentMethodResponse,
  simulatedCardToken,
} from '../../model/payment.model';
import {PaymentMethodsApiService} from '../../services/payment-methods-api.service';
import {Card} from '../../../shared/components/card/card';
import {EmptyState} from '../../../shared/components/empty-state/empty-state';
import {NoticeBanner} from '../../../shared/components/notice-banner/notice-banner';
import {ButtonVariantDirective} from '../../../shared/components/button/button-variant';

/** The card must not be expired at the end of its expiration month. */
export function notExpiredValidator(
  control: AbstractControl,
  now = new Date(),
): ValidationErrors | null {
  const {expMonth, expYear} = control.value as {expMonth: number | null; expYear: number | null};
  if (!expMonth || !expYear) {
    return null;
  }
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return expYear > year || (expYear === year && expMonth >= month) ? null : {expired: true};
}

/**
 * Passenger cards. Only brand, last 4 digits and expiration are captured; the
 * card token is simulated (`tok_<uuid>`), the full number is never asked.
 */
@Component({
  selector: 'app-payment-methods-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    Card,
    EmptyState,
    NoticeBanner,
    ButtonVariantDirective,
  ],
  templateUrl: './payment-methods-page.html',
  styleUrl: './payment-methods-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodsPage implements OnInit {
  private readonly api = inject(PaymentMethodsApiService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly brands = CARD_BRANDS;
  protected readonly brandLabels = CARD_BRAND_LABELS;
  protected readonly months = Array.from({length: 12}, (_, i) => i + 1);
  protected readonly years = Array.from({length: 15}, (_, i) => new Date().getFullYear() + i);
  /** Lets testers simulate a declined card outside production. */
  protected readonly canSimulateDecline = !environment.production;

  protected readonly methods = signal<PaymentMethodResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly saving = signal(false);
  protected readonly showForm = signal(false);
  protected readonly confirmingDelete = signal<string | null>(null);
  protected readonly deleting = signal<string | null>(null);

  readonly form = this.fb.group(
    {
      brand: this.fb.control<CardBrand | ''>('', Validators.required),
      last4: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      expMonth: this.fb.control<number | null>(null, Validators.required),
      expYear: this.fb.control<number | null>(null, Validators.required),
      simulateDecline: [false],
    },
    {validators: control => notExpiredValidator(control)},
  );

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.api.list().subscribe({
      next: methods => {
        this.methods.set(methods);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  protected openForm(): void {
    this.form.reset();
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.api
      .create({
        cardToken: simulatedCardToken(value.simulateDecline),
        brand: value.brand as CardBrand,
        last4: value.last4,
        expMonth: value.expMonth!,
        expYear: value.expYear!,
      })
      .subscribe({
        next: method => {
          this.methods.update(list => [...list, method]);
          this.saving.set(false);
          this.showForm.set(false);
          this.notifications.success('Tarjeta agregada.');
        },
        error: () => this.saving.set(false),
      });
  }

  remove(id: string): void {
    this.confirmingDelete.set(null);
    this.deleting.set(id);
    this.api.delete(id).subscribe({
      next: () => {
        this.methods.update(list => list.filter(m => m.id !== id));
        this.deleting.set(null);
        this.notifications.success('Tarjeta eliminada.');
      },
      error: () => this.deleting.set(null),
    });
  }
}
