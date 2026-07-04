import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EliminationStep, SolutionTerm, VektorRechnerService } from './vektor-rechner.service';

interface Equation {
  coeffs: (number | null)[];
  sum: number | null;
}

interface GeneralRow {
  label: string;
  expr: string;
  free: boolean;
}

interface DisplayStep {
  caption: string;
  ops: string[];
  matrix: number[][];
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule]
})
export class AppComponent {
  private vektorRechner = inject(VektorRechnerService);

  readonly minSize = 2;
  readonly maxSize = 8;
  readonly roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  size = 3;
  equations: Equation[] = [
    { coeffs: [1, 2, 1], sum: 1 },
    { coeffs: [3, 1, 2], sum: 1 },
    { coeffs: [2, 2, 1], sum: 3 },
  ];
  results: number[] | null = null;
  generalRows: GeneralRow[] | null = null;
  noSolution = false;
  error: string | null = null;
  steps: DisplayStep[] | null = null;

  changeSize(delta: number) {
    const next = Math.min(this.maxSize, Math.max(this.minSize, this.size + delta));
    if (next === this.size) {
      return;
    }
    this.size = next;
    this.equations = Array.from({ length: next }, (_, i) => ({
      coeffs: Array.from({ length: next }, (_, j) => this.equations[i]?.coeffs[j] ?? null),
      sum: this.equations[i]?.sum ?? null,
    }));
    this.clearResults();
  }

  clearResults() {
    this.results = null;
    this.generalRows = null;
    this.noSolution = false;
    this.error = null;
    this.steps = null;
  }

  calculate() {
    this.clearResults();

    const cells = this.equations.flatMap(eq => [...eq.coeffs, eq.sum]);
    if (cells.some(v => typeof v !== 'number' || !Number.isFinite(v))) {
      this.error = 'Bitte fülle alle Felder aus.';
      return;
    }

    const result = this.vektorRechner.solve(
      this.equations.map(eq => eq.coeffs as number[]),
      this.equations.map(eq => eq.sum as number),
    );
    if (result.kind !== 'invalid') {
      this.steps = toDisplaySteps(result.steps, this.roman);
    }
    switch (result.kind) {
      case 'unique':
        this.results = result.solution.map(round6);
        break;
      case 'none':
        this.noSolution = true;
        break;
      case 'infinite': {
        const paramNames = this.parameterNames(result.freeVars.length);
        this.generalRows = result.terms.map((term, i) => ({
          label: `x${sub(i + 1)}`,
          expr: formatTerm(term, paramNames),
          free: result.freeVars.includes(i),
        }));
        break;
      }
      default: // 'invalid' — unreachable after the finite-number validation above
        this.error = 'Bitte fülle alle Felder aus.';
    }
  }

  private parameterNames(count: number): string[] {
    if (count === 1) {
      return ['t'];
    }
    return Array.from({ length: count }, (_, i) => `t${sub(i + 1)}`);
  }
}

// ponytail: 6 Nachkommastellen reichen; parseFloat entfernt 0.999999-Artefakte und "-0"
function round6(v: number): number {
  return parseFloat(v.toFixed(6));
}

const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';
function sub(n: number): string {
  return String(n).replace(/\d/g, d => SUBSCRIPTS[+d]);
}

function formatTerm(term: SolutionTerm, paramNames: string[]): string {
  const base = round6(term.base);
  const parts: string[] = [];
  paramNames.forEach((name, idx) => {
    const c = round6(term.params[idx]);
    if (c === 0) { return; }
    const sign = c < 0 ? '−' : '+';
    const mag = Math.abs(c);
    const body = mag === 1 ? name : `${mag}·${name}`;
    parts.push(`${sign} ${body}`);
  });

  if (parts.length === 0) {
    return `${base}`;
  }
  // Fold a nonzero base in as the leading constant; otherwise start with the
  // first parameter (dropping a leading "+ " and keeping a leading "−").
  if (base !== 0) {
    return [`${base}`, ...parts].join(' ');
  }
  const [first, ...rest] = parts;
  const lead = first.startsWith('−') ? first.replace('− ', '−') : first.replace('+ ', '');
  return [lead, ...rest].join(' ');
}

function toDisplaySteps(steps: EliminationStep[], roman: string[]): DisplayStep[] {
  return steps.map(step => {
    if (!step.pivotFound) {
      return {
        caption: `Spalte ${step.col + 1}: kein Pivot – x${sub(step.col + 1)} ist frei wählbar`,
        ops: [],
        matrix: formatMatrix(step.matrix),
      };
    }
    const ops: string[] = [];
    if (step.sourceRow !== step.targetRow) {
      ops.push(`Zeile ${roman[step.sourceRow]} ↔ Zeile ${roman[step.targetRow]}`);
    }
    const scale = round6(step.scale);
    if (scale !== 1) {
      ops.push(`Zeile ${roman[step.targetRow]} ÷ ${scale}`);
    }
    for (const { row, factor } of step.eliminatedRows) {
      const f = round6(factor);
      const sign = f < 0 ? '+=' : '−=';
      const mag = Math.abs(f);
      const body = mag === 1 ? `Zeile ${roman[step.targetRow]}` : `${mag}·Zeile ${roman[step.targetRow]}`;
      ops.push(`Zeile ${roman[row]} ${sign} ${body}`);
    }
    return { caption: `Spalte ${step.col + 1} eliminieren`, ops, matrix: formatMatrix(step.matrix) };
  });
}

function formatMatrix(matrix: number[][]): number[][] {
  return matrix.map(row => row.map(round6));
}
