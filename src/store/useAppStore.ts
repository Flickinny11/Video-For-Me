import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ModelType,
  VideoDuration,
  Resolution,
  AspectRatio,
  GenerationRequest,
  GenerationJob,
  GenerationResult,
  LibraryItem,
  VideoSegment,
} from '../types';

interface AppState {
  // API Configuration
  apiKey: string;
  setApiKey: (key: string) => void;

  // Generation Settings
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;

  prompt: string;
  setPrompt: (prompt: string) => void;

  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;

  duration: VideoDuration;
  setDuration: (duration: VideoDuration) => void;

  resolution: Resolution;
  setResolution: (resolution: Resolution) => void;

  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;

  enablePromptExpansion: boolean;
  setEnablePromptExpansion: (enabled: boolean) => void;

  enableSafetyChecker: boolean;
  setEnableSafetyChecker: (enabled: boolean) => void;

  // Media uploads
  uploadedImages: string[];
  addUploadedImage: (uri: string) => void;
  removeUploadedImage: (uri: string) => void;
  clearUploadedImages: () => void;

  uploadedVideos: string[];
  addUploadedVideo: (uri: string) => void;
  removeUploadedVideo: (uri: string) => void;
  clearUploadedVideos: () => void;

  // Video Sequencing
  numberOfVideos: number;
  setNumberOfVideos: (count: number) => void;

  videoSegments: VideoSegment[];
  updateSegment: (id: string, updates: Partial<VideoSegment>) => void;
  initializeSegments: (count: number) => void;

  // Jobs
  activeJobs: GenerationJob[];
  addJob: (job: GenerationJob) => void;
  updateJob: (id: string, updates: Partial<GenerationJob>) => void;
  removeJob: (id: string) => void;
  clearCompletedJobs: () => void;

  // Library
  libraryItems: LibraryItem[];
  addLibraryItem: (item: LibraryItem) => void;
  removeLibraryItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearLibrary: () => void;

  // Reuse functionality
  reuseGenerationResult: (result: GenerationResult) => void;

  // Reset generation form
  resetGenerationForm: () => void;
}

const generateSegmentId = () => Math.random().toString(36).substring(2, 9);

