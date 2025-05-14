import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MaterialTableServicesService } from './material-table-services.service';

@Component({
  selector: 'app-material-table',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  templateUrl: './material-table.component.html',
  styleUrls: ['./material-table.component.css']
})
export class MaterialTableComponent implements OnInit {
  displayedColumns: string[] = [
    'MaterialCode',
    'IESCode',
    'Description',
    'CategoryID',
    'UOM',
    'UnitPrice',
    'CurrentQuantity'
  ];

  constructor(public materialService: MaterialTableServicesService) {}

  ngOnInit(): void {
    this.materialService.fetchMaterials();
  }
}
