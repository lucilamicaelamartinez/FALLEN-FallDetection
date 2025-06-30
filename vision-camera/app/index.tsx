// app/index.tsx
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../contexts/AppContext';

export default function Index() {
  const router = useRouter();
  const { user } = useAppContext();
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setBooted(true), 300); // delay para cargar contexto
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!booted) return;

    if (!user) {
      router.replace('/login');
    } else {
      router.replace('/(tabs)/home'); // navegación normal
    }
  }, [booted, user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#061833' }}>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}



















