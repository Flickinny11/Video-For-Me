import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { ProcessedMedia, AspectRatio } from '../types';

// Wan 2.6 image requirements
const WAN_MIN_DIMENSION = 360;
const WAN_MAX_DIMENSION = 2000;
const WAN_MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png', 'bmp', 'webp'];

// Get optimal dimensions for a given aspect ratio
export const getDimensionsForAspectRatio = (
  aspectRatio: AspectRatio,
  resolution: '720p' | '1080p'
): { width: number; height: number } => {
  const baseHeight = resolution === '1080p' ? 1080 : 720;
  const baseWidth = resolution === '1080p' ? 1920 : 1280;

  switch (aspectRatio) {
    case '16:9':
      return { width: baseWidth, height: baseHeight };
    case '9:16':
      return { width: baseHeight, height: baseWidth };
    case '1:1':
      return { width: baseHeight, height: baseHeight };
    case '4:3':
      return {
        width: Math.round(baseHeight * (4 / 3)),
        height: baseHeight,
      };
    case '3:4':
      return {
        width: baseHeight,
        height: Math.round(baseHeight * (4 / 3)),
      };
    default:
      return { width: baseWidth, height: baseHeight };
  }
};

// Resize image to fit within Wan 2.6 requirements
export const resizeImageForWan = async (
  uri: string,
  targetAspectRatio?: AspectRatio,
  resolution: '720p' | '1080p' = '1080p'
): Promise<ProcessedMedia> => {
  console.log('Processing image:', uri);

  // Get target dimensions
  const targetDimensions = targetAspectRatio
    ? getDimensionsForAspectRatio(targetAspectRatio, resolution)
    : { width: resolution === '1080p' ? 1920 : 1280, height: resolution === '1080p' ? 1080 : 720 };

  // Ensure dimensions are within Wan limits
  let { width, height } = targetDimensions;

  // Scale down if too large
  const maxDim = Math.max(width, height);
  if (maxDim > WAN_MAX_DIMENSION) {
    const scale = WAN_MAX_DIMENSION / maxDim;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  // Scale up if too small
  const minDim = Math.min(width, height);
  if (minDim < WAN_MIN_DIMENSION) {
    const scale = WAN_MIN_DIMENSION / minDim;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  // Manipulate the image
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      {
        resize: { width, height },
      },
    ],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  // Check file size
  const fileInfo = await FileSystem.getInfoAsync(result.uri);
  let finalUri = result.uri;

  if (fileInfo.exists && 'size' in fileInfo && fileInfo.size > WAN_MAX_FILE_SIZE) {
    // Re-compress with lower quality
    const recompressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width, height } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    finalUri = recompressed.uri;
  }

  // Convert to base64 for API upload
  const base64 = await FileSystem.readAsStringAsync(finalUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return {
    uri: finalUri,
    base64: `data:image/jpeg;base64,${base64}`,
    width,
    height,
    type: 'image',
    format: 'jpeg',
  };
};

// Convert various image formats to JPEG
export const convertToJpeg = async (uri: string): Promise<string> => {
  const result = await ImageManipulator.manipulateAsync(uri, [], {
    compress: 0.9,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return result.uri;
};

// Check if file format is supported
export const isSupportedFormat = (filename: string): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return SUPPORTED_FORMATS.includes(extension);
};

// Get file extension from URI
export const getFileExtension = (uri: string): string => {
  const parts = uri.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

// Process uploaded image for Wan 2.6
export const processImageForUpload = async (
  uri: string,
  aspectRatio?: AspectRatio,
  resolution: '720p' | '1080p' = '1080p'
): Promise<ProcessedMedia> => {
  // First, convert to JPEG if needed
  const extension = getFileExtension(uri);
  let processedUri = uri;

  if (!SUPPORTED_FORMATS.includes(extension)) {
    // Try to convert to JPEG
    processedUri = await convertToJpeg(uri);
  }

  // Then resize for Wan requirements
  return resizeImageForWan(processedUri, aspectRatio, resolution);
};

// Extract dimensions from image URI (using Image.getSize would require react-native Image)
export const getImageDimensions = async (
  uri: string
): Promise<{ width: number; height: number }> => {
  // We'll use ImageManipulator to get dimensions by doing a no-op manipulation
  const result = await ImageManipulator.manipulateAsync(uri, []);
  return {
    width: result.width,
    height: result.height,
  };
};

// Create a thumbnail for display
export const createThumbnail = async (
  uri: string,
  maxSize: number = 300
): Promise<string> => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      {
        resize: {
          width: maxSize,
          height: maxSize,
        },
      },
    ],
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );
  return result.uri;
};

// Validate image meets Wan 2.6 requirements
export const validateImageForWan = async (
  uri: string
): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  try {
    const dimensions = await getImageDimensions(uri);

    if (dimensions.width < WAN_MIN_DIMENSION || dimensions.height < WAN_MIN_DIMENSION) {
      errors.push(`Image too small. Minimum dimension is ${WAN_MIN_DIMENSION}px`);
    }

    if (dimensions.width > WAN_MAX_DIMENSION || dimensions.height > WAN_MAX_DIMENSION) {
      errors.push(`Image too large. Maximum dimension is ${WAN_MAX_DIMENSION}px`);
    }

    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists && 'size' in fileInfo && fileInfo.size > WAN_MAX_FILE_SIZE) {
      errors.push(`File too large. Maximum size is 25MB`);
    }
  } catch (error) {
    errors.push('Could not validate image');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
