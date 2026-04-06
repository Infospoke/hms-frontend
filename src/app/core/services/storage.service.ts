import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  setLocal(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getLocal<T = any>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try { return JSON.parse(item); } catch { return null; }
  }

  removeLocal(key: string) { localStorage.removeItem(key); }

  setSession(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  getSession<T = any>(key: string): T | null {
    const item = sessionStorage.getItem(key);
    if (!item) return null;
    try { return JSON.parse(item); } catch { return null; }
  }

  removeSession(key: string) { 
    sessionStorage.removeItem(key); 
  }

  clearAll() { 
    localStorage.clear(); sessionStorage.clear(); 
  }
}
