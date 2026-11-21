import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Router} from '@angular/router';
import {NoticeBanner} from '../../../shared/components/notice-banner/notice-banner';

/**
 * Driver trips. TODO(backend): there is no "my trips" endpoint for drivers yet
 * (backend blocker #5 in docs/PROGRESS.md), so the driver opens a trip by
 * its code.
 */
@Component({
  selector: 'app-trips-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    NoticeBanner,
  ],
  template: `
    <section class="page">
      <h1>Mis viajes</h1>
      <app-notice-banner tone="info" icon="schedule" heading="Disponible próximamente"
        >La lista de tus viajes asignados estará disponible cuando el servicio de viajes la
        publique. Mientras tanto, abre un viaje con su código.</app-notice-banner
      >
      <mat-card appearance="outlined">
        <mat-card-content>
          <form class="open-form" (ngSubmit)="open()" novalidate>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Código del viaje</mat-label>
              <input matInput [formControl]="tripId" autocomplete="off" />
            </mat-form-field>
            <button mat-flat-button type="submit">Abrir viaje</button>
          </form>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: `
    .page {
      padding: var(--sw-page-padding);
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    h1 {
      font: var(--mat-sys-headline-small);
      margin: 0;
    }
    .open-form {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      padding-top: 8px;
    }
    mat-form-field {
      flex: 1;
      min-width: 200px;
    }
  `,
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
