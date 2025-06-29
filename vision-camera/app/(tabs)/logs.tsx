//----------------------------------------------
// app/(tabs)/logs.tsx
//----------------------------------------------
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  RefreshControl,
  ListRenderItem,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppContext, IEvent } from '../../contexts/AppContext';
import moment from 'moment';

export default function LogsScreen() {
  const { logs, loadLogs, registerPushToken, clearLogs } = useContext(AppContext);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      await loadLogs();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete all logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => clearLogs(),
        },
      ]
    );
  };

  const renderItem: ListRenderItem<IEvent> = ({ item }) => {
    const timestamp = moment.utc(item.timestamp).local();
    const formatted = timestamp.format('YYYY-MM-DD HH:mm:ss');
    const relative = timestamp.fromNow();

    return (
      <View style={styles.logCard}>
        <View style={styles.row}>
          {item.screenshotUri ? (
            <Image
              source={{ uri: item.screenshotUri }}
              style={styles.thumb}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <Text style={styles.thumbText}>⚠</Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.logTime}>{formatted}</Text>
            <Text style={styles.logRel}>{relative}</Text>
            <Text style={styles.logLoc}>
              {item.location || 'No location provided'}
            </Text>
          </View>
        </View>

        {item.screenshotUri && (
          <Image
            source={{ uri: item.screenshotUri }}
            style={styles.screenshot}
            resizeMode="cover"
          />
        )}
      </View>
    );
  };

  const sortedLogs = [...logs].sort((a, b) => {
    const tA = moment.utc(a.timestamp).local().valueOf();
    const tB = moment.utc(b.timestamp).local().valueOf();
    return tB - tA;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fall Logs</Text>

      <TouchableOpacity onPress={registerPushToken} style={styles.manualBtn}>
        <Text style={styles.manualText}>Register Push Token</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleClearLogs} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>🗑 Delete All Logs</Text>
      </TouchableOpacity>

      {sortedLogs.length ? (
        <FlatList
          data={sortedLogs}
          keyExtractor={(item) => String(item.id ?? Math.random())}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <Text style={styles.empty}>No fall events yet.</Text>
      )}
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#061833',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  manualBtn: {
    alignSelf: 'center',
    marginBottom: 14,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2a4d90',
  },
  manualText: {
    color: 'white',
    fontWeight: '600',
  },
  deleteBtn: {
    alignSelf: 'center',
    marginBottom: 14,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#902a2a',
  },
  deleteText: {
    color: 'white',
    fontWeight: '600',
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  thumbFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  thumbText: {
    fontSize: 18,
  },
  logTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logRel: {
    fontSize: 13,
    color: '#888',
  },
  logLoc: {
    fontSize: 14,
    color: '#666',
  },
  screenshot: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginTop: 12,
  },
  empty: {
    fontStyle: 'italic',
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 40,
  },
});












