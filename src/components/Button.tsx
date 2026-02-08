/**
 * Button Component
 * Primary button component with variants for different use cases
 * Large touch targets for security users
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [styles.button, styles[size]];

    if (fullWidth) {
      baseStyles.push(styles.fullWidth);
    }

    switch (variant) {
      case 'primary':
        baseStyles.push(styles.primaryButton);
        if (disabled) baseStyles.push(styles.primaryDisabled);
        break;
      case 'secondary':
        baseStyles.push(styles.secondaryButton);
        if (disabled) baseStyles.push(styles.secondaryDisabled);
        break;
      case 'outline':
        baseStyles.push(styles.outlineButton);
        if (disabled) baseStyles.push(styles.outlineDisabled);
        break;
      case 'danger':
        baseStyles.push(styles.dangerButton);
        if (disabled) baseStyles.push(styles.dangerDisabled);
        break;
    }

    return baseStyles;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseTextStyles: TextStyle[] = [styles.text, styles[`${size}Text`]];

    switch (variant) {
      case 'primary':
        baseTextStyles.push(styles.primaryText);
        break;
      case 'secondary':
        baseTextStyles.push(styles.secondaryText);
        break;
      case 'outline':
        baseTextStyles.push(styles.outlineText);
        break;
      case 'danger':
        baseTextStyles.push(styles.dangerText);
        break;
    }

    if (disabled) {
      baseTextStyles.push(styles.disabledText);
    }

    return baseTextStyles;
  };

  const getLoaderColor = (): string => {
    switch (variant) {
      case 'outline':
        return colors.primary;
      default:
        return colors.textOnPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  // Sizes - Large for security users
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  medium: {
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  large: {
    paddingVertical: spacing.lg - 4,
    paddingHorizontal: spacing.xl,
    minHeight: 64,
  },
  // Primary variant
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },
  primaryText: {
    color: colors.textOnPrimary,
  },
  // Secondary variant
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  secondaryDisabled: {
    backgroundColor: colors.secondaryLight,
    opacity: 0.6,
  },
  secondaryText: {
    color: colors.textOnPrimary,
  },
  // Outline variant
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  outlineDisabled: {
    borderColor: colors.secondaryLight,
    opacity: 0.6,
  },
  outlineText: {
    color: colors.primary,
  },
  // Danger variant
  dangerButton: {
    backgroundColor: colors.error,
  },
  dangerDisabled: {
    backgroundColor: colors.error,
    opacity: 0.6,
  },
  dangerText: {
    color: colors.textOnPrimary,
  },
  // Text styles
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.8,
  },
});

export default Button;
