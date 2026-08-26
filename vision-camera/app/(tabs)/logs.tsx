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
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AppContext, IEvent } from '../../contexts/AppContext';
import moment from 'moment';
import ImageViewing from 'react-native-image-viewing';

export default function LogsScreen() {
  const { logs, loadLogs, clearLogs } = useContext(AppContext);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        <View style={styles.cardTop}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Fall detected</Text>
          </View>

          <Text style={styles.relativeText}>{relative}</Text>
        </View>

        <View style={styles.row}>
          {item.screenshotUri ? (
            <TouchableOpacity onPress={() => setSelectedImage(item.screenshotUri!)}>
              <Image
                source={{ uri: item.screenshotUri }}
                style={styles.thumb}
                resizeMode="cover"
                onError={() =>
                  console.log('⚠ Error cargando thumbnail', item.screenshotUri)
                }
              />
            </TouchableOpacity>
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <Ionicons name="warning-outline" size={22} color="#FF6978" />
            </View>
          )}

          <View style={styles.info}>
            <Text style={styles.logTime}>{formatted}</Text>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#7990AA" />
              <Text style={styles.logLoc}>
                {item.location || 'No location provided'}
              </Text>
            </View>
          </View>
        </View>

        {item.screenshotUri && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedImage(item.screenshotUri!)}
          >
            <Image
              source={{ uri: item.screenshotUri }}
              style={styles.screenshot}
              resizeMode="cover"
              onError={() =>
                console.log('⚠ Error cargando imagen grande', item.screenshotUri)
              }
            />

            <View style={styles.imageOverlay}>
              <Ionicons name="expand-outline" size={18} color="#FFFFFF" />
              <Text style={styles.imageOverlayText}>View image</Text>
            </View>
          </TouchableOpacity>
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
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ACTIVITY</Text>
          <Text style={styles.title}>Fall Logs</Text>
          <Text style={styles.subtitle}>
            Recent detected fall events
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleClearLogs}
          style={styles.deleteBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={19} color="#FF6978" />
        </TouchableOpacity>
      </View>

      {sortedLogs.length ? (
        <FlatList
          data={sortedLogs}
          keyExtractor={(item) => String(item.id ?? Math.random())}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4ED7E6"
              colors={['#4ED7E6']}
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="shield-checkmark-outline" size={36} color="#4ED7E6" />
          </View>
          <Text style={styles.emptyTitle}>No fall events</Text>
          <Text style={styles.empty}>
            Detected falls will appear here.
          </Text>
        </View>
      )}

      {selectedImage && (
        <ImageViewing
          images={[{ uri: selectedImage }]}
          imageIndex={0}
          visible={true}
          onRequestClose={() => setSelectedImage(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07172E',
    paddingHorizontal: 20,
    paddingTop: 58,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  eyebrow: {
    color: '#4ED7E6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    color: '#8EA1BA',
    marginTop: 5,
    fontSize: 14,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#623039',
    backgroundColor: '#291D2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logCard: {
    backgroundColor: '#10233E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1D3858',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D202D',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FF6978',
    marginRight: 7,
  },
  statusText: {
    color: '#FF8994',
    fontSize: 12,
    fontWeight: '700',
  },
  relativeText: {
    color: '#7389A4',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#233C59',
  },
  thumbFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 13,
  },
  logTime: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 4,
  },
  logLoc: {
    fontSize: 13,
    color: '#8EA1BA',
  },
  screenshot: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginTop: 16,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(6, 24, 51, 0.78)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    marginTop: 90,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#102D44',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },
  empty: {
    fontSize: 14,
    color: '#8296AF',
    textAlign: 'center',
    marginTop: 6,
  },
});

















