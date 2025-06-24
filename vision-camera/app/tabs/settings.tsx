import React from 'react';
import { View, Text, Button, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../contexts/AppContext';
import { useAppTheme } from '../../contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAppContext();
  const { theme, toggleTheme } = useAppTheme();

  const isDark = theme === 'dark';
  const bg = '#061833';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

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

        {/*  ── Fila Dark Mode ─────────────────────────────── */}
        <View style={styles.row}>
          <Text style={styles.labelLight}>Dark Mode</Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#061833',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: { width: '100%' },

  /* encabezado */
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },

  /* tarjeta blanca con datos de usuario */
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

  /* fila con switch */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  labelLight: {
    fontSize: 16,
    color: '#fff',          // 🔸 texto blanco visible sobre fondo oscuro
    fontWeight: '600',
  },

  logoutBtn: {
    alignSelf: 'center',
    width: '50%',
  },
});








