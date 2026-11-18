import {Injectable, inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

/** Thin wrapper over MatSnackBar so messages look the same everywhere. */
@Injectable({providedIn: 'root'})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'Cerrar', {duration: 4000});
  }

  error(message: string): void {
    this.snackBar.open(message, 'Cerrar', {duration: 6000, panelClass: 'sw-snackbar-error'});
  }
}
