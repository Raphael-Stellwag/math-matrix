import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { VektorRechnerService } from './vektor-rechner.service';

interface Equation {
  coeffs: (number | null)[];
  sum: number | null;
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
  error: string | null = null;

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
    this.error = null;
  }

  calculate() {
    this.clearResults();

    const cells = this.equations.flatMap(eq => [...eq.coeffs, eq.sum]);
    if (cells.some(v => typeof v !== 'number' || !Number.isFinite(v))) {
      this.error = 'Bitte fülle alle Felder aus.';
      return;
    }

    const solution = this.vektorRechner.solve(
      this.equations.map(eq => eq.coeffs as number[]),
      this.equations.map(eq => eq.sum as number),
    );
    if (solution) {
      // ponytail: 6 Nachkommastellen reichen; parseFloat entfernt 0.999999-Artefakte und "-0"
      this.results = solution.map(v => parseFloat(v.toFixed(6)));
    } else {
      this.error = 'Dieses Gleichungssystem hat keine eindeutige Lösung.';
    }
  }
}
