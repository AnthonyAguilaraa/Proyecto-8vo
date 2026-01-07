import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // El Gateway es la puerta de entrada única
  private API_URL = 'http://localhost:8080/api/auth'; 

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    // Según tu guía, el login es un POST al gateway
    return this.http.post(`${this.API_URL}/login`, credentials);
  }

  // Método para registrar nuevos usuarios
  register(userData: any): Observable<any> {
    // El endpoint estándar suele ser /register en el Auth Service
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  logout() {
    // 1. Borramos el token y datos del usuario de la memoria local
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Si guardaste datos del usuario también
  }
}