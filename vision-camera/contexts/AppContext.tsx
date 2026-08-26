// contexts/AppContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { api } from '../api/api';
import { router } from 'expo-router';

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: 'ELDERLY_PERSON' | 'EMERGENCY_CONTACT';
  phoneNumber?: string;
  expoPushToken?: string;
  elderlyPersons?: {
    id: number;
    name: string;
    phoneNumber?: string;
    email: string;
  }[];
}

export interface IEvent {
  id?: number;
  timestamp: string;
  location: string;
  screenshotUri?: string;
}

interface LoginResp {
  token: string;
}

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
  notificationRedirect: string | null;
  setNotificationRedirect: (value: string | null) => void;
  login(email: string, password: string): Promise<void>;
  register(data: RegisterPayload): Promise<void>;
  logout(): void;
  loadContacts(): Promise<void>;
  loadLogs(): Promise<void>;
  reportFall(): Promise<number | null>;
  addScreenshot(uri: string, eventId?: number): Promise<void>;
  registerPushToken(): Promise<void>;
  updateWaitingMs(ms: number): Promise<void>;
  clearLogs(): Promise<void>;
}

export const AppContext = createContext<Ctx>({} as Ctx);
export const useAppContext = () => useContext(AppContext);

const PROJECT_ID = '5724bbe6-e00b-4e9e-9cb3-22ed66f1399b';
const TOKEN_KEY = '@fallen_token';
const USER_KEY = '@fallen_user';
const WAIT_KEY = '@fallen_wait_ms';
const DEFAULT_WAIT_MS = 10000;

const notificationRedirect = useRef<string | null>(null);
export const useNotificationRedirect = () => notificationRedirect;

async function getExpoPushToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) return null;

    let { status } = await Notifications.getPermissionsAsync();

    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }

    if (status !== 'granted') return null;

    const { data } = await Notifications.getExpoPushTokenAsync({
      projectId: PROJECT_ID,
    });

    console.log('✅ Token obtenido:', data);

    return data;
  } catch (err) {
    console.log('❌ Error al obtener token:', err);
    return null;
  }
}

