const STORAGE_KEY = 'sclCsirProgress';

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
}

export function setLearnerName(name) {
  const progress = loadProgress();
  progress.learnerName = name.trim();
  saveProgress(progress);
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
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
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
