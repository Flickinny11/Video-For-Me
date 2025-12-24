import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useAppStore } from '../src/store/useAppStore';
import { configureFal, validateApiKey } from '../src/services/falApi';
import { SettingsRow } from '../src/components';

export default function SettingsScreen() {
  const {
    apiKey,
    setApiKey,
    enablePromptExpansion,
    setEnablePromptExpansion,
    enableSafetyChecker,
    setEnableSafetyChecker,
    resolution,
    setResolution,
    libraryItems,
    activeJobs,
  } = useAppStore();

  const [inputKey, setInputKey] = useState(apiKey);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveApiKey = async () => {
    if (!inputKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    setIsSaving(true);
    try {
      configureFal(inputKey.trim());
      setApiKey(inputKey.trim());
      Alert.alert('Success', 'API key saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  const openFalDashboard = () => {
    Linking.openURL('https://fal.ai/dashboard/keys');
  };

  const maskedKey = apiKey
    ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
    : 'Not set';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Fal.ai API Key</Text>
          <Text style={styles.currentKey}>Current: {maskedKey}</Text>

          <TextInput
            style={styles.input}
            value={inputKey}
            onChangeText={setInputKey}
            placeholder="Enter your Fal.ai API key"
            placeholderTextColor="#666"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveApiKey}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save API Key'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openFalDashboard}>
            <Text style={styles.linkText}>Get your API key from fal.ai →</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Settings</Text>

        <View style={styles.card}>
          <SettingsRow
            label="Prompt Expansion"
            value={enablePromptExpansion}
            onValueChange={setEnablePromptExpansion}
            description="Use AI to enhance prompts automatically"
          />
          <SettingsRow
            label="Safety Checker"
            value={enableSafetyChecker}
            onValueChange={setEnableSafetyChecker}
            description="Filter potentially unsafe content (disabled by default)"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>

        <View style={styles.card}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Library Items</Text>
            <Text style={styles.statValue}>{libraryItems.length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Active Jobs</Text>
            <Text style={styles.statValue}>{activeJobs.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.card}>
          <Text style={styles.aboutText}>
            Video For Me uses Fal.ai's Wan 2.6 models to generate AI videos and
            images from text prompts and reference media.
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supported Models</Text>

        <View style={styles.card}>
          <View style={styles.modelInfo}>
            <Text style={styles.modelName}>Text to Video</Text>
            <Text style={styles.modelDesc}>Generate videos from text prompts</Text>
          </View>
          <View style={styles.modelInfo}>
            <Text style={styles.modelName}>Image to Video</Text>
            <Text style={styles.modelDesc}>Animate images with motion</Text>
          </View>
          <View style={styles.modelInfo}>
            <Text style={styles.modelName}>Reference to Video</Text>
            <Text style={styles.modelDesc}>
              Create videos with subject consistency from reference videos
            </Text>
          </View>
          <View style={styles.modelInfo}>
            <Text style={styles.modelName}>Text to Image</Text>
            <Text style={styles.modelDesc}>Generate images from text</Text>
          </View>
          <View style={styles.modelInfo}>
            <Text style={styles.modelName}>Image to Image</Text>
            <Text style={styles.modelDesc}>Transform images with prompts</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a14',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentKey: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0a0a14',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#7c3aed',
    fontSize: 14,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  aboutText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  versionText: {
    color: '#666',
    fontSize: 12,
  },
  modelInfo: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  modelName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  modelDesc: {
    color: '#888',
    fontSize: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});
