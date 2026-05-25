/**
 * Input Component
 * Text input with label, error handling, and consistent styling
 */
import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  type?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  type,
  ...props
}) => {
  if (Platform.OS === 'web' && (type === 'date' || type === 'time')) {
    return (
      <View style={[styles.container, containerStyle]}>
        {!!label && <Text style={styles.label}>{label}</Text>}
        {React.createElement('input', {
          type: type,
          value: props.value,
          onChange: (e: any) => {
            if (props.onChangeText) {
              props.onChangeText(e.target.value);
            }
          },
          style: {
            backgroundColor: colors.surface,
            border: `1px solid ${error ? colors.error : colors.border}`,
            borderRadius: borderRadius.lg,
            paddingLeft: spacing.md,
            paddingRight: spacing.md,
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm,
            fontSize: '16px',
            color: colors.text,
            minHeight: '52px',
            width: '100%',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            outline: 'none',
          },
          placeholder: props.placeholder,
          disabled: props.editable === false,
        })}
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          !!error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.textLight}
        {...props}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    fontSize: 16,
    color: colors.text,
    minHeight: 52,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default Input;
