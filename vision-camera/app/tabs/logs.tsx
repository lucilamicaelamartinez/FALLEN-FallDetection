import React, { useContext, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { AppContext } from '../../contexts/AppContext';

export default function LogsScreen() {
  const { logs, loadLogs } = useContext(AppContext);

  useEffect(() => {
    loadLogs();
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const raw = item.timestamp;
    const localTime = raw ? new Date(raw).toLocaleString() : 'Unknown time';

    return (
      <View style={styles.logCard}>
        <Text style={styles.logText}>
          🕒 {localTime}{"\n"}
          📍 {item.location ?? 'Unknown location'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fall Logs</Text>

      {logs.length > 0 ? (
        <FlatList
          data={logs}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      ) : (
        <Text style={styles.empty}>No logs yet.</Text>
      )}
    </View>
  );
}

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
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  logText: {
    fontSize: 16,
    color: '#333',
  },
  empty: {
    fontStyle: 'italic',
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 16,
  },
});


