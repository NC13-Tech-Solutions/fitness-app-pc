import { Pipe, PipeTransform } from '@angular/core';
import { DateData } from 'app/shared/models/date-data.model';

@Pipe({
  name: 'dateDate',
  standalone: true
})
export class DateDatePipe implements PipeTransform {

  transform(value: DateData): string {
    let x = ''
    if(value){
      x = `${value.day} ${value.month}, ${value.year}`
    }
    return x;
  }

}
