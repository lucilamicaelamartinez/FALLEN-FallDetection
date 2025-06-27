// ────────────────────────────────────────────────
// contexts/AppContext.tsx – versión final corregida
// ────────────────────────────────────────────────
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { api } from '../api/api';

/* ─────────── Tipos ──────────────────────────── */
export interface IUser {
  id: number;
  name: string;
  email: string;
  role: 'ELDERLY_PERSON' | 'EMERGENCY_CONTACT';
  phoneNumber?: string;
  expoPushToken?: string;
}

export interface IEvent {
  id?: number;
  timestamp: string;
  location: string;
  screenshotUri?: string;
}

interface LoginResp { token: string }

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: 'ELDERLY_PERSON' | 'EMERGENCY_CONTACT';
  elderlyPersonId?: number;
  phoneNumber?: string;
};

interface Ctx {
  user: IUser | null;
  token: string | null;
  contacts: IUser[];
  logs: IEvent[];
  screenshots: string[];
  waitingMs: number;

  login(email: string, password: string): Promise<void>;
  register(data: RegisterPayload): Promise<void>;
  logout(): void;

  loadContacts(): Promise<void>;
  loadLogs(): Promise<void>;

  reportFall(): Promise<number | null>;
  addScreenshot(uri: string, eventId?: number): Promise<void>;

  registerPushToken(): Promise<void>;
  updateWaitingMs(ms: number): Promise<void>;
}

export const AppContext = createContext<Ctx>({} as Ctx);
export const useAppContext = () => useContext(AppContext);

/* ─────────── Constantes ──────────────────────── */
const PROJECT_ID       = '5724bbe6-e00b-4e9e-9cb3-22ed66f1399b';
const WAIT_KEY         = '@fallen_wait_ms';
const DEFAULT_WAIT_MS  = 10_000;

/* ─────────── Helpers Push ────────────────────── */
async function getExpoPushToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) return null;

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return null;

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
    console.log('[Push] token obtenido', data);
    return data;
  } catch (err) {
    console.warn('[Push] error al obtener token', err);
    return null;
  }
}

async function sendExpoPush(to: string, title: string, body: string) {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        title,
        body,
        sound: 'default',
        channelId: 'falls',
        data: { screen: '/tabs/logs' },
      }),
    });
  } catch (err) {
    console.warn('[Push] send error', err);
  }
}

/* ─────────── Provider ────────────────────────── */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]           = useState<IUser | null>(null);
  const [token, setToken]         = useState<string | null>(null);
  const [contacts, setContacts]   = useState<IUser[]>([]);
  const [logs, setLogs]           = useState<IEvent[]>([]);
  const [screenshots, setShots]   = useState<string[]>([]);
  const [waitingMs, setWaitingMs] = useState<number>(DEFAULT_WAIT_MS);

  const notifListener = useRef<Notifications.Subscription>();
  const respListener  = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('falls', {
        name: 'Falls',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(WAIT_KEY).then((v) => {
      if (v) setWaitingMs(Number(v));
    });
  }, []);

  useEffect(() => {
    notifListener.current = Notifications.addNotificationReceivedListener((n) =>
      console.log('[Push] received', n),
    );
    respListener.current = Notifications.addNotificationResponseReceivedListener((r) => {
      console.log('[Push] tapped', r);
      router.push('/tabs/logs');
    });
    return () => {
      notifListener.current?.remove();
      respListener.current?.remove();
    };
  }, []);

  const loadContacts = async (t: string | null = token) => {
    if (!t) return;
    const data = await api<IUser[]>('/emergency-contacts', 'GET', t);
    setContacts(data);
  };

  const loadLogs = async (t: string | null = token) => {
    if (!t) return;
    const data = await api<IEvent[]>('/events', 'GET', t);
    setLogs(data.slice().reverse());
  };

  const registerPushToken = async () => {
    const pushTok = await getExpoPushToken();
    if (!pushTok || !token || !user?.id) return;

    await api('/users/expo-token', 'POST', token, {
      expoToken: pushTok,
    });
    setUser((p) => (p ? { ...p, expoPushToken: pushTok } : p));
  };

  const login = async (email: string, password: string) => {
    const { token: tk } = await api<LoginResp>('/login', 'POST', undefined, { email, password });
    setToken(tk);

    const me = await api<IUser>('/me', 'GET', tk);
    setUser(me);

    if (me.role === 'ELDERLY_PERSON') await loadContacts(tk);
    await loadLogs(tk);

    setTimeout(() => registerPushToken(), 500);
  };

  const register = (d: RegisterPayload) => api('/register', 'POST', undefined, d);

  const reportFall = async (): Promise<number | null> => {
    if (!token) return null;

    const ev: IEvent = { timestamp: new Date().toISOString(), location: 'home' };
    const saved = await api<IEvent>('/events', 'POST', token, ev);
    setLogs((prev) => [saved, ...prev]);

    contacts
      .filter((c) => c.expoPushToken)
      .forEach((c) =>
        sendExpoPush(
          c.expoPushToken as string,
          '⚠ Caída detectada',
          'Toque para ver el registro',
        ),
      );

    return saved.id ?? null;
  };

  const addScreenshot = async (uri: string, eventId?: number) => {
    setShots((s) => [uri, ...s]);
    setLogs((prev) => {
      if (!prev.length) return prev;
      const [first, ...rest] = prev;
      return [{ ...first, screenshotUri: uri }, ...rest];
    });

    if (token && eventId) {
      await api(`/events/${eventId}/screenshot`, 'PATCH', token, {
        screenshotUri: uri,
      });
    }
  };

  const updateWaitingMs = async (ms: number) => {
    await AsyncStorage.setItem(WAIT_KEY, String(ms));
    setWaitingMs(ms);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setContacts([]);
    setLogs([]);
    setShots([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        contacts,
        logs,
        screenshots,
        waitingMs,
        login,
        register,
        loadContacts,
        loadLogs,
        reportFall,
        addScreenshot,
        registerPushToken,
        updateWaitingMs,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};








