import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { 
  Tag, 
  HandCoins, 
  Layers, 
  Barcode, 
  Coins, 
  Truck, 
  LayoutGrid, 
  Maximize,
  Camera,
  X
} from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import FloatingLabelInput from '../FloatingLabelInput';

export interface ProductFormFieldsProps {
  name: string;
  price: string;
  purchasePrice: string;
  supplier: string;
  category: string;
  stock: string;
  barcode: string;
  imageUri: string | null;
  onChangeName: (t: string) => void;
  onChangePrice: (t: string) => void;
  onChangePurchasePrice: (t: string) => void;
  onChangeSupplier: (t: string) => void;
  onChangeCategory: (t: string) => void;
  onChangeStock: (t: string) => void;
  onChangeBarcode: (t: string) => void;
  onPickImage: () => void;
  onRemoveImage: () => void;
  onScanPress: () => void;
  onAutoGeneratePress: () => void;
  onFieldFocus?: (y: number) => void;
  isEditable?: boolean; // Prop tambahan untuk kontrol Read-Only
}

export const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  name, price, purchasePrice, supplier, category, stock, barcode, imageUri,
  onChangeName, onChangePrice, onChangePurchasePrice, onChangeSupplier,
  onChangeCategory, onChangeStock, onChangeBarcode, onPickImage, onRemoveImage,
  onScanPress, onAutoGeneratePress, onFieldFocus,
  isEditable = true, // Default true agar bisa digunakan di layar Tambah Produk
}) => {
  // Warna ikon dinamis: Biru jika bisa edit, Abu-abu jika read-only
  const iconColor = isEditable ? COLORS.primary : '#94A3B8';

  return (
    <View style={styles.card}>
      {/* --- SECTION: IMAGE PICKER --- */}
      <View style={styles.imageSection}>
        <Text style={styles.sectionLabel}>Foto Produk</Text>
        <TouchableOpacity 
          style={[
            styles.imageUploadBox, 
            imageUri && styles.imageBoxActive,
            !isEditable && { borderStyle: 'solid', backgroundColor: '#F1F5F9' }
          ]} 
          onPress={isEditable ? onPickImage : undefined}
          activeOpacity={isEditable ? 0.7 : 1}
        >
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              {isEditable && (
                <TouchableOpacity style={styles.removeImageBtn} onPress={onRemoveImage}>
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.placeholderContainer}>
              <View style={[styles.iconCircle, !isEditable && { backgroundColor: '#E2E8F0' }]}>
                <Camera size={24} color={iconColor} />
              </View>
              <Text style={[styles.uploadText, !isEditable && { color: '#94A3B8' }]}>
                {isEditable ? 'Tambah Foto' : 'Tidak ada foto'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* --- SECTION: INPUT FIELDS --- */}
      {/* Container dibungkus pointerEvents agar input benar-benar tidak bisa ditekan saat read-only */}
      <View pointerEvents={isEditable ? 'auto' : 'none'}>
        <FloatingLabelInput
          label="Nama Produk"
          value={name}
          onChangeText={onChangeName}
          icon={<Tag size={18} color={iconColor} />}
          onFocusCallback={onFieldFocus}
          editable={isEditable}
        />

        <View style={styles.row}>
          <View style={styles.flex}>
            <FloatingLabelInput
              label="Kategori"
              value={category}
              onChangeText={onChangeCategory}
              icon={<LayoutGrid size={18} color={iconColor} />}
              onFocusCallback={onFieldFocus}
              editable={isEditable}
            />
          </View>
          <View style={styles.flex}>
            <FloatingLabelInput
              label="Pemasok"
              value={supplier}
              onChangeText={onChangeSupplier}
              icon={<Truck size={18} color={iconColor} />}
              onFocusCallback={onFieldFocus}
              editable={isEditable}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flex}>
            <FloatingLabelInput
              label="Harga Jual"
              value={price}
              onChangeText={onChangePrice}
              keyboardType="numeric"
              icon={<HandCoins size={18} color={iconColor} />}
              onFocusCallback={onFieldFocus}
              editable={isEditable}
            />
          </View>
          <View style={styles.flex}>
            <FloatingLabelInput
              label="Harga Beli"
              value={purchasePrice}
              onChangeText={onChangePurchasePrice}
              keyboardType="numeric"
              icon={<Coins size={18} color={iconColor} />}
              onFocusCallback={onFieldFocus}
              editable={isEditable}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flex}>
            <FloatingLabelInput
              label="Stok"
              value={stock}
              onChangeText={onChangeStock}
              keyboardType="numeric"
              icon={<Layers size={18} color={iconColor} />}
              onFocusCallback={onFieldFocus}
              editable={isEditable}
            />
          </View>
          <View style={styles.flex}>
            <FloatingLabelInput
              label="Barcode"
              value={barcode}
              onChangeText={onChangeBarcode}
              icon={<Barcode size={18} color={iconColor} />}
              onFocusCallback={onFieldFocus}
              editable={isEditable}
            />
          </View>
        </View>
      </View>

      {/* --- SECTION: ACTIONS --- */}
      {/* Tombol SCAN dan AUTO hanya muncul jika isEditable true */}
      {isEditable && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btn} onPress={onScanPress}>
            <Maximize size={16} color="#fff" />
            <Text style={styles.btnText}>SCAN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnAlt} onPress={onAutoGeneratePress}>
            <HandCoins size={16} color="#fff" />
            <Text style={styles.btnText}>AUTO</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 18,
  },
  imageSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
    color: COLORS.textDark,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  imageUploadBox: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageBoxActive: {
    borderStyle: 'solid',
    borderColor: COLORS.primary,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: COLORS.primary,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 68, 68, 0.8)',
    padding: 4,
    borderRadius: 12,
  },
  row: { 
    flexDirection: 'row', 
    gap: 10 
  },
  flex: { 
    flex: 1 
  },
  actions: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    gap: 8, 
    marginTop: 12
  },
  btn: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.secondary, 
    paddingHorizontal: 14, 
    paddingVertical: 9, 
    borderRadius: 10 
  },
  btnAlt: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FF8A65', 
    paddingHorizontal: 14, 
    paddingVertical: 9, 
    borderRadius: 10 
  },
  btnText: { 
    color: '#fff', 
    fontFamily: 'PoppinsBold', 
    fontSize: 12 
  },
});