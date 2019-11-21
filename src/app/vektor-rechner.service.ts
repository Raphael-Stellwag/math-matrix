import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VektorRechnerService {

  constructor() { }

  skalarSubtraktion(Minuend, Subtrahend, skalar) {
    let obj = {};
    Object.keys(Minuend).forEach(key => {
      obj[key] = Minuend[key] - Subtrahend[key] * skalar;
    })
    return obj;
  }
}
