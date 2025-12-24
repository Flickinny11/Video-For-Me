import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { LibraryItem } from '../types';

interface LibraryCardProps {
  item: LibraryItem;
  onPress: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  onReuse: () => void;
  onDownload: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export const LibraryCard: React.FC<LibraryCardProps> = ({
  item,
  onPress,
  onFavorite,
  onDelete,
  onReuse,
  onDownload,
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const isVideo = item.result.type === 'video';

  useEffect(() => {
    const loadThumbnail = async () => {
      if (isVideo && item.result.url) {
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(
            item.result.url,
            { time: 1000 }
          );
          setThumbnail(uri);
        } catch (error) {
          console.log('Using URL as thumbnail');
          setThumbnail(item.result.thumbnailUrl || item.result.url);
        }
      } else {
        setThumbnail(item.result.url);
      }
    };

    loadThumbnail();
  }, [item.result.url, isVideo]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.imageContainer}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>Loading...</Text>
          </View>
        )}
        {isVideo && (
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        )}
        {item.result.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.result.duration}s</Text>
          </View>
        )}
        {item.result.isSequence && (
          <View style={styles.sequenceBadge}>
            <Text style={styles.sequenceText}>Sequence</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.prompt} numberOfLines={2}>
          {item.result.prompt}
        </Text>
        <Text style={styles.date}>{formatDate(item.result.createdAt)}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onFavorite}>
          <Text style={styles.actionIcon}>
            {item.isFavorite ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onReuse}>
          <Text style={styles.actionIcon}>↻</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDownload}>
          <Text style={styles.actionIcon}>↓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
        >
          <Text style={[styles.actionIcon, styles.deleteIcon]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
    backgroundColor: '#2a2a3e',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  sequenceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sequenceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
  },
  prompt: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  date: {
    color: '#666',
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#2a2a3e',
  },
  actionIcon: {
    fontSize: 16,
    color: '#888',
  },
  deleteButton: {
    borderRightWidth: 0,
  },
  deleteIcon: {
    color: '#ef4444',
  },
});