async function sendExpoPush(
  to: string,
  title: string,
  body: string,
) {
  console.log('📤 Enviando notificación a', to);

  await fetch(
    'https://exp.host/--/api/v2/push/send',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        title,
        body,
        sound: 'default',
        channelId: 'falls',
        data: {
          screen: '/logs',
        },
      }),
    },
  );
}

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({
  children,
}: AppProviderProps) => {
  const [user, setUser] =
    useState<IUser | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [contacts, setContacts] =
    useState<IUser[]>([]);

  const [logs, setLogs] =
    useState<IEvent[]>([]);

  const [screenshots, setShots] =
    useState<string[]>([]);

  const [waitingMs, setWaitingMs] =
    useState(DEFAULT_WAIT_MS);

  const notificationResponseListener =
    useRef<Notifications.Subscription>();

  useEffect(() => {
    Notifications.setNotificationChannelAsync(
      'falls',
      {
        name: 'Falls',
        importance:
          Notifications.AndroidImportance.HIGH,
        vibrationPattern: [
          0,
          250,
          250,
          250,
        ],
        sound: 'default',
      },
    );
  }, []);

  useEffect(() => {
    AsyncStorage.multiGet([
      TOKEN_KEY,
      USER_KEY,
      WAIT_KEY,
    ]).then(([tk, usr, wt]) => {
      if (wt[1]) {
        setWaitingMs(
          Number(wt[1]),
        );
      }

      if (tk[1] && usr[1]) {
        setToken(tk[1]);

        const parsed =
          JSON.parse(usr[1]);

        setUser(parsed);

        loadLogs(
          tk[1],
          parsed,
        );

        if (
          parsed.role ===
          'ELDERLY_PERSON'
        ) {
          loadContacts(tk[1]);
        }

        registerPushToken(
          tk[1],
          parsed,
        );
      } else {
        console.log(
          '❌ Token inválido o falta info del usuario',
        );
      }
    });
  }, []);

  useEffect(() => {
    async function checkInitialNotification() {
      const response =
        await Notifications.getLastNotificationResponseAsync();

      const screen =
        response?.notification.request
          .content.data?.screen;

      if (screen) {
        notificationRedirect.current =
          screen;
      }
    }

    checkInitialNotification();

    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const screen =
            response.notification.request
              .content.data?.screen;

          if (screen) {
            notificationRedirect.current =
              screen;

            router.push(screen);
          }
        },
      );

    return () => {
      notificationResponseListener.current?.remove();
    };
  }, []);

  const loadContacts = async (
    t: string | null = token,
  ) => {
    if (!t) return;

    console.log(
      '📞 Cargando contactos…',
    );

    const data =
      await api<IUser[]>(
        '/emergency-contacts',
        'GET',
        t,
      );

    setContacts(data);
  };

  const loadLogs = async (
    t: string | null = token,
    currentUser:
      | IUser
      | null = user,
  ) => {
    if (
      !t ||
      !currentUser
    ) {
      return;
    }

    console.log(
      '📜 Cargando logs…',
    );

    const result =
      await api<IEvent[]>(
        '/events',
        'GET',
        t,
      );

    const sorted =
      result.sort(
        (a, b) =>
          new Date(
            b.timestamp,
          ).getTime() -
          new Date(
            a.timestamp,
          ).getTime(),
      );

    setLogs(sorted);
  };

  const registerPushToken = async (
    tk: string | null = token,
    usr: IUser | null = user,
  ) => {
    const pushTok =
      await getExpoPushToken();

    if (
      !pushTok ||
      !tk ||
      !usr?.id
    ) {
      return;
    }

    await api(
      '/users/expo-token',
      'POST',
      tk,
      {
        expoToken:
          pushTok,
      },
    );

    const updated = {
      ...usr,
      expoPushToken:
        pushTok,
    };

    setUser(updated);

    AsyncStorage.setItem(
      USER_KEY,
      JSON.stringify(
        updated,
      ),
    );

    console.log(
      '✅ Token registrado y guardado',
    );
  };

  const login = async (
    email: string,
    password: string,
  ) => {
    const {
      token: tk,
    } =
      await api<LoginResp>(
        '/login',
        'POST',
        undefined,
        {
          email,
          password,
        },
      );

    const me =
      await api<IUser>(
        '/me',
        'GET',
        tk,
      );

    setToken(tk);
    setUser(me);

    AsyncStorage.setItem(
      TOKEN_KEY,
      tk,
    );

    AsyncStorage.setItem(
      USER_KEY,
      JSON.stringify(me),
    );

    if (
      me.role ===
      'ELDERLY_PERSON'
    ) {
      await loadContacts(tk);
    }

    await loadLogs(
      tk,
      me,
    );

    await registerPushToken(
      tk,
      me,
    );
  };

  const register = (
    data:
      RegisterPayload,
  ) =>
    api(
      '/register',
      'POST',
      undefined,
      data,
    );

  const reportFall =
    async (): Promise<
      number | null
    > => {
      if (
        !token ||
        !user
      ) {
        return null;
      }

      let fallLocation =
        'Location unavailable';

      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (
          permission.status ===
          'granted'
        ) {
          const position =
            await Location.getCurrentPositionAsync({
              accuracy:
                Location.Accuracy.High,
            });

          const {
            latitude,
            longitude,
          } =
            position.coords;

          console.log(
            '📍 Coordenadas de la caída:',
            latitude,
            longitude,
          );

          const addresses =
            await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });

          if (
            addresses.length >
            0
          ) {
            const address =
              addresses[0];

            const street =
              address.street ||
              address.name ||
              '';

            const streetNumber =
              address.streetNumber ||
              '';

            const city =
              address.city ||
              address.subregion ||
              address.region ||
              '';

            const streetPart =
              streetNumber
                ? `${street} ${streetNumber}`
                : street;

            fallLocation = [
              streetPart,
              city,
            ]
              .filter(
                Boolean,
              )
              .join(', ');

            if (
              !fallLocation
            ) {
              fallLocation =
                `${latitude.toFixed(
                  6,
                )}, ${longitude.toFixed(
                  6,
                )}`;
            }

            console.log(
              '📍 Dirección de la caída:',
              fallLocation,
            );
          } else {
            fallLocation =
              `${latitude.toFixed(
                6,
              )}, ${longitude.toFixed(
                6,
              )}`;
          }
        } else {
          console.log(
            '⚠ Permiso de ubicación denegado',
          );
        }
      } catch (
        error
      ) {
        console.log(
          '⚠ No se pudo obtener la ubicación:',
          error,
        );
      }

      const ev: IEvent = {
        timestamp:
          new Date().toISOString(),

        location:
          fallLocation,
      };

      const saved =
        await api<IEvent>(
          '/events',
          'POST',
          token,
          ev,
        );

      await loadLogs(
        token,
        user,
      );

      // 👇 Notificación sin duplicados (deduplica expoPushToken)
      const uniqueTokens = [
        ...new Set(
          contacts
            .filter(
              (c) =>
                c.expoPushToken,
            )
            .map(
              (c) =>
                c.expoPushToken!,
            ),
        ),
      ];

      uniqueTokens.forEach(
        (token) =>
          sendExpoPush(
            token,
            '⚠ Fall Detected',
            'Tap to view the record',
          ),
      );

      return (
        saved.id ?? null
      );
    };

  const addScreenshot =
    async (
      uri: string,
      eventId?: number,
    ) => {
      setShots(
        (s) => [
          uri,
          ...s,
        ],
      );

      if (
        !token ||
        !eventId
      ) {
        return;
      }

      await api(
        `/events/${eventId}/screenshot`,
        'PATCH',
        token,
        {
          screenshotUri:
            uri,
        },
      );

      await loadLogs(
        token,
        user,
      );
    };

  const updateWaitingMs =
    async (
      ms: number,
    ) => {
      await AsyncStorage.setItem(
        WAIT_KEY,
        String(ms),
      );

      setWaitingMs(ms);
    };

  const clearLogs =
    async () => {
      if (!token) return;

      await api(
        '/events/clear',
        'DELETE',
        token,
      );

      setLogs([]);
    };

  const logout = () => {
    setUser(null);
    setToken(null);
    setContacts([]);
    setLogs([]);
    setShots([]);

    AsyncStorage.multiRemove([
      TOKEN_KEY,
      USER_KEY,
    ]);
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
        notificationRedirect:
          notificationRedirect.current,
        setNotificationRedirect:
          (val) =>
            (notificationRedirect.current =
              val),
        login,
        register,
        loadContacts,
        loadLogs,
        reportFall,
        addScreenshot,
        registerPushToken,
        updateWaitingMs,
        logout,
        clearLogs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
