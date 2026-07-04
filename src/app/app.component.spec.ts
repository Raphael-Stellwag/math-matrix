import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        FormsModule
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('solves the default 3x3 system', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;
    app.calculate();
    expect(app.results).toEqual([2, 1, -3]);
    expect(app.error).toBeNull();
  });

  it('reports empty fields instead of computing with them', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;
    app.equations[0].coeffs[1] = null;
    app.calculate();
    expect(app.results).toBeNull();
    expect(app.error).toContain('alle Felder');
  });

  it('reports systems without a unique solution', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;
    app.equations = [
      { coeffs: [1, 1, 1], sum: 1 },
      { coeffs: [1, 1, 1], sum: 2 },
      { coeffs: [1, 1, 1], sum: 3 },
    ];
    app.calculate();
    expect(app.results).toBeNull();
    expect(app.error).toContain('keine eindeutige Lösung');
  });

  it('grows and shrinks the system while keeping entered values', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;
    app.changeSize(1);
    expect(app.size).toBe(4);
    expect(app.equations.length).toBe(4);
    expect(app.equations[3].coeffs).toEqual([null, null, null, null]);
    // rows must be independent objects (regression: shared reference)
    app.equations[3].coeffs[0] = 7;
    expect(app.equations[2].coeffs[0]).not.toBe(7);
    app.changeSize(-1);
    expect(app.equations[0].coeffs).toEqual([1, 2, 1]);
  });

  it('should render the calculate button', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('button.solve').textContent).toContain('Berechnen');
  });
});
