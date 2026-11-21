import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Location} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTooltipModule} from '@angular/material/tooltip';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import {catchError, filter, map, of} from 'rxjs';
import {UsersApiService} from '../../../iam/services/users-api.service';
import {BrandLogo} from '../../../shared/components/brand-logo/brand-logo';
import {AuthService} from '../../auth/auth.service';
import {NAV_ITEMS, ROLE_LABELS} from './nav-items';

const TITLE_SUFFIX = ' · ShareWay';

/**
 * Authenticated layout. Desktop: 248 px dark sidebar with the logo, the
 * role menu and the user with logout at the bottom. Phone: top bar with
 * the screen title and a back arrow; the menu opens as a drawer.
 */
@Component({
  selector: 'app-shell',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatTooltipModule,
    BrandLogo,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private navigations = 0;

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

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => {
        this.navigations++;
        return event.urlAfterRedirects;
      }),
    ),
    {initialValue: this.router.url},
  );

  protected readonly displayName = computed(
    () => this.profile()?.fullName || this.auth.currentUser()?.email || '',
  );

  protected readonly initials = computed(() =>
    this.displayName()
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join(''),
  );

  protected readonly roleLabel = computed(() => {
    const role = this.auth.role();
    return role ? (ROLE_LABELS[role] ?? '') : '';
  });

  protected readonly navItems = computed(() => {
    const role = this.auth.role();
    return role ? (NAV_ITEMS[role] ?? []) : [];
  });

  protected readonly homeUrl = computed(() => this.auth.homeUrl());

  protected readonly isHome = computed(() => this.currentUrl().split('?')[0] === this.homeUrl());

  /** Title of the deepest active route, without the " · ShareWay" suffix. */
  protected readonly pageTitle = computed(() => {
    this.currentUrl();
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let title = '';
    while (route) {
      title = route.title ?? title;
      route = route.firstChild;
    }
    return title.replace(TITLE_SUFFIX, '') || 'ShareWay';
  });

  /** Back inside the app when possible; otherwise to the role home. */
  protected goBack(): void {
    if (this.navigations > 1) {
      this.location.back();
    } else {
      void this.router.navigateByUrl(this.homeUrl());
    }
  }

  protected logout(): void {
    this.auth.logout();
  }
}
