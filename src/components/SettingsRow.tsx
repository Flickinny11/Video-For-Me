import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface SettingsRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  value,
  onValueChange,
  description,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3a3a4e', true: '#7c3aed' }}
        thumbColor={value ? '#fff' : '#888'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  labelContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
});
