import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../contexts/AppContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAppContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      router.replace('/');
    } catch (e) {
      Alert.alert('Login failed', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ───────── IMAGEN SUPERIOR ───────── */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/home.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* ───────── FORMULARIO ───────── */}
        <View style={styles.form}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>

            <Text style={styles.subtitle}>
              Sign in to continue to FALLEN
            </Text>
          </View>

          {/* EMAIL */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#8B98AA"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#8B98AA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* LOGIN */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#061833" />
            ) : (
              <Text style={styles.loginButtonText}>
                Login
              </Text>
            )}
          </TouchableOpacity>

          {/* DIVISOR */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.dividerText}>
              OR
            </Text>

            <View style={styles.divider} />
          </View>

          {/* REGISTER */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register')}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>
              Create an account
            </Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Smart monitoring • Immediate alerts
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#061833',
  },

  container: {
    flexGrow: 1,
    backgroundColor: '#061833',
  },

  /* ───────── IMAGEN ───────── */

  imageContainer: {
    width: '100%',
    height: 270,
    backgroundColor: '#061833',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
    paddingHorizontal: 20,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  /* ───────── FORMULARIO ───────── */

  form: {
    width: '100%',
    backgroundColor: '#061833',
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 45,
  },

  header: {
    marginBottom: 25,
  },

  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#9EADBF',
  },

  /* ───────── CAMPOS ───────── */

  field: {
    marginBottom: 18,
  },

  label: {
    color: '#DDE6F1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 2,
  },

  input: {
    width: '100%',
    height: 54,
    backgroundColor: '#FFFFFF',
    color: '#061833',
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: 15,

    borderWidth: 1,
    borderColor: '#E3E8EF',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  /* ───────── LOGIN ───────── */

  loginButton: {
    height: 54,
    backgroundColor: '#4ED7E6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: '#061833',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* ───────── DIVISOR ───────── */

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  dividerText: {
    color: '#77869A',
    fontSize: 11,
    fontWeight: '600',
    marginHorizontal: 14,
  },

  /* ───────── REGISTER ───────── */

  registerButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    color: '#64758B',
    fontSize: 11,
    marginTop: 25,
    letterSpacing: 0.4,
  },
});



