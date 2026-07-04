import { VektorRechnerService } from './vektor-rechner.service';

describe('VektorRechnerService', () => {
  const service = new VektorRechnerService();

  it('solves a system with a unique solution', () => {
    const x = service.solve([[1, 2, 1], [3, 1, 2], [2, 2, 1]], [1, 1, 3]);
    expect(x).not.toBeNull();
    expect(x[0]).toBeCloseTo(2, 10);
    expect(x[1]).toBeCloseTo(1, 10);
    expect(x[2]).toBeCloseTo(-3, 10);
  });

  it('solves with decimal coefficients', () => {
    const x = service.solve([[0.5, 0], [0, 4]], [1, 2]);
    expect(x[0]).toBeCloseTo(2, 10);
    expect(x[1]).toBeCloseTo(0.5, 10);
  });

  it('rejects a singular inconsistent system instead of returning garbage', () => {
    // linear-solve returned x ~ 1.3e15 here because float residue slipped
    // past its exact ===0 pivot check
    expect(service.solve([[3, 7], [6, 14]], [1, 3])).toBeNull();
  });

  it('rejects underdetermined systems (no unique solution)', () => {
    expect(service.solve([[1, 1], [2, 2]], [1, 2])).toBeNull();
    expect(service.solve([[0, 1], [0, 0]], [1, 0])).toBeNull();
  });

  it('rejects NaN input', () => {
    expect(service.solve([[NaN, 1], [1, 1]], [1, 2])).toBeNull();
  });

  it('handles a zero leading pivot via row swap', () => {
    const x = service.solve([[0, 1], [1, 0]], [3, 4]);
    expect(x[0]).toBeCloseTo(4, 10);
    expect(x[1]).toBeCloseTo(3, 10);
  });
});
