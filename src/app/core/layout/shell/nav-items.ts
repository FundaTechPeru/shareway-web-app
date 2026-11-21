import {Role} from '../../../iam/model/auth.model';

export interface NavItem {
  label: string;
  icon: string;
  link: string;
  /** Highlight only on an exact URL match (for links that prefix others). */
  exact?: boolean;
}

/** Side menu entries per role. ADMIN does not use this app. */
export const NAV_ITEMS: Partial<Record<Role, readonly NavItem[]>> = {
  PASSENGER: [
    {label: 'Inicio', icon: 'home', link: '/passenger/home'},
    {label: 'Programar viaje', icon: 'search', link: '/passenger/trip-requests/new'},
    {label: 'Mis solicitudes', icon: 'route', link: '/passenger/trip-requests', exact: true},
    {label: 'Métodos de pago', icon: 'credit_card', link: '/passenger/payment-methods'},
    {label: 'Mis pagos', icon: 'payments', link: '/passenger/payments'},
    {label: 'Quiero ser conductor', icon: 'directions_car', link: '/passenger/become-driver'},
  ],
  DRIVER: [
    {label: 'Inicio', icon: 'home', link: '/driver/home'},
    {label: 'Mis viajes', icon: 'calendar_month', link: '/driver/trips'},
    {label: 'Documentos', icon: 'description', link: '/driver/documents'},
    {label: 'Vehículos', icon: 'directions_car', link: '/driver/vehicles'},
    {label: 'Disponibilidad', icon: 'schedule', link: '/driver/availability'},
    {label: 'Ganancias', icon: 'payments', link: '/driver/earnings'},
  ],
};

/** Role shown under the brand and the user name. */
export const ROLE_LABELS: Partial<Record<Role, string>> = {
  PASSENGER: 'Pasajero',
  DRIVER: 'Conductor',
};
