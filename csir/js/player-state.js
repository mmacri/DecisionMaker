import { getProgress as getStoredProgress, setProgress as setStoredProgress, getName, getRole } from './storage.js';

function moduleOrder() {
  return (window.CSIR_PLAYER?.modules || []).map((m) => m.id);
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
  base.current = progress.current || { moduleId: 'm1', stepIndex: 0 };
  base.current.moduleId = convertModule(base.current.moduleId || 'm1');
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

export function setCurrent(moduleId, stepIndex) {
  const progress = getProgress();
  progress.current = { moduleId, stepIndex };
  return persist(progress);
}

export function markStepComplete(stepId) {
  const progress = getProgress();
  if (!progress.completedSteps.includes(stepId)) {
    progress.completedSteps.push(stepId);
  }

  const modules = window.CSIR_PLAYER?.modules || [];
  const module = modules.find((m) => m.steps.some((s) => s.id === stepId));
  if (module) {
    const allDone = module.steps.every((s) => progress.completedSteps.includes(s.id));
    if (allDone) markModuleComplete(module.id, progress);
  }
  return persist(progress);
}

export function markModuleComplete(moduleId, existingProgress) {
  const progress = existingProgress ? normalize(existingProgress) : getProgress();
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
  const completed = getProgress().completedModules || [];
  const unlockedIndex = completed.reduce((max, id) => Math.max(max, modules.indexOf(id)), -1) + 1;
  const current = getProgress().current?.moduleId;
  return idx <= unlockedIndex || moduleId === current || completed.includes(moduleId);
}

export function canStartExam() {
  const progress = getProgress();
  const needed = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'];
  const allPrereqs = needed.every((id) => progress.completedModules.includes(id));
  return allPrereqs;
}

export function moduleSteps(moduleId) {
  const module = (window.CSIR_PLAYER?.modules || []).find((m) => m.id === moduleId);
  return module ? module.steps : [];
}

export function totalModulesCompleted() {
  const progress = getProgress();
  return progress.completedModules.length;
}
