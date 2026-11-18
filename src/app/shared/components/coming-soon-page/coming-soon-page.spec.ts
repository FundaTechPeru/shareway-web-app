import {TestBed} from '@angular/core/testing';
import {ComingSoonPage} from './coming-soon-page';

describe('ComingSoonPage', () => {
  it('renders the given title and the coming-soon message', async () => {
    const fixture = TestBed.createComponent(ComingSoonPage);
    fixture.componentRef.setInput('title', 'Mis documentos');
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Mis documentos');
    expect(text).toContain('Disponible próximamente');
  });
});
