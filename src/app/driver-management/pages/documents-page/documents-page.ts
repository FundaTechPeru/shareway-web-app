import {DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit, computed, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {NotificationService} from '../../../core/notifications/notification.service';
import {StatusChip, StatusTone} from '../../../shared/components/status-chip/status-chip';
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  DocumentResponse,
  DocumentStatus,
  DocumentType,
  latestByType,
} from '../../model/document.model';
import {DriverDocumentsApiService} from '../../services/driver-documents-api.service';

/** Client-side guard; the backend has the final word on size and type. */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const STATUS_TONES: Record<DocumentStatus, StatusTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

interface DocumentSlot {
  type: DocumentType;
  label: string;
  document: DocumentResponse | null;
}

/** Upload the 4 required documents and follow their review (US-17). */
@Component({
  selector: 'app-documents-page',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    StatusChip,
  ],
  templateUrl: './documents-page.html',
  styleUrl: './documents-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsPage implements OnInit {
  private readonly api = inject(DriverDocumentsApiService);
  private readonly notifications = inject(NotificationService);

  protected readonly documents = signal<DocumentResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly uploading = signal<DocumentType | null>(null);

  protected readonly statusLabels = DOCUMENT_STATUS_LABELS;
  protected readonly statusTones = STATUS_TONES;
  protected readonly accept = ACCEPTED_TYPES.join(',');

  protected readonly slots = computed<DocumentSlot[]>(() => {
    const latest = latestByType(this.documents());
    return DOCUMENT_TYPES.map(type => ({
      type,
      label: DOCUMENT_TYPE_LABELS[type],
      document: latest[type] ?? null,
    }));
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.api.list().subscribe({
      next: docs => {
        this.documents.set(docs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  protected onFileSelected(type: DocumentType, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      this.upload(type, file);
    }
  }

  upload(type: DocumentType, file: File): void {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      this.notifications.error('Sube un archivo PDF, JPG o PNG.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.notifications.error('El archivo no debe superar los 10 MB.');
      return;
    }
    this.uploading.set(type);
    this.api.upload(type, file).subscribe({
      next: doc => {
        this.documents.update(docs => [...docs, doc]);
        this.uploading.set(null);
        this.notifications.success(`${DOCUMENT_TYPE_LABELS[type]} enviado a revisión.`);
      },
      error: () => this.uploading.set(null),
    });
  }
}
