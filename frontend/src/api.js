const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://10.129.215.144:8080/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    throw new Error("Server error");
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || "Request failed");
  }

  return json.data;
}

export const api = {
  createSession: (body) =>
    request("/session/create", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getActiveSession: () =>
    request("/session/active"),

  generateToken: (sid) =>
    request("/token/generate", {
      method: "POST",
      body: JSON.stringify({ sessionId: sid }),
    }),

  validateToken: (tok) =>
    request("/token/validate", {
      method: "POST",
      body: JSON.stringify({ token: tok }),
    }),

  markAttendance: (body) =>
    request("/attendance/mark", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getAttendance: (sid) =>
    request(`/attendance/list?sessionId=${sid}`),
};