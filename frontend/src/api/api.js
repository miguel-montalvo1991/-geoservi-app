// Cliente HTTP mínimo: centraliza la URL base y el manejo de errores del backend
const BASE_URL = "http://localhost:4000";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Gracias al errorHandler que ya corregimos, data.message siempre viene limpio
    throw new Error(data?.message || "Error de red");
  }

  return data;
}