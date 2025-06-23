import React from 'react';
import { View, Text, Button, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../contexts/AppContext';
import { useAppTheme } from '../../contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAppContext();      // ← usamos logout directo
  const { theme, toggleTheme } = useAppTheme();

  const isDark = theme === 'dark';
  const fg = isDark ? '#fff' : '#000';
  const bg = isDark ? '#000' : '#fff';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: fg }]}>Settings</Text>

      {user ? (
        <>
          <Text style={[styles.info, { color: fg }]}>Email: {user.email}</Text>
          <Text style={[styles.info, { color: fg }]}>Role: {user.role}</Text>
        </>
      ) : (
        <Text style={[styles.info, { color: fg }]}>No user logged in.</Text>
      )}

      <View style={styles.row}>
        <Text style={{ color: fg }}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>

      <Button title="Log out" color="#d00" onPress={() => { logout(); router.replace('/login'); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title:     { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  info:      { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  row:       { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 30 },
});





