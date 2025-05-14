import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialTableComponent } from '../material-table/material-table.component'; // adjust the path as needed
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, MaterialTableComponent,CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  
}
