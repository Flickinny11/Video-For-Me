import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface PromptInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  label?: string;
  style?: ViewStyle;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Describe what you want to generate...',
  maxLength = 1000,
  label,
  style,
}) => {
  // Calculate dynamic height based on content
  const minHeight = 80;
  const lineHeight = 22;
  const lines = value.split('\n').length;
  const contentHeight = Math.max(minHeight, lines * lineHeight + 20);
  const maxHeight = 300;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { height: Math.min(contentHeight, maxHeight) },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666"
        multiline
        maxLength={maxLength}
        textAlignVertical="top"
      />
      <Text style={styles.counter}>
        {value.length}/{maxLength}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  counter: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
});
