import {CurrencyPipe, DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit, inject, input, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {RouterLink} from '@angular/router';
import {catchError, forkJoin, of} from 'rxjs';
import {StatusChip} from '../../../shared/components/status-chip/status-chip';
import {
  MatchProposal,
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_STATUS_TONES,
  TRIP_REQUEST_STATUS_LABELS,
  TRIP_REQUEST_STATUS_TONES,
  TripRequest,
} from '../../model/trip-request.model';
import {TripPlanningApiService} from '../../services/trip-planning-api.service';
import {Card} from '../../../shared/components/card/card';
import {EmptyState} from '../../../shared/components/empty-state/empty-state';
import {ButtonVariantDirective} from '../../../shared/components/button/button-variant';

/** A trip request with its match proposals. */
@Component({
  selector: 'app-trip-request-detail-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    StatusChip,
    Card,
    EmptyState,
    ButtonVariantDirective,
  ],
  templateUrl: './trip-request-detail-page.html',
  styleUrl: './trip-request-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripRequestDetailPage implements OnInit {
  private readonly api = inject(TripPlanningApiService);

  /** Route param. */
  readonly id = input.required<string>();

  protected readonly request = signal<TripRequest | null>(null);
  protected readonly proposals = signal<MatchProposal[]>([]);
  protected readonly loading = signal(true);
  protected readonly searching = signal(false);
  protected readonly requestLabels = TRIP_REQUEST_STATUS_LABELS;
  protected readonly requestTones = TRIP_REQUEST_STATUS_TONES;
  protected readonly proposalLabels = PROPOSAL_STATUS_LABELS;
  protected readonly proposalTones = PROPOSAL_STATUS_TONES;

  ngOnInit(): void {
    forkJoin({
      request: this.api.get(this.id()).pipe(catchError(() => of(null))),
      proposals: this.api.listProposals(this.id()).pipe(catchError(() => of([]))),
    }).subscribe(({request, proposals}) => {
      this.request.set(request);
      this.proposals.set(proposals);
      this.loading.set(false);
    });
  }

  searchDrivers(): void {
    this.searching.set(true);
    this.api.requestProposals(this.id()).subscribe({
      next: created => {
        this.proposals.update(list => [
          ...list.filter(p => !created.some(c => c.id === p.id)),
          ...created,
        ]);
        this.searching.set(false);
      },
      error: () => this.searching.set(false),
    });
  }
}
