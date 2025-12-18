import { getName, getRole, getMode, setMode, getProgress, setProgress } from './storage.js';

function isEmbeddedMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'embedded';
}

function resolveModuleByHash(hash) {
  const curriculum = window.CSIR_CURRICULUM || [];
  return curriculum.find((m) => m.runtimeHash === hash) || curriculum[0];
}

function allowedHash(progress, requestedHash) {
  const curriculum = window.CSIR_CURRICULUM || [];
  const completed = progress.completed || [];
  const unlockedCount = completed.length + 1;
  const unlockable = curriculum.slice(0, unlockedCount);
  const requestedModule = resolveModuleByHash(requestedHash);
  if (!requestedModule) return null;
  const isUnlocked = unlockable.some((m) => m.id === requestedModule.id);
  return isUnlocked ? requestedModule.runtimeHash : (progress.lastRuntimeHash || curriculum[0]?.runtimeHash || '#m1');
}

function syncBackLink(hash) {
  const back = document.getElementById('backToCurriculum');
  if (!back) return;
  const module = resolveModuleByHash(hash);
  if (!module) return;
  back.href = `index.html${module.overviewAnchor}`;
}

function gateAccess() {
  const name = getName();
  const role = getRole();
  if (!name || !role) {
    window.location.href = 'role.html';
    return false;
  }
  return true;
}

function enforceMode() {
  if (isEmbeddedMode()) {
    setMode('embedded');
    return;
  }
  if (getMode() !== 'guided') setMode('guided');
}

function persistRuntimeHash(hash) {
  const progress = getProgress();
  progress.lastRuntimeHash = hash;
  setProgress(progress);
}

function handleLocked(hash) {
  const modal = document.getElementById('lockedModal');
  if (modal && typeof modal.showModal === 'function') {
    modal.querySelector('p.small').textContent = 'That module is locked. Finish the previous module to continue.';
    modal.showModal();
  }
  window.location.hash = hash;
}

function initCertificateGate(progress) {
  const certLink = document.getElementById('certificateLink');
  if (!certLink) return;
  const examPassed = progress.exam?.passed || progress.finalExamScore?.passed;
  if (examPassed && getMode() === 'guided') {
    certLink.style.display = 'inline-flex';
  } else {
    certLink.style.display = 'none';
  }
}

function initHashGuard() {
  let progress = getProgress();
  const curriculum = window.CSIR_CURRICULUM || [];
  const defaultHash = progress.lastRuntimeHash || curriculum[0]?.runtimeHash || '#m1';
  if (!window.location.hash) {
    window.location.hash = defaultHash;
  }
  let targetHash = window.location.hash || defaultHash;
  const permitted = allowedHash(progress, targetHash);
  if (permitted !== targetHash) {
    handleLocked(permitted);
    targetHash = permitted;
  }
  syncBackLink(targetHash);
  persistRuntimeHash(targetHash);

  window.addEventListener('hashchange', () => {
    progress = getProgress();
    const requested = window.location.hash || defaultHash;
    const allowed = allowedHash(progress, requested);
    if (allowed !== requested) {
      handleLocked(allowed);
      return;
    }
    syncBackLink(allowed);
    persistRuntimeHash(allowed);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  if (!gateAccess()) return;
  enforceMode();
  if (isEmbeddedMode()) return;
  const progress = getProgress();
  initCertificateGate(progress);
  initHashGuard();
});
