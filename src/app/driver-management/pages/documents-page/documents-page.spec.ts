import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {NotificationService} from '../../../core/notifications/notification.service';
import {DocumentResponse} from '../../model/document.model';
import {DriverDocumentsApiService} from '../../services/driver-documents-api.service';
import {DocumentsPage, MAX_FILE_BYTES} from './documents-page';

function doc(partial: Partial<DocumentResponse>): DocumentResponse {
  return {
    id: 'd1',
    driverId: 'u1',
    type: 'DRIVERS_LICENSE',
    status: 'PENDING',
    originalFilename: 'licencia.pdf',
    contentType: 'application/pdf',
    sizeBytes: 1000,
    rejectionReason: null,
    uploadedAt: '2026-11-01T10:00:00Z',
    reviewedAt: null,
    ...partial,
  };
}

describe('DocumentsPage', () => {
  let fixture: ComponentFixture<DocumentsPage>;
  let api: {list: ReturnType<typeof vi.fn>; upload: ReturnType<typeof vi.fn>};
  let notifications: {success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>};

  async function create(documents: DocumentResponse[]): Promise<void> {
    api = {list: vi.fn(() => of(documents)), upload: vi.fn()};
    notifications = {success: vi.fn(), error: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        {provide: DriverDocumentsApiService, useValue: api},
        {provide: NotificationService, useValue: notifications},
      ],
    });
    fixture = TestBed.createComponent(DocumentsPage);
    await fixture.whenStable();
  }

  const card = (type: string) =>
    (fixture.nativeElement as HTMLElement).querySelector(`[data-type=${type}]`)!;

  it('shows the 4 document types with their status', async () => {
    await create([
      doc({type: 'DRIVERS_LICENSE', status: 'APPROVED'}),
      doc({
        id: 'd2',
        type: 'NATIONAL_ID',
        status: 'REJECTED',
        rejectionReason: 'Foto borrosa',
      }),
    ]);
    expect(card('DRIVERS_LICENSE').textContent).toContain('Aprobado');
    expect(card('DRIVERS_LICENSE').querySelector('button')).toBeNull();
    expect(card('NATIONAL_ID').textContent).toContain('Rechazado');
    expect(card('NATIONAL_ID').textContent).toContain('Foto borrosa');
    expect(card('NATIONAL_ID').textContent).toContain('Reemplazar');
    expect(card('CRIMINAL_RECORD').textContent).toContain('Sin subir');
    expect(card('VEHICLE_REGISTRATION').textContent).toContain('Subir');
  });

  it('shows the latest upload of each type', async () => {
    await create([
      doc({id: 'old', status: 'REJECTED', uploadedAt: '2026-11-01T10:00:00Z'}),
      doc({id: 'new', status: 'PENDING', uploadedAt: '2026-11-02T10:00:00Z'}),
    ]);
    expect(card('DRIVERS_LICENSE').textContent).toContain('En revisión');
  });

  it('uploads a valid file and shows it as pending', async () => {
    await create([]);
    const uploaded = doc({type: 'CRIMINAL_RECORD', originalFilename: 'antecedentes.pdf'});
    api.upload.mockReturnValue(of(uploaded));
    const file = new File(['%PDF'], 'antecedentes.pdf', {type: 'application/pdf'});

    fixture.componentInstance.upload('CRIMINAL_RECORD', file);
    await fixture.whenStable();

    expect(api.upload).toHaveBeenCalledWith('CRIMINAL_RECORD', file);
    expect(card('CRIMINAL_RECORD').textContent).toContain('antecedentes.pdf');
    expect(card('CRIMINAL_RECORD').textContent).toContain('En revisión');
  });

  it('rejects unsupported or too large files before uploading', async () => {
    await create([]);
    const page = fixture.componentInstance;
    page.upload('NATIONAL_ID', new File(['x'], 'dni.docx', {type: 'application/msword'}));
    const big = new File(['x'], 'dni.pdf', {type: 'application/pdf'});
    Object.defineProperty(big, 'size', {value: MAX_FILE_BYTES + 1});
    page.upload('NATIONAL_ID', big);

    expect(api.upload).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledTimes(2);
  });
});
