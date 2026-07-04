import { Injectable } from '@angular/core';

/** One variable of a general solution: base value plus a coefficient per free parameter. */
export interface SolutionTerm {
  base: number;
  params: number[]; // aligned to freeVars
}

export type EliminationStep =
  | { col: number; pivotFound: false; matrix: number[][] }
  | {
      col: number;
      pivotFound: true;
      targetRow: number;        // pivotRow at loop entry
      sourceRow: number;        // piv - row with the largest |value| in this column
      scale: number;            // p - divisor applied to targetRow (raw, unrounded)
      eliminatedRows: { row: number; factor: number }[]; // rows with f !== 0
      matrix: number[][];       // snapshot after this column's ops
    };

export type SolveResult =
  | { kind: 'unique'; solution: number[]; steps: EliminationStep[] }
  | { kind: 'none'; steps: EliminationStep[] } // consistent-free, i.e. inconsistent -> no solution
  | { kind: 'infinite'; freeVars: number[]; terms: SolutionTerm[]; steps: EliminationStep[] }
  | { kind: 'invalid' }; // non-finite input

@Injectable({
  providedIn: 'root'
})
export class VektorRechnerService {

  /**
   * Solves A.x = b via Gauss-Jordan elimination (full RREF) with partial pivoting.
   * Classifies the system as a unique solution, no solution (inconsistent),
   * or infinitely many solutions (returns the parameterized general solution).
   */
  solve(a: number[][], b: number[]): SolveResult {
    const n = a.length;
    const m = a.map((row, i) => [...row, b[i]]);

    // ponytail: fixed relative tolerance; an exact ===0 pivot test lets float
    // residue produce garbage (~1e15) or misclassify rank for singular input
    let scale = 1;
    for (const row of m) {
      for (const v of row) {
        if (!Number.isFinite(v)) {
          return { kind: 'invalid' };
        }
        scale = Math.max(scale, Math.abs(v));
      }
    }
    const eps = scale * 1e-10;

    // Full RREF: pivotRow advances only when a column actually yields a pivot,
    // so pivot-less columns are recorded as free variables instead of aborting.
    const steps: EliminationStep[] = [];
    const snapshot = () => m.map(row => [...row]);

    const pivotColOfRow: number[] = [];
    let pivotRow = 0;
    for (let col = 0; col < n && pivotRow < n; col++) {
      let piv = pivotRow;
      for (let r = pivotRow + 1; r < n; r++) {
        if (Math.abs(m[r][col]) > Math.abs(m[piv][col])) {
          piv = r;
        }
      }
      if (!(Math.abs(m[piv][col]) > eps)) {
        steps.push({ col, pivotFound: false, matrix: snapshot() });
        continue; // no usable pivot in this column -> free variable
      }
      [m[pivotRow], m[piv]] = [m[piv], m[pivotRow]];
      const p = m[pivotRow][col];
      for (let k = col; k <= n; k++) {
        m[pivotRow][k] /= p;
      }
      const eliminatedRows: { row: number; factor: number }[] = [];
      for (let r = 0; r < n; r++) {
        if (r === pivotRow) { continue; }
        const f = m[r][col];
        if (f !== 0) {
          for (let k = col; k <= n; k++) {
            m[r][k] -= f * m[pivotRow][k];
          }
          eliminatedRows.push({ row: r, factor: f });
        }
      }
      steps.push({ col, pivotFound: true, targetRow: pivotRow, sourceRow: piv, scale: p, eliminatedRows, matrix: snapshot() });
      pivotColOfRow[pivotRow] = col;
      pivotRow++;
    }
    const rank = pivotRow;

    // Consistency: a row that is all-zero in the coefficients but nonzero in the
    // RHS is the contradiction 0 = c, so the system has no solution.
    for (let r = 0; r < n; r++) {
      const coeffsZero = m[r].slice(0, n).every(v => Math.abs(v) <= eps);
      if (coeffsZero && Math.abs(m[r][n]) > eps) {
        return { kind: 'none', steps };
      }
    }

    if (rank === n) {
      const solution = new Array<number>(n);
      for (let r = 0; r < n; r++) {
        solution[pivotColOfRow[r]] = m[r][n];
      }
      return { kind: 'unique', solution, steps };
    }

    // rank < n and consistent -> infinitely many solutions.
    const isPivotCol = new Array<boolean>(n).fill(false);
    for (let r = 0; r < rank; r++) {
      isPivotCol[pivotColOfRow[r]] = true;
    }
    const freeVars: number[] = [];
    for (let col = 0; col < n; col++) {
      if (!isPivotCol[col]) { freeVars.push(col); }
    }

    const terms: SolutionTerm[] = Array.from({ length: n }, () => ({
      base: 0,
      params: new Array<number>(freeVars.length).fill(0),
    }));
    // Free variables: x_free = its own parameter.
    freeVars.forEach((col, idx) => {
      terms[col].params[idx] = 1;
    });
    // Pivot variables: x_pivot = rhs - sum(coeff * free), read off the RREF row.
    for (let r = 0; r < rank; r++) {
      const col = pivotColOfRow[r];
      terms[col].base = m[r][n];
      freeVars.forEach((f, idx) => {
        terms[col].params[idx] = -m[r][f];
      });
    }

    return { kind: 'infinite', freeVars, terms, steps };
  }

}
