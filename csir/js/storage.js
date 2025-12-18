const PROGRESS_KEY = 'scl_csir_progress';
const NAME_KEY = 'scl_csir_name';
const ROLE_KEY = 'scl_csir_role';
const MODE_KEY = 'scl_csir_mode';
const LEGACY_PROGRESS_KEYS = ['sclCsirProgress'];

const moduleStepMap = {
  'module-1': ['mission-control', 'csir-basics'],
  'module-2': ['roles', 'comms'],
  'module-3': ['definitions', 'severity'],
  'module-4': ['workflow', 'response'],
  'module-5': ['reporting', 'evidence'],
  'module-6': ['scenarios', 'audit-etiquette'],
  'module-7': ['final-exam', 'checklist', 'completion'],
};

function defaultProgress() {
  return {
    courseId: 'scl-csir',
    courseVersion: '1.0',
    roleId: null,
    learnerName: '',
    activeStepId: null,
    viewedSteps: [],
    completedSteps: [],
    quizScores: {},
    interactionScores: {},
    acknowledgements: {},
    finalExamScore: null,
    checklistUnlocked: false,
    certificateId: null,
    completedAt: null,
    // New shared fields
    completed: [],
    lastRuntimeHash: null,
    moduleScores: {},
    exam: { score: null, passed: false },
  };
}

function getCurriculum() {
  return Array.isArray(window.CSIR_CURRICULUM) ? window.CSIR_CURRICULUM : [];
}

function migrateLegacyKeys(baseProgress) {
  let progress = baseProgress;
  // Legacy progress blobs
  LEGACY_PROGRESS_KEYS.forEach((key) => {
    const legacy = localStorage.getItem(key);
    if (legacy && !localStorage.getItem(PROGRESS_KEY)) {
      localStorage.setItem(PROGRESS_KEY, legacy);
      localStorage.removeItem(key);
    }
  });
  // Merge from old name/role storage if present
  const name = localStorage.getItem(NAME_KEY);
  const role = localStorage.getItem(ROLE_KEY);
  if (name && !progress.learnerName) progress.learnerName = name;
  if (role && !progress.roleId) progress.roleId = role;

  // Legacy exam/certificate data
  if (progress.finalExamScore && progress.finalExamScore.percent !== undefined) {
    progress.exam = { score: progress.finalExamScore.percent, passed: Boolean(progress.finalExamScore.passed) };
  }

  return progress;
}

function loadRawProgress() {
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (!saved) return defaultProgress();
  try {
    return { ...defaultProgress(), ...JSON.parse(saved) };
  } catch (e) {
    console.warn('Resetting corrupt progress');
    return defaultProgress();
  }
}

function computeModuleCompletion(progress) {
  const completedModules = new Set(progress.completed || []);
  Object.entries(moduleStepMap).forEach(([moduleId, steps]) => {
    const allDone = steps.every((step) => progress.completedSteps.includes(step));
    if (allDone) completedModules.add(moduleId);
  });
  progress.completed = Array.from(completedModules);
  return progress;
}

function updateLastRuntime(progress, stepId) {
  if (!stepId) return progress;
  const moduleEntry = Object.entries(moduleStepMap).find(([, steps]) => steps.includes(stepId));
  if (!moduleEntry) return progress;
  const [moduleId] = moduleEntry;
  const curriculum = getCurriculum();
  const module = curriculum.find((m) => m.id === moduleId);
  progress.lastRuntimeHash = module?.runtimeHash || progress.lastRuntimeHash || '#m1';
  return progress;
}

function persist(progress) {
  const merged = computeModuleCompletion(progress);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
  if (merged.learnerName) localStorage.setItem(NAME_KEY, merged.learnerName);
  if (merged.roleId) localStorage.setItem(ROLE_KEY, merged.roleId);
  return merged;
}

export function getName() {
  const stored = localStorage.getItem(NAME_KEY);
  if (stored) return stored;
  return loadProgress().learnerName || null;
}

export function getRole() {
  const stored = localStorage.getItem(ROLE_KEY);
  if (stored) return stored;
  return loadProgress().roleId || null;
}

