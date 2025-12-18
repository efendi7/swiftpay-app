import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Product } from '../models/Product'; // Menggunakan model yang sudah kita perbarui

export interface ProductValidationResult {
  isValid: boolean;
  error?: string;
}

export class ProductService {
  /**
   * Generate unique barcode (15 digit)
   */
  static generateUniqueBarcode(): string {
    const timestamp = new Date().getTime().toString();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return (timestamp + random).substring(0, 15);
  }

  /**
   * Check if barcode already exists in Firestore
   */
  static async checkBarcodeExists(barcode: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'products'),
        where('barcode', '==', barcode.trim())
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking barcode:', error);
      throw new Error('Gagal memeriksa barcode');
    }
  }

  /**
   * Validate product data including Purchase Price and Supplier
   */
  static validateProduct(
    name: string,
    price: string,
    purchasePrice: string,
    stock: string,
    barcode: string
  ): ProductValidationResult {
    // 1. Cek Kelengkapan Data
    if (!name || !price || !purchasePrice || !stock || !barcode) {
      return {
        isValid: false,
        error: 'Silakan isi semua data produk wajib (Nama, Harga Jual, Harga Beli, Stok, dan Barcode).',
      };
    }

    const priceNum = parseFloat(price);
    const purchasePriceNum = parseFloat(purchasePrice);
    const stockNum = parseInt(stock);

    // 2. Cek Format Angka
    if (isNaN(priceNum) || isNaN(purchasePriceNum) || isNaN(stockNum)) {
      return {
        isValid: false,
        error: 'Harga jual, harga beli, dan stok harus berupa angka.',
      };
    }

    // 3. Logika Bisnis (Harga & Stok)
    if (purchasePriceNum <= 0) {
      return { isValid: false, error: 'Harga beli harus lebih dari 0.' };
    }

    if (priceNum < purchasePriceNum) {
      return { 
        isValid: false, 
        error: 'Peringatan: Harga jual tidak boleh lebih kecil dari harga beli (rugi).' 
      };
    }

    if (stockNum < 0) {
      return { isValid: false, error: 'Stok tidak boleh negatif.' };
    }

    return { isValid: true };
  }

  /**
   * Add new product to database
   */
  static async addProduct(
    name: string,
    price: string,
    purchasePrice: string,
    supplier: string,
    category: string,
    stock: string,
    barcode: string
  ): Promise<void> {
    
    // Jalankan Validasi
    const validation = this.validateProduct(name, price, purchasePrice, stock, barcode);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Cek Duplikasi Barcode
    const isDuplicate = await this.checkBarcodeExists(barcode);
    if (isDuplicate) {
      throw new Error('Barcode ini sudah terdaftar untuk produk lain.');
    }

    try {
      // Mapping ke object Product (tanpa ID karena ID di-generate Firestore)
      // Omit 'id' dari Product interface saat addDoc
      const productData = {
        name: name.trim(),
        price: parseFloat(price),
        purchasePrice: parseFloat(purchasePrice),
        supplier: supplier.trim() || 'Umum', // Default ke 'Umum' jika kosong
        category: category.trim() || 'Tanpa Kategori',
        stock: parseInt(stock),
        barcode: barcode.trim(),
        createdAt: serverTimestamp(), // Menggunakan serverTimestamp agar waktu konsisten
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'products'), productData);
    } catch (error) {
      console.error('Error adding product:', error);
      throw new Error('Gagal menyimpan data ke database.');
    }
  }
}