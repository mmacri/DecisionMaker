import { loadProgress } from './storage.js';

export function requireRoleAndName() {
  const progress = loadProgress();
  if (!progress.roleId) {
    window.location.href = 'role.html';
    return false;
  }
  if (!progress.learnerName) {
    window.location.href = 'profile.html';
    return false;
  }
  return true;
}

export function redirectIfMissingPrereqs() {
  requireRoleAndName();
}

export function enforceNameBeforeCertificate() {
  const progress = loadProgress();
  if (!progress.roleId) window.location.href = 'role.html';
  if (!progress.learnerName) window.location.href = 'profile.html';
  if (!progress.completedAt) window.location.href = 'learn.html';
}

export function getProgressForUI() {
  return loadProgress();
}
