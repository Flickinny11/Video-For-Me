import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VideoDuration } from '../types';

interface DurationSelectorProps {
  selectedDuration: VideoDuration;
  onSelectDuration: (duration: VideoDuration) => void;
  availableDurations?: VideoDuration[];
  label?: string;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDuration,
  onSelectDuration,
  availableDurations = ['5', '10', '15'],
  label = 'Duration',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.buttonGroup}>
        {availableDurations.map((duration) => (
          <TouchableOpacity
            key={duration}
            style={[
              styles.button,
              selectedDuration === duration && styles.buttonSelected,
            ]}
            onPress={() => onSelectDuration(duration)}
          >
            <Text
              style={[
                styles.buttonText,
                selectedDuration === duration && styles.buttonTextSelected,
              ]}
            >
              {duration}s
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
