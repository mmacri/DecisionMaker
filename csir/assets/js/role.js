const Role = (() => {
  const key = 'scl_csir_role_profile';
  const nameKey = 'scl_csir_name';
  const roleKey = 'scl_csir_role';
  const defaultProfile = () => ({ name: '', email: '', role: 'ot-operator', startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

  const state = () => Storage.get(key, defaultProfile());

  const setRole = (roleId) => {
    const profile = state();
    profile.role = roleId;
    profile.updatedAt = new Date().toISOString();
    Storage.set(key, profile);
    localStorage.setItem(roleKey, roleId);
  };

  const setName = (name) => {
    const profile = state();
    profile.name = name;
    profile.updatedAt = new Date().toISOString();
    Storage.set(key, profile);
    localStorage.setItem(nameKey, name);
  };

  const setEmail = (email) => {
    const profile = state();
    profile.email = email;
    profile.updatedAt = new Date().toISOString();
    Storage.set(key, profile);
  };

  const setProfile = ({ name, email, role }) => {
    const profile = state();
    profile.name = name ?? profile.name;
    profile.email = email ?? profile.email;
    profile.role = role ?? profile.role;
    profile.updatedAt = new Date().toISOString();
    Storage.set(key, profile);
    if (profile.name) localStorage.setItem(nameKey, profile.name);
    if (profile.role) localStorage.setItem(roleKey, profile.role);
  };

  const reset = () => Storage.set(key, defaultProfile());

  return { state, setRole, setName, setEmail, setProfile, reset };
})();
