import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  /**
   * Creates a post request to the `url` end point, where `T` is the type of data that you want to return and `V` is the type of data returned by the api endpoint
   * @param url
   * @param responseType
   * @param body
   * @param additionalHeaders
   * @param callback The function used to convert the `V` type data returned from the api call into `T` type
   * @returns `Observable<T>`
   */
  public postRequest<T, V>(
    url: string,
    responseType: 'text',
    body: object,
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;
  /**
   * Creates a post request to the `url` end point, where `T` is the type of data that you want to return and `V` is the type of data returned by the api endpoint
   * @param url
   * @param responseType
   * @param body
   * @param additionalHeaders
   * @param callback The function used to convert the `V` type data returned from the api call into `T` type
   * @returns `Observable<T>` where `T` is the type of data that you want to return
   */
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

  /**
   *Creates a get request to the `url` end point, where `T` is the type of data that you want to return and `V` is the type of data returned by the api endpoint
   * @param url
   * @param responseType
   * @param additionalHeaders
   * @param callback The function used to convert the `V` type data returned from the api call into `T` type
   * @returns `Observable<T>` where `T` is the type of data that you want to return
   */
  public getRequest<T, V>(
    url: string,
    responseType: 'text',
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;
  /**
   *Creates a get request to the `url` end point, where `T` is the type of data that you want to return and `V` is the type of data returned by the api endpoint
   * @param url
   * @param responseType
   * @param additionalHeaders
   * @param callback The function used to convert the `V` type data returned from the api call into `T` type
   * @returns `Observable<T>` where `T` is the type of data that you want to return
   */
  public getRequest<T, V>(
    url: string,
    responseType: 'json',
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;
  /**
   *Creates a get request to the `url` end point, where `T` is the type of data that you want to return and `V` is the type of data returned by the api endpoint
   * @param url
   * @param responseType
   * @param additionalHeaders
   * @param callback The function used to convert the `V` type data returned from the api call into `T` type
   * @returns `Observable<T>` where `T` is the type of data that you want to return
   */
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
  /**
   *Creates a get request to the `url` end point, where `T` is the type of data that you want to return and `V` is the type of data returned by the api endpoint
   * @param url
   * @param responseType
   * @param body
   * @param additionalHeaders
   * @param callback The function used to convert the `V` type data returned from the api call into `T` type
   * @returns `Observable<T>` where `T` is the type of data that you want to return
   */
  public putRequest<T, V>(
    url: string,
    responseType: 'text',
    body: object,
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;

  /**
   *Creates a get request to the `url` end point, where `T` is the type of data that you want to return and `V` is the type of data returned by the api endpoint
   * @param url
   * @param responseType
   * @param body
   * @param additionalHeaders
   * @param callback The function used to convert the `V` type data returned from the api call into `T` type
   * @returns `Observable<T>` where `T` is the type of data that you want to return
   */
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

  /**
   *Creates a delete request to the `url` end point, where `T` is the type of data that you want to return and `V` is the type of data returned by the api endpoint
   * @param url
   * @param responseType
   * @param additionalHeaders
   * @param callback The function used to convert the `V` type data returned from the api call into `T` type
   * @returns `Observable<T>` where `T` is the type of data that you want to return
   */
  public deleteRequest<T, V>(
    url: string,
    responseType: 'text',
    additionalHeaders: { name: string; value: string }[],
    callback: (x: V) => T
  ): Observable<T>;

  /**
   *Creates a delete request to the `url` end point, where `T` is the type of data that you want to return and `V` is the type of data returned by the api endpoint
   * @param url
   * @param responseType
   * @param additionalHeaders
   * @param callback The function used to convert the `V` type data returned from the api call into `T` type
   * @returns `Observable<T>` where `T` is the type of data that you want to return
   */
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
