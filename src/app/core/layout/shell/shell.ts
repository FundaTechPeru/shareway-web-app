import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {catchError, map, of} from 'rxjs';
import {UsersApiService} from '../../../iam/services/users-api.service';
import {AuthService} from '../../auth/auth.service';
import {NAV_ITEMS} from './nav-items';

/** Authenticated layout: toolbar with the user's name and a role-based menu. */
@Component({
  selector: 'app-shell',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly auth = inject(AuthService);

  protected readonly isHandset = toSignal(
    inject(BreakpointObserver)
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map(state => state.matches)),
    {initialValue: true},
  );

  protected readonly profile = toSignal(
    inject(UsersApiService)
      .getMe()
      .pipe(catchError(() => of(null))),
    {initialValue: null},
  );

  protected readonly displayName = computed(
    () => this.profile()?.fullName || this.auth.currentUser()?.email || '',
  );

  protected readonly navItems = computed(() => {
    const role = this.auth.role();
    return role ? (NAV_ITEMS[role] ?? []) : [];
  });

  protected readonly homeUrl = computed(() => this.auth.homeUrl());

  protected logout(): void {
    this.auth.logout();
  }
}
