import {CurrencyPipe, DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {RouterLink} from '@angular/router';
import {catchError, forkJoin, of} from 'rxjs';
import {StatusChip} from '../../../shared/components/status-chip/status-chip';
import {
  EarningsSummaryResponse,
  SETTLEMENT_STATUS_LABELS,
  SETTLEMENT_STATUS_TONES,
  SettlementResponse,
} from '../../model/settlement.model';
import {SettlementsApiService} from '../../services/settlements-api.service';
import {Card} from '../../../shared/components/card/card';
import {EmptyState} from '../../../shared/components/empty-state/empty-state';
import {ButtonVariantDirective} from '../../../shared/components/button/button-variant';

/** Driver earnings: summary and settlements list (US-25, US-26). */
@Component({
  selector: 'app-earnings-page',
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
  templateUrl: './earnings-page.html',
  styleUrl: './earnings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EarningsPage implements OnInit {
  private readonly api = inject(SettlementsApiService);

  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly summary = signal<EarningsSummaryResponse | null>(null);
  protected readonly settlements = signal<SettlementResponse[]>([]);
  protected readonly labels = SETTLEMENT_STATUS_LABELS;
  protected readonly tones = SETTLEMENT_STATUS_TONES;

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    forkJoin({
      summary: this.api.summary().pipe(catchError(() => of(null))),
      settlements: this.api.listMine(),
    }).subscribe({
      next: ({summary, settlements}) => {
        this.summary.set(summary);
        this.settlements.set(
          [...settlements].sort((a, b) => b.tripCompletedAt.localeCompare(a.tripCompletedAt)),
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