// Default API key - can be updated in Settings
const DEFAULT_API_KEY = '53b1019d-ddde-4ce7-b291-9271949bbfc1:500671543bb64c583e2f6e9f26c63071';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // API Configuration
      apiKey: DEFAULT_API_KEY,
      setApiKey: (key) => set({ apiKey: key }),

      // Generation Settings
      selectedModel: 'text-to-video',
      setSelectedModel: (model) => set({ selectedModel: model }),

      prompt: '',
      setPrompt: (prompt) => set({ prompt }),

      negativePrompt: '',
      setNegativePrompt: (prompt) => set({ negativePrompt: prompt }),

      duration: '5',
      setDuration: (duration) => set({ duration }),

      resolution: '1080p',
      setResolution: (resolution) => set({ resolution }),

      aspectRatio: '16:9',
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),

      enablePromptExpansion: true,
      setEnablePromptExpansion: (enabled) => set({ enablePromptExpansion: enabled }),

      enableSafetyChecker: false, // Disabled by default as requested
      setEnableSafetyChecker: (enabled) => set({ enableSafetyChecker: enabled }),

      // Media uploads
      uploadedImages: [],
      addUploadedImage: (uri) =>
        set((state) => ({ uploadedImages: [...state.uploadedImages, uri] })),
      removeUploadedImage: (uri) =>
        set((state) => ({
          uploadedImages: state.uploadedImages.filter((u) => u !== uri),
        })),
      clearUploadedImages: () => set({ uploadedImages: [] }),

      uploadedVideos: [],
      addUploadedVideo: (uri) =>
        set((state) => ({ uploadedVideos: [...state.uploadedVideos, uri] })),
      removeUploadedVideo: (uri) =>
        set((state) => ({
          uploadedVideos: state.uploadedVideos.filter((u) => u !== uri),
        })),
      clearUploadedVideos: () => set({ uploadedVideos: [] }),

      // Video Sequencing
      numberOfVideos: 1,
      setNumberOfVideos: (count) => {
        set({ numberOfVideos: count });
        get().initializeSegments(count);
      },

      videoSegments: [
        { id: generateSegmentId(), prompt: '', duration: '5', order: 0 },
      ],
      updateSegment: (id, updates) =>
        set((state) => ({
          videoSegments: state.videoSegments.map((seg) =>
            seg.id === id ? { ...seg, ...updates } : seg
          ),
        })),
      initializeSegments: (count) =>
        set((state) => {
          const currentSegments = state.videoSegments;
          const newSegments: VideoSegment[] = [];

          for (let i = 0; i < count; i++) {
            if (currentSegments[i]) {
              newSegments.push({ ...currentSegments[i], order: i });
            } else {
              newSegments.push({
                id: generateSegmentId(),
                prompt: '',
                duration: '5',
                order: i,
              });
            }
          }

          return { videoSegments: newSegments };
        }),

      // Jobs
      activeJobs: [],
      addJob: (job) =>
        set((state) => ({ activeJobs: [...state.activeJobs, job] })),
      updateJob: (id, updates) =>
        set((state) => ({
          activeJobs: state.activeJobs.map((job) =>
            job.id === id ? { ...job, ...updates, updatedAt: Date.now() } : job
          ),
        })),
      removeJob: (id) =>
        set((state) => ({
          activeJobs: state.activeJobs.filter((job) => job.id !== id),
        })),
      clearCompletedJobs: () =>
        set((state) => ({
          activeJobs: state.activeJobs.filter(
            (job) => job.status !== 'completed' && job.status !== 'failed'
          ),
        })),

      // Library
      libraryItems: [],
      addLibraryItem: (item) =>
        set((state) => ({ libraryItems: [item, ...state.libraryItems] })),
      removeLibraryItem: (id) =>
        set((state) => ({
          libraryItems: state.libraryItems.filter((item) => item.id !== id),
        })),
      toggleFavorite: (id) =>
        set((state) => ({
          libraryItems: state.libraryItems.map((item) =>
            item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
          ),
        })),
      clearLibrary: () => set({ libraryItems: [] }),

      // Reuse functionality
      reuseGenerationResult: (result) => {
        set({
          selectedModel: result.modelType,
          prompt: result.prompt,
          duration: result.duration || '5',
          resolution: result.resolution,
          aspectRatio: result.aspectRatio,
          uploadedImages: result.imageUrls || [],
          uploadedVideos: result.videoUrls || [],
        });
      },

      // Reset generation form
      resetGenerationForm: () =>
        set({
          prompt: '',
          negativePrompt: '',
          uploadedImages: [],
          uploadedVideos: [],
          numberOfVideos: 1,
          videoSegments: [
            { id: generateSegmentId(), prompt: '', duration: '5', order: 0 },
          ],
        }),
    }),
    {
      name: 'video-for-me-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        apiKey: state.apiKey,
        libraryItems: state.libraryItems,
        resolution: state.resolution,
        aspectRatio: state.aspectRatio,
        enablePromptExpansion: state.enablePromptExpansion,
        enableSafetyChecker: state.enableSafetyChecker,
      }),
    }
  )
);

// Helper to create a generation request from current state
export const createGenerationRequest = (state: AppState): GenerationRequest => {
  const isSequence = state.numberOfVideos > 1;

  return {
    id: Math.random().toString(36).substring(2, 9),
    modelType: state.selectedModel,
    prompt: state.prompt,
    negativePrompt: state.negativePrompt,
    duration: state.duration,
    resolution: state.resolution,
    aspectRatio: state.aspectRatio,
    imageUrls: state.uploadedImages,
    videoUrls: state.uploadedVideos,
    enablePromptExpansion: state.enablePromptExpansion,
    enableSafetyChecker: state.enableSafetyChecker,
    segments: isSequence ? state.videoSegments : undefined,
    isSequence,
  };
};
