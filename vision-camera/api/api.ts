export const API_BASE = 'http://192.168.100.12:8085/api';

export async function api(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  token?: string,
  body?: unknown
) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'API error');
  return json;
}
