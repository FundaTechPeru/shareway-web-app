import {CurrencyPipe, DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit, computed, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {StatusChip} from '../../../shared/components/status-chip/status-chip';
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  PaymentResponse,
} from '../../model/payment.model';
import {PaymentsApiService} from '../../services/payments-api.service';

/** Most relevant date of a payment, used to sort the history. */
export function paymentDate(payment: PaymentResponse): string {
  return payment.capturedAt ?? payment.voidedAt ?? payment.authorizedAt ?? '';
}

/** Passenger payment history. */
@Component({
  selector: 'app-payments-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule,
    StatusChip,
  ],
  templateUrl: './payments-page.html',
  styleUrl: './payments-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsPage implements OnInit {
  private readonly api = inject(PaymentsApiService);

  protected readonly payments = signal<PaymentResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly labels = PAYMENT_STATUS_LABELS;
  protected readonly tones = PAYMENT_STATUS_TONES;

  protected readonly sorted = computed(() =>
    [...this.payments()].sort((a, b) => paymentDate(b).localeCompare(paymentDate(a))),
  );

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.api.listMine().subscribe({
      next: payments => {
        this.payments.set(payments);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  /** Captured amount when charged, otherwise the authorized hold. */
  protected amount(payment: PaymentResponse): number {
    return payment.capturedAmount ?? payment.authorizedAmount ?? 0;
  }
}
