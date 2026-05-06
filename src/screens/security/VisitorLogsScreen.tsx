/**
 * Visitor Logs Screen
 * Lists all visitor entries for security review
 */
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { VisitorCard, Loading, EmptyState } from '../../components';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme';
import { visitorService } from '../../services';
import { Visitor } from '../../types';

export const VisitorLogsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  const loadVisitors = useCallback(async () => {
    try {
      const data = await visitorService.getVisitorLogs();
      setVisitors(data);
    } catch (error) {
      console.error('Error loading visitors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadVisitors();
    }, [loadVisitors])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVisitors();
    setRefreshing(false);
  };

  if (loading) {
    return <Loading message="Loading visitor logs..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visitor Logs</Text>
        <Text style={styles.subtitle}>{visitors.length} record(s)</Text>
      </View>

      {visitors.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No Visitor Logs"
          message="Visitor records will appear here"
        />
      ) : (
        <FlatList
          data={visitors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VisitorCard visitor={item} showResident />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
  },
});

export default VisitorLogsScreen;
