import { Injectable } from '@angular/core';
import * as d3 from 'd3';

export interface DummyData {
  name: string;
  value: number;
  value2: number;
  date: string;
}
type DummyDataType = keyof DummyData;

@Injectable({
  providedIn: 'root',
})
export class DataGeneratorService {
  COLORSET = d3.schemeSet1.concat(d3.schemeSet2).concat(d3.schemeSet3);

  constructor() {}

  generateDummyData(): DummyData[] {
    const result = [];
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');
    const nameSet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    const oneday = 1000 * 60 * 60 * 24;
    const dayGap = (endDate.getTime() - startDate.getTime()) / oneday + 1;

    for (let i = 0; i < dayGap; i++) {
      for (let eachName of nameSet) {
        result.push({
          name: eachName,
          value: d3.randomInt(1000000)(),
          value2: d3.randomInt(1000000)(),
          date: d3.timeFormat('%Y-%m-%d')(this.addDays(startDate, i)),
        });
      }
    }

    return result;
  }

  getData(
    source: DummyData[],
    field: DummyDataType,
    value: string | number
  ): DummyData[] {
    const res: any[] = [];
    source.map((obj: DummyData) => {
      if (obj[field] == value) {
        res.push(obj);
      }
    });

    return res;
  }

  addDays(date: Date, days: number): Date {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
