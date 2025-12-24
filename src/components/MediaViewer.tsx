import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LibraryItem } from '../types';

interface MediaViewerProps {
  item: LibraryItem | null;
  visible: boolean;
  onClose: () => void;
  onReuse: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

const { width, height } = Dimensions.get('window');

export const MediaViewer: React.FC<MediaViewerProps> = ({
  item,
  visible,
  onClose,
  onReuse,
  onDownload,
  onDelete,
}) => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!item) return null;

  const isVideo = item.result.type === 'video';

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlayback = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.mediaContainer}>
          {isVideo ? (
            <TouchableOpacity
              style={styles.videoContainer}
              onPress={togglePlayback}
              activeOpacity={1}
            >
              <Video
                ref={videoRef}
                source={{ uri: item.result.url }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                shouldPlay
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              />
              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#7c3aed" />
                </View>
              )}
              {!isPlaying && !isLoading && (
                <View style={styles.playOverlay}>
                  <View style={styles.playButton}>
                    <Text style={styles.playIcon}>▶</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <Image
              source={{ uri: item.result.url }}
              style={styles.image}
              resizeMode="contain"
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
            />
          )}
        </View>

        <ScrollView style={styles.infoContainer}>
          <Text style={styles.prompt}>{item.result.prompt}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Model:</Text>
            <Text style={styles.metaValue}>{item.result.modelType}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Resolution:</Text>
            <Text style={styles.metaValue}>{item.result.resolution}</Text>
          </View>

          {item.result.duration && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Duration:</Text>
              <Text style={styles.metaValue}>{item.result.duration}s</Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Aspect Ratio:</Text>
            <Text style={styles.metaValue}>{item.result.aspectRatio}</Text>
          </View>

          {item.result.seed && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Seed:</Text>
              <Text style={styles.metaValue}>{item.result.seed}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onReuse}>
            <Text style={styles.actionIcon}>↻</Text>
            <Text style={styles.actionLabel}>Reuse</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
            <Text style={styles.actionIcon}>↓</Text>
            <Text style={styles.actionLabel}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteAction]}
            onPress={onDelete}
          >
            <Text style={[styles.actionIcon, styles.deleteIcon]}>✕</Text>
            <Text style={[styles.actionLabel, styles.deleteIcon]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  videoContainer: {
    width: width,
    height: height * 0.4,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: width,
    height: height * 0.4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 24,
    marginLeft: 4,
  },
  infoContainer: {
    maxHeight: height * 0.25,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  prompt: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaLabel: {
    color: '#888',
    fontSize: 12,
    width: 100,
  },
  metaValue: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIcon: {
    fontSize: 24,
    color: '#7c3aed',
    marginBottom: 4,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
  },
  deleteAction: {},
  deleteIcon: {
    color: '#ef4444',
  },
});
