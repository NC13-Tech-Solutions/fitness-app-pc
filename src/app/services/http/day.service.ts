import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { DayData } from 'src/app/shared/models/day-data.model';
import { DateData } from 'src/app/shared/models/date-data.model';

@Injectable({
  providedIn: 'root',
})
export class DayService {
  private api = inject(ApiService);
  private entryPoint = 'daydata';

  /**
   *Gets all day data
   * @returns Observable of list of all {@link DayData}
   */
  public getAllDays(): Observable<DayData[]> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.getRequest<DayData[], DayData[]>(
      `${this.entryPoint}/all`,
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
  /**
   *Finds the day data posted on {@link DateData} date
   * @remarks {@link DateData.day} value will be `1` as day value is not needed
   * @param datePostedOn
   * @returns Observable of list of all {@link DayData}
   */
  public getDayDataForMonth(datePostedOn: DateData): Observable<DayData[]> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.postRequest<DayData[], DayData[]>(
      `${this.entryPoint}/day`,
      'json',
      datePostedOn,
      [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Authorization', value: `Bearer ${JwtToken}` },
      ],
      (value) => {
        if (value) return value;
        return [];
      }
    );
  }

  /**
   * Finds the day data posted on {@link DateData} date
   * @param datePostedOn
   * @returns Observable of {@link DayData} or `null` if day data doesn't exist on that date
   */
  public getDayData(datePostedOn: DateData): Observable<DayData> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.postRequest<DayData, DayData>(
      `${this.entryPoint}/day`,
      'json',
      datePostedOn,
      [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Authorization', value: `Bearer ${JwtToken}` },
      ],
      (value) => {
        return value;
      }
    );
  }

  /**
   * Adds a new day data
   * @param dayData
   * @returns Observable of number which returns the following:
   * `1` - if insert is successful; `-1` - if not successful; `0` - if another day data is already posted on that day
   */
  public addDayData(dayData: DayData): Observable<number> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.postRequest<number, number>(
      `${this.entryPoint}/new`,
      'text',
      dayData,
      [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Authorization', value: `Bearer ${JwtToken}` },
      ],
      (value) => {
        return value;
      }
    );
  }

  /**
   * Edits the day data for the day
   * @remarks {@link DayData.ddId} will be used to find the day data
   * @param dayData
   * @returns Observable of number which returns the following:
   * `1` - if update is successful; `-1` - if previous day data was not found; `0` - if another day data is already posted on that day
   */
  public editDayData(dayData: DayData): Observable<number> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.putRequest<number, number>(
      `${this.entryPoint}/${dayData.ddId}`,
      'text',
      dayData,
      [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Authorization', value: `Bearer ${JwtToken}` },
      ],
      (value) => {
        return value;
      }
    );
  }
}
