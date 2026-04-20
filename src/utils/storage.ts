
export const safeJsonParse = <T,>(key: string, fallback: T): T => {
  const item = localStorage.getItem(key);
  if (!item || item === 'undefined') return fallback;
  try {
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error parsing localStorage key "${key}":`, e);
    return fallback;
  }
};
