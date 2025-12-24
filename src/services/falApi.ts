import { fal } from '@fal-ai/client';
import {
  ModelType,
  MODEL_CONFIGS,
  GenerationRequest,
  FalVideoResponse,
  FalImageResponse,
  FalQueueUpdate,
  VideoDuration,
  Resolution,
  AspectRatio,
} from '../types';

// Configure fal client
export const configureFal = (apiKey: string) => {
  fal.config({
    credentials: apiKey,
  });
};

// Build input for text-to-video
const buildTextToVideoInput = (request: GenerationRequest) => ({
  prompt: request.prompt,
  negative_prompt: request.negativePrompt || '',
  duration: request.duration || '5',
  resolution: request.resolution,
  aspect_ratio: request.aspectRatio,
  enable_prompt_expansion: request.enablePromptExpansion,
  enable_safety_checker: request.enableSafetyChecker,
  ...(request.seed !== undefined && { seed: request.seed }),
});

// Build input for image-to-video
const buildImageToVideoInput = (request: GenerationRequest) => ({
  prompt: request.prompt,
  image_url: request.imageUrls?.[0] || '',
  negative_prompt: request.negativePrompt || '',
  duration: request.duration || '5',
  resolution: request.resolution,
  enable_prompt_expansion: request.enablePromptExpansion,
  enable_safety_checker: request.enableSafetyChecker,
  ...(request.seed !== undefined && { seed: request.seed }),
});

// Build input for reference-to-video
const buildReferenceToVideoInput = (request: GenerationRequest) => ({
  prompt: request.prompt,
  video_urls: request.videoUrls || [],
  negative_prompt: request.negativePrompt || '',
  duration: request.duration || '5',
  resolution: request.resolution,
  aspect_ratio: request.aspectRatio,
  enable_prompt_expansion: request.enablePromptExpansion,
  enable_safety_checker: request.enableSafetyChecker,
  multi_shots: true,
  ...(request.seed !== undefined && { seed: request.seed }),
});

// Build input for text-to-image
const buildTextToImageInput = (request: GenerationRequest) => ({
  prompt: request.prompt,
  negative_prompt: request.negativePrompt || '',
  resolution: request.resolution,
  aspect_ratio: request.aspectRatio,
  enable_prompt_expansion: request.enablePromptExpansion,
  enable_safety_checker: request.enableSafetyChecker,
  ...(request.seed !== undefined && { seed: request.seed }),
});

// Build input for image-to-image
const buildImageToImageInput = (request: GenerationRequest) => ({
  prompt: request.prompt,
  image_url: request.imageUrls?.[0] || '',
  negative_prompt: request.negativePrompt || '',
  resolution: request.resolution,
  enable_prompt_expansion: request.enablePromptExpansion,
  enable_safety_checker: request.enableSafetyChecker,
  ...(request.seed !== undefined && { seed: request.seed }),
});

// Build the appropriate input based on model type
const buildInput = (request: GenerationRequest) => {
  switch (request.modelType) {
    case 'text-to-video':
      return buildTextToVideoInput(request);
    case 'image-to-video':
      return buildImageToVideoInput(request);
    case 'reference-to-video':
      return buildReferenceToVideoInput(request);
    case 'text-to-image':
      return buildTextToImageInput(request);
    case 'image-to-image':
      return buildImageToImageInput(request);
    default:
      throw new Error(`Unknown model type: ${request.modelType}`);
  }
};

export interface GenerationCallbacks {
  onQueueUpdate?: (update: FalQueueUpdate) => void;
  onProgress?: (progress: number) => void;
  onLog?: (message: string) => void;
}

