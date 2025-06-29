// app/tabs/home.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
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
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.role}>
        Role: {isElderly ? 'Elderly Person' : 'Emergency Contact'}
      </Text>

      {isElderly ? (
        <TouchableOpacity style={styles.button} onPress={() => router.push('/camera')}>
          <Ionicons name="camera" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.welcome}>Hi, {user.name ?? user.email}</Text>
            <Text style={styles.info}>You will receive alerts if a fall is detected.</Text>
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <Button
                title="View Fall Logs"
                onPress={() => router.push('/logs')}
                color="#007AFF"
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                title="View Contacts"
                onPress={() => router.push('/contacts')}
                color="#007AFF"
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#061833',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#061833',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  buttonWrapper: {
    marginBottom: 16,
    width: '100%',
  },
});








