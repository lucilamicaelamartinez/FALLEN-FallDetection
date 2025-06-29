import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppContext } from '../contexts/AppContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { user, notificationRedirect } = useAppContext(); // 👈 agregado
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    // Small delay to allow AsyncStorage to load
    const timeout = setTimeout(() => setBooted(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!booted) return;

    // 👇 Prevent automatic navigation if app was opened via push notification
    if (notificationRedirect) return;

    if (!user) {
      router.replace('/login');
    } else if (user.role === 'EMERGENCY_CONTACT') {
      router.replace('/contactHome');
    } else if (user.role === 'ELDERLY_PERSON') {
      router.replace('/tabs/home');
    }
  }, [booted, user, notificationRedirect]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#061833' }}>
      <ActivityIndicator color="white" size="large" />
    </View>
  );
}







