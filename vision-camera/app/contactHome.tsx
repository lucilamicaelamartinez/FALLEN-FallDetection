import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppContext } from '../contexts/AppContext';

export default function ContactHomeScreen() {
  const router = useRouter();
  const { user } = useContext(AppContext);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Welcome, {user?.email ?? 'Contact user'}
      </Text>

      <Text style={styles.info}>No recent alerts.</Text>

      <Button title="View fall logs"     onPress={() => router.push('/tabs/logs')} />
      <Button title="View contacts"      onPress={() => router.push('/tabs/contacts')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  info: { marginBottom: 24, fontSize: 16, color: '#555' },
});


