import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VektorRechnerService {

  /**
   * Solves A.x = b via Gauss-Jordan elimination with partial pivoting.
   * Returns null if the system has no unique solution (singular matrix,
   * i.e. inconsistent or underdetermined) or the input contains NaN.
   */
  solve(a: number[][], b: number[]): number[] | null {
    const n = a.length;
    const m = a.map((row, i) => [...row, b[i]]);

    // ponytail: fixed relative tolerance; replaces the exact ===0 pivot test
    // of linear-solve that let float residue produce garbage for singular input
    let scale = 1;
    for (const row of m) {
      for (const v of row) {
        scale = Math.max(scale, Math.abs(v));
      }
    }
    const eps = scale * 1e-10;

    for (let col = 0; col < n; col++) {
      let piv = col;
      for (let r = col + 1; r < n; r++) {
        if (Math.abs(m[r][col]) > Math.abs(m[piv][col])) {
          piv = r;
        }
      }
      if (!(Math.abs(m[piv][col]) > eps)) {
        return null; // no usable pivot: singular (or NaN input)
      }
      [m[col], m[piv]] = [m[piv], m[col]];
      const p = m[col][col];
      for (let k = col; k <= n; k++) {
        m[col][k] /= p;
      }
      for (let r = 0; r < n; r++) {
        if (r === col) { continue; }
        const f = m[r][col];
        if (f !== 0) {
          for (let k = col; k <= n; k++) {
            m[r][k] -= f * m[col][k];
          }
        }
      }
    }
    return m.map(row => row[n]);
  }

}
