import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileSharingService {
  private api = inject(ApiService);

  /**
   * Uploads a file to the server
   * @param file
   * @param type is either `images` or `videos`
   * @returns Observable of string which contains the file url in the server, if upload is successful or empty string if otherwise
   */
  public uploadFile(file: File, type: 'images' | 'videos'): Observable<string> {
    const JwtToken = localStorage.getItem('JwtToken');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', type);
    return this.api.postRequest<string, string>(
      'files/add',
      'text',
      formData,
      [{ name: 'Authorization', value: `Bearer ${JwtToken}` }],
      (value) => {
        if (value) {
          return value;
        }
        return '';
      }
    );
  }

  /**
   * Deletes the file from the server
   * @param fileName
   * @param type is either `images` or `videos`
   * @returns Observable of number which returns `1` if delete is successful; `-1` or `0` if otherwise
   */
  public deleteFile(
    fileName: string,
    type: 'images' | 'videos'
  ): Observable<number> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.deleteRequest<number, number>(
      'files/' + type + '/' + fileName,
      'text',
      [{ name: 'Authorization', value: `Bearer ${JwtToken}` }],
      (value) => {
        console.log('Moonjakkam', value);
        return value;
      }
    );
  }

  /**
   * Allows to stream the video file from the server with Jwt Authentication
   * @remarks Retrieves the file from the server as a {@link Blob} and uses {@link URL.createObjectURL} to read the file
   * @param fileUrl url of the video file in the server
   * @returns Observable of string, where the blob data will be converted into string URL, if it is available or else empty string will be returned
   */
  public viewVideoFile(fileUrl: string): Observable<string> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.getRequest<string, Blob>(
      fileUrl,
      'blob',
      [{ name: 'Authorization', value: `Bearer ${JwtToken}` }],
      (value) => {
        console.log('Moonjakkam', value);
        if (value) return URL.createObjectURL(value);
        return '';
      }
    );
  }

  /**
   * Allows to view the image files from the server with Jwt Authentication
   * @remarks Retrieves the image file from the server as a {@link Blob} and uses {@link FileReader.readAsDataURL} to read the file
   * @param fileUrl url of the image file in the server
   * @returns Observable of `Observable<string>` which contains the url of the image file read from the server, if it is successful
   *  or the observable will produce errors accordingly
   */
  public viewImageFile(fileUrl: string): Observable<Observable<string>> {
    const JwtToken = localStorage.getItem('JwtToken');
    return this.api.getRequest<Observable<string>, Blob>(
      fileUrl,
      'blob',
      [{ name: 'Authorization', value: `Bearer ${JwtToken}` }],
      (value) => {
        console.log('Moonjakkam', value);

        return new Observable<string>((observer) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            if (reader.result != null) {
              if (typeof reader.result === 'string') {
                observer.next(reader.result);
                observer.complete();
              } else {
                observer.error('Result is an ArrayBuffer');
              }
            } else {
              observer.error('Result is null');
            }
          };

          reader.onerror = (err) => {
            observer.error(err);
          };

          reader.readAsDataURL(value);
        });
      }
    );
  }
}
