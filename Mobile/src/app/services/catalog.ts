import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importa HttpHeaders
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  
  // El Gateway (puerto 8080)
  private API_URL = 'http://localhost:8080/api/catalog';

  constructor(private http: HttpClient) { }

  // Método auxiliar para crear la cabecera con el Token
  private getHeaders() {
    const token = localStorage.getItem('token'); // Recuperamos el pase VIP
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}` // Formato estándar: Bearer token...
      })
    };
  }

  // 1. Obtener mis colecciones (GET)
  getCollections(): Observable<any> {
    return this.http.get(`${this.API_URL}/collections`, this.getHeaders());
  }

  // 2. Crear nueva colección (POST)
  createCollection(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/collections`, data, this.getHeaders());
  }

  // Obtener items de una colección específica
  getItems(collectionName: string): Observable<any> {
    // Según tu guía Endpoint F: /collections/:name/items
    return this.http.get(`${this.API_URL}/collections/${collectionName}/items`, this.getHeaders());
  }

  // Crear un nuevo item (POST)
  createItem(data: any): Observable<any> {
    // Endpoint E: /items
    return this.http.post(`${this.API_URL}/items`, data, this.getHeaders());
  }

  // Borrar un item por su ID
  deleteItem(itemId: string): Observable<any> {
    // Asumimos el estándar REST: DELETE /items/:id
    return this.http.delete(`${this.API_URL}/items/${itemId}`, this.getHeaders());
  }

  // Actualizar un item existente
  updateItem(itemId: string, itemData: any): Observable<any> {
    // Estándar REST: PUT /items/:id
    return this.http.put(`${this.API_URL}/items/${itemId}`, itemData, this.getHeaders());
  }
}