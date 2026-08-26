import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
        Alert.alert(
          'Not found',
          'No elderly person registered with that email. Please register them first.'
        );

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
        Alert.alert(
          'Verify elder',
          'Please verify the elderly person\'s email first.'
        );
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
        role:
          selectedRole === 'elder'
            ? 'ELDERLY_PERSON'
            : 'EMERGENCY_CONTACT',
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
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#D8E3EF" />
          </TouchableOpacity>

          <Text style={styles.eyebrow}>FALLEN</Text>
          <Text style={styles.title}>Create account</Text>

          <Text style={styles.subtitle}>
            Set up your account and connect to the FALLEN monitoring system.
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#8392A5"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#8392A5"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone number</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#8392A5"
              value={phoneNumber}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#8392A5"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.roleSection}>
            <Text style={styles.sectionLabel}>Account type</Text>

            <View style={styles.roleSelector}>
              <Pressable
                style={[
                  styles.roleOption,
                  selectedRole === 'elder' && styles.roleSelected,
                ]}
                onPress={() => setRole('elder')}
              >
                <View
                  style={[
                    styles.roleIcon,
                    selectedRole === 'elder' && styles.roleIconSelected,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color={selectedRole === 'elder' ? '#07172E' : '#4ED7E6'}
                  />
                </View>

                <Text
                  style={[
                    styles.roleTitle,
                    selectedRole === 'elder' && styles.roleTitleSelected,
                  ]}
                >
                  Senior
                </Text>

                <Text
                  style={[
                    styles.roleDescription,
                    selectedRole === 'elder' && styles.roleDescriptionSelected,
                  ]}
                >
                  Monitored person
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.roleOption,
                  selectedRole === 'contact' && styles.roleSelected,
                ]}
                onPress={() => setRole('contact')}
              >
                <View
                  style={[
                    styles.roleIcon,
                    selectedRole === 'contact' && styles.roleIconSelected,
                  ]}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color={selectedRole === 'contact' ? '#07172E' : '#4ED7E6'}
                  />
                </View>

                <Text
                  style={[
                    styles.roleTitle,
                    selectedRole === 'contact' && styles.roleTitleSelected,
                  ]}
                >
                  Contact
                </Text>

                <Text
                  style={[
                    styles.roleDescription,
                    selectedRole === 'contact' && styles.roleDescriptionSelected,
                  ]}
                >
                  Receives alerts
                </Text>
              </Pressable>
            </View>
          </View>

          {selectedRole === 'contact' && (
            <View style={styles.linkSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons name="link-outline" size={19} color="#4ED7E6" />
                </View>

                <View>
                  <Text style={styles.sectionTitle}>Link elderly person</Text>
                  <Text style={styles.sectionSubtitle}>
                    Enter their registered email
                  </Text>
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Elderly person's email"
                placeholderTextColor="#8392A5"
                value={elderEmail}
                onChangeText={(text) => {
                  setElderEmail(text);
                  setEmailVerified(false);
                  setElderlyPersonName('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  verifying && styles.disabledButton,
                ]}
                onPress={verifyElderEmail}
                disabled={verifying}
                activeOpacity={0.8}
              >
                {verifying ? (
                  <ActivityIndicator color="#07172E" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={19}
                      color="#07172E"
                    />
                    <Text style={styles.verifyButtonText}>
                      Verify Elder Email
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {emailVerified && elderlyPersonName !== '' && (
                <View style={styles.confirmationBox}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#68E0AA"
                  />

                  <View style={styles.confirmationContent}>
                    <Text style={styles.confirmationLabel}>
                      Successfully linked
                    </Text>

                    <Text style={styles.confirmationText}>
                      {elderlyPersonName}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.registerButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#07172E" />
          ) : (
            <Text style={styles.registerButtonText}>
              Create account
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.replace('/login')}
          disabled={loading}
        >
          <Text style={styles.loginLinkText}>
            Already have an account?{' '}
            <Text style={styles.loginLinkAccent}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#07172E',
  },

  screen: {
    flex: 1,
    backgroundColor: '#07172E',
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 42,
  },

  header: {
    marginBottom: 26,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#10233E',
    borderWidth: 1,
    borderColor: '#1E3A5B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  eyebrow: {
    color: '#4ED7E6',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.3,
    marginBottom: 7,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '800',
  },

  subtitle: {
    color: '#8EA1BA',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    maxWidth: 330,
  },

  formCard: {
    backgroundColor: '#10233E',
    borderRadius: 24,
    padding: 19,
    borderWidth: 1,
    borderColor: '#1D3858',
  },

  field: {
    marginBottom: 17,
  },

  label: {
    color: '#D7E1ED',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 2,
  },

  input: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#FFFFFF',
    backgroundColor: '#091B32',
    borderWidth: 1,
    borderColor: '#29435F',
  },

  roleSection: {
    marginTop: 3,
  },

  sectionLabel: {
    color: '#D7E1ED',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 11,
  },

  roleSelector: {
    flexDirection: 'row',
    gap: 11,
  },

  roleOption: {
    flex: 1,
    minHeight: 126,
    padding: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#29435F',
    backgroundColor: '#0B1E35',
  },

  roleSelected: {
    backgroundColor: '#4ED7E6',
    borderColor: '#4ED7E6',
  },

  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#153550',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  roleIconSelected: {
    backgroundColor: 'rgba(7,23,46,0.10)',
  },

  roleTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  roleTitleSelected: {
    color: '#07172E',
  },

  roleDescription: {
    color: '#7F93AD',
    fontSize: 11,
    marginTop: 4,
  },

  roleDescriptionSelected: {
    color: '#244050',
  },

  linkSection: {
    marginTop: 22,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#1F3B5A',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#153550',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  sectionSubtitle: {
    color: '#8195AE',
    fontSize: 12,
    marginTop: 2,
  },

  verifyButton: {
    height: 50,
    backgroundColor: '#4ED7E6',
    borderRadius: 14,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  verifyButtonText: {
    color: '#07172E',
    fontWeight: '800',
    fontSize: 14,
  },

  confirmationBox: {
    marginTop: 14,
    padding: 13,
    backgroundColor: '#15382F',
    borderWidth: 1,
    borderColor: '#245B49',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  confirmationContent: {
    marginLeft: 10,
  },

  confirmationLabel: {
    color: '#69D9A6',
    fontSize: 11,
    fontWeight: '600',
  },

  confirmationText: {
    color: '#D9F8E9',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },

  registerButton: {
    height: 55,
    backgroundColor: '#4ED7E6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 4,
  },

  registerButtonText: {
    color: '#07172E',
    fontSize: 16,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.55,
  },

  loginLink: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  loginLinkText: {
    color: '#8294AB',
    fontSize: 13,
  },

  loginLinkAccent: {
    color: '#4ED7E6',
    fontWeight: '700',
  },
});


