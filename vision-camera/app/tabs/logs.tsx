//----------------------------------------------
// app/tabs/logs.tsx
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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppContext, IEvent } from '../../contexts/AppContext';

export default function LogsScreen() {
  const { logs, loadLogs } = useContext(AppContext);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      await loadLogs();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  useFocusEffect(useCallback(() => { fetchLogs(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const renderItem: ListRenderItem<IEvent> = ({ item }) => {
    const localTime = new Date(item.timestamp).toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false,
    });
    const location = item.location ?? 'Ubicación desconocida';

    return (
      <View style={styles.logCard}>
        <View style={styles.row}>
          {item.screenshotUri ? (
            <Image source={{ uri: item.screenshotUri }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <Text style={styles.thumbText}>⚠</Text>
            </View>
          )}

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.logTime}>{localTime}</Text>
            <Text style={styles.logLoc}>{location}</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fall Logs</Text>

      {logs.length ? (
        <FlatList
          data={logs}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <Text style={styles.empty}>No hay registros aún.</Text>
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
    marginBottom: 20,
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
  row: { flexDirection: 'row', alignItems: 'center' },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  thumbFallback: { justifyContent: 'center', alignItems: 'center' },
  thumbText: { fontSize: 18 },
  logTime: { fontSize: 16, fontWeight: '600', color: '#333' },
  logLoc: { fontSize: 14, color: '#666' },
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



