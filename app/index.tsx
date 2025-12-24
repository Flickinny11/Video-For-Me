import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore, createGenerationRequest } from '../src/store/useAppStore';
import { MODEL_CONFIGS } from '../src/types';
import {
  PromptInput,
  ModelSelector,
  DurationSelector,
  ImageUploader,
  VideoUploader,
  SegmentEditor,
  NumberSelector,
  AspectRatioSelector,
  ResolutionSelector,
  SettingsRow,
} from '../src/components';
import { generate, generateVideoSequence, uploadFile } from '../src/services/falApi';
import { processImageForUpload } from '../src/utils/imageUtils';

export default function GenerateScreen() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    apiKey,
    selectedModel,
    setSelectedModel,
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    duration,
    setDuration,
    resolution,
    setResolution,
    aspectRatio,
    setAspectRatio,
    enablePromptExpansion,
    setEnablePromptExpansion,
    enableSafetyChecker,
    setEnableSafetyChecker,
    uploadedImages,
    addUploadedImage,
    removeUploadedImage,
    uploadedVideos,
    addUploadedVideo,
    removeUploadedVideo,
    numberOfVideos,
    setNumberOfVideos,
    videoSegments,
    updateSegment,
    addJob,
    updateJob,
    addLibraryItem,
    resetGenerationForm,
  } = useAppStore();

  const modelConfig = MODEL_CONFIGS[selectedModel];
  const isVideoModel = modelConfig.isVideoOutput;
  const requiresImage = modelConfig.requiresImage;
  const requiresVideo = modelConfig.requiresVideo;
  const showSequencing = isVideoModel && selectedModel !== 'reference-to-video';

  const handleGenerate = async () => {
    if (!apiKey) {
      Alert.alert(
        'API Key Required',
        'Please set your Fal.ai API key in Settings',
        [{ text: 'Go to Settings', onPress: () => router.push('/settings') }]
      );
      return;
    }

    if (!prompt.trim() && numberOfVideos === 1) {
      Alert.alert('Prompt Required', 'Please enter a prompt');
      return;
    }

    if (requiresImage && uploadedImages.length === 0) {
      Alert.alert('Image Required', 'Please upload an image for this model');
      return;
    }

    if (requiresVideo && uploadedVideos.length === 0) {
      Alert.alert('Video Required', 'Please upload reference videos for this model');
      return;
    }

    setIsGenerating(true);

    try {
      // Process and upload images
      let processedImageUrls: string[] = [];
      for (const imageUri of uploadedImages) {
        const processed = await processImageForUpload(imageUri, aspectRatio, resolution);
        const uploadedUrl = await uploadFile(processed.base64 || processed.uri);
        processedImageUrls.push(uploadedUrl);
      }

      // Upload videos
      let processedVideoUrls: string[] = [];
      for (const videoUri of uploadedVideos) {
        const uploadedUrl = await uploadFile(videoUri, 'video/mp4');
        processedVideoUrls.push(uploadedUrl);
      }

      const jobId = Math.random().toString(36).substring(2, 9);
      const isSequence = numberOfVideos > 1 && isVideoModel;

      // Create job for tracking
      addJob({
        id: jobId,
        requestId: jobId,
        status: 'queued',
        progress: 0,
        logs: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        totalSegments: isSequence ? numberOfVideos : undefined,
      });

      // Navigate to status
      router.push('/status');

      if (isSequence) {
        // Generate video sequence
        const request = createGenerationRequest({
          ...useAppStore.getState(),
          uploadedImages: processedImageUrls,
          uploadedVideos: processedVideoUrls,
        });

        const videoUrls = await generateVideoSequence(request, {
          onProgress: (progress) => {
            updateJob(jobId, { progress, status: 'in_progress' });
          },
          onLog: (message) => {
            const currentJob = useAppStore.getState().activeJobs.find((j) => j.id === jobId);
            if (currentJob) {
              updateJob(jobId, { logs: [...currentJob.logs, message] });
            }
          },
          onSegmentStart: (index, total) => {
            updateJob(jobId, {
              segmentIndex: index,
              totalSegments: total,
              logs: [...(useAppStore.getState().activeJobs.find((j) => j.id === jobId)?.logs || []), `Starting segment ${index + 1} of ${total}`],
            });
          },
          onSegmentComplete: (index, videoUrl) => {
            const currentJob = useAppStore.getState().activeJobs.find((j) => j.id === jobId);
            if (currentJob) {
              updateJob(jobId, {
                logs: [...currentJob.logs, `Completed segment ${index + 1}`],
              });
            }
          },
        });

        // Add to library
        addLibraryItem({
          id: Math.random().toString(36).substring(2, 9),
          result: {
            id: jobId,
            type: 'video',
            url: videoUrls[videoUrls.length - 1],
            prompt: videoSegments.map((s) => s.prompt).join(' | '),
            modelType: selectedModel,
            duration: duration,
            resolution: resolution,
            aspectRatio: aspectRatio,
            createdAt: Date.now(),
            isSequence: true,
            sequenceUrls: videoUrls,
          },
          isFavorite: false,
        });

        updateJob(jobId, {
          status: 'completed',
          progress: 100,
        });
      } else {
        // Single generation
        const request = createGenerationRequest({
          ...useAppStore.getState(),
          uploadedImages: processedImageUrls,
          uploadedVideos: processedVideoUrls,
        });

        const result = await generate(request, {
          onProgress: (progress) => {
            updateJob(jobId, { progress, status: 'in_progress' });
          },
          onLog: (message) => {
            const currentJob = useAppStore.getState().activeJobs.find((j) => j.id === jobId);
            if (currentJob) {
              updateJob(jobId, { logs: [...currentJob.logs, message] });
            }
          },
        });

        // Process result
        if ('video' in result) {
          addLibraryItem({
            id: Math.random().toString(36).substring(2, 9),
            result: {
              id: jobId,
              type: 'video',
              url: result.video.url,
              prompt: prompt,
              modelType: selectedModel,
              duration: duration,
              resolution: resolution,
              aspectRatio: aspectRatio,
              imageUrls: processedImageUrls,
              videoUrls: processedVideoUrls,
              createdAt: Date.now(),
              seed: result.seed,
              isSequence: false,
            },
            isFavorite: false,
          });
        } else if ('images' in result && result.images.length > 0) {
          addLibraryItem({
            id: Math.random().toString(36).substring(2, 9),
            result: {
              id: jobId,
              type: 'image',
              url: result.images[0].url,
              prompt: prompt,
              modelType: selectedModel,
              resolution: resolution,
              aspectRatio: aspectRatio,
              imageUrls: processedImageUrls,
              createdAt: Date.now(),
              seed: result.seed,
              isSequence: false,
            },
            isFavorite: false,
          });
        }

        updateJob(jobId, {
          status: 'completed',
          progress: 100,
        });
      }

      resetGenerationForm();
    } catch (error) {
      console.error('Generation error:', error);
      // Update job status to failed
      const currentJobs = useAppStore.getState().activeJobs;
      const failedJob = currentJobs.find((j) => j.status === 'queued' || j.status === 'in_progress');
      if (failedJob) {
        updateJob(failedJob.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
      Alert.alert(
        'Generation Failed',
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ModelSelector
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />

      {requiresImage && (
        <ImageUploader
          images={uploadedImages}
          onAddImage={addUploadedImage}
          onRemoveImage={removeUploadedImage}
          maxImages={modelConfig.maxReferences || 1}
          label="Upload Image"
        />
      )}

      {requiresVideo && (
        <VideoUploader
          videos={uploadedVideos}
          onAddVideo={addUploadedVideo}
          onRemoveVideo={removeUploadedVideo}
          maxVideos={modelConfig.maxReferences}
          label="Reference Videos"
        />
      )}

      {showSequencing && (
        <NumberSelector
          value={numberOfVideos}
          onChange={setNumberOfVideos}
          min={1}
          max={5}
          label="Number of Videos"
        />
      )}

      {numberOfVideos > 1 && showSequencing ? (
        <SegmentEditor
          segments={videoSegments}
          onUpdateSegment={updateSegment}
          availableDurations={modelConfig.supportedDurations}
        />
      ) : (
        <>
          <PromptInput
            value={prompt}
            onChangeText={setPrompt}
            maxLength={modelConfig.maxPromptLength}
            label="Prompt"
            placeholder={
              requiresVideo
                ? 'Use @Video1, @Video2, @Video3 to reference your videos...'
                : 'Describe what you want to generate...'
            }
          />

          <PromptInput
            value={negativePrompt}
            onChangeText={setNegativePrompt}
            maxLength={500}
            label="Negative Prompt (optional)"
            placeholder="What to avoid..."
          />
        </>
      )}

      {isVideoModel && modelConfig.supportedDurations.length > 0 && numberOfVideos === 1 && (
        <DurationSelector
          selectedDuration={duration}
          onSelectDuration={setDuration}
          availableDurations={modelConfig.supportedDurations}
        />
      )}

      <ResolutionSelector
        selectedResolution={resolution}
        onSelectResolution={setResolution}
      />

      <AspectRatioSelector
        selectedRatio={aspectRatio}
        onSelectRatio={setAspectRatio}
      />

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Advanced Settings</Text>
        <SettingsRow
          label="Prompt Expansion"
          value={enablePromptExpansion}
          onValueChange={setEnablePromptExpansion}
          description="Use AI to enhance your prompt"
        />
        <SettingsRow
          label="Safety Checker"
          value={enableSafetyChecker}
          onValueChange={setEnableSafetyChecker}
          description="Filter potentially unsafe content"
        />
      </View>

      <TouchableOpacity
        style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.generateButtonText}>
            Generate {isVideoModel ? 'Video' : 'Image'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a14',
  },
  content: {
    padding: 16,
  },
  settingsSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  settingsSectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  generateButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },
});
