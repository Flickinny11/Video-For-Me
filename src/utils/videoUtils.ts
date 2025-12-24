import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system/legacy';
import { ProcessedMedia } from '../types';
import { resizeImageForWan } from './imageUtils';

// Extract a frame from a video at a specific time
export const extractVideoFrame = async (
  videoUri: string,
  timeMs: number = 0
): Promise<string> => {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: timeMs,
      quality: 1,
    });
    return uri;
  } catch (error) {
    console.error('Error extracting video frame:', error);
    throw new Error('Failed to extract video frame');
  }
};

// Extract the last frame from a video
// Note: This is approximate as we don't know the exact duration without AVPlayer
export const extractLastFrame = async (
  videoUri: string,
  estimatedDurationSec: number = 5
): Promise<string> => {
  // Try to get a frame near the end
  // We subtract a small amount to ensure we don't go past the end
  const timeMs = Math.max(0, (estimatedDurationSec * 1000) - 500);

  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: timeMs,
      quality: 1,
    });
    return uri;
  } catch (error) {
    console.error('Error extracting last frame:', error);
    // Fall back to trying a frame at 80% of estimated duration
    try {
      const fallbackTime = estimatedDurationSec * 800;
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: fallbackTime,
        quality: 1,
      });
      return uri;
    } catch (fallbackError) {
      console.error('Fallback frame extraction also failed:', fallbackError);
      throw new Error('Failed to extract last frame from video');
    }
  }
};

// Extract last frame and prepare it for the next video in a sequence
export const extractAndPrepareLastFrame = async (
  videoUri: string,
  estimatedDurationSec: number,
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4',
  resolution: '720p' | '1080p' = '1080p'
): Promise<ProcessedMedia> => {
  // Extract the last frame
  const frameUri = await extractLastFrame(videoUri, estimatedDurationSec);

  // Process it for Wan 2.6 requirements
  const processed = await resizeImageForWan(frameUri, aspectRatio, resolution);

  return processed;
};

// Generate video thumbnail for library display
export const generateVideoThumbnail = async (
  videoUri: string
): Promise<string> => {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000, // 1 second in
      quality: 0.7,
    });
    return uri;
  } catch (error) {
    console.error('Error generating video thumbnail:', error);
    throw new Error('Failed to generate video thumbnail');
  }
};

// Download video to local storage
export const downloadVideo = async (
  url: string,
  filename: string
): Promise<string> => {
  const directory = `${FileSystem.documentDirectory}videos/`;

  // Ensure directory exists
  const dirInfo = await FileSystem.getInfoAsync(directory);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }

  const localUri = `${directory}${filename}`;

  const downloadResult = await FileSystem.downloadAsync(url, localUri);

  if (downloadResult.status !== 200) {
    throw new Error(`Failed to download video: ${downloadResult.status}`);
  }

  return downloadResult.uri;
};

// Get local videos directory
export const getVideosDirectory = (): string => {
  return `${FileSystem.documentDirectory}videos/`;
};

// Delete a local video file
export const deleteLocalVideo = async (uri: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    throw new Error('Failed to delete video');
  }
};

// Get video duration in seconds from filename or default
export const parseVideoDuration = (
  durationStr: '5' | '10' | '15'
): number => {
  return parseInt(durationStr, 10);
};

// Validate video URL
export const isValidVideoUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Check if local file exists
export const checkLocalFileExists = async (uri: string): Promise<boolean> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  } catch {
    return false;
  }
};
