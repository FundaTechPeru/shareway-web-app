import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {Shell} from './shell';

describe('Shell', () => {
  it('shows the ShareWay brand in the toolbar', async () => {
    TestBed.configureTestingModule({providers: [provideRouter([])]});
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();

    const brand = (fixture.nativeElement as HTMLElement).querySelector('.brand');
    expect(brand?.textContent).toContain('ShareWay');
  });
});
