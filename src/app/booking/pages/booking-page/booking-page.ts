import {CurrencyPipe} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {NotificationService} from '../../../core/notifications/notification.service';
import {StatusChip} from '../../../shared/components/status-chip/status-chip';
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONES,
  Booking,
  BookingCancellation,
  BookingStatus,
  isCancellable,
} from '../../model/booking.model';
import {BookingApiService} from '../../services/booking-api.service';

/** Happy path of a booking, used for the progress steps. */
export const BOOKING_STEPS: readonly BookingStatus[] = [
  'REQUESTED',
  'GROUPED',
  'CONFIRMED',
  'BOARDED',
  'IN_PROGRESS',
  'COMPLETED',
];

/** Booking status (US-04) and cancellation (US-12). */
@Component({
  selector: 'app-booking-page',
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    StatusChip,
  ],
  templateUrl: './booking-page.html',
  styleUrl: './booking-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingPage implements OnInit {
  private readonly api = inject(BookingApiService);
  private readonly notifications = inject(NotificationService);

  /** Route param: booking id. */
  readonly id = input.required<string>();

  protected readonly booking = signal<Booking | null>(null);
  protected readonly cancellation = signal<BookingCancellation | null>(null);
  protected readonly loading = signal(true);
  protected readonly cancelling = signal(false);
  protected readonly confirmingCancel = signal(false);
  protected readonly labels = BOOKING_STATUS_LABELS;
  protected readonly tones = BOOKING_STATUS_TONES;
  protected readonly steps = BOOKING_STEPS;

  protected readonly canCancel = computed(() => {
    const booking = this.booking();
    return !!booking && isCancellable(booking.status);
  });
  protected readonly stepIndex = computed(() =>
    BOOKING_STEPS.indexOf(this.booking()?.status ?? 'REQUESTED'),
  );

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.api.get(this.id()).subscribe({
      next: booking => {
        this.booking.set(booking);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  cancel(): void {
    this.confirmingCancel.set(false);
    this.cancelling.set(true);
    this.api.cancel(this.id()).subscribe({
      next: result => {
        this.cancellation.set(result);
        this.booking.set({bookingId: result.bookingId, status: result.status});
        this.cancelling.set(false);
        this.notifications.success('Reserva cancelada.');
      },
      error: () => this.cancelling.set(false),
    });
  }
}
