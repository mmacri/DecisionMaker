import { getProgress as getStoredProgress, setProgress as setStoredProgress, getName, getRole } from './storage.js';

const CURRICULUM = window.CSIR_CURRICULUM || [];

function moduleOrder() {
  return CURRICULUM.map((m) => m.moduleId);
}

function moduleSequence(moduleId) {
  return CURRICULUM.find((m) => m.moduleId === moduleId)?.steps || [];
}

function getModuleDefinition(moduleId) {
  return (window.CSIR_PLAYER?.modules || []).find((m) => m.id === moduleId);
}

function normalizeCurrent(progress) {
  const hasCurrent = Object.prototype.hasOwnProperty.call(progress || {}, 'current');
  if (hasCurrent && progress.current === null) return null;

  const convertModule = (id) => {
    if (!id) return id;
    if (id.startsWith('module-')) {
      return `m${id.split('-')[1]}`;
    }
    return id;
  };

  const moduleId = convertModule(progress?.current?.moduleId) || 'm1';
  const candidateStepId = progress?.current?.stepId;
  const stepIndex = Number(progress?.current?.stepIndex);
  const sequence = moduleSequence(moduleId);

  const normalizedStepId = (() => {
    if (candidateStepId && sequence.includes(candidateStepId)) return candidateStepId;
    if (!Number.isNaN(stepIndex) && sequence[stepIndex]) return sequence[stepIndex];
    return sequence[0] || null;
  })();

  return normalizedStepId ? { moduleId, stepId: normalizedStepId } : null;
}

function normalize(progress = {}) {
  const convertModule = (id) => {
    if (!id) return id;
    if (id.startsWith('module-')) {
      return `m${id.split('-')[1]}`;
    }
    return id;
  };
  const base = { ...progress };
  base.current = normalizeCurrent(progress);
  const completedModules = progress.completedModules || progress.completed || [];
  base.completedModules = Array.from(new Set(completedModules.map(convertModule)));
  base.completedSteps = Array.from(new Set(progress.completedSteps || []));
  base.exam = progress.exam || { score: progress.finalExamScore?.percent ?? null, passed: Boolean(progress.finalExamScore?.passed) };
  base.completed = base.completedModules;
  return base;
}

function persist(progress) {
  const merged = normalize(progress);
  return setStoredProgress(merged);
}

export function requireIdentity() {
  const name = getName();
  const role = getRole();
  if (!name || !role) {
    window.location.href = 'role.html';
    return false;
  }
  return true;
}

export function getProgress() {
  const stored = getStoredProgress();
  return normalize(stored);
}

export function setProgress(progress) {
  return persist(progress);
}

export function setCurrent(moduleId, stepId) {
  const progress = getProgress();
  progress.current = moduleId && stepId ? { moduleId, stepId } : null;
  return persist(progress);
}

export function getNext(moduleId, stepId) {
  const moduleIndex = CURRICULUM.findIndex((m) => m.moduleId === moduleId);
  if (moduleIndex < 0) return null;

  const steps = moduleSequence(moduleId);
  const stepIndex = steps.indexOf(stepId);

  if (stepIndex + 1 < steps.length) {
    return { moduleId, stepId: steps[stepIndex + 1] };
  }

  if (moduleIndex + 1 < CURRICULUM.length) {
    const nextModule = CURRICULUM[moduleIndex + 1];
    return { moduleId: nextModule.moduleId, stepId: nextModule.steps[0] };
  }

  return null;
}

export function markStepComplete(moduleId, stepId) {
  const progress = getProgress();
  if (stepId && !progress.completedSteps.includes(stepId)) {
    progress.completedSteps.push(stepId);
  }

  const steps = moduleSequence(moduleId);
  const allDone = steps.length > 0 && steps.every((id) => progress.completedSteps.includes(id));
  if (allDone) markModuleComplete(moduleId, progress);

  progress.current = getNext(moduleId, stepId);
  return persist(progress);
}

export function markModuleComplete(moduleId, existingProgress) {
  const progress = existingProgress ? normalize(existingProgress) : getProgress();
  if (!moduleId) return progress;
  if (!progress.completedModules.includes(moduleId)) {
    progress.completedModules.push(moduleId);
  }
  progress.completed = progress.completedModules;
  return persist(progress);
}

export function canAccessModule(moduleId) {
  const modules = moduleOrder();
  const idx = modules.indexOf(moduleId);
  if (idx === -1) return false;
  const progress = getProgress();
  const completed = progress.completedModules || [];
  const currentModule = progress.current?.moduleId;
  const unlockedIndex = completed.reduce((max, id) => Math.max(max, modules.indexOf(id)), -1);
  const furthest = Math.max(unlockedIndex + 1, modules.indexOf(currentModule));
  return idx <= furthest;
}

export function canStartExam() {
  const progress = getProgress();
  const needed = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'];
  const allPrereqs = needed.every((id) => progress.completedModules.includes(id));
  return allPrereqs;
}

export function moduleSteps(moduleId) {
  const module = getModuleDefinition(moduleId);
  const sequence = moduleSequence(moduleId);
  if (!module) return sequence.map((id) => ({ id }));
  const stepMap = new Map((module.steps || []).map((s) => [s.id, s]));
  if (!sequence.length) return module.steps;
  return sequence.map((id) => stepMap.get(id)).filter(Boolean);
}

export function totalModulesCompleted() {
  const progress = getProgress();
  return progress.completedModules.length;
}
