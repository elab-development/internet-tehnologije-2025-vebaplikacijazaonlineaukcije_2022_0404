const BASE_URL = import.meta.env.VITE_API_URL;

function buildUrl(path, query) {
  const url = new URL(BASE_URL + path);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
}

export async function apiRequest(
  path,
  { method = 'GET', body, token, query, headers } = {},
) {
  const url = buildUrl(path, query);
  try {
    const res = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      const message =
        (data && (data.message || data.error)) ||
        (typeof data === 'string' ? data : 'Request failed');
      const error = new Error(message);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.log(error);
  }
}
