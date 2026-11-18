import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {NotificationService} from '../../../core/notifications/notification.service';
import {PLATE_PATTERN, VehicleResponse} from '../../model/vehicle.model';
import {VehiclesApiService} from '../../services/vehicles-api.service';
import {VehiclesPage} from './vehicles-page';

const yaris: VehicleResponse = {
  id: 'v1',
  plate: 'ABC-123',
  brand: 'Toyota',
  model: 'Yaris',
  year: 2020,
  color: 'Gris',
  seats: 4,
};

describe('VehiclesPage', () => {
  let fixture: ComponentFixture<VehiclesPage>;
  let api: {
    list: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    api = {list: vi.fn(() => of([yaris])), create: vi.fn(), update: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        {provide: VehiclesApiService, useValue: api},
        {provide: NotificationService, useValue: {success: vi.fn(), error: vi.fn()}},
      ],
    });
    fixture = TestBed.createComponent(VehiclesPage);
    await fixture.whenStable();
  });

  const el = () => fixture.nativeElement as HTMLElement;

  function type(name: string, value: string): void {
    const input = el().querySelector<HTMLInputElement>(`input[formControlName=${name}]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  it('validates the plate format', () => {
    expect(PLATE_PATTERN.test('ABC-123')).toBe(true);
    expect(PLATE_PATTERN.test('A1B-234')).toBe(true);
    expect(PLATE_PATTERN.test('ABC123')).toBe(false);
    expect(PLATE_PATTERN.test('abc-123')).toBe(false);
    expect(PLATE_PATTERN.test('ABC-12')).toBe(false);
  });

  it('lists the vehicles', () => {
    expect(el().textContent).toContain('Toyota Yaris');
    expect(el().textContent).toContain('ABC-123');
  });

  it('registers a new vehicle with a normalized plate', async () => {
    const created = {...yaris, id: 'v2', plate: 'XYZ-987', brand: 'Kia', model: 'Rio'};
    api.create.mockReturnValue(of(created));
    fixture.componentInstance.startCreate();
    await fixture.whenStable();

    type('plate', 'xyz987');
    type('brand', 'Kia');
    type('model', 'Rio');
    type('year', '2021');
    type('color', 'Azul');
    type('seats', '4');
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(api.create).toHaveBeenCalledWith({
      plate: 'XYZ-987',
      brand: 'Kia',
      model: 'Rio',
      year: 2021,
      color: 'Azul',
      seats: 4,
    });
    expect(el().textContent).toContain('Kia Rio');
    expect(el().querySelector('form')).toBeNull();
  });

  it('rejects invalid seats and years', async () => {
    fixture.componentInstance.startCreate();
    await fixture.whenStable();
    type('plate', 'ABC-123');
    type('brand', 'Kia');
    type('model', 'Rio');
    type('year', '1900');
    type('color', 'Azul');
    type('seats', '9');
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(api.create).not.toHaveBeenCalled();
    expect(el().textContent).toContain('Entre 1 y 8 asientos.');
    expect(el().textContent).toContain('Ingresa un año entre 1980');
  });

  it('edits an existing vehicle', async () => {
    api.update.mockReturnValue(of({...yaris, color: 'Rojo'}));
    fixture.componentInstance.startEdit(yaris);
    await fixture.whenStable();

    type('color', 'Rojo');
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(api.update).toHaveBeenCalledWith('v1', {
      plate: 'ABC-123',
      brand: 'Toyota',
      model: 'Yaris',
      year: 2020,
      color: 'Rojo',
      seats: 4,
    });
    expect(el().textContent).toContain('Rojo');
  });
});
