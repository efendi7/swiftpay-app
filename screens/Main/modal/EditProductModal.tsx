import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Modal, Animated,
  TouchableWithoutFeedback, Dimensions, KeyboardAvoidingView, Platform, Alert,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Save } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../../constants/colors';
import { useProductForm } from '../../../hooks/useProductForm';
import { ProductFormFields } from '../../../components/addproduct/ProductFormFields';
import BarcodeScannerScreen from '../BarcodeScannerScreen';
import { Product } from '../../../types/product.types';

const { height } = Dimensions.get('window');
const MAX_MODAL_HEIGHT = height * 0.85;

interface EditProductModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ 
  visible, 
  product, 
  onClose, 
  onSuccess 
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const animateModal = useCallback((toValue: number, callback?: () => void) => {
    if (toValue === 0) {
      Animated.spring(slideAnim, {
        toValue,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start(callback);
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start(callback);
    }
  }, [slideAnim]);

  useEffect(() => {
    if (visible) animateModal(0);
    else slideAnim.setValue(height);
  }, [visible, animateModal, slideAnim]);

  const {
    formData, loading, showScanner, imageUri,
    updateField, handleBarcodeScanned, handleSubmit, 
    setShowScanner, pickImage, removeImage, resetForm, setInitialData
  } = useProductForm(() => {
    if (onSuccess) onSuccess();
    handleClose();
  }, product?.id); // Pass productId untuk mode edit

  // Set data awal saat product berubah
  useEffect(() => {
    if (product && visible) {
      setInitialData({
        name: product.name,
        price: product.price.toString(),
        purchasePrice: product.purchasePrice.toString(),
        stock: product.stock.toString(),
        barcode: product.barcode,
        supplier: product.supplier || '',
        category: product.category || '',
        imageUrl: product.imageUrl || ''
      }, product.imageUrl || null);
    }
  }, [product, visible]);

  const handleClose = useCallback(() => {
    animateModal(height, () => {
      resetForm();
      onClose();
    });
  }, [onClose, animateModal, resetForm]);

  const onAutoGeneratePress = () => {
    Alert.alert(
      "Opsi Generate Barcode",
      "Pilih standar barcode yang diinginkan:",
      [
        { 
          text: "EAN-13 (Ritel Standar)", 
          onPress: () => updateField('barcode', Date.now().toString().substring(0, 13))
        },
        { 
          text: "CODE-128 (Internal Toko)", 
          onPress: () => updateField('barcode', Date.now().toString().substring(0, 15))
        },
        { text: "Batal", style: "cancel" }
      ]
    );
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <StatusBar translucent backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              { maxHeight: MAX_MODAL_HEIGHT, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* CUSTOM HEADER UNTUK EDIT */}
            <LinearGradient
              colors={[COLORS.primary, '#2c537a']}
              style={[styles.header, { paddingTop: insets.top + 12 }]}
            >
              <View style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </View>

              <View style={styles.headerContent}>
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.headerSubtitle}>Manajemen Produk</Text>
                  <Text style={styles.headerTitle}>
                    {product ? "Edit Produk" : "Tambah Produk"}
                  </Text>
                </View>

                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <View style={styles.contentWrapper}>
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <ProductFormFields
                  name={formData.name}
                  price={formData.price}
                  purchasePrice={formData.purchasePrice}
                  supplier={formData.supplier}
                  category={formData.category}
                  stock={formData.stock}
                  barcode={formData.barcode}
                  imageUri={imageUri}
                  onChangeName={(v) => updateField('name', v)}
                  onChangePrice={(v) => updateField('price', v)}
                  onChangePurchasePrice={(v) => updateField('purchasePrice', v)}
                  onChangeSupplier={(v) => updateField('supplier', v)}
                  onChangeCategory={(v) => updateField('category', v)}
                  onChangeStock={(v) => updateField('stock', v)}
                  onChangeBarcode={(v) => updateField('barcode', v)}
                  onPickImage={pickImage}
                  onRemoveImage={removeImage}
                  onScanPress={() => setShowScanner(true)}
                  onAutoGeneratePress={onAutoGeneratePress}
                  onFieldFocus={(fieldY) => {
                    scrollViewRef.current?.scrollTo({ y: fieldY - 60, animated: true });
                  }}
                />

                {/* CUSTOM SUBMIT BUTTON */}
                <TouchableOpacity
                  style={[styles.saveButton, loading && { opacity: 0.8 }]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.secondary, '#008e85']}
                    style={styles.saveGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <Save size={20} color="#FFF" style={{ marginRight: 10 }} />
                        <Text style={styles.saveButtonText}>
                          {product ? "Simpan Perubahan" : "Simpan Produk Baru"}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.infoFooter}>
                  {product 
                    ? "Pastikan data sudah benar sebelum menyimpan perubahan." 
                    : "Gunakan EAN-13 untuk produk umum agar kompatibel dengan sistem lain."
                  }
                </Text>
              </ScrollView>
            </View>

            {showScanner && (
              <BarcodeScannerScreen
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={handleBarcodeScanned}
              />
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  contentWrapper: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  
  // Header styles
  header: {
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  dragHandleContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  dragHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'PoppinsMedium',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontFamily: 'MontserratBold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Submit button styles
  saveButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
  },
  
  infoFooter: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: COLORS.textLight,
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 16,
    marginBottom: 8,
  },
});

export default EditProductModal;