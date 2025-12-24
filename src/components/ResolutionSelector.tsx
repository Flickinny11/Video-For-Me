import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Resolution } from '../types';

interface ResolutionSelectorProps {
  selectedResolution: Resolution;
  onSelectResolution: (resolution: Resolution) => void;
}

export const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({
  selectedResolution,
  onSelectResolution,
}) => {
  const resolutions: Resolution[] = ['720p', '1080p'];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Resolution</Text>
      <View style={styles.buttonGroup}>
        {resolutions.map((resolution) => (
          <TouchableOpacity
            key={resolution}
            style={[
              styles.button,
              selectedResolution === resolution && styles.buttonSelected,
            ]}
            onPress={() => onSelectResolution(resolution)}
          >
            <Text
              style={[
                styles.buttonText,
                selectedResolution === resolution && styles.buttonTextSelected,
              ]}
            >
              {resolution}
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
