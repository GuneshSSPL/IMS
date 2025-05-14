import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-barcode-print',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './printbarcode.component.html',
  styleUrls: ['./printbarcode.component.css']
})
export class PrintBarcodeComponent {
  // Changed property names to match backend expectations
  MaterialCode: string = '';
  Description: string = '';
  CategoryID: number | null = null;
  CurrentQuantity: number | null = null;
  UOM: string = '';
  UnitPrice: number | null = null;

  generatedBarcode: string | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private http: HttpClient) {}

  generateBarcode() {
    this.resetMessages();
    this.isLoading = true;

    // Validate required fields
    if (!this.MaterialCode || !this.Description || !this.CategoryID || !this.CurrentQuantity) {
      this.showError('All required fields must be filled');
      this.isLoading = false;
      return;
    }

    const materialData = {
      MaterialCode: this.MaterialCode,
      Description: this.Description,
      CategoryID: this.CategoryID,
      CurrentQuantity: this.CurrentQuantity,
      UOM: this.UOM,
      UnitPrice: this.UnitPrice
    };

    this.http.post<any>('http://localhost:5000/api/materials', materialData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.data?.BarcodePath) {
            this.generatedBarcode = `http://localhost:5000${response.data.BarcodePath}`;
            this.showSuccess('Material created successfully');
            this.resetForm();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          const message = error.error?.message || 'Failed to create material';
          this.showError(message);
          console.error('API Error:', error);
        }
      });
  }

  printBarcode() {
    if (this.generatedBarcode) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Barcode Print</title>
              <style>
                body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${this.generatedBarcode}" alt="Barcode">
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      } else {
        this.showError('Failed to open print window');
      }
    } else {
      this.showError('No barcode available to print');
    }
  }

  private resetForm() {
    this.MaterialCode = '';
    this.Description = '';
    this.CategoryID = null;
    this.CurrentQuantity = null;
    this.UOM = '';
    this.UnitPrice = null;
  }

  private resetMessages() {
    this.errorMessage = null;
    this.successMessage = null;
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.resetMessages(), 5000);
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => this.resetMessages(), 5000);
  }
}
