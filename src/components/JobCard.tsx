import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GenerationJob } from '../types';

interface JobCardProps {
  job: GenerationJob;
  onPress?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return '#22c55e';
      case 'failed':
        return '#ef4444';
      case 'in_progress':
        return '#7c3aed';
      case 'queued':
        return '#f59e0b';
      default:
        return '#888';
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'in_progress':
        return `Generating... ${Math.round(job.progress)}%`;
      case 'queued':
        return job.queuePosition
          ? `Queue position: ${job.queuePosition}`
          : 'In Queue';
      default:
        return 'Pending';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
        <Text style={styles.time}>{formatTime(job.createdAt)}</Text>
      </View>

      {job.status === 'in_progress' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${job.progress}%` }]}
            />
          </View>
        </View>
      )}

      {job.segmentIndex !== undefined && job.totalSegments && (
        <Text style={styles.segmentInfo}>
          Segment {job.segmentIndex + 1} of {job.totalSegments}
        </Text>
      )}

      {job.logs.length > 0 && (
        <View style={styles.logsContainer}>
          <Text style={styles.lastLog} numberOfLines={1}>
            {job.logs[job.logs.length - 1]}
          </Text>
        </View>
      )}

      {job.error && (
        <Text style={styles.errorText} numberOfLines={2}>
          {job.error}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  time: {
    color: '#888',
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2a2a3e',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 3,
  },
  segmentInfo: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
  logsContainer: {
    marginTop: 8,
    backgroundColor: '#0a0a14',
    padding: 8,
    borderRadius: 8,
  },
  lastLog: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 8,
  },
});
