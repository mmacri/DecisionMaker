const Role = (() => {
  const key = 'csir_profile';
  const defaultProfile = () => ({ name: '', role: 'ot-operator', startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

  const state = () => Storage.get(key, defaultProfile());

  const setRole = (roleId) => {
    const profile = state();
    profile.role = roleId;
    profile.updatedAt = new Date().toISOString();
    Storage.set(key, profile);
  };

  const setName = (name) => {
    const profile = state();
    profile.name = name;
    profile.updatedAt = new Date().toISOString();
    Storage.set(key, profile);
  };

  const reset = () => Storage.set(key, defaultProfile());

  return { state, setRole, setName, reset };
})();
