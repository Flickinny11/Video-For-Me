import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAppStore } from '../src/store/useAppStore';
import { JobCard } from '../src/components';

export default function StatusScreen() {
  const { activeJobs, clearCompletedJobs, removeJob } = useAppStore();
  const [refreshing, setRefreshing] = React.useState(false);

  // Sort jobs by createdAt (newest first)
  const sortedJobs = [...activeJobs].sort((a, b) => b.createdAt - a.createdAt);

  const inProgressJobs = sortedJobs.filter(
    (job) => job.status === 'in_progress' || job.status === 'queued'
  );
  const completedJobs = sortedJobs.filter(
    (job) => job.status === 'completed' || job.status === 'failed'
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#7c3aed"
        />
      }
    >
      {activeJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⏳</Text>
          <Text style={styles.emptyTitle}>No Active Jobs</Text>
          <Text style={styles.emptySubtitle}>
            Start generating to see progress here
          </Text>
        </View>
      ) : (
        <>
          {inProgressJobs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                In Progress ({inProgressJobs.length})
              </Text>
              {inProgressJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </View>
          )}

          {completedJobs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Completed ({completedJobs.length})
                </Text>
                <TouchableOpacity onPress={clearCompletedJobs}>
                  <Text style={styles.clearButton}>Clear All</Text>
                </TouchableOpacity>
              </View>
              {completedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onPress={() => removeJob(job.id)}
                />
              ))}
            </View>
          )}
        </>
      )}

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
  emptyState: {
    flex: 1,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  clearButton: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
