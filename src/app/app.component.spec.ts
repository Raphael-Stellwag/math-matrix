import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppComponent
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

  it('reports an inconsistent system as having no solution', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;
    app.equations = [
      { coeffs: [1, 1, 1], sum: 1 },
      { coeffs: [1, 1, 1], sum: 2 },
      { coeffs: [1, 1, 1], sum: 3 },
    ];
    app.calculate();
    expect(app.results).toBeNull();
    expect(app.noSolution).toBe(true);
    expect(app.error).toBeNull();
  });

  it('shows the parameterized general solution for an underdetermined system', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.equations = [
      { coeffs: [1, 0, 1], sum: 5 },
      { coeffs: [0, 1, 2], sum: 3 },
      { coeffs: [1, 0, 1], sum: 5 },
    ];
    app.calculate();
    expect(app.results).toBeNull();
    expect(app.generalRows).not.toBeNull();
    expect(app.generalRows!.map(r => `${r.label} = ${r.expr}`)).toEqual([
      'x₁ = 5 − t',
      'x₂ = 3 − 2·t',
      'x₃ = t',
    ]);
    expect(app.generalRows![2].free).toBe(true);

    // template actually renders the infinite branch
    fixture.detectChanges();
    const text = fixture.nativeElement.querySelector('.solution').textContent;
    expect(text).toContain('Unendlich viele Lösungen');
    expect(text).toContain('x₁ = 5 − t');
    expect(text).toContain('(frei)');
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

  it('renders the elimination trace inside the solution section', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.calculate();
    fixture.detectChanges();
    const details = fixture.nativeElement.querySelector('.solution .trace');
    expect(details).toBeTruthy();
    expect(details.hasAttribute('open')).toBe(false);
    expect(details.querySelector('summary').textContent).toContain('Rechenweg anzeigen');
    expect(app.steps!.length).toBe(3);
  });

  it('should render the calculate button', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('button.solve').textContent).toContain('Berechnen');
  });
});
