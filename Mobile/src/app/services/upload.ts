import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  
  // Apuntamos al Gateway (Puerto 8080) que redirige al upload-service
  private API_URL = 'http://localhost:8080/api/upload/image';

  constructor(private http: HttpClient) { }

  uploadImage(blob: Blob): Observable<any> {
    const formData = new FormData();
    // El backend espera el campo 'image' según tu código: .single('image')
    formData.append('image', blob); 

    return this.http.post(this.API_URL, formData);
  }
}