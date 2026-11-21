import {CurrencyPipe, DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit, inject, input, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {RouterLink} from '@angular/router';
import {StatusChip} from '../../../shared/components/status-chip/status-chip';
import {
  SETTLEMENT_STATUS_LABELS,
  SETTLEMENT_STATUS_TONES,
  SettlementResponse,
} from '../../model/settlement.model';
import {SettlementsApiService} from '../../services/settlements-api.service';
import {Card} from '../../../shared/components/card/card';
import {EmptyState} from '../../../shared/components/empty-state/empty-state';
import {ButtonVariantDirective} from '../../../shared/components/button/button-variant';

/** Detail of one settlement: gross, commission and net amounts (US-26). */
@Component({
  selector: 'app-settlement-detail-page',
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
  templateUrl: './settlement-detail-page.html',
  styleUrl: './settlement-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettlementDetailPage implements OnInit {
  private readonly api = inject(SettlementsApiService);

  /** Route param. */
  readonly id = input.required<string>();

  protected readonly settlement = signal<SettlementResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly labels = SETTLEMENT_STATUS_LABELS;
  protected readonly tones = SETTLEMENT_STATUS_TONES;

  ngOnInit(): void {
    this.api.getMine(this.id()).subscribe({
      next: settlement => {
        this.settlement.set(settlement);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
