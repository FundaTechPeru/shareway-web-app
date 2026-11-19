import {ChangeDetectionStrategy, Component, OnInit, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {NotificationService} from '../../../core/notifications/notification.service';
import {
  MAX_SEATS,
  MIN_SEATS,
  PLATE_PATTERN,
  VehicleRequest,
  VehicleResponse,
} from '../../model/vehicle.model';
import {VehiclesApiService} from '../../services/vehicles-api.service';

export const MIN_YEAR = 1980;
export const MAX_YEAR = new Date().getFullYear() + 1;

/** Register (US-18) and edit (US-30) the driver's vehicles. */
@Component({
  selector: 'app-vehicles-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './vehicles-page.html',
  styleUrl: './vehicles-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiclesPage implements OnInit {
  private readonly api = inject(VehiclesApiService);
  private readonly notifications = inject(NotificationService);

  protected readonly vehicles = signal<VehicleResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly saving = signal(false);
  /** `null`: form hidden, `'new'`: creating, otherwise the vehicle id being edited. */
  protected readonly editing = signal<string | null>(null);

  protected readonly limits = {MIN_YEAR, MAX_YEAR, MIN_SEATS, MAX_SEATS};

  protected readonly form = inject(NonNullableFormBuilder).group({
    plate: ['', [Validators.required, Validators.pattern(PLATE_PATTERN)]],
    brand: ['', [Validators.required, Validators.pattern(/\S/)]],
    model: ['', [Validators.required, Validators.pattern(/\S/)]],
    year: [
      new Date().getFullYear(),
      [Validators.required, Validators.min(MIN_YEAR), Validators.max(MAX_YEAR)],
    ],
    color: ['', [Validators.required, Validators.pattern(/\S/)]],
    seats: [4, [Validators.required, Validators.min(MIN_SEATS), Validators.max(MAX_SEATS)]],
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.api.list().subscribe({
      next: vehicles => {
        this.vehicles.set(vehicles);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  startCreate(): void {
    this.form.reset();
    this.editing.set('new');
  }

  startEdit(vehicle: VehicleResponse): void {
    const {plate, brand, model, year, color, seats} = vehicle;
    this.form.reset({plate, brand, model, year, color, seats});
    this.editing.set(vehicle.id);
  }

  protected cancel(): void {
    this.editing.set(null);
  }

  /** Normalizes the plate to uppercase and inserts the dash ("abc123" -> "ABC-123"). */
  protected normalizePlate(): void {
    const control = this.form.controls.plate;
    let value = control.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (/^[A-Z0-9]{3}\d{3}$/.test(value)) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    }
    if (value !== control.value) {
      control.setValue(value);
    }
  }

  save(): void {
    const editing = this.editing();
    if (this.form.invalid || this.saving() || editing === null) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const request: VehicleRequest = {
      plate: value.plate,
      brand: value.brand.trim(),
      model: value.model.trim(),
      year: Number(value.year),
      color: value.color.trim(),
      seats: Number(value.seats),
    };
    const call = editing === 'new' ? this.api.create(request) : this.api.update(editing, request);
    this.saving.set(true);
    call.subscribe({
      next: saved => {
        this.vehicles.update(list =>
          editing === 'new' ? [...list, saved] : list.map(v => (v.id === saved.id ? saved : v)),
        );
        this.saving.set(false);
        this.editing.set(null);
        this.notifications.success(
          editing === 'new' ? 'Vehículo registrado.' : 'Vehículo actualizado.',
        );
      },
      error: () => this.saving.set(false),
    });
  }
}
