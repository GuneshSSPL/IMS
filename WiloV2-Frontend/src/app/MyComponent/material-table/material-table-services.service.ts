import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';

@Injectable({
  providedIn: 'root'
})
export class MaterialTableServicesService {
  dataSource = new MatTableDataSource<any>([]);
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  fetchMaterials(): void {
    this.http.get<any[]>('http://localhost:5000/api/dashboard').subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.error = 'Failed to load materials. Please try again later.';
        this.loading = false;
      }
    });
  }
}
