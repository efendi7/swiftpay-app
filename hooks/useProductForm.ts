import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProductService } from '../services/productService';
import { ProductFormData } from '../models/Product';

export const useProductForm = (onSuccess: () => void, productId?: string) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    purchasePrice: '',
    stock: '',
    barcode: '',
    supplier: '',
    category: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [initialStock, setInitialStock] = useState(0);

  const updateField = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Set initial data untuk mode edit
  const setInitialData = (data: ProductFormData, existingImageUri: string | null) => {
    setFormData(data);
    setImageUri(existingImageUri);
    setInitialStock(parseInt(data.stock) || 0);
  };

  // Generate barcode dengan tipe EAN13 atau CODE128
  const generateBarcode = (type: 'EAN13' | 'CODE128') => {
    const newBarcode = ProductService.generateUniqueBarcode(type);
    updateField('barcode', newBarcode);
  };

  const handleBarcodeScanned = (data: string) => {
    updateField('barcode', data);
    setShowScanner(false);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Izin Diperlukan',
          'Aplikasi memerlukan izin akses galeri untuk memilih foto produk.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih gambar. Silakan coba lagi.');
    }
  };

  const removeImage = () => {
    setImageUri(null);
    updateField('imageUrl', '');
  };

  const resetForm = () => {
    setFormData({
      name: '', 
      price: '', 
      purchasePrice: '', 
      stock: '',
      barcode: '', 
      supplier: '', 
      category: '', 
      imageUrl: ''
    });
    setImageUri(null);
    setInitialStock(0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let finalData = { ...formData };
      
      // Upload gambar baru jika ada perubahan
      if (imageUri && !imageUri.startsWith('http')) {
        const uploadedUrl = await ProductService.uploadImage(imageUri);
        finalData.imageUrl = uploadedUrl;
      } else if (imageUri) {
        // Gunakan URL yang sudah ada
        finalData.imageUrl = imageUri;
      }
      
      // Mode edit atau tambah
      if (productId) {
        await ProductService.updateProduct(productId, finalData, initialStock);
        Alert.alert('Berhasil', 'Produk berhasil diperbarui');
      } else {
        await ProductService.addProduct(finalData);
        Alert.alert('Berhasil', 'Produk berhasil ditambahkan');
      }
      
      resetForm();
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData, 
    loading, 
    showScanner, 
    imageUri,
    updateField, 
    generateBarcode, 
    handleBarcodeScanned,
    handleSubmit, 
    setShowScanner, 
    pickImage, 
    removeImage, 
    resetForm,
    setInitialData
  };
};