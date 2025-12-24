import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { LibraryCard, MediaViewer } from '../src/components';
import { LibraryItem } from '../src/types';

export default function LibraryScreen() {
  const router = useRouter();
  const {
    libraryItems,
    removeLibraryItem,
    toggleFavorite,
    reuseGenerationResult,
    clearLibrary,
  } = useAppStore();

  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'favorites' | 'videos' | 'images'>('all');

  const filteredItems = libraryItems.filter((item) => {
    switch (filter) {
      case 'favorites':
        return item.isFavorite;
      case 'videos':
        return item.result.type === 'video';
      case 'images':
        return item.result.type === 'image';
      default:
        return true;
    }
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleDownload = async (item: LibraryItem) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save media');
        return;
      }

      const filename = `videoforme_${item.id}.${item.result.type === 'video' ? 'mp4' : 'jpg'}`;
      const localUri = `${FileSystem.documentDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(
        item.result.url,
        localUri
      );

      if (downloadResult.status !== 200) {
        throw new Error('Download failed');
      }

      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
      Alert.alert('Success', 'Saved to your photo library!');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to save media');
    }
  };

  const handleDelete = (item: LibraryItem) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeLibraryItem(item.id);
            setSelectedItem(null);
          },
        },
      ]
    );
  };

  const handleReuse = (item: LibraryItem) => {
    reuseGenerationResult(item.result);
    setSelectedItem(null);
    router.push('/');
  };

  const handleClearLibrary = () => {
    Alert.alert(
      'Clear Library',
      'Are you sure you want to delete all items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearLibrary,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {(['all', 'favorites', 'videos', 'images'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === f && styles.filterButtonTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7c3aed"
          />
        }
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'No Creations Yet' : `No ${filter}`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all'
                ? 'Generate something to see it here'
                : `You don't have any ${filter} yet`}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredItems.map((item) => (
              <LibraryCard
                key={item.id}
                item={item}
                onPress={() => setSelectedItem(item)}
                onFavorite={() => toggleFavorite(item.id)}
                onDelete={() => handleDelete(item)}
                onReuse={() => handleReuse(item)}
                onDownload={() => handleDownload(item)}
              />
            ))}
          </View>
        )}

        {libraryItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearLibrary}
          >
            <Text style={styles.clearButtonText}>Clear Library</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <MediaViewer
        item={selectedItem}
        visible={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onReuse={() => selectedItem && handleReuse(selectedItem)}
        onDownload={() => selectedItem && handleDownload(selectedItem)}
        onDelete={() => selectedItem && handleDelete(selectedItem)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a14',
  },
  filterBar: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#1a1a2e',
  },
  filterButtonActive: {
    backgroundColor: '#7c3aed',
  },
  filterButtonText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  clearButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
