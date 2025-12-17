const STORAGE_KEY = 'scl_csir_progress';
const NAME_KEY = 'scl_csir_name';
const ROLE_KEY = 'scl_csir_role';
const EXAM_KEY = 'scl_csir_exam';
const CERTIFICATE_KEY = 'scl_csir_certificate';

function migrateLegacyKeys() {
  const legacy = localStorage.getItem('sclCsirProgress');
  if (legacy && !localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, legacy);
    localStorage.removeItem('sclCsirProgress');
  }
}

const defaultProgress = () => ({
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
});

export function loadProgress() {
  migrateLegacyKeys();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...defaultProgress(), ...parsed };
    } catch (e) {
      console.warn('Resetting corrupt progress');
    }
  }
  return defaultProgress();
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function setRole(roleId) {
  const progress = loadProgress();
  progress.roleId = roleId;
  saveProgress(progress);
  localStorage.setItem(ROLE_KEY, roleId);
}

export function setLearnerName(name) {
  const progress = loadProgress();
  progress.learnerName = name.trim();
  saveProgress(progress);
  localStorage.setItem(NAME_KEY, progress.learnerName);
}

export function setActiveStep(stepId) {
  const progress = loadProgress();
  progress.activeStepId = stepId;
  if (!progress.viewedSteps.includes(stepId)) progress.viewedSteps.push(stepId);
  saveProgress(progress);
}

export function markStepCompleted(stepId) {
  const progress = loadProgress();
  if (!progress.completedSteps.includes(stepId)) progress.completedSteps.push(stepId);
  saveProgress(progress);
}

export function setQuizScore(stepId, score, total, passingScore) {
  const progress = loadProgress();
  const percent = Math.round((score / total) * 100);
  progress.quizScores[stepId] = { score, total, percent, passed: percent >= passingScore };
  saveProgress(progress);
}

export function setInteractionScore(stepId, score, total, passingScore) {
  const progress = loadProgress();
  const percent = Math.round((score / total) * 100);
  progress.interactionScores[stepId] = { score, total, percent, passed: percent >= passingScore };
  saveProgress(progress);
}

export function setAcknowledgements(stepId, count) {
  const progress = loadProgress();
  progress.acknowledgements[stepId] = count;
  saveProgress(progress);
}

export function setFinalExamScore(score, total, passingScore) {
  const progress = loadProgress();
  const percent = Math.round((score / total) * 100);
  progress.finalExamScore = { score, total, percent, passed: percent >= passingScore };
  saveProgress(progress);
  localStorage.setItem(EXAM_KEY, JSON.stringify(progress.finalExamScore));
}

export function unlockChecklist() {
  const progress = loadProgress();
  progress.checklistUnlocked = true;
  saveProgress(progress);
}

export function setCompletedAt(timestamp) {
  const progress = loadProgress();
  progress.completedAt = timestamp;
  saveProgress(progress);
}

export function setCertificateId(id) {
  const progress = loadProgress();
  progress.certificateId = id;
  saveProgress(progress);
  localStorage.setItem(CERTIFICATE_KEY, id);
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EXAM_KEY);
  localStorage.removeItem(CERTIFICATE_KEY);
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
    saveProgress(fresh);
    return fresh;
  }
  return progress;
}
