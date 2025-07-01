// app/index.tsx
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext, useNotificationRedirect } from '../contexts/AppContext';

export default function Index() {
  const router = useRouter();
  const { user } = useAppContext();
  const redirectRef = useNotificationRedirect();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      router.replace('/login');
    } else if (redirectRef.current) {
      router.replace(redirectRef.current);
      redirectRef.current = null;
    } else {
      router.replace('/home');
    }
  }, [ready, user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#061833' }}>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}

























