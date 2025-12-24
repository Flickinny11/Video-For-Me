import React, { useState, useEffect } from 'react';
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
import * as VideoThumbnails from 'expo-video-thumbnails';

interface VideoUploaderProps {
  videos: string[];
  onAddVideo: (uri: string) => void;
  onRemoveVideo: (uri: string) => void;
  maxVideos?: number;
  label?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  videos,
  onAddVideo,
  onRemoveVideo,
  maxVideos = 3,
  label = 'Upload Reference Videos',
}) => {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    // Generate thumbnails for videos
    videos.forEach(async (uri) => {
      if (!thumbnails[uri]) {
        try {
          const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(
            uri,
            { time: 1000 }
          );
          setThumbnails((prev) => ({ ...prev, [uri]: thumbUri }));
        } catch (error) {
          console.error('Error generating thumbnail:', error);
        }
      }
    });
  }, [videos]);

  const pickVideo = async () => {
    if (videos.length >= maxVideos) {
      Alert.alert('Limit Reached', `Maximum ${maxVideos} videos allowed`);
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
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      onAddVideo(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.hint}>
        Use @Video1, @Video2, @Video3 in your prompt to reference
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.videosContainer}
      >
        {videos.map((uri, index) => (
          <View key={uri} style={styles.videoWrapper}>
            <Image
              source={{ uri: thumbnails[uri] || uri }}
              style={styles.thumbnail}
            />
            <View style={styles.videoOverlay}>
              <Text style={styles.videoIcon}>🎬</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemoveVideo(uri)}
            >
              <Text style={styles.removeButtonText}>x</Text>
            </TouchableOpacity>
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>@Video{index + 1}</Text>
            </View>
          </View>
        ))}
        {videos.length < maxVideos && (
          <TouchableOpacity style={styles.addButton} onPress={pickVideo}>
            <Text style={styles.addButtonIcon}>+</Text>
            <Text style={styles.addButtonText}>Add Video</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Text style={styles.counter}>
        {videos.length}/{maxVideos} videos
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
    marginBottom: 4,
  },
  hint: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  videosContainer: {
    paddingVertical: 8,
  },
  videoWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: 120,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#2a2a3e',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
  },
  videoIcon: {
    fontSize: 24,
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
  indexBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  indexText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  addButton: {
    width: 120,
    height: 80,
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
  },
  addButtonText: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
  },
  counter: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
});
