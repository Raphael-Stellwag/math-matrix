import { Component, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';

import { VektorRechnerService } from './vektor-rechner.service';
import * as linear from 'linear-solve';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AppComponent {
  private changeDetectorRefs = inject(ChangeDetectorRef);
  private vektorRechner = inject(VektorRechnerService);

  title = 'math-matrix';
  anzahl_unbekannte = '3';
  bool_natuerlich = true;
  show_results = false;
  results: number[] = [];

  displayedColumns: string[] = ['Nr', '1', '2', '3', 'Summe'];
  dataSource: object[] = [
    {1:1, 2: 2, 3: 1, Summe: 1},
    {1:3, 2: 1, 3: 2, Summe: 1},
    {1:2, 2: 2, 3: 1, Summe: 3},
  ];

  anzahlUnbekannteCountArray(): number[] { 
    return Array(parseInt(this.anzahl_unbekannte)); 
  } 

  sizeChanged() {
    this.show_results = false;

    const countNewRows: number = parseInt(this.anzahl_unbekannte) - (this.displayedColumns.length - 2)
    if (countNewRows > 0) {
      this.addRows(countNewRows);
    } else if (countNewRows < 0) {
      this.removeRows();
    }

    this.changeDetectorRefs.detectChanges();
  }

  removeRows() {
    this.dataSource = this.deepCopyObjectArray(this.dataSource, this.anzahl_unbekannte)
    const keys = ["Nr"];
    for (let index = 1; index <= parseInt(this.anzahl_unbekannte); index++) {
      keys.push(index + "");
    }
    keys.push("Summe");
    this.displayedColumns = keys;
  }

  addRows(countNewRows: number) {
    const oldCountOfRows = (this.displayedColumns.length - 2); //Substract Nr and Summe
    
    // Add the columns for the existing rows
    for(const element of this.dataSource) {
      for (let index = 1; index <= countNewRows; index++) {
        element[oldCountOfRows + index] = 0;          
      }
    }

    // Add new rows to the datasource
    const obj = {};
    this.displayedColumns = ["Nr"]
    for (let index = 1; index <= parseInt(this.anzahl_unbekannte); index++) {
      obj[index] = 0;
      this.displayedColumns.push(index + "");
    }
    this.displayedColumns.push("Summe");
    obj['Summe'] = 0;
    for (let index = 0; index < countNewRows; index++) {
      this.dataSource.push(obj);          
    }

  }

  private deepCopyObjectArray(d2Array, count) {
    const obj = [];
    for (let index1 = 0; index1 < count; index1++) {
      obj[index1] = {"Summe": d2Array[index1]["Summe"]};
      for (let index2 = 0; index2 <count; index2++) {
        obj[index1][index2+1] = d2Array[index1][index2+1];
      }
    }
    return obj;
  }

  calculate() {
    console.log(this.dataSource);

    const sum = [];
    const matrix = [];
    for(const row of this.dataSource) {
      const newMatrixRow = [];
      for(const key of Object.keys(row)) {
        if (key == "Summe") {
          sum.push(parseInt(row[key]));
        } else {
          newMatrixRow.push(parseInt(row[key]));
        }
      }
      matrix.push(newMatrixRow);
    }
    console.log(matrix);
    console.log(sum);

    this.results = null;
    try {
      
      this.results = linear.solve(matrix, sum);
      if (this.results instanceof Array) {
        this.show_results = true;
      } else {
        this.show_results = false;
      }
    } catch {
      this.show_results = false;
      alert("This is not solveable");
    }
    
  }
}
