export interface ProductFormData {
  name: string;
  price: string;
  stock: string;
  barcode: string;
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  createdAt: Date;
}

export interface ProductValidationResult {
  isValid: boolean;
  error?: string;
}