import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../../constants/colors';
import { useProductForm } from '../../../hooks/useProductForm';
import { ProductFormHeader } from '../../../components/product/ProductFormHeader';
import { ProductFormFields } from '../../../components/product/ProductFormFields';
import { SubmitButton } from '../../../components/product/SubmitButton';
import BarcodeScannerScreen from './../BarcodeScannerScreen';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.9; // Sedikit lebih tinggi untuk menampung field kategori

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(height)).current;

  const {
    formData,
    loading,
    showScanner,
    updateField,
    generateBarcode,
    handleBarcodeScanned,
    handleSubmit,
    setShowScanner,
  } = useProductForm(handleClose);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  function handleClose() {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(onClose);
  }

  return (
    <Modal transparent visible={visible} animationType="none">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modalContainer,
            { height: MODAL_HEIGHT, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <ProductFormHeader onClose={handleClose} isModal />

          <View style={styles.contentWrapper}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <ProductFormFields
                  name={formData.name}
                  price={formData.price}
                  purchasePrice={formData.purchasePrice}
                  supplier={formData.supplier}
                  category={formData.category} // Sinkronisasi field kategori
                  stock={formData.stock}
                  barcode={formData.barcode}
                  onChangeName={(t) => updateField('name', t)}
                  onChangePrice={(t) => updateField('price', t)}
                  onChangePurchasePrice={(t) => updateField('purchasePrice', t)}
                  onChangeSupplier={(t) => updateField('supplier', t)}
                  onChangeCategory={(t) => updateField('category', t)} // Sinkronisasi handler kategori
                  onChangeStock={(t) => updateField('stock', t)}
                  onChangeBarcode={(t) => updateField('barcode', t)}
                  onScanPress={() => setShowScanner(true)}
                  onAutoGeneratePress={generateBarcode}
                />

                <SubmitButton loading={loading} onPress={handleSubmit} />

                <Text style={styles.infoFooter}>
                  Pastikan kategori, harga beli, dan pemasok diisi agar laporan laba akurat.
                </Text>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>

          <BarcodeScannerScreen
            visible={showScanner}
            onClose={() => setShowScanner(false)}
            onScan={handleBarcodeScanned}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContainer: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  infoFooter: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

export default AddProductModal;