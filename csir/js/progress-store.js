const STORAGE_PREFIX = 'SCL_CSIR_PROGRESS_';

const defaultProgress = (trackId) => ({
  completedSteps: {},
  completedModules: [],
  lastLocation: { trackId, m: 1, s: 1 },
  scores: {},
  certificateEligible: false,
});

function loadProgress(trackId) {
  const raw = localStorage.getItem(`${STORAGE_PREFIX}${trackId}`);
  if (!raw) return defaultProgress(trackId);
  try {
    const parsed = JSON.parse(raw);
    return {
      ...defaultProgress(trackId),
      ...parsed,
    };
  } catch (e) {
    console.warn('Progress parse error, resetting', e);
    return defaultProgress(trackId);
  }
}

function persist(trackId, data) {
  localStorage.setItem(`${STORAGE_PREFIX}${trackId}`, JSON.stringify(data));
}

export const ProgressStore = {
  getProgress(trackId) {
    return loadProgress(trackId);
  },
  setStepComplete(trackId, m, s) {
    const prog = loadProgress(trackId);
    const steps = prog.completedSteps[m] || [];
    if (!steps.includes(s)) steps.push(s);
    prog.completedSteps[m] = steps;
    prog.lastLocation = { trackId, m, s };
    persist(trackId, prog);
    return prog;
  },
  setModuleComplete(trackId, m) {
    const prog = loadProgress(trackId);
    if (!prog.completedModules.includes(m)) prog.completedModules.push(m);
    persist(trackId, prog);
    return prog;
  },
  setLastLocation(trackId, m, s) {
    const prog = loadProgress(trackId);
    prog.lastLocation = { trackId, m, s };
    persist(trackId, prog);
    return prog;
  },
  setScore(trackId, key, value) {
    const prog = loadProgress(trackId);
    prog.scores = prog.scores || {};
    prog.scores[key] = value;
    persist(trackId, prog);
    return prog;
  },
  setCertificateEligible(trackId, eligible) {
    const prog = loadProgress(trackId);
    prog.certificateEligible = eligible;
    persist(trackId, prog);
    return prog;
  },
};

export default ProgressStore;
