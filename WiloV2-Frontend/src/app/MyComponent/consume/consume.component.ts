import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consume',
  templateUrl: './consume.component.html',
  styleUrls: ['./consume.component.css'],
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule 
  ]
})
export class ConsumeComponent {
  materials: any[] = []; 
  selectedMaterialCode: string = ''; 
  materialDetails: any = {}; 

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/api/consume/')
      .subscribe(response => {
        if (response.success) {
          this.materials = response.data;
        }
      });
  }

  onMaterialSelect() {
    if (!this.selectedMaterialCode) return;

    const selectedMaterial = this.materials.find(
      mat => mat.MaterialCode === this.selectedMaterialCode
    );

    if (selectedMaterial) {
      this.materialDetails = {
        description: selectedMaterial.Description || '',
        uom: selectedMaterial.UOM || '',
        availableQty: selectedMaterial.CurrentQuantity || 0
      };
    }
    this.fetchMaterialDetails();

  }

  // Handle manual code entry
  fetchMaterialDetails() {
    const code = this.selectedMaterialCode.trim();
    if (!code) return;

    this.http.get<any>(`http://localhost:5000/api/consume/${code}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.materialDetails = {
              description: response.data.Description || '',
              uom: response.data.UOM || '',
              availableQty: response.data.CurrentQuantity || 0
            };
          } else {
            alert('Material not found');
            this.clearSelection();
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error fetching material details');
          this.clearSelection();
        }
      });
  }
  private clearSelection() {
    this.selectedMaterialCode = '';
    this.materialDetails = {};
  }
  get remainingQty() {
    return (this.materialDetails.availableQty || 0) - (this.materialDetails.quantity || 0);
  }

  // Consume material logic
  consumeMaterial() {
    if (!this.selectedMaterialCode || !this.materialDetails.quantity) {
      alert('Please select a material and enter a valid quantity');
      return;
    }

    const payload = {
      materialCode: this.selectedMaterialCode,
      quantity: this.materialDetails.quantity
    };

    this.http.post<any>('http://localhost:5000/api/consume', payload)
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Material consumed successfully!');
            this.materialDetails.availableQty = response.data.newQuantity;
            this.resetForm();
          } else {
            alert('Consumption failed');
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error consuming material');
        }
      });
  }

  // Reset form fields
  resetForm() {
    this.selectedMaterialCode = '';
    this.materialDetails = {};
  }
}