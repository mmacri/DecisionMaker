const Storage = (() => {
  const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const get = (key, fallback = null) => {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  };
  const remove = key => localStorage.removeItem(key);
  return { set, get, remove };
})();
