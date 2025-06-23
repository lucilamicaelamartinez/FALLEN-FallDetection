// app/tabs/home.tsx
import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppContext } from '../../contexts/AppContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AppContext);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome {user.email}</Text>
      <Text style={styles.subtitle}>
        Role: {user.role === 'ELDERLY_PERSON' ? 'Elderly Person' : 'Contact'}
      </Text>

      {user.role === 'ELDERLY_PERSON' ? (
        <Button title="Open camera" onPress={() => router.push('/camera')} />
      ) : (
        <Text>You should not be here.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
});



