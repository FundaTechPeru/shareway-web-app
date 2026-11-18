import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSelectModule} from '@angular/material/select';
import {Router} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';
import {NotificationService} from '../../../core/notifications/notification.service';
import {LIMA_PLACES, Place, findPlace} from '../../model/places';
import {TripPlanningApiService} from '../../services/trip-planning-api.service';

export const MAX_SEATS_REQUESTED = 4;

/** Local date as YYYY-MM-DD. */
export function todayIso(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Origin and destination differ; the departure window is valid and not in the past. */
export function tripRequestValidator(
  control: AbstractControl,
  now = new Date(),
): ValidationErrors | null {
  const v = control.value as {
    originId: string;
    destinationId: string;
    travelDate: string;
    earliestDeparture: string;
    latestDeparture: string;
  };
  const errors: ValidationErrors = {};
  if (v.originId && v.originId === v.destinationId) {
    errors['samePlace'] = true;
  }
  if (v.travelDate && v.travelDate < todayIso(now)) {
    errors['pastDate'] = true;
  }
  if (v.earliestDeparture && v.latestDeparture && v.latestDeparture <= v.earliestDeparture) {
    errors['window'] = true;
  }
  return Object.keys(errors).length ? errors : null;
}

/** Search or schedule a trip (US-02). */
@Component({
  selector: 'app-new-trip-request-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  templateUrl: './new-trip-request-page.html',
  styleUrl: './new-trip-request-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTripRequestPage {
  private readonly api = inject(TripPlanningApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  protected readonly districts = LIMA_PLACES.filter(p => p.group === 'Distritos');
  protected readonly universities = LIMA_PLACES.filter(p => p.group === 'Universidades');
  protected readonly seatOptions = Array.from({length: MAX_SEATS_REQUESTED}, (_, i) => i + 1);
  protected readonly minDate = todayIso();
  protected readonly saving = signal(false);

  readonly form = inject(NonNullableFormBuilder).group(
    {
      originId: ['', Validators.required],
      destinationId: ['', Validators.required],
      travelDate: [todayIso(), Validators.required],
      earliestDeparture: ['07:00', Validators.required],
      latestDeparture: ['07:30', Validators.required],
      seatsRequested: [
        1,
        [Validators.required, Validators.min(1), Validators.max(MAX_SEATS_REQUESTED)],
      ],
    },
    {validators: control => tripRequestValidator(control)},
  );

  submit(): void {
    const user = this.auth.currentUser();
    if (this.form.invalid || this.saving() || !user) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const origin = findPlace(v.originId) as Place;
    const destination = findPlace(v.destinationId) as Place;
    this.saving.set(true);
    this.api
      .create(user.id, {
        originLabel: origin.label,
        destinationLabel: destination.label,
        operationZone: origin.operationZone,
        originLat: origin.lat,
        originLng: origin.lng,
        destinationLat: destination.lat,
        destinationLng: destination.lng,
        travelDate: v.travelDate,
        earliestDeparture: v.earliestDeparture,
        latestDeparture: v.latestDeparture,
        seatsRequested: Number(v.seatsRequested),
      })
      .subscribe({
        next: created => {
          this.saving.set(false);
          this.notifications.success('Solicitud creada. Te avisaremos cuando haya propuestas.');
          void this.router.navigate(['/passenger/trip-requests', created.id]);
        },
        error: () => this.saving.set(false),
      });
  }
}
