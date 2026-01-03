// src/components/ResetPasswordModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { X, Mail } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import FloatingLabelInput from '../../components/FloatingLabelInput';

const { width } = Dimensions.get('window');

interface ResetPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSendReset: (email: string) => Promise<void>;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  visible,
  onClose,
  onSendReset,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      setEmail('');
    }
  }, [visible]);

  const handleSend = async () => {
    if (!email.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSendReset(email.trim());
      setEmail('');
      onClose();
    } catch (error) {
      // Error ditangani di parent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalMessage}>
            Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
          </Text>

          <FloatingLabelInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={20} color={COLORS.textLight} />}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!email.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!email.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.sendButtonText}>Kirim Link Reset</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 25,
    width: width * 0.85,
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 22,
    color: COLORS.textDark,
    fontFamily: 'MontserratBold',
  },
  modalMessage: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: 20,
    fontFamily: 'PoppinsRegular',
  },
  sendButton: {
    backgroundColor: COLORS.secondary,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
  },
});

export default ResetPasswordModal;