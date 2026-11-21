import {DatePipe} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {RouterLink} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../../../core/auth/auth.service';
import {NotificationService} from '../../../core/notifications/notification.service';
import {StatusChip} from '../../../shared/components/status-chip/status-chip';
import {
  Boarding,
  BoardingResult,
  TRIP_STATUS_LABELS,
  TRIP_STATUS_TONES,
  Trip,
} from '../../model/trip.model';
import {TripExecutionApiService} from '../../services/trip-execution-api.service';
import {Card} from '../../../shared/components/card/card';
import {EmptyState} from '../../../shared/components/empty-state/empty-state';
import {NoticeBanner} from '../../../shared/components/notice-banner/notice-banner';
import {ButtonVariantDirective} from '../../../shared/components/button/button-variant';

/** Boarding PIN: 4 to 6 digits. */
export const PIN_PATTERN = /^\d{4,6}$/;

/** Trip view for the driver: validate boarding with PIN, start and finish. */
@Component({
  selector: 'app-trip-page',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    StatusChip,
    Card,
    EmptyState,
    NoticeBanner,
    ButtonVariantDirective,
  ],
  templateUrl: './trip-page.html',
  styleUrl: './trip-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripPage implements OnInit {
  private readonly api = inject(TripExecutionApiService);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  /** Route param. */
  readonly id = input.required<string>();

  protected readonly trip = signal<Trip | null>(null);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly confirmingCancel = signal(false);
  protected readonly lastResults = signal<Record<string, BoardingResult>>({});
  protected readonly labels = TRIP_STATUS_LABELS;
  protected readonly tones = TRIP_STATUS_TONES;

  /** One PIN control per booking. */
  readonly pins = new Map<string, FormControl<string>>();
  readonly cancelReason = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/)],
  });

  private readonly driverId = computed(() => this.auth.currentUser()?.id ?? '');
  /** TODO(backend): Trip Execution has no auth; this check is client-side only. */
  protected readonly isMine = computed(() => this.trip()?.driverId === this.driverId());
  protected readonly boardedCount = computed(
    () => this.trip()?.boardings.filter(b => b.boarded).length ?? 0,
  );

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.api.get(this.id()).subscribe({
      next: trip => {
        for (const boarding of trip.boardings) {
          if (!this.pins.has(boarding.bookingId)) {
            this.pins.set(
              boarding.bookingId,
              new FormControl('', {
                nonNullable: true,
                validators: [Validators.required, Validators.pattern(PIN_PATTERN)],
              }),
            );
          }
        }
        this.trip.set(trip);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected pin(boarding: Boarding): FormControl<string> {
    return this.pins.get(boarding.bookingId)!;
  }

  validate(boarding: Boarding): void {
    const control = this.pin(boarding);
    if (control.invalid || this.busy()) {
      control.markAsTouched();
      return;
    }
    this.busy.set(true);
    this.api
      .validateBoarding(this.id(), {
        driverId: this.driverId(),
        bookingId: boarding.bookingId,
        code: control.value,
        method: 'PIN',
      })
      .subscribe({
        next: result => {
          this.lastResults.update(r => ({...r, [boarding.bookingId]: result}));
          this.busy.set(false);
          control.reset();
          if (result.outcome === 'VALID') {
            this.notifications.success('Abordaje validado.');
          } else if (result.outcome === 'LOCKED') {
            this.notifications.error('Abordaje bloqueado por demasiados intentos fallidos.');
          } else {
            this.notifications.error(
              `PIN incorrecto. Te quedan ${result.remainingAttempts} intento(s).`,
            );
          }
          this.load();
        },
        error: () => this.busy.set(false),
      });
  }

  start(): void {
    this.run(this.api.start(this.id(), this.driverId()), 'Viaje iniciado.');
  }

  finish(): void {
    this.run(this.api.finish(this.id(), this.driverId()), 'Viaje finalizado.');
  }

  cancel(): void {
    if (this.cancelReason.invalid) {
      this.cancelReason.markAsTouched();
      return;
    }
    this.confirmingCancel.set(false);
    this.run(this.api.cancel(this.id(), this.cancelReason.value.trim()), 'Viaje cancelado.');
  }

  private run(action: Observable<void>, message: string): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    action.subscribe({
      next: () => {
        this.busy.set(false);
        this.notifications.success(message);
        this.load();
      },
      error: () => this.busy.set(false),
    });
  }
}
