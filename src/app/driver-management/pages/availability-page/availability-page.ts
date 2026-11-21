import {ChangeDetectionStrategy, Component, OnInit, inject, signal} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {NotificationService} from '../../../core/notifications/notification.service';
import {
  Availability,
  AvailabilitySlot,
  DAYS_OF_WEEK,
  DAY_LABELS,
  DayOfWeek,
} from '../../model/availability.model';
import {AvailabilityApiService} from '../../services/availability-api.service';
import {noOverlapValidator, timeRangeValidator} from './availability-validators';
import {Card} from '../../../shared/components/card/card';
import {EmptyState} from '../../../shared/components/empty-state/empty-state';
import {ButtonVariantDirective} from '../../../shared/components/button/button-variant';

type SlotForm = FormGroup<{startTime: FormControl<string>; endTime: FormControl<string>}>;
type WeekForm = FormGroup<Record<DayOfWeek, FormArray<SlotForm>>>;

/** Editable weekly schedule (US-19). Saving replaces the whole schedule. */
@Component({
  selector: 'app-availability-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    Card,
    EmptyState,
    ButtonVariantDirective,
  ],
  templateUrl: './availability-page.html',
  styleUrl: './availability-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailabilityPage implements OnInit {
  private readonly api = inject(AvailabilityApiService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly days = DAYS_OF_WEEK;
  protected readonly dayLabels = DAY_LABELS;
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly saving = signal(false);

  readonly form: WeekForm = this.fb.group(
    Object.fromEntries(
      DAYS_OF_WEEK.map(day => [day, this.fb.array<SlotForm>([], noOverlapValidator)]),
    ) as Record<DayOfWeek, FormArray<SlotForm>>,
  );

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.api.get().subscribe({
      next: availability => {
        this.setSchedule(availability);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  addSlot(day: DayOfWeek, startTime = '07:00', endTime = '09:00'): void {
    this.form.controls[day].push(this.createSlot(startTime, endTime));
    this.form.markAsDirty();
  }

  protected removeSlot(day: DayOfWeek, index: number): void {
    this.form.controls[day].removeAt(index);
    this.form.markAsDirty();
  }

  /** Flattens the form into the backend `slots` list, ordered by day and time. */
  toAvailability(): Availability {
    const slots: AvailabilitySlot[] = DAYS_OF_WEEK.flatMap(day =>
      this.form.controls[day]
        .getRawValue()
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map(slot => ({dayOfWeek: day, ...slot})),
    );
    return {slots};
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      this.notifications.error('Revisa los horarios marcados antes de guardar.');
      return;
    }
    this.saving.set(true);
    this.api.replace(this.toAvailability()).subscribe({
      next: saved => {
        this.setSchedule(saved);
        this.saving.set(false);
        this.notifications.success('Disponibilidad guardada.');
      },
      error: () => this.saving.set(false),
    });
  }

  private setSchedule(availability: Availability): void {
    for (const day of DAYS_OF_WEEK) {
      this.form.controls[day].clear();
    }
    for (const slot of availability.slots) {
      this.form.controls[slot.dayOfWeek]?.push(this.createSlot(slot.startTime, slot.endTime));
    }
    this.form.markAsPristine();
  }

  private createSlot(startTime: string, endTime: string): SlotForm {
    return this.fb.group(
      {
        startTime: [startTime, Validators.required],
        endTime: [endTime, Validators.required],
      },
      {validators: timeRangeValidator},
    );
  }
}
