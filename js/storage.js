const STORAGE_KEY = 'sclCsirProgress';

export function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn('Resetting corrupt progress');
    }
  }
  return {
    courseId: 'scl-csir',
    roleId: null,
    learnerName: '',
    completedSteps: [],
    quizScores: {},
    finalExamScore: null,
    completedAt: null
  };
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

export function markStepCompleted(stepId) {
  const progress = loadProgress();
  if (!progress.completedSteps.includes(stepId)) {
    progress.completedSteps.push(stepId);
  }
  saveProgress(progress);
}

export function setQuizScore(stepId, score, total, passingScore) {
  const progress = loadProgress();
  const percent = Math.round((score / total) * 100);
  progress.quizScores[stepId] = { score, total, percent, passed: percent >= passingScore };
  saveProgress(progress);
}

export function setFinalExamScore(score, total) {
  const progress = loadProgress();
  const percent = Math.round((score / total) * 100);
  progress.finalExamScore = { score, total, percent };
  saveProgress(progress);
}

export function setCompletedAt(timestamp) {
  const progress = loadProgress();
  progress.completedAt = timestamp;
  saveProgress(progress);
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isCourseComplete(requiredStepIds, passingScore) {
  const progress = loadProgress();
  const stepsDone = requiredStepIds.every((id) => progress.completedSteps.includes(id));
  const examPassed = progress.finalExamScore &&
    Math.round((progress.finalExamScore.score / progress.finalExamScore.total) * 100) >= passingScore;
  return stepsDone && examPassed;
}
