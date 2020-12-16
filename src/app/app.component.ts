import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { VektorRechnerService } from './vektor-rechner.service';
var linear = require("../../node_modules/linear-solve/gauss-jordan.js");

const NEW_ELEMENT_DATA: object[] = [
  {1:1, 2: 2, 3: 3},//, get: (element: any, i: number) => `${element['x'+i]}` },
  {1:4, 2: 5, 3: 6},//, get: (element: any, i: number) => `${element['x'+i]}` },
  {1:7, 2: 8, 3: 9},//, get: (element: any, i: number) => `${element['x'+i]}` },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'math-matrix';
  anzahl_unbekannte: string = '3';
  bool_natuerlich = true;
  show_results = false;
  results = {};

  constructor(private changeDetectorRefs: ChangeDetectorRef, private vektorRechner: VektorRechnerService){

    }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  displayedColumns: string[] = ['Nr', '1', '2', '3', 'Summe'];
  dataSource: object[] = [
    {1:1, 2: 2, 3: 1, Summe: 1},
    {1:3, 2: 1, 3: 2, Summe: 1},
    {1:2, 2: 2, 3: 1, Summe: 3},
  ];

  keys: string[] = ['1','2','3'];

  sizeChanged() {
    this.show_results = false;

    let change: number = parseInt(this.anzahl_unbekannte) - this.keys.length
    if (change > 0) {
      this.dataSource.forEach(element => {
        for (let index = 0; index < change; index++) {
          element[(this.keys.length + 1) + (index)] = 0;          
        }
      });
      let obj = {};
      this.displayedColumns = ["Nr"]
      for (let index = 0; index < parseInt(this.anzahl_unbekannte); index++) {
        obj[(index + 1)] = 0;
        this.displayedColumns.push(index + 1 + "");
      }
      this.keys = Object.keys(obj);
      obj['Summe'] = 0;
      for (let index = 0; index < change; index++) {
        this.dataSource.push(obj);          
      }
    } else if (change < 0) {
      this.dataSource = this.deepCopyObjectArray(this.dataSource, this.anzahl_unbekannte)
      this.displayedColumns = [];
      this.keys = [];
      for (let index1 = 0; index1 < parseInt(this.anzahl_unbekannte); index1++) {
        this.keys.push(index1 + 1 + "");
      }
      this.displayedColumns = this.displayedColumns.concat("Nr", this.keys);
    }

    this.displayedColumns.push("Summe");
    this.changeDetectorRefs.detectChanges();
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
        if (key == "Summe") {
          sum.push(row[key]);
        } else {
          newMatrixRow.push(row[key]);
        }
      }
      matrix.push(newMatrixRow);
    }
    console.log(matrix);
    console.log(sum);

    this.results = null;
    this.results = linear.solve(matrix, sum);
    if (this.results instanceof Array) {
      this.show_results = true;
    } else {
      this.show_results = false;
    }
  }
}
