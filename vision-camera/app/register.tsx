// app/register.tsx
import React, { useState, useEffect } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useAppContext, IUser } from '../contexts/AppContext';
import { api } from '../api/api';

export default function RegisterScreen() {
  const router           = useRouter();
  const { register }     = useAppContext();

  const [name,        setName]     = useState('');
  const [email,       setEmail]    = useState('');
  const [password,    setPassword] = useState('');
  const [phoneNumber, setPhone]    = useState('');
  const [selectedRole, setRole]    = useState<'elder' | 'contact'>('elder');
  const [elderlyPersonId, setElderlyPersonId] = useState<number | undefined>();
  const [elderlyUsers, setElderlyUsers] = useState<IUser[]>([]);
  const [loading,     setLoading]  = useState(false);

  useEffect(() => {
    const fetchElders = async () => {
      try {
        const data: IUser[] = await api('/elders', 'GET');
        setElderlyUsers(data);
      } catch (e) {
        console.error(e);
      }
    };
    if (selectedRole === 'contact') fetchElders();
  }, [selectedRole]);

  const handleRegister = async () => {
    if (!name || !email || !password || !phoneNumber) {
      Alert.alert('Missing fields', 'Please fill in all fields');
      return;
    }

    if (selectedRole === 'contact' && !elderlyPersonId) {
      Alert.alert('Select elder', 'Please select the senior person this contact is linked to.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name,
        email,
        password,
        phoneNumber,
        role: selectedRole === 'elder' ? 'ELDERLY_PERSON' : 'EMERGENCY_CONTACT',
        elderlyPersonId,
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
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Select associated elder:</Text>
          <Picker
            selectedValue={elderlyPersonId}
            onValueChange={(itemValue) => setElderlyPersonId(itemValue)}
            style={Platform.OS === 'android' ? styles.picker : undefined}
          >
            <Picker.Item label="-- Select --" value={undefined} />
            {elderlyUsers.map(user => (
              <Picker.Item key={user.id} label={user.name} value={user.id} />
            ))}
          </Picker>
        </View>
      )}

      <Button
        title={loading ? 'Loading…' : 'Register'}
        onPress={handleRegister}
        disabled={loading}
      />
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
  pickerWrapper: { marginBottom: 10 },
  pickerLabel:   { marginBottom: 4, color: '#333' },
  picker: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
});


