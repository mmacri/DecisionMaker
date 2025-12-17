const Role = (() => {
  const key = 'csir_profile';
  const defaultProfile = () => ({ name: '', email: '', role: 'ot-operator', startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

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
  };

  const reset = () => Storage.set(key, defaultProfile());

  return { state, setRole, setName, setEmail, setProfile, reset };
})();
