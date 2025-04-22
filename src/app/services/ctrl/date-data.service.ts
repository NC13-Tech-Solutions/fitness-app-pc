import { Injectable } from '@angular/core';
import { DateData } from 'src/app/shared/models/date-data.model';
import { months } from './months.store';

@Injectable({
  providedIn: 'root'
})
export class DateDataService {
  public getDateData(): DateData{
    let date: Date = new Date();

    return{
      day: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear()
    }
  }
}
