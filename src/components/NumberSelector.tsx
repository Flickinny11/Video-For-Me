import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface NumberSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export const NumberSelector: React.FC<NumberSelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 5,
  label = 'Number of Videos',
}) => {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.buttonGroup}>
        {options.map((num) => (
          <TouchableOpacity
            key={num}
            style={[styles.button, value === num && styles.buttonSelected]}
            onPress={() => onChange(num)}
          >
            <Text
              style={[
                styles.buttonText,
                value === num && styles.buttonTextSelected,
              ]}
            >
              {num}
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
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonSelected: {
    backgroundColor: '#7c3aed',
  },
  buttonText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextSelected: {
    color: '#fff',
  },
});
