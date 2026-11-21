import {CurrencyPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit, computed, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {RouterLink} from '@angular/router';
import {Observable, catchError, forkJoin, of} from 'rxjs';
import {EarningsSummaryResponse} from '../../../payments/model/settlement.model';
import {SettlementsApiService} from '../../../payments/services/settlements-api.service';
import {StatusChip, StatusTone} from '../../../shared/components/status-chip/status-chip';
import {DocumentResponse} from '../../model/document.model';
import {DRIVER_STATUS_LABELS, DriverProfileResponse} from '../../model/driver-profile.model';
import {ChecklistState, buildChecklist} from '../../model/verification';
import {VehicleResponse} from '../../model/vehicle.model';
import {DriverDocumentsApiService} from '../../services/driver-documents-api.service';
import {DriverProfileApiService} from '../../services/driver-profile-api.service';
import {VehiclesApiService} from '../../services/vehicles-api.service';
import {Card} from '../../../shared/components/card/card';
import {NoticeBanner} from '../../../shared/components/notice-banner/notice-banner';
import {ButtonVariantDirective} from '../../../shared/components/button/button-variant';

// Presentation of each checklist state (CON-02 colors).
const BUBBLE_TONES: Record<ChecklistState, string> = {
  done: 'success',
  pending: 'warning',
  rejected: 'error',
  missing: 'neutral',
};

const CHIP_TONES: Record<ChecklistState, StatusTone> = {
  done: 'success',
  pending: 'warning',
  rejected: 'error',
  missing: 'neutral',
};

const STATE_HINTS: Record<ChecklistState, string> = {
  done: 'Listo',
  pending: 'Lo estamos revisando',
  rejected: 'Revisa el motivo y vuelve a subirlo',
  missing: 'Falta completar este paso',
};

function orNull<T>(source: Observable<T>): Observable<T | null> {
  return source.pipe(catchError(() => of(null)));
}

/** Driver landing: verification status and checklist. */
@Component({
  selector: 'app-driver-home-page',
  imports: [
    CurrencyPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    StatusChip,
    Card,
    NoticeBanner,
    ButtonVariantDirective,
  ],
  templateUrl: './driver-home-page.html',
  styleUrl: './driver-home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverHomePage implements OnInit {
  private readonly profileApi = inject(DriverProfileApiService);
  private readonly documentsApi = inject(DriverDocumentsApiService);
  private readonly vehiclesApi = inject(VehiclesApiService);
  private readonly settlementsApi = inject(SettlementsApiService);

  protected readonly loading = signal(true);
  protected readonly profile = signal<DriverProfileResponse | null>(null);
  protected readonly documents = signal<DocumentResponse[]>([]);
  protected readonly vehicles = signal<VehicleResponse[]>([]);
  protected readonly earnings = signal<EarningsSummaryResponse | null>(null);

  protected readonly bubbleTones = BUBBLE_TONES;
  protected readonly chipTones = CHIP_TONES;
  protected readonly stateHints = STATE_HINTS;
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
      earnings: orNull(this.settlementsApi.summary()),
    }).subscribe(({profile, documents, vehicles, earnings}) => {
      this.earnings.set(earnings);
      this.profile.set(profile);
      this.documents.set(documents ?? []);
      this.vehicles.set(vehicles ?? []);
      this.loading.set(false);
    });
  }
}
