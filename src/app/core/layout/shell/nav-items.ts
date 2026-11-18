import {Role} from '../../../iam/model/auth.model';

export interface NavItem {
  label: string;
  icon: string;
  link: string;
}

/** Side menu entries per role. ADMIN does not use this app. */
export const NAV_ITEMS: Partial<Record<Role, readonly NavItem[]>> = {
  PASSENGER: [
    {label: 'Inicio', icon: 'home', link: '/passenger/home'},
    {label: 'Programar viaje', icon: 'add_road', link: '/passenger/trip-requests/new'},
    {label: 'Mis solicitudes', icon: 'route', link: '/passenger/trip-requests'},
    {label: 'Métodos de pago', icon: 'credit_card', link: '/passenger/payment-methods'},
    {label: 'Mis pagos', icon: 'receipt_long', link: '/passenger/payments'},
    {label: 'Quiero ser conductor', icon: 'directions_car', link: '/passenger/become-driver'},
  ],
  DRIVER: [
    {label: 'Inicio', icon: 'home', link: '/driver/home'},
    {label: 'Documentos', icon: 'badge', link: '/driver/documents'},
    {label: 'Vehículos', icon: 'directions_car', link: '/driver/vehicles'},
    {label: 'Disponibilidad', icon: 'event_available', link: '/driver/availability'},
    {label: 'Ganancias', icon: 'payments', link: '/driver/earnings'},
  ],
};
