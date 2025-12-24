import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../src/store/useAppStore';
import { configureFal } from '../src/services/falApi';

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: string;
  color: string;
  focused: boolean;
}) {
  const icons: Record<string, string> = {
    generate: '✨',
    status: '⏳',
    library: '📚',
    settings: '⚙️',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, { opacity: focused ? 1 : 0.6 }]}>
        {icons[name] || '•'}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const apiKey = useAppStore((state) => state.apiKey);
  const activeJobs = useAppStore((state) => state.activeJobs);
  const inProgressJobs = activeJobs.filter(
    (job) => job.status === 'in_progress' || job.status === 'queued'
  );

  // Configure Fal.ai client with API key on app start and when key changes
  useEffect(() => {
    if (apiKey) {
      configureFal(apiKey);
      console.log('Fal.ai configured with API key');
    }
  }, [apiKey]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#7c3aed',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerStyle: styles.header,
          headerTintColor: '#fff',
          headerTitleStyle: styles.headerTitle,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Generate',
            headerTitle: 'Video For Me',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="generate" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="status"
          options={{
            title: 'Status',
            headerTitle: 'Generation Status',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="status" color={color} focused={focused} />
            ),
            tabBarBadge:
              inProgressJobs.length > 0 ? inProgressJobs.length : undefined,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            headerTitle: 'My Creations',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="library" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerTitle: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="settings" color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0a0a14',
    borderTopColor: '#1a1a2e',
    borderTopWidth: 1,
    paddingTop: 8,
    height: 85,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  header: {
    backgroundColor: '#0a0a14',
    borderBottomColor: '#1a1a2e',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 18,
  },
  iconContainer: {
    marginTop: 4,
  },
  icon: {
    fontSize: 22,
  },
});
