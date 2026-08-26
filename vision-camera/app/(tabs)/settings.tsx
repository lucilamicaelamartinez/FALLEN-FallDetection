import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ToastAndroid,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../contexts/AppContext';
import { useAppTheme } from '../../contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, waitingMs, updateWaitingMs } = useAppContext();
  const { theme, toggleTheme } = useAppTheme();

  const isDark = theme === 'dark';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>PREFERENCES</Text>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Personalize your FALLEN experience
          </Text>
        </View>

        {user ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={20} color="#4ED7E6" />
              </View>

              <Text style={styles.cardTitle}>Account</Text>
            </View>

            <View style={styles.infoRow}>
              <View>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View>
                <Text style={styles.label}>Role</Text>
                <Text style={styles.value}>{user.role}</Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.value}>No user logged in.</Text>
        )}

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="moon-outline" size={20} color="#4ED7E6" />
              </View>

              <View>
                <Text style={styles.settingTitle}>Dark Mode</Text>

                <Text style={styles.settingDescription}>
                  Use a darker interface
                </Text>
              </View>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: '#CBD5E1',
                true: '#2A8290',
              }}
              thumbColor={
                isDark
                  ? '#4ED7E6'
                  : '#F8FAFC'
              }
            />
          </View>
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="timer-outline" size={20} color="#4ED7E6" />
            </View>

            <View>
              <Text style={styles.settingTitle}>
                Fall alert delay
              </Text>

              <Text style={styles.settingDescription}>
                Time before confirming a fall
              </Text>
            </View>
          </View>

          <View style={styles.delayValue}>
            <Text style={styles.delayNumber}>
              {waitingMs / 1000}
            </Text>

            <Text style={styles.delayUnit}>
              seconds
            </Text>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={20}
            step={1}
            value={waitingMs / 1000}
            minimumTrackTintColor="#4ED7E6"
            maximumTrackTintColor="#35465F"
            thumbTintColor="#FFFFFF"
            onSlidingComplete={(val) => {
              updateWaitingMs(val * 1000);

              ToastAndroid.show(
                `Alert delay set to ${val} seconds`,
                ToastAndroid.SHORT
              );
            }}
          />

          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>
              5s
            </Text>

            <Text style={styles.sliderLabel}>
              20s
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.85}
          onPress={() => {
            logout();
            router.replace('/login');
          }}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#FF6978"
          />

          <Text style={styles.logoutText}>
            Log out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07172E',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 120,
  },

  content: {
    width: '100%',
  },

  header: {
    marginBottom: 26,
  },

  eyebrow: {
    color: '#4ED7E6',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 6,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },

  subtitle: {
    color: '#91A3BC',
    fontSize: 15,
  },

  card: {
    backgroundColor: '#10233E',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1C3656',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#173550',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoRow: {
    paddingVertical: 4,
  },

  label: {
    fontSize: 12,
    color: '#7F93AD',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  value: {
    fontSize: 16,
    color: '#F8FAFC',
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#1E3858',
    marginVertical: 14,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  settingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  settingDescription: {
    color: '#8396AE',
    fontSize: 13,
    marginTop: 3,
  },

  sliderContainer: {
    backgroundColor: '#10233E',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1C3656',
  },

  delayValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },

  delayNumber: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  delayUnit: {
    color: '#8EA1BA',
    marginLeft: 8,
    fontSize: 14,
  },

  slider: {
    width: '100%',
    height: 42,
  },

  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sliderLabel: {
    color: '#7388A3',
    fontSize: 12,
  },

  logoutBtn: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#63303A',
    backgroundColor: '#291D2A',
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
  },

  logoutText: {
    color: '#FF6978',
    fontWeight: '700',
    fontSize: 15,
  },
});









