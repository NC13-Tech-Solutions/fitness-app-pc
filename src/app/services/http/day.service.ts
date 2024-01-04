import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { DayData } from 'src/app/shared/models/day-data.model';

@Injectable({
  providedIn: 'root',
})
export class DayService {
  private api = inject(ApiService);

  public getAllDays(): Observable<DayData[]> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.getRequest<DayData[], DayData[]>(
      'daydata/all',
      'json',
      [{ name: 'Authorization', value: `Bearer ${JwtToken}` }],
      (value) => {
        if (value != null) {
          return value;
        }
        return [];
      }
    );
  }

  public getDayData(datePostedOn: string): Observable<DayData> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.getRequest<DayData, DayData>(
      `daydata/day/${datePostedOn}`,
      'json',
      [{ name: 'Authorization', value: `Bearer ${JwtToken}` }],
      (value) => {
        return value;
      }
    );
  }
}
