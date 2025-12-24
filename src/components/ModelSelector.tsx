import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ModelType, MODEL_CONFIGS } from '../types';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onSelectModel: (model: ModelType) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
}) => {
  const models = Object.values(MODEL_CONFIGS);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Model</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {models.map((model) => (
          <TouchableOpacity
            key={model.id}
            style={[
              styles.modelButton,
              selectedModel === model.id && styles.modelButtonSelected,
            ]}
            onPress={() => onSelectModel(model.id)}
          >
            <Text
              style={[
                styles.modelButtonText,
                selectedModel === model.id && styles.modelButtonTextSelected,
              ]}
            >
              {model.name}
            </Text>
            <Text style={styles.modelButtonHint}>
              {model.isVideoOutput ? 'Video' : 'Image'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  scrollContent: {
    paddingRight: 16,
  },
  modelButton: {
    backgroundColor: '#2a2a3e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#3a3a4e',
    minWidth: 100,
    alignItems: 'center',
  },
  modelButtonSelected: {
    borderColor: '#7c3aed',
    backgroundColor: '#3d2a5e',
  },
  modelButtonText: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  modelButtonTextSelected: {
    color: '#fff',
  },
  modelButtonHint: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
  },
});
