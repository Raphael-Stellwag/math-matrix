import { VektorRechnerService } from './vektor-rechner.service';

describe('VektorRechnerService', () => {
  const service = new VektorRechnerService();

  it('solves a system with a unique solution', () => {
    const r = service.solve([[1, 2, 1], [3, 1, 2], [2, 2, 1]], [1, 1, 3]);
    expect(r.kind).toBe('unique');
    if (r.kind === 'unique') {
      expect(r.solution[0]).toBeCloseTo(2, 10);
      expect(r.solution[1]).toBeCloseTo(1, 10);
      expect(r.solution[2]).toBeCloseTo(-3, 10);
    }
  });

  it('solves with decimal coefficients', () => {
    const r = service.solve([[0.5, 0], [0, 4]], [1, 2]);
    expect(r.kind).toBe('unique');
    if (r.kind === 'unique') {
      expect(r.solution[0]).toBeCloseTo(2, 10);
      expect(r.solution[1]).toBeCloseTo(0.5, 10);
    }
  });

  it('reports no solution for an inconsistent singular system', () => {
    // linear-solve once returned x ~ 1.3e15 here; must be classified 'none'
    expect(service.solve([[3, 7], [6, 14]], [1, 3]).kind).toBe('none');
  });

  it('reports no solution for an inconsistent 3x3 (dependent rows, incompatible rhs)', () => {
    // row3 = row1 + row2 in coefficients, but 1 + 2 != 4 on the rhs
    expect(service.solve([[1, 1, 1], [1, 2, 3], [2, 3, 4]], [1, 2, 4]).kind).toBe('none');
  });

  it('returns the general solution for an underdetermined 2x2 system', () => {
    // x1 + x2 = 1 ; 2x1 + 2x2 = 2  ->  x1 = 1 - t, x2 = t
    const r = service.solve([[1, 1], [2, 2]], [1, 2]);
    expect(r.kind).toBe('infinite');
    if (r.kind === 'infinite') {
      expect(r.freeVars).toEqual([1]);
      expect(r.terms[0].base).toBeCloseTo(1, 10);
      expect(r.terms[0].params[0]).toBeCloseTo(-1, 10);
      expect(r.terms[1].base).toBeCloseTo(0, 10);
      expect(r.terms[1].params[0]).toBeCloseTo(1, 10);
    }
  });

  it('handles a free leading variable (pivot shift)', () => {
    // x2 = 1 ; 0 = 0  ->  x1 = t (free), x2 = 1
    const r = service.solve([[0, 1], [0, 0]], [1, 0]);
    expect(r.kind).toBe('infinite');
    if (r.kind === 'infinite') {
      expect(r.freeVars).toEqual([0]);
      expect(r.terms[0].base).toBeCloseTo(0, 10);
      expect(r.terms[0].params[0]).toBeCloseTo(1, 10);
      expect(r.terms[1].base).toBeCloseTo(1, 10);
      expect(r.terms[1].params[0]).toBeCloseTo(0, 10);
    }
  });

  it('returns the general solution for an underdetermined 3x3 system', () => {
    // x1 + x3 = 5 ; x2 + 2x3 = 3 ; duplicate of eq1  ->  x3 = t free
    const r = service.solve([[1, 0, 1], [0, 1, 2], [1, 0, 1]], [5, 3, 5]);
    expect(r.kind).toBe('infinite');
    if (r.kind === 'infinite') {
      expect(r.freeVars).toEqual([2]);
      // x1 = 5 - t
      expect(r.terms[0].base).toBeCloseTo(5, 10);
      expect(r.terms[0].params[0]).toBeCloseTo(-1, 10);
      // x2 = 3 - 2t
      expect(r.terms[1].base).toBeCloseTo(3, 10);
      expect(r.terms[1].params[0]).toBeCloseTo(-2, 10);
      // x3 = t
      expect(r.terms[2].base).toBeCloseTo(0, 10);
      expect(r.terms[2].params[0]).toBeCloseTo(1, 10);
    }
  });

  it('rejects non-finite input', () => {
    expect(service.solve([[NaN, 1], [1, 1]], [1, 2]).kind).toBe('invalid');
  });

  it('handles a zero leading pivot via row swap', () => {
    const r = service.solve([[0, 1], [1, 0]], [3, 4]);
    expect(r.kind).toBe('unique');
    if (r.kind === 'unique') {
      expect(r.solution[0]).toBeCloseTo(4, 10);
      expect(r.solution[1]).toBeCloseTo(3, 10);
    }
  });

  it('records one step per pivot column for the default 3x3 system', () => {
    const r = service.solve([[1, 2, 1], [3, 1, 2], [2, 2, 1]], [1, 1, 3]);
    expect(r.kind).toBe('unique');
    if (r.kind === 'unique') {
      expect(r.steps.length).toBe(3);
      expect(r.steps.every(s => s.pivotFound)).toBe(true);
    }
  });

  it('records a swap step when partial pivoting reorders rows', () => {
    const r = service.solve([[0, 1], [1, 0]], [3, 4]);
    if (r.kind === 'unique') {
      const first = r.steps[0];
      expect(first.pivotFound).toBe(true);
      if (first.pivotFound) {
        expect(first.sourceRow).toBe(1);
        expect(first.targetRow).toBe(0);
      }
    }
  });

  it('records a skipped column as a free variable', () => {
    const r = service.solve([[0, 1], [0, 0]], [1, 0]);
    expect(r.kind).toBe('infinite');
    if (r.kind === 'infinite') {
      expect(r.steps[0]).toEqual(jasmine.objectContaining({ col: 0, pivotFound: false }));
    }
  });

  it('records steps and a contradictory final row for an inconsistent system', () => {
    const r = service.solve([[3, 7], [6, 14]], [1, 3]);
    expect(r.kind).toBe('none');
    if (r.kind === 'none') {
      expect(r.steps.length).toBe(2);
      const last = r.steps.at(-1)!.matrix;
      const contradiction = last.some(row =>
        row.slice(0, -1).every(v => Math.abs(v) < 1e-9) && Math.abs(row.at(-1)!) > 1e-9);
      expect(contradiction).toBe(true);
    }
  });
});
