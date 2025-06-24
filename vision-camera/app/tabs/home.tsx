// app/tabs/home.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AppContext } from '../../contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AppContext);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.role}>
        Role: {user.role === 'ELDERLY_PERSON' ? 'Elderly Person' : 'Emergency Contact'}
      </Text>

      {user.role === 'ELDERLY_PERSON' ? (
        <TouchableOpacity style={styles.button} onPress={() => router.push('/camera')}>
          <Ionicons name="camera" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.warning}>You should not be here.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#061833', justifyContent: 'center', alignItems: 'center', padding: 30 },
  title:         { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  email:         { fontSize: 16, color: '#ccc', marginBottom: 4 },
  role:          { fontSize: 16, color: '#aaa', marginBottom: 30 },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  icon:          { marginRight: 10 },
  buttonText:    { color: '#fff', fontSize: 16, fontWeight: '500' },

  warning:       { color: '#ff5555', fontSize: 16, marginTop: 20 },
});




