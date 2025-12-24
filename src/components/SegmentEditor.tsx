import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VideoSegment, VideoDuration } from '../types';
import { PromptInput } from './PromptInput';
import { DurationSelector } from './DurationSelector';

interface SegmentEditorProps {
  segments: VideoSegment[];
  onUpdateSegment: (id: string, updates: Partial<VideoSegment>) => void;
  availableDurations?: VideoDuration[];
}

export const SegmentEditor: React.FC<SegmentEditorProps> = ({
  segments,
  onUpdateSegment,
  availableDurations = ['5', '10', '15'],
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Segments</Text>
      <Text style={styles.subtitle}>
        Each segment will use the last frame of the previous video for seamless
        transitions
      </Text>
      {segments.map((segment, index) => (
        <View key={segment.id} style={styles.segmentCard}>
          <View style={styles.segmentHeader}>
            <Text style={styles.segmentNumber}>Video {index + 1}</Text>
            {index > 0 && (
              <Text style={styles.continuationBadge}>
                ⟵ Continues from Video {index}
              </Text>
            )}
          </View>
          <PromptInput
            value={segment.prompt}
            onChangeText={(text) =>
              onUpdateSegment(segment.id, { prompt: text })
            }
            placeholder={`Describe the motion for video ${index + 1}...`}
            maxLength={800}
          />
          <DurationSelector
            selectedDuration={segment.duration}
            onSelectDuration={(duration) =>
              onUpdateSegment(segment.id, { duration })
            }
            availableDurations={availableDurations}
            label={`Video ${index + 1} Duration`}
          />
        </View>
      ))}
      <View style={styles.totalDuration}>
        <Text style={styles.totalDurationLabel}>Total Duration:</Text>
        <Text style={styles.totalDurationValue}>
          {segments.reduce(
            (sum, seg) => sum + parseInt(seg.duration, 10),
            0
          )}
          s
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888',
    fontSize: 12,
    marginBottom: 16,
  },
  segmentCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  segmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  segmentNumber: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '700',
  },
  continuationBadge: {
    color: '#22c55e',
    fontSize: 11,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  totalDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  totalDurationLabel: {
    color: '#888',
    fontSize: 14,
    marginRight: 8,
  },
  totalDurationValue: {
    color: '#7c3aed',
    fontSize: 18,
    fontWeight: '700',
  },
});
