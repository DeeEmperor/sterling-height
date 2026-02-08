/**
 * Visitor History Screen
 * Lists all visitors for the resident
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { VisitorCard, Loading, EmptyState, Button } from '../../components';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme';
import { useAuth } from '../../context';
import { visitorService } from '../../services';
import { Visitor } from '../../types';

export const VisitorHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  const loadVisitors = useCallback(async () => {
    if (!user) return;

    try {
      const data = await visitorService.getVisitorsForResident(user.id);
      setVisitors(data);
    } catch (error) {
      console.error('Error loading visitors:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVisitors();
    setRefreshing(false);
  };

  if (loading) {
    return <Loading message="Loading visitors..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Visitors</Text>
        <Button
          title="+ Add New"
          onPress={() => navigation.navigate('CreateVisitor')}
          size="small"
        />
      </View>

      {visitors.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Visitors Yet"
          message="Add a visitor to generate an access code for them"
        />
      ) : (
        <FlatList
          data={visitors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VisitorCard visitor={item} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  listContent: {
    padding: spacing.md,
  },
});

export default VisitorHistoryScreen;
