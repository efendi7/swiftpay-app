import { collection, query, where, getDocs, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { ProductFormData, ProductValidationResult } from '../models/Product';

const CLOUD_NAME = 'dlkrdbabo'; 
const UPLOAD_PRESET = 'expo_products'; 

export class ProductService {
  private static async logActivity(batch: any, type: 'IN' | 'OUT' | 'INFO', message: string) {
    const activityRef = doc(collection(db, 'activities'));
    const user = auth.currentUser;
    batch.set(activityRef, {
      type,
      message,
      userName: user?.displayName || user?.email?.split('@')[0] || 'Admin',
      createdAt: serverTimestamp(),
    });
  }

  static generateUniqueBarcode(type: 'EAN13' | 'CODE128'): string {
    const now = new Date();
    const timestamp = now.getTime().toString();
    if (type === 'EAN13') {
      const baseCode = timestamp.substring(timestamp.length - 12);
      return this.calculateEAN13(baseCode);
    } else {
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      return (timestamp + random).substring(0, 15);
    }
  }

  private static calculateEAN13(code: string): string {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return code + checksum;
  }

  static validateProduct(data: ProductFormData): ProductValidationResult {
    const { name, price, purchasePrice, stock, barcode } = data;
    if (!name || !price || !purchasePrice || !stock || !barcode) {
      return { isValid: false, error: 'Silakan isi semua data produk wajib.' };
    }
    const priceNum = parseFloat(price);
    const purchasePriceNum = parseFloat(purchasePrice);
    const stockNum = parseInt(stock);
    if (isNaN(priceNum) || isNaN(purchasePriceNum) || isNaN(stockNum)) {
      return { isValid: false, error: 'Harga dan stok harus berupa angka.' };
    }
    if (purchasePriceNum <= 0) return { isValid: false, error: 'Harga beli harus lebih dari 0.' };
    if (priceNum < purchasePriceNum) return { isValid: false, error: 'Harga jual tidak boleh lebih kecil dari harga beli.' };
    if (stockNum < 0) return { isValid: false, error: 'Stok tidak boleh negatif.' };
    return { isValid: true };
  }

  static async uploadImage(uri: string): Promise<string> {
    try {
      const formData = new FormData();
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('file', {
        uri: uri,
        name: `product_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      } as any);
      formData.append('upload_preset', UPLOAD_PRESET);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'Upload gagal');
      return result.secure_url.replace('/upload/', '/upload/w_600,q_auto,f_auto/');
    } catch (error) {
      throw new Error("Gagal mengunggah gambar.");
    }
  }

  static async checkBarcodeExists(barcode: string): Promise<boolean> {
    const q = query(collection(db, 'products'), where('barcode', '==', barcode.trim()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  static async addProduct(data: ProductFormData): Promise<void> {
    const validation = this.validateProduct(data);
    if (!validation.isValid) throw new Error(validation.error);
    const isDuplicate = await this.checkBarcodeExists(data.barcode);
    if (isDuplicate) throw new Error('Barcode ini sudah terdaftar.');

    try {
      const batch = writeBatch(db);
      const productRef = doc(collection(db, 'products'));
      const stockQty = parseInt(data.stock);
      const productName = data.name.trim();
      
      const productData = {
        name: productName,
        price: parseFloat(data.price),
        purchasePrice: parseFloat(data.purchasePrice),
        supplier: data.supplier?.trim() || 'Umum',
        category: data.category?.trim() || 'Tanpa Kategori',
        stock: stockQty,
        barcode: data.barcode.trim(),
        barcodeType: data.barcode.length === 13 ? 'EAN13' : 'CODE128', 
        imageUrl: data.imageUrl, 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      batch.set(productRef, productData);

      const stockPurchaseRef = doc(collection(db, 'stock_purchases'));
      batch.set(stockPurchaseRef, {
        productId: productRef.id,
        productName: productName,
        barcode: data.barcode.trim(),
        quantity: stockQty,
        purchasePrice: parseFloat(data.purchasePrice),
        totalCost: stockQty * parseFloat(data.purchasePrice),
        supplier: data.supplier?.trim() || 'Umum',
        date: serverTimestamp(),
        type: 'initial_stock',
      });

      // LOG: Tambah Produk Baru dengan detail stok
      this.logActivity(
        batch, 
        'INFO', 
        `Admin menambah produk baru "${productName}" sebanyak ${stockQty} unit`
      );

      await batch.commit();
    } catch (error) {
      throw new Error('Gagal menyimpan ke database');
    }
  }

  static async updateProduct(productId: string, data: ProductFormData, oldStock: number, oldName: string): Promise<void> {
    const validation = this.validateProduct(data);
    if (!validation.isValid) throw new Error(validation.error);

    try {
      const batch = writeBatch(db);
      const productRef = doc(db, 'products', productId);
      const newStock = parseInt(data.stock);
      const newName = data.name.trim();

      const productData = {
        name: newName,
        price: parseFloat(data.price),
        purchasePrice: parseFloat(data.purchasePrice),
        supplier: data.supplier?.trim() || 'Umum',
        category: data.category?.trim() || 'Tanpa Kategori',
        stock: newStock,
        barcode: data.barcode.trim(),
        imageUrl: data.imageUrl, 
        updatedAt: serverTimestamp(),
      };
      batch.update(productRef, productData);

      // LOG: Edit Nama Produk
      if (newName !== oldName) {
        this.logActivity(
          batch, 
          'INFO', 
          `Admin mengubah nama produk dari "${oldName}" menjadi "${newName}"`
        );
      }

      // LOG: Tambah/Kurang Stok dengan detail
      if (newStock > oldStock) {
        const diff = newStock - oldStock;
        this.logActivity(
          batch, 
          'IN', 
          `Admin menambah stok "${newName}" sebanyak ${diff} unit (dari ${oldStock} menjadi ${newStock} unit)`
        );
      } else if (newStock < oldStock) {
        const diff = oldStock - newStock;
        this.logActivity(
          batch, 
          'OUT', 
          `Admin mengurangi stok "${newName}" sebanyak ${diff} unit (dari ${oldStock} menjadi ${newStock} unit)`
        );
      }

      if (newStock !== oldStock) {
        const adjustmentRef = doc(collection(db, 'stock_adjustments'));
        batch.set(adjustmentRef, {
          productId: productId,
          productName: newName,
          oldStock: oldStock,
          newStock: newStock,
          difference: newStock - oldStock,
          date: serverTimestamp(),
          reason: 'Manual Edit',
        });
      }

      await batch.commit();
    } catch (error) {
      throw new Error('Gagal memperbarui produk');
    }
  }
}