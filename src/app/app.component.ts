import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import { VektorRechnerService } from './vektor-rechner.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppComponent {
  title = 'math-matrix';
  anzahl_unbekannte: string = '3';
  bool_natuerlich = true;
  show_results = false;
  results: number[] = [];

  constructor(private changeDetectorRefs: ChangeDetectorRef, private vektorRechner: VektorRechnerService){}

  displayedColumns: string[] = ['Nr', '1', '2', '3', 'Summe'];
  dataSource: object[] = [
    {1:1, 2: 2, 3: 1, Summe: 1},
    {1:3, 2: 1, 3: 2, Summe: 1},
    {1:2, 2: 2, 3: 1, Summe: 3},
  ];

  anzahlUnbekannteCountArray(): Array<number> { 
    return Array(parseInt(this.anzahl_unbekannte)); 
  } 

  sizeChanged() {
    this.show_results = false;

    let countNewRows: number = parseInt(this.anzahl_unbekannte) - (this.displayedColumns.length - 2)
    if (countNewRows > 0) {
      this.addRows(countNewRows);
    } else if (countNewRows < 0) {
      this.removeRows();
    }

    this.changeDetectorRefs.detectChanges();
  }

  removeRows() {
    this.dataSource = this.deepCopyObjectArray(this.dataSource, this.anzahl_unbekannte)
    let keys = ["Nr"];
    for (let index = 1; index <= parseInt(this.anzahl_unbekannte); index++) {
      keys.push(index + "");
    }
    keys.push("Summe");
    this.displayedColumns = keys;
  }

  addRows(countNewRows: number) {
    let oldCountOfRows = (this.displayedColumns.length - 2); //Substract Nr and Summe
    
    // Add the columns for the existing rows
    for(let element of this.dataSource) {
      for (let index = 1; index <= countNewRows; index++) {
        element[oldCountOfRows + index] = 0;          
      }
    }

    // Add new rows to the datasource
    this.displayedColumns = ["Nr"]
    for (let index = 1; index <= parseInt(this.anzahl_unbekannte); index++) {
      this.displayedColumns.push(index + "");
    }
    this.displayedColumns.push("Summe");
    for (let index = 0; index < countNewRows; index++) {
      // a fresh object per row - a shared one would alias the rows
      let obj = {};
      for (let col = 1; col <= parseInt(this.anzahl_unbekannte); col++) {
        obj[col] = 0;
      }
      obj['Summe'] = 0;
      this.dataSource.push(obj);
    }

  }

  private deepCopyObjectArray(d2Array, count) {
    let obj = [];
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

    let sum = [];
    let matrix = [];
    for(let row of this.dataSource) {
      let newMatrixRow = [];
      for(let key of Object.keys(row)) {
        let value = parseFloat(row[key]);
        if (isNaN(value)) {
          this.show_results = false;
          alert("Bitte alle Felder mit Zahlen füllen");
          return;
        }
        if (key == "Summe") {
          sum.push(value);
        } else {
          newMatrixRow.push(value);
        }
      }
      matrix.push(newMatrixRow);
    }
    console.log(matrix);
    console.log(sum);

    let solution = this.vektorRechner.solve(matrix, sum);
    if (solution) {
      // round away float noise like 1.9999999999999998
      this.results = solution.map(x => Math.round(x * 1e10) / 1e10);
      this.show_results = true;
    } else {
      this.show_results = false;
      alert("Das Gleichungssystem hat keine eindeutige Lösung");
    }
  }
}
