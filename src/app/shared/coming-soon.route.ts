import {Route} from '@angular/router';

/** Builds a lazy route that renders the shared "coming soon" placeholder. */
export function comingSoonRoute(path: string, title: string): Route {
  return {
    path,
    title: `${title} · ShareWay`,
    data: {title},
    loadComponent: () =>
      import('./components/coming-soon-page/coming-soon-page').then(m => m.ComingSoonPage),
  };
}