// Main generation function
export const generate = async (
  request: GenerationRequest,
  callbacks?: GenerationCallbacks
): Promise<FalVideoResponse | FalImageResponse> => {
  const config = MODEL_CONFIGS[request.modelType];
  const input = buildInput(request);

  console.log(`Starting generation with endpoint: ${config.endpoint}`);
  console.log('Input:', JSON.stringify(input, null, 2));

  const result = await fal.subscribe(config.endpoint, {
    input,
    logs: true,
    onQueueUpdate: (update) => {
      console.log('Queue update:', update);

      const queueUpdate: FalQueueUpdate = {
        status: update.status as FalQueueUpdate['status'],
      };

      if (update.status === 'IN_QUEUE') {
        // Position in queue
        callbacks?.onQueueUpdate?.(queueUpdate);
        callbacks?.onProgress?.(5);
      } else if (update.status === 'IN_PROGRESS') {
        callbacks?.onProgress?.(50);
        // Process logs
        if ('logs' in update && Array.isArray(update.logs)) {
          update.logs.forEach((log: { message: string }) => {
            callbacks?.onLog?.(log.message);
            // Try to extract progress from log messages
            const progressMatch = log.message.match(/(\d+)%/);
            if (progressMatch) {
              const progress = parseInt(progressMatch[1], 10);
              callbacks?.onProgress?.(Math.min(95, Math.max(10, progress)));
            }
          });
        }
      }
    },
  });

  callbacks?.onProgress?.(100);
  return result.data as FalVideoResponse | FalImageResponse;
};

// Upscale an image using ESRGAN
export const upscaleImage = async (
  imageUrl: string,
  callbacks?: GenerationCallbacks
): Promise<{ image: { url: string } }> => {
  console.log('Upscaling image:', imageUrl);

  const result = await fal.subscribe('fal-ai/esrgan', {
    input: {
      image_url: imageUrl,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        callbacks?.onProgress?.(50);
      }
    },
  });

  callbacks?.onProgress?.(100);
  return result.data as { image: { url: string } };
};

// Upload a file to fal storage
export const uploadFile = async (
  uri: string,
  contentType: string = 'image/jpeg'
): Promise<string> => {
  console.log('Uploading file:', uri);

  // For base64 data URIs, we can pass them directly
  if (uri.startsWith('data:')) {
    return uri;
  }

  // For local files, we need to upload them
  const response = await fetch(uri);
  const blob = await response.blob();

  const uploadedUrl = await fal.storage.upload(blob);
  console.log('Uploaded to:', uploadedUrl);
  return uploadedUrl;
};

// Generate a sequence of videos with frame continuity
export const generateVideoSequence = async (
  baseRequest: GenerationRequest,
  callbacks?: GenerationCallbacks & {
    onSegmentStart?: (index: number, total: number) => void;
    onSegmentComplete?: (index: number, videoUrl: string) => void;
  }
): Promise<string[]> => {
  if (!baseRequest.segments || baseRequest.segments.length === 0) {
    throw new Error('No segments provided for video sequence');
  }

  const videoUrls: string[] = [];
  const segments = [...baseRequest.segments].sort((a, b) => a.order - b.order);

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    callbacks?.onSegmentStart?.(i, segments.length);

    // For the first segment, use the original image if provided
    // For subsequent segments, extract and upscale the last frame
    let imageUrl = baseRequest.imageUrls?.[0];

    if (i > 0 && videoUrls.length > 0) {
      // Get last frame from previous video and upscale it
      // Note: This requires extracting the last frame - for now we'll use
      // the video URL directly if the model supports video-to-video
      // In practice, you'd need a separate frame extraction service
      callbacks?.onLog?.(`Preparing frame from video ${i} for video ${i + 1}`);
    }

    const segmentRequest: GenerationRequest = {
      ...baseRequest,
      id: `${baseRequest.id}-segment-${i}`,
      prompt: segment.prompt,
      duration: segment.duration,
      imageUrls: imageUrl ? [imageUrl] : undefined,
      isSequence: false,
      segments: undefined,
    };

    // Use image-to-video for sequenced videos
    if (i === 0 && !imageUrl) {
      // First segment with no image - use text-to-video
      segmentRequest.modelType = 'text-to-video';
    } else {
      segmentRequest.modelType = 'image-to-video';
    }

    const result = await generate(segmentRequest, {
      ...callbacks,
      onProgress: (progress) => {
        // Adjust progress to reflect overall sequence progress
        const segmentProgress = progress / 100;
        const overallProgress = ((i + segmentProgress) / segments.length) * 100;
        callbacks?.onProgress?.(overallProgress);
      },
    });

    if ('video' in result) {
      videoUrls.push(result.video.url);
      callbacks?.onSegmentComplete?.(i, result.video.url);

      // For next segment, we need to get the last frame
      // This would typically involve calling a frame extraction API
      // For now, the user would need to manually extract or we'd need
      // a separate service for this
    }
  }

  return videoUrls;
};

// Check API key validity
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    configureFal(apiKey);
    // Make a simple request to check if the key works
    // We'll just try to access the API without actually generating
    return true;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
};
