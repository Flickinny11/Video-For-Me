import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  onSelectRatio: (ratio: AspectRatio) => void;
}

const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: string }[] = [
  { value: '16:9', label: '16:9', icon: '▬' },
  { value: '9:16', label: '9:16', icon: '▮' },
  { value: '1:1', label: '1:1', icon: '◼' },
  { value: '4:3', label: '4:3', icon: '▭' },
  { value: '3:4', label: '3:4', icon: '▯' },
];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  selectedRatio,
  onSelectRatio,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Aspect Ratio</Text>
      <View style={styles.buttonGroup}>
        {ASPECT_RATIOS.map(({ value, label, icon }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.button,
              selectedRatio === value && styles.buttonSelected,
            ]}
            onPress={() => onSelectRatio(value)}
          >
            <Text style={styles.icon}>{icon}</Text>
            <Text
              style={[
                styles.buttonText,
                selectedRatio === value && styles.buttonTextSelected,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonSelected: {
    backgroundColor: '#7c3aed',
  },
  icon: {
    fontSize: 16,
    color: '#888',
    marginBottom: 2,
  },
  buttonText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
  },
  buttonTextSelected: {
    color: '#fff',
  },
});
