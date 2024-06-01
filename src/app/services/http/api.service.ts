import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  public postRequest<T, V>(
    url: string,
    responseType: 'text',
    body: object,
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;

  public postRequest<T, V>(
    url: string,
    responseType: 'json',
    body: object,
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;

  public postRequest<T, V>(
    url: string,
    responseType: 'text' | 'json',
    body: object,
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T> {
    let headers = new Headers();
    headers.set('Accept', '*/*');
    headers.set('Access-Control-Allow-Origin', '*');
    for (let x of additionalHeaders) {
      headers.set(x.name, x.value);
    }
    if (responseType == 'json')
      return this.http
        .post(environment.api_url + url, body, {
          headers: new HttpHeaders(headers),
          responseType: responseType,
        })
        .pipe(
          map((value, index) => {
            return callback(value as V);
          })
        );

    return this.http
      .post(environment.api_url + url, body, {
        headers: new HttpHeaders(headers),
        responseType: responseType,
      })
      .pipe(
        map((value, index) => {
          return callback(value as V);
        })
      );
  }

  public getRequest<T, V>(
    url: string,
    responseType: 'text',
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;

  public getRequest<T, V>(
    url: string,
    responseType: 'json',
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;

  public getRequest<T, V>(
    url: string,
    responseType: 'blob',
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;

  public getRequest<T, V>(
    url: string,
    responseType: 'text' | 'json' | 'blob',
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T> {
    let headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', '*/*');
    headers.set('Access-Control-Allow-Origin', '*');
    for (let x of additionalHeaders) {
      headers.set(x.name, x.value);
    }

    if (responseType == 'json')
      return this.http
        .get(environment.api_url + url, {
          headers: new HttpHeaders(headers),
          responseType: responseType,
        })
        .pipe(
          map((value, index) => {
            return callback(value as V);
          })
        );

    if (responseType == 'blob')
      return this.http
        .get(url, {
          headers: new HttpHeaders(headers),
          responseType: responseType,
        })
        .pipe(
          map((value, index) => {
            return callback(value as V);
          })
        );

    return this.http
      .get(environment.api_url + url, {
        headers: new HttpHeaders(headers),
        responseType: responseType,
      })
      .pipe(
        map((value, index) => {
          return callback(value as V);
        })
      );
  }

  public putRequest<T, V>(
    url: string,
    responseType: 'text',
    body: object,
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;

  public putRequest<T, V>(
    url: string,
    responseType: 'json',
    body: object,
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;

  public putRequest<T, V>(
    url: string,
    responseType: 'text' | 'json',
    body: object,
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T> {
    let headers = new Headers();
    headers.set('Accept', '*/*');
    headers.set('Access-Control-Allow-Origin', '*');
    for (let x of additionalHeaders) {
      headers.set(x.name, x.value);
    }
    if (responseType == 'json')
      return this.http
        .put(environment.api_url + url, body, {
          headers: new HttpHeaders(headers),
          responseType: responseType,
        })
        .pipe(
          map((value, index) => {
            return callback(value as V);
          })
        );

    return this.http
      .put(environment.api_url + url, body, {
        headers: new HttpHeaders(headers),
        responseType: responseType,
      })
      .pipe(
        map((value, index) => {
          return callback(value as V);
        })
      );
  }

  public deleteRequest<T, V>(
    url: string,
    responseType: 'text',
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;

  public deleteRequest<T, V>(
    url: string,
    responseType: 'json',
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;

  public deleteRequest<T, V>(
    url: string,
    responseType: 'text' | 'json',
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T> {
    let headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', '*/*');
    headers.set('Access-Control-Allow-Origin', '*');
    for (let x of additionalHeaders) {
      headers.set(x.name, x.value);
    }
    if (responseType == 'json')
      return this.http
        .delete(environment.api_url + url, {
          headers: new HttpHeaders(headers),
          responseType: responseType,
        })
        .pipe(
          map((value, index) => {
            return callback(value as V);
          })
        );

    return this.http
      .delete(environment.api_url + url, {
        headers: new HttpHeaders(headers),
        responseType: responseType,
      })
      .pipe(
        map((value, index) => {
          return callback(value as V);
        })
      );
  }
}
