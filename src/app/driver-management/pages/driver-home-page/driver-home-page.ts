import {ChangeDetectionStrategy, Component, OnInit, computed, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {RouterLink} from '@angular/router';
import {Observable, catchError, forkJoin, of} from 'rxjs';
import {StatusChip} from '../../../shared/components/status-chip/status-chip';
import {DocumentResponse} from '../../model/document.model';
import {DRIVER_STATUS_LABELS, DriverProfileResponse} from '../../model/driver-profile.model';
import {ChecklistState, buildChecklist} from '../../model/verification';
import {VehicleResponse} from '../../model/vehicle.model';
import {DriverDocumentsApiService} from '../../services/driver-documents-api.service';
import {DriverProfileApiService} from '../../services/driver-profile-api.service';
import {VehiclesApiService} from '../../services/vehicles-api.service';

const STATE_ICONS: Record<ChecklistState, string> = {
  done: 'check_circle',
  pending: 'schedule',
  rejected: 'cancel',
  missing: 'radio_button_unchecked',
};

function orNull<T>(source: Observable<T>): Observable<T | null> {
  return source.pipe(catchError(() => of(null)));
}

/** Driver landing: verification status and checklist. */
@Component({
  selector: 'app-driver-home-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    StatusChip,
  ],
  templateUrl: './driver-home-page.html',
  styleUrl: './driver-home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverHomePage implements OnInit {
  private readonly profileApi = inject(DriverProfileApiService);
  private readonly documentsApi = inject(DriverDocumentsApiService);
  private readonly vehiclesApi = inject(VehiclesApiService);

  protected readonly loading = signal(true);
  protected readonly profile = signal<DriverProfileResponse | null>(null);
  protected readonly documents = signal<DocumentResponse[]>([]);
  protected readonly vehicles = signal<VehicleResponse[]>([]);

  protected readonly stateIcons = STATE_ICONS;
  protected readonly checklist = computed(() => buildChecklist(this.documents(), this.vehicles()));
  protected readonly completed = computed(
    () => this.checklist().filter(item => item.state === 'done').length,
  );
  protected readonly verified = computed(() => this.profile()?.driverStatus === 'VERIFIED');
  protected readonly statusLabel = computed(() => {
    const status = this.profile()?.driverStatus;
    return status ? DRIVER_STATUS_LABELS[status] : 'Estado desconocido';
  });

  ngOnInit(): void {
    forkJoin({
      profile: orNull(this.profileApi.get()),
      documents: orNull(this.documentsApi.list()),
      vehicles: orNull(this.vehiclesApi.list()),
    }).subscribe(({profile, documents, vehicles}) => {
      this.profile.set(profile);
      this.documents.set(documents ?? []);
      this.vehicles.set(vehicles ?? []);
      this.loading.set(false);
    });
  }
}
