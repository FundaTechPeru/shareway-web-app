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
import {Router, RouterLink} from '@angular/router';
import {NotificationService} from '../../../core/notifications/notification.service';
import {ComingSoonNotice} from '../../../shared/components/coming-soon-notice/coming-soon-notice';
import {FareEstimate} from '../../model/booking.model';
import {BookingApiService} from '../../services/booking-api.service';

/** Fare estimate (US-03) and reservation (US-04) for a trip request. */
@Component({
  selector: 'app-new-booking-page',
  imports: [
    CurrencyPipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    ComingSoonNotice,
  ],
  templateUrl: './new-booking-page.html',
  styleUrl: './new-booking-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewBookingPage implements OnInit {
  private readonly api = inject(BookingApiService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  /** Query params. */
  readonly requestId = input<string>();
  /**
   * TODO(backend): no endpoint returns the `groupId` that fare and booking
   * need (backend blocker #4 in docs/PROGRESS.md). Until then this page
   * shows the coming-soon state unless a groupId arrives as a query param.
   */
  readonly groupId = input<string>();

  protected readonly fare = signal<FareEstimate | null>(null);
  protected readonly loadingFare = signal(false);
  protected readonly booking = signal(false);
  protected readonly ready = computed(() => !!this.requestId() && !!this.groupId());

  /**
   * One key per reservation attempt: it is created on the first click and
   * reused if the user retries after an error, so the backend can detect
   * duplicates. It is cleared once the booking is accepted.
   */
  private idempotencyKey: string | null = null;

  ngOnInit(): void {
    const groupId = this.groupId();
    if (!groupId) {
      return;
    }
    this.loadingFare.set(true);
    this.api.estimateFare(groupId).subscribe({
      next: fare => {
        this.fare.set(fare);
        this.loadingFare.set(false);
      },
      error: () => this.loadingFare.set(false),
    });
  }

  reserve(): void {
    const requestId = this.requestId();
    const groupId = this.groupId();
    if (!requestId || !groupId || this.booking()) {
      return;
    }
    this.idempotencyKey ??= crypto.randomUUID();
    this.booking.set(true);
    this.api.create({requestId, groupId}, this.idempotencyKey).subscribe({
      next: created => {
        this.idempotencyKey = null;
        this.booking.set(false);
        this.notifications.success('Reserva enviada. Te confirmaremos en breve.');
        void this.router.navigate(['/passenger/bookings', created.bookingId]);
      },
      error: () => this.booking.set(false),
    });
  }
}