export function setNameRole(name, role) {
  const progress = loadProgress();
  progress.learnerName = name ? name.trim() : '';
  progress.roleId = role || null;
  persist(progress);
}

export function getMode() {
  return localStorage.getItem(MODE_KEY) || 'curriculum';
}

export function setMode(mode) {
  if (!mode) return;
  localStorage.setItem(MODE_KEY, mode);
}

export function getProgress() {
  let progress = migrateLegacyKeys(loadRawProgress());
  return persist(progress);
}

export function setProgress(progress) {
  const merged = { ...defaultProgress(), ...progress };
  return persist(merged);
}

export function loadProgress() {
  return getProgress();
}

export function saveProgress(progress) {
  setProgress(progress);
}

export function setRole(roleId) {
  const progress = loadProgress();
  progress.roleId = roleId;
  persist(progress);
  localStorage.setItem(ROLE_KEY, roleId);
}

export function setLearnerName(name) {
  const progress = loadProgress();
  progress.learnerName = name.trim();
  persist(progress);
  localStorage.setItem(NAME_KEY, progress.learnerName);
}

export function setActiveStep(stepId) {
  const progress = loadProgress();
  progress.activeStepId = stepId;
  if (!progress.viewedSteps.includes(stepId)) progress.viewedSteps.push(stepId);
  updateLastRuntime(progress, stepId);
  persist(progress);
}

export function markStepCompleted(stepId) {
  const progress = loadProgress();
  if (!progress.completedSteps.includes(stepId)) progress.completedSteps.push(stepId);
  updateLastRuntime(progress, stepId);
  persist(progress);
}

export function setQuizScore(stepId, score, total, passingScore) {
  const progress = loadProgress();
  const percent = Math.round((score / total) * 100);
  progress.quizScores[stepId] = { score, total, percent, passed: percent >= passingScore };
  persist(progress);
}

export function setInteractionScore(stepId, score, total, passingScore) {
  const progress = loadProgress();
  const percent = Math.round((score / total) * 100);
  progress.interactionScores[stepId] = { score, total, percent, passed: percent >= passingScore };
  persist(progress);
}

export function setAcknowledgements(stepId, count) {
  const progress = loadProgress();
  progress.acknowledgements[stepId] = count;
  persist(progress);
}

export function setFinalExamScore(score, total, passingScore) {
  const progress = loadProgress();
  const percent = Math.round((score / total) * 100);
  progress.finalExamScore = { score, total, percent, passed: percent >= passingScore };
  progress.exam = { score: percent, passed: percent >= passingScore };
  if (progress.exam.passed && !progress.completed.includes('module-7')) {
    // Mark exam module as complete when passed
    progress.completed.push('module-7');
  }
  persist(progress);
  localStorage.setItem('scl_csir_exam', JSON.stringify(progress.finalExamScore));
}

export function unlockChecklist() {
  const progress = loadProgress();
  progress.checklistUnlocked = true;
  persist(progress);
}

export function setCompletedAt(timestamp) {
  const progress = loadProgress();
  progress.completedAt = timestamp;
  persist(progress);
}

export function setCertificateId(id) {
  const progress = loadProgress();
  progress.certificateId = id;
  persist(progress);
  localStorage.setItem('scl_csir_certificate', id);
}

export function resetProgress() {
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem('scl_csir_exam');
  localStorage.removeItem('scl_csir_certificate');
  localStorage.removeItem(MODE_KEY);
}

export function isCourseComplete(requiredStepIds, passingScore) {
  const progress = loadProgress();
  const stepsDone = requiredStepIds.every((id) => progress.completedSteps.includes(id));
  const examPassed = progress.finalExamScore && progress.finalExamScore.passed && progress.finalExamScore.percent >= passingScore;
  return stepsDone && examPassed;
}

export function clearIfDifferentCourse(courseVersion) {
  const progress = loadProgress();
  if (progress.courseVersion !== courseVersion) {
    resetProgress();
    const fresh = defaultProgress();
    fresh.courseVersion = courseVersion;
    setProgress(fresh);
    return fresh;
  }
  return progress;
}
