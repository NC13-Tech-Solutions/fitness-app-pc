import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileSharingService {
  private api = inject(ApiService);

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
}
