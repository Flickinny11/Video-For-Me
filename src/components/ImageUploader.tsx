import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImageUploaderProps {
  images: string[];
  onAddImage: (uri: string) => void;
  onRemoveImage: (uri: string) => void;
  maxImages?: number;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onAddImage,
  onRemoveImage,
  maxImages = 3,
  label = 'Upload Images',
}) => {
  const pickImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `Maximum ${maxImages} images allowed`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      onAddImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `Maximum ${maxImages} images allowed`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      onAddImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imagesContainer}
      >
        {images.map((uri, index) => (
          <View key={uri} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemoveImage(uri)}
            >
              <Text style={styles.removeButtonText}>x</Text>
            </TouchableOpacity>
            <Text style={styles.imageIndex}>#{index + 1}</Text>
          </View>
        ))}
        {images.length < maxImages && (
          <View style={styles.addButtonsContainer}>
            <TouchableOpacity style={styles.addButton} onPress={pickImage}>
              <Text style={styles.addButtonIcon}>+</Text>
              <Text style={styles.addButtonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={takePhoto}>
              <Text style={styles.addButtonIcon}>📷</Text>
              <Text style={styles.addButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <Text style={styles.hint}>
        Images will be auto-resized for Wan 2.6 ({images.length}/{maxImages})
      </Text>
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
  imagesContainer: {
    paddingVertical: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#2a2a3e',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageIndex: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    width: 80,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#2a2a3e',
    borderWidth: 2,
    borderColor: '#3a3a4e',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonIcon: {
    fontSize: 24,
    color: '#7c3aed',
    marginBottom: 4,
  },
  addButtonText: {
    color: '#888',
    fontSize: 11,
  },
  hint: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
});
