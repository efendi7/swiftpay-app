export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  purchasePrice: number;
  supplier: string;
  category: string; // Tambahan
  stock: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface ProductFormData {
  name: string;
  price: string;
  purchasePrice: string;
  supplier: string;
  category: string; // Tambahan
  stock: string;
  barcode: string;
}