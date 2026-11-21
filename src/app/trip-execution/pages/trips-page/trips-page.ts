import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {Router} from '@angular/router';
import {ButtonVariantDirective} from '../../../shared/components/button/button-variant';
import {Card} from '../../../shared/components/card/card';
import {EmptyState} from '../../../shared/components/empty-state/empty-state';
import {NoticeBanner} from '../../../shared/components/notice-banner/notice-banner';

/**
 * Driver trips agenda (CON-09). TODO(backend): there is no "my trips"
 * endpoint for drivers yet (backend blocker #5 in docs/PROGRESS.md), so the
 * agenda shows its empty state and the driver opens a trip by its code.
 */
@Component({
  selector: 'app-trips-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    ButtonVariantDirective,
    Card,
    EmptyState,
    NoticeBanner,
  ],
  templateUrl: './trips-page.html',
  styleUrl: './trips-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripsPage {
  private readonly router = inject(Router);

  readonly tripId = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/)],
  });

  open(): void {
    if (this.tripId.invalid) {
      return;
    }
    void this.router.navigate(['/driver/trips', this.tripId.value.trim()]);
  }
}
