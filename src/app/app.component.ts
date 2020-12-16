import { element } from 'protractor';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { VektorRechnerService } from './vektor-rechner.service';
var linear = require("../../node_modules/linear-solve/gauss-jordan.js");

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
    let obj = {};
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
