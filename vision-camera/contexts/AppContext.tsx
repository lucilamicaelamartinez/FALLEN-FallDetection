// contexts/AppContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { api } from '../api/api'

/* ---------- Tipos ---------- */
export interface IUser {
  id: number;
  name: string;
  email: string;
  role: 'ELDERLY_PERSON' | 'EMERGENCY_CONTACT';
  phoneNumber?: string;
}
export interface IEvent {
  id: number;
  timestamp: string;           // ISO-8601
  location: string;
}

/* --- payloads de la API --- */
interface LoginResponse { token: string }
type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: 'ELDERLY_PERSON' | 'EMERGENCY_CONTACT';
  elderlyPersonId?: number;   // sólo si es EMERGENCY_CONTACT
  phoneNumber?: string;
};

/* ---------- Contexto ---------- */
interface Ctx {
  /* datos */
  user:    IUser | null;
  token:   string | null;
  contacts: IUser[];
  logs:     IEvent[];

  /* acciones */
  login:        (email: string, pwd: string) => Promise<void>;
  register:     (data: RegisterPayload)      => Promise<void>;
  loadContacts: () => Promise<void>;
  loadLogs:     () => Promise<void>;
  reportFall:   () => Promise<void>;
  logout:       () => void;
}

export const AppContext = createContext<Ctx>({} as Ctx);
export const useAppContext = () => useContext(AppContext);

/* ---------- Provider ---------- */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,    setUser   ] = useState<IUser | null>(null);
  const [token,   setToken  ] = useState<string | null>(null);
  const [contacts,setContacts] = useState<IUser[]>([]);
  const [logs,    setLogs   ] = useState<IEvent[]>([]);

  /* ---- helper internas ---- */
  const loadContacts = async (t: string | null = token) => {
    if (!t) return;
    const data: IUser[] = await api('/emergency-contacts', 'GET', t);
    setContacts(data);
  };

  const loadLogs = async (t: string | null = token) => {
    if (!t) return;
    const data: IEvent[] = await api('/events', 'GET', t);
    setLogs(data);
  };

  /* ---- acciones públicas ---- */
  const login = async (email: string, password: string) => {
    // 1. pedir token
    const { token: newToken } = await api<LoginResponse>(
      '/login',
      'POST',
      null,
      { email, password }
    );
    setToken(newToken);

    // 2. pedir datos de usuario
    const me: IUser = await api('/me', 'GET', newToken);
    setUser(me);

    // 3. precargar datos dependientes
    if (me.role === 'ELDERLY_PERSON') await loadContacts(newToken);
    await loadLogs(newToken);
  };

  const register = async (data: RegisterPayload) => {
    await api('/register', 'POST', null, data);
  };

  const reportFall = async () => {
    if (!token) return;
    await api('/events', 'POST', token, {
      timestamp: new Date().toISOString(),
      location:  'home',
    });
    await loadLogs();          // refresca estado
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setContacts([]);
    setLogs([]);
  };

  /* ---------- export ---------- */
  return (
    <AppContext.Provider
      value={{
        user, token,
        contacts, logs,
        login, register,
        loadContacts, loadLogs,
        reportFall,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};



