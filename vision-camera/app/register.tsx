import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../contexts/AppContext';
import { api } from '../api/api';

export default function RegisterScreen() {
  const router       = useRouter();
  const { register } = useAppContext();

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [phoneNumber, setPhone]       = useState('');
  const [selectedRole, setRole]       = useState<'elder' | 'contact'>('elder');
  const [elderEmail, setElderEmail]   = useState('');
  const [elderlyPersonId, setElderlyPersonId] = useState<number | null>(null);
  const [elderlyPersonName, setElderlyPersonName] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifying, setVerifying]     = useState(false);
  const [loading, setLoading]         = useState(false);

  const verifyElderEmail = async () => {
    if (!elderEmail) {
      Alert.alert('Missing email', 'Please enter the elderly person\'s email.');
      return;
    }
    try {
      setVerifying(true);
      const elders = await api('/elders', 'GET');
      const match = elders.find((u: any) => u.email === elderEmail.trim());
      if (!match) {
        Alert.alert('Not found', 'No elderly person registered with that email. Please register them first.');
        setElderlyPersonId(null);
        setElderlyPersonName('');
        setEmailVerified(false);
      } else {
        Alert.alert('Verified', `Linked to: ${match.name}`);
        setElderlyPersonId(match.id);
        setElderlyPersonName(match.name);
        setEmailVerified(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not verify elderly person.');
    } finally {
      setVerifying(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !phoneNumber) {
      Alert.alert('Missing fields', 'Please fill in all fields');
      return;
    }

    if (selectedRole === 'contact') {
      if (!elderlyPersonId || !emailVerified) {
        Alert.alert('Verify elder', 'Please verify the elderly person\'s email first.');
        return;
      }
    }

    try {
      setLoading(true);
      await register({
        name,
        email,
        password,
        phoneNumber,
        role: selectedRole === 'elder' ? 'ELDERLY_PERSON' : 'EMERGENCY_CONTACT',
        elderlyPersonId: elderlyPersonId ?? undefined,
      });
      Alert.alert('Success', 'Account created');
      router.replace('/login');
    } catch (err) {
      Alert.alert('Register failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#999"
        value={phoneNumber}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.roleSelector}>
        <Pressable
          style={[styles.roleOption, selectedRole === 'elder' && styles.roleSelected]}
          onPress={() => setRole('elder')}
        >
          <Text>Senior</Text>
        </Pressable>
        <Pressable
          style={[styles.roleOption, selectedRole === 'contact' && styles.roleSelected]}
          onPress={() => setRole('contact')}
        >
          <Text>Contact</Text>
        </Pressable>
      </View>

      {selectedRole === 'contact' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Elderly person's email"
            placeholderTextColor="#999"
            value={elderEmail}
            onChangeText={(text) => {
              setElderEmail(text);
              setEmailVerified(false);
              setElderlyPersonName('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button
            title={verifying ? 'Verifying...' : 'Verify Elder Email'}
            onPress={verifyElderEmail}
            disabled={verifying}
          />
          {emailVerified && elderlyPersonName !== '' && (
            <Text style={styles.confirmationText}>✔ Associated with: {elderlyPersonName}</Text>
          )}
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title={loading ? 'Registering...' : 'Register'}
          onPress={handleRegister}
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
  title:        { fontSize: 24, textAlign: 'center', marginBottom: 20, color: '#222' },
  input:        {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: '#222',
    backgroundColor: '#f9f9f9',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  roleOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  roleSelected: { backgroundColor: '#eee' },
  confirmationText: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#2a8',
  },
});



