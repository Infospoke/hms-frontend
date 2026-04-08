import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private websiteURL = environment.websiteURL;
  private aiBaseUrl = environment.atsUrl;

  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body);
  }

  silentGet<T>(endpoint: string, params?: any): Observable<T> {
    const headers = new HttpHeaders({ 'X-Skip-Loader': 'true' });
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params, headers });
  }

  silentPost<T>(endpoint: string, body: any): Observable<T> {
    const headers = new HttpHeaders({ 'X-Skip-Loader': 'true' });
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, { headers });
  }

  websitePost<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.websiteURL}${endpoint}`, body);
  }
  websiteGet<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.websiteURL}${endpoint}`, { params });
  }

  websiteGetBlob(endpoint: string, params?: any): Observable<Blob> {
    return this.http.get(`${this.websiteURL}${endpoint}`, {
      params,
      responseType: 'blob'
    });
  }
  aiGet<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.aiBaseUrl}${endpoint}`, { params });
  }

  aiPost<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.aiBaseUrl}${endpoint}`, body);
  }

  aiPut<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.aiBaseUrl}${endpoint}`, body);
  }

  aiDelete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.aiBaseUrl}${endpoint}`);
  }

  aiPatch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body);
  }

  aiSilentGet<T>(endpoint: string, params?: any): Observable<T> {
    const headers = new HttpHeaders({ 'X-Skip-Loader': 'true' });
    return this.http.get<T>(`${this.aiBaseUrl}${endpoint}`, { params, headers });
  }

  aiSilentPost<T>(endpoint: string, body: any): Observable<T> {
    const headers = new HttpHeaders({ 'X-Skip-Loader': 'true' });
    return this.http.post<T>(`${this.aiBaseUrl}${endpoint}`, body, { headers });
  }
}
