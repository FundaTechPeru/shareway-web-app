/** A predefined place in Lima for the origin/destination selector. */
export interface Place {
  id: string;
  label: string;
  /** Group shown in the selector. */
  group: 'Distritos' | 'Universidades';
  operationZone: string;
  lat: number;
  lng: number;
}

/**
 * Predefined places until a map/geocoder is available. `operationZone` is the
 * district code of the place.
 */
export const LIMA_PLACES: readonly Place[] = [
  {
    id: 'pueblo-libre',
    label: 'Pueblo Libre (Plaza Bolívar)',
    group: 'Distritos',
    operationZone: 'PUEBLO_LIBRE',
    lat: -12.0757,
    lng: -77.0636,
  },
  {
    id: 'jesus-maria',
    label: 'Jesús María (Campo de Marte)',
    group: 'Distritos',
    operationZone: 'JESUS_MARIA',
    lat: -12.07,
    lng: -77.0433,
  },
  {
    id: 'magdalena',
    label: 'Magdalena del Mar (Plaza principal)',
    group: 'Distritos',
    operationZone: 'MAGDALENA_DEL_MAR',
    lat: -12.0907,
    lng: -77.0716,
  },
  {
    id: 'san-isidro',
    label: 'San Isidro (Centro Financiero)',
    group: 'Distritos',
    operationZone: 'SAN_ISIDRO',
    lat: -12.097,
    lng: -77.0365,
  },
  {
    id: 'miraflores',
    label: 'Miraflores (Parque Kennedy)',
    group: 'Distritos',
    operationZone: 'MIRAFLORES',
    lat: -12.1211,
    lng: -77.0297,
  },
  {
    id: 'upc-monterrico',
    label: 'UPC Monterrico',
    group: 'Universidades',
    operationZone: 'SANTIAGO_DE_SURCO',
    lat: -12.104,
    lng: -76.9631,
  },
  {
    id: 'upc-san-isidro',
    label: 'UPC San Isidro',
    group: 'Universidades',
    operationZone: 'SAN_ISIDRO',
    lat: -12.0883,
    lng: -77.0503,
  },
  {
    id: 'pucp',
    label: 'PUCP',
    group: 'Universidades',
    operationZone: 'SAN_MIGUEL',
    lat: -12.0691,
    lng: -77.0796,
  },
  {
    id: 'ulima',
    label: 'Universidad de Lima',
    group: 'Universidades',
    operationZone: 'SANTIAGO_DE_SURCO',
    lat: -12.0846,
    lng: -76.9711,
  },
  {
    id: 'unmsm',
    label: 'UNMSM (Ciudad Universitaria)',
    group: 'Universidades',
    operationZone: 'LIMA_CERCADO',
    lat: -12.056,
    lng: -77.0844,
  },
];

export function findPlace(id: string): Place | undefined {
  return LIMA_PLACES.find(place => place.id === id);
}
