import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { VektorRechnerService } from './vektor-rechner.service';


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
  anzahl_unbekannte = 3;
  bool_natuerlich = true;
  show_results = true;
  results = {};
  constructor(private changeDetectorRefs: ChangeDetectorRef, private vektorRechner: VektorRechnerService){}

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

    let change: number = this.anzahl_unbekannte - this.keys.length
    if (change > 0) {
      this.dataSource.forEach(element => {
        for (let index = 0; index < change; index++) {
          element[(this.keys.length + 1) + (index)] = 0;          
        }
      });
      let obj = {};
      this.displayedColumns = ["Nr"]
      for (let index = 0; index < this.anzahl_unbekannte; index++) {
        obj[(index + 1)] = 0;
        this.displayedColumns.push(index + 1 + "");
      }
      obj['Summe'] = 0
      for (let index = 0; index < change; index++) {
        this.dataSource.push(obj);          
      }
      this.keys = Object.keys(this.dataSource[0]);
    } else if (change < 0) {
      this.dataSource = this.deepCopyObjectArray(this.dataSource, this.anzahl_unbekannte)
      this.displayedColumns = [];
      this.keys = [];
      for (let index1 = 0; index1 < this.anzahl_unbekannte; index1++) {
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
    let out: string = "";
    this.dataSource.forEach(function (element, index) {
      out = " " + index + ";";
      Object.keys(element).forEach(function (key) {
        out = out + " " + key + ": "+ element[key];
      });
      console.log(out);
    });


    let copy = this.deepCopyObjectArray(this.dataSource, this.anzahl_unbekannte);
    for(let index = 0;  index < this.anzahl_unbekannte-1; index++) {
      for(let i =0; i < index; i++) {
        let Subtrahend = copy[0];
        let Minnuend = copy[index+1];
        let skalar = Minnuend[i+1]/Subtrahend[i+1];
        let obj = this.vektorRechner.skalarSubtraktion(Minnuend, Subtrahend, skalar);
        copy[index+1] = obj;
      }
      let Subtrahend = copy[index];
      let Minnuend = copy[index+1];
      let skalar = Minnuend[index+1]/Subtrahend[index+1];
      let obj = this.vektorRechner.skalarSubtraktion(Minnuend, Subtrahend, skalar);
      copy[index+1] = obj;
    }
    this.results = {};
    for(let index = this.anzahl_unbekannte; index > 0; index--) {
      for(let i = index+1; i <= this.anzahl_unbekannte; i ++) {
        copy[index-1]["Summe"] = copy[index-1]["Summe"] - copy[index-1][i] * this.results[i];
        copy[index-1][i] = 0;
      }

      let result = copy[index-1]["Summe"] / copy[index-1][index];
      this.results[index] = result;
    }
    this.show_results = true;
  }
}
