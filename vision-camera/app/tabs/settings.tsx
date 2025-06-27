import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Switch,
  ToastAndroid,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../contexts/AppContext';
import { useAppTheme } from '../../contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, waitingMs, updateWaitingMs } = useAppContext();
  const { theme, toggleTheme } = useAppTheme();

  const isDark = theme === 'dark';
  const bg = '#061833';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* ── User info ───────────────────────── */}
        {user ? (
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>

            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{user.role}</Text>
          </View>
        ) : (
          <Text style={styles.value}>No user logged in.</Text>
        )}

        {/* ── Dark Mode ─────────────────────── */}
        <View style={styles.row}>
          <Text style={styles.labelLight}>Dark Mode</Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>

        {/* ── Waiting Time Slider ───────────── */}
        <View style={styles.sliderContainer}>
          <Text style={styles.labelLight}>
            Fall alert delay: {waitingMs / 1000}s
          </Text>

          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={5}
            maximumValue={20}
            step={1}
            value={waitingMs / 1000}
            minimumTrackTintColor="#00f2ff"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#00f2ff"
            onSlidingComplete={(val) => {
              updateWaitingMs(val * 1000);
              ToastAndroid.show(
                `Alert delay set to ${val} seconds`,
                ToastAndroid.SHORT
              );
            }}
          />
        </View>

        {/* ── Logout ───────────────────────── */}
        <View style={styles.logoutBtn}>
          <Button
            title="Log out"
            color="#d00"
            onPress={() => {
              logout();
              router.replace('/login');
            }}
          />
        </View>
      </View>
    </View>
  );
}

/* ── Styles ───────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#061833',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: '#061833',
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  labelLight: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  sliderContainer: {
    backgroundColor: '#1b2a45',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  logoutBtn: {
    alignSelf: 'center',
    width: '50%',
  },
});










