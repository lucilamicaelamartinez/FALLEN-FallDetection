import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AppContext } from '../contexts/AppContext';

export default function ContactHomeScreen() {
  const router = useRouter();
  const { user } = useContext(AppContext);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.welcome}>
          Welcome, {user?.email ?? 'Contact user'}
        </Text>
        <Text style={styles.info}>No recent alerts.</Text>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button title="View fall logs" onPress={() => router.push('/tabs/logs')} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="View contacts" onPress={() => router.push('/tabs/contacts')} />
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
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
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



