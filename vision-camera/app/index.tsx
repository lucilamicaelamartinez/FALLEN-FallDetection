// /app/index.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppContext } from '../contexts/AppContext';

export default function Index() {
  const router = useRouter();
  const { user } = useAppContext();
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    // Se ejecuta luego del primer render (cuando ya está montado el router)
    setBooted(true);
  }, []);

  useEffect(() => {
    if (!booted) return;

    if (!user) {
      router.replace('/login');
    } else if (user.role === 'EMERGENCY_CONTACT') {
      router.replace('/contactHome');
    } else {
      router.replace('/tabs/home');
    }
  }, [booted, user]);

  return null;
}




