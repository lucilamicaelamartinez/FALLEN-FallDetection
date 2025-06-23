// app/tabs/logs.tsx
import React, { useContext, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { AppContext } from '../../contexts/AppContext';

export default function LogsScreen() {
  const { logs, loadLogs } = useContext(AppContext);

  useEffect(() => {
    loadLogs(); // Llama al backend y actualiza los logs
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.logItem}>
      <Text style={styles.logText}>
        🕒 {item.timestamp?.slice(0, 19).replace('T', ' ') ?? 'Unknown'}{"\n"}
        📍 {item.location ?? 'Unknown location'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fall Logs</Text>

      {logs.length > 0 ? (
        <FlatList
          data={logs}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.empty}>No logs yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  logItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  logText: { fontSize: 16 },
  empty: { marginTop: 8, fontStyle: 'italic', textAlign: 'center' },
});

