import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../../contexts/AppContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AppContext);

  if (!user) return null;

  const isElderly = user.role === 'ELDERLY_PERSON';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>FALLEN</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.roleBadge}>
          <View style={styles.roleDot} />
          <Text style={styles.roleText}>
            {isElderly ? 'Elderly Person' : 'Emergency Contact'}
          </Text>
        </View>
      </View>

      {isElderly ? (
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="scan-outline" size={34} color="#4ED7E6" />
          </View>

          <Text style={styles.heroTitle}>Fall Detection</Text>

          <Text style={styles.heroText}>
            Start the camera to monitor posture and detect possible falls.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={() => router.push('/camera')}
          >
            <Ionicons name="camera-outline" size={21} color="#07172E" />
            <Text style={styles.primaryButtonText}>Open Camera</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="notifications-outline" size={34} color="#4ED7E6" />
            </View>

            <Text style={styles.heroTitle}>
              Hi, {user.name ?? user.email}
            </Text>

            <Text style={styles.heroText}>
              You will receive an alert whenever a connected person has a detected fall.
            </Text>

            <View style={styles.activeStatus}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Monitoring active</Text>
            </View>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.85}
              onPress={() => router.push('/logs')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="document-text-outline" size={24} color="#4ED7E6" />
              </View>

              <Text style={styles.actionTitle}>Fall Logs</Text>
              <Text style={styles.actionSubtitle}>
                Review detected events
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#8397B1"
                style={styles.arrow}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.85}
              onPress={() => router.push('/contacts')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="people-outline" size={24} color="#4ED7E6" />
              </View>

              <Text style={styles.actionTitle}>Contacts</Text>
              <Text style={styles.actionSubtitle}>
                View linked contacts
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#8397B1"
                style={styles.arrow}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07172E',
    paddingHorizontal: 22,
    paddingTop: 62,
  },
  header: {
    marginBottom: 28,
  },
  eyebrow: {
    color: '#4ED7E6',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.4,
    marginBottom: 8,
  },
  title: {
    fontSize: 31,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 14,
    color: '#8EA1BA',
    marginTop: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: '#102B43',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  roleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ED7E6',
    marginRight: 7,
  },
  roleText: {
    color: '#B8D7E5',
    fontSize: 12,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: '#10233E',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1D3858',
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 19,
    backgroundColor: '#153550',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroText: {
    color: '#91A4BC',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  primaryButton: {
    marginTop: 22,
    backgroundColor: '#4ED7E6',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primaryButtonText: {
    color: '#07172E',
    fontSize: 15,
    fontWeight: '800',
  },
  activeStatus: {
    marginTop: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15382F',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5AE2A8',
    marginRight: 7,
  },
  activeText: {
    color: '#7FE7BC',
    fontSize: 12,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
  },
  actionCard: {
    flex: 1,
    minHeight: 170,
    backgroundColor: '#10233E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1D3858',
    padding: 17,
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#153550',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionSubtitle: {
    color: '#8498B2',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
    paddingRight: 15,
  },
  arrow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});







