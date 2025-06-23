// /app/login.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../contexts/AppContext';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAppContext();        // <-- usamos la función del contexto

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);  // <-- llamada al backend
      router.replace('/');                 // el index redirige según rol
    } catch (e) {
      Alert.alert('Login failed', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Imagen splash arriba */}
      <Image
        source={require('../assets/images/home.png')}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Formulario */}
      <View style={styles.form}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button title={loading ? 'Loading...' : 'Login'} onPress={handleLogin} disabled={loading} />
        <View style={{ height: 10 }} />
        <Button
          title="Register"
          color="gray"
          onPress={() => router.push('/register')}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flexGrow: 1, backgroundColor: '#061833', alignItems: 'center' },
  image:         { width, height: width },                  // cuadrada
  form:          { width: '85%', padding: 20, backgroundColor: '#061833' },
  title:         { fontSize: 24, color: '#fff', textAlign: 'center', marginBottom: 16 },
  input:         { backgroundColor: '#fff', padding: 10, borderRadius: 6, marginBottom: 12 },
});


