import {DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';
import {NoticeBanner} from '../../../shared/components/notice-banner/notice-banner';
import {StatusChip} from '../../../shared/components/status-chip/status-chip';
import {
  TRIP_REQUEST_STATUS_LABELS,
  TRIP_REQUEST_STATUS_TONES,
  TripRequest,
} from '../../model/trip-request.model';
import {TripPlanningApiService} from '../../services/trip-planning-api.service';
import {Card} from '../../../shared/components/card/card';
import {EmptyState} from '../../../shared/components/empty-state/empty-state';
import {ButtonVariantDirective} from '../../../shared/components/button/button-variant';

/** The passenger's trip requests. */
@Component({
  selector: 'app-trip-requests-page',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    NoticeBanner,
    StatusChip,
    Card,
    EmptyState,
    ButtonVariantDirective,
  ],
  templateUrl: './trip-requests-page.html',
  styleUrl: './trip-requests-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripRequestsPage implements OnInit {
  private readonly api = inject(TripPlanningApiService);
  private readonly auth = inject(AuthService);

  protected readonly requests = signal<TripRequest[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly canListByUser = this.api.canListByUser;
  protected readonly labels = TRIP_REQUEST_STATUS_LABELS;
  protected readonly tones = TRIP_REQUEST_STATUS_TONES;

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    const user = this.auth.currentUser();
    if (!user) {
      return;
    }
    this.loading.set(true);
    this.loadFailed.set(false);
    this.api.listMine(user.id).subscribe({
      next: requests => {
        this.requests.set(
          [...requests].sort((a, b) =>
            `${b.travelDate}${b.earliestDeparture}`.localeCompare(
              `${a.travelDate}${a.earliestDeparture}`,
            ),
          ),
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadFailed.set(true);
      },
    });
  }
}
