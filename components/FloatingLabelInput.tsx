// components/FloatingLabelInput.tsx - VERSI FIX ERROR ANIMATED LEFT

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Animated,
  StyleSheet,
  TextInputProps,
  Platform,
  Easing,
  TouchableOpacity,
} from 'react-native';

import { Eye, EyeOff } from 'lucide-react-native';

const COLORS = {
  primary: '#00A79D',
  borderNormal: '#bdc3c7',
  labelNormal: '#7f8c8d',
  text: '#34495e',
  background: '#FFFFFF',
};

interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: React.ReactNode;
  isPassword?: boolean;
  inputStyle?: object;
  labelStyle?: object;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  icon,
  isPassword,
  inputStyle,
  labelStyle,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [secure, setSecure] = useState(!!isPassword);

  const floatAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(floatAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true, // Aman karena hanya pakai transform & opacity
    }).start();
  }, [isFocused, value]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -34],
  });

  const scale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.785], // ~11px dari base 14px
  });

  // Geser horizontal pakai translateX (supported native!)
  const translateX = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [icon ? 38 : 0, icon ? -8 : 0], 
    // Awal: geser ke kanan agar tidak numpuk icon
    // Akhir: geser sedikit ke kiri agar rata semua field
  });

  const labelColor = isFocused ? COLORS.primary : COLORS.labelNormal;
  const borderColor = isFocused ? COLORS.primary : COLORS.borderNormal;

  return (
    <View style={[styles.container, { borderColor }]}>
      <Animated.Text
        style={[
          styles.label,
          {
            transform: [{ translateY }, { translateX }, { scale }],
            color: labelColor,
          },
          labelStyle,
        ]}
      >
        {label}
      </Animated.Text>

      <View style={styles.inputRow}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <TextInput
          {...rest}
          value={value}
          onChangeText={onChangeText}
          style={[styles.input, inputStyle]}
          secureTextEntry={secure}
          cursorColor={COLORS.primary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setSecure(!secure)}
            style={styles.eyeIcon}
            activeOpacity={0.7}
          >
            {secure ? (
              <EyeOff size={20} color={isFocused ? COLORS.primary : COLORS.labelNormal} />
            ) : (
              <Eye size={20} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  label: {
    position: 'absolute',
    left: 16,                          // ← Fixed base position
    backgroundColor: COLORS.background,
    paddingHorizontal: 4,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    zIndex: 1,
    top: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
    fontFamily: 'PoppinsRegular',
    ...Platform.select({
      android: {
        paddingVertical: 0,
        textAlignVertical: 'center',
      },
    }),
  },
  eyeIcon: {
    paddingLeft: 8,
    paddingRight: 4,
  },
});

export default FloatingLabelInput;