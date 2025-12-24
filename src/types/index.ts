// Model types for Wan 2.6
export type ModelType =
  | 'text-to-image'
  | 'image-to-image'
  | 'reference-to-video'
  | 'image-to-video'
  | 'text-to-video';

export type VideoDuration = '5' | '10' | '15';
export type Resolution = '720p' | '1080p';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

// Model configurations
export interface ModelConfig {
  id: ModelType;
  name: string;
  endpoint: string;
  requiresImage: boolean;
  requiresVideo: boolean;
  supportsMultipleReferences: boolean;
  maxReferences: number;
  supportedDurations: VideoDuration[];
  isVideoOutput: boolean;
  maxPromptLength: number;
}

export const MODEL_CONFIGS: Record<ModelType, ModelConfig> = {
  'text-to-image': {
    id: 'text-to-image',
    name: 'Text to Image',
    endpoint: 'wan/v2.6/text-to-image',
    requiresImage: false,
    requiresVideo: false,
    supportsMultipleReferences: false,
    maxReferences: 0,
    supportedDurations: [],
    isVideoOutput: false,
    maxPromptLength: 1000,
  },
  'image-to-image': {
    id: 'image-to-image',
    name: 'Image to Image',
    endpoint: 'wan/v2.6/image-to-image',
    requiresImage: true,
    requiresVideo: false,
    supportsMultipleReferences: false,
    maxReferences: 1,
    supportedDurations: [],
    isVideoOutput: false,
    maxPromptLength: 1000,
  },
  'reference-to-video': {
    id: 'reference-to-video',
    name: 'Reference to Video',
    endpoint: 'wan/v2.6/reference-to-video',
    requiresImage: false,
    requiresVideo: true,
    supportsMultipleReferences: true,
    maxReferences: 3,
    supportedDurations: ['5', '10'],
    isVideoOutput: true,
    maxPromptLength: 800,
  },
  'image-to-video': {
    id: 'image-to-video',
    name: 'Image to Video',
    endpoint: 'wan/v2.6/image-to-video',
    requiresImage: true,
    requiresVideo: false,
    supportsMultipleReferences: false,
    maxReferences: 1,
    supportedDurations: ['5', '10', '15'],
    isVideoOutput: true,
    maxPromptLength: 800,
  },
  'text-to-video': {
    id: 'text-to-video',
    name: 'Text to Video',
    endpoint: 'wan/v2.6/text-to-video',
    requiresImage: false,
    requiresVideo: false,
    supportsMultipleReferences: false,
    maxReferences: 0,
    supportedDurations: ['5', '10', '15'],
    isVideoOutput: true,
    maxPromptLength: 800,
  },
};

// Generation request types
export interface VideoSegment {
  id: string;
  prompt: string;
  duration: VideoDuration;
  order: number;
}

export interface GenerationRequest {
  id: string;
  modelType: ModelType;
  prompt: string;
  negativePrompt?: string;
  duration?: VideoDuration;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  imageUrls?: string[];
  videoUrls?: string[];
  enablePromptExpansion: boolean;
  enableSafetyChecker: boolean;
  seed?: number;
  // For video sequencing
  segments?: VideoSegment[];
  isSequence: boolean;
}

// Job status tracking
export type JobStatus = 'pending' | 'queued' | 'in_progress' | 'completed' | 'failed';

export interface GenerationJob {
  id: string;
  requestId: string;
  falRequestId?: string;
  status: JobStatus;
  progress: number;
  queuePosition?: number;
  logs: string[];
  result?: GenerationResult;
  error?: string;
  createdAt: number;
  updatedAt: number;
  // For sequences
  segmentIndex?: number;
  totalSegments?: number;
}

export interface GenerationResult {
  id: string;
  type: 'image' | 'video';
  url: string;
  localUri?: string;
  thumbnailUrl?: string;
  prompt: string;
  modelType: ModelType;
  duration?: VideoDuration;
  resolution: Resolution;
  aspectRatio: AspectRatio;
  imageUrls?: string[];
  videoUrls?: string[];
  createdAt: number;
  seed?: number;
  // For sequences
  isSequence: boolean;
  sequenceUrls?: string[];
}

// Library item
export interface LibraryItem {
  id: string;
  result: GenerationResult;
  isFavorite: boolean;
  downloadedAt?: number;
}

// Upload handling
export interface ProcessedMedia {
  uri: string;
  base64?: string;
  width: number;
  height: number;
  type: 'image' | 'video';
  format: string;
}

// Fal API types
export interface FalQueueUpdate {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED';
  position?: number;
  logs?: { message: string }[];
}

export interface FalVideoResponse {
  video: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
  seed: number;
  timings?: Record<string, number>;
}

export interface FalImageResponse {
  images: Array<{
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
    width: number;
    height: number;
  }>;
  seed: number;
  timings?: Record<string, number>;
}
