import { getName, getRole, getProgress, setMode } from './storage.js';

function byId(id) {
  return document.getElementById(id);
}

function findModuleCard(anchor) {
  if (!anchor) return null;
  const id = anchor.replace('#', '');
  return document.getElementById(id);
}

function decorateModules(progress) {
  const curriculum = window.CSIR_CURRICULUM || [];
  const completedSet = new Set(progress.completed || []);
  const nextModule = curriculum.find((m) => !completedSet.has(m.id));
  curriculum.forEach((module) => {
    const card = findModuleCard(module.overviewAnchor);
    if (!card) return;
    card.querySelectorAll('.status-pill').forEach((el) => el.remove());
    const pill = document.createElement('div');
    pill.className = 'status-pill';
    if (completedSet.has(module.id)) {
      pill.textContent = 'Completed';
      pill.classList.add('success');
    } else if (nextModule && nextModule.id === module.id) {
      pill.textContent = 'In progress';
      pill.classList.add('accent');
    } else {
      pill.textContent = 'Locked until previous modules are done';
      pill.classList.add('muted');
    }
    card.querySelector('.pill')?.insertAdjacentElement('afterend', pill);

    const startBtn = card.querySelector('.start-module');
    if (startBtn) {
      const modId = module.id.replace('module-', 'm');
      startBtn.href = `player.html?module=${modId}`;
      startBtn.addEventListener('click', () => setMode('guided'));
    }
  });

  const moduleProgress = byId('moduleProgress');
  if (moduleProgress) {
    const count = completedSet.size;
    const total = curriculum.length || 0;
    moduleProgress.textContent = total ? `${count} of ${total} modules complete` : '';
  }
}

function wireTrainingCtas(progress) {
  const enterButtons = ['enterTrainingNav', 'enterTrainingHero']
    .map(byId)
    .filter(Boolean);

  const resume = byId('resumeLink');
  if (resume && progress.lastRuntimeHash) {
    const module = window.CSIR_CURRICULUM?.find((m) => m.runtimeHash === progress.lastRuntimeHash);
    const moduleParam = module ? module.id.replace('module-', 'm') : 'm1';
    resume.href = `player.html?module=${moduleParam}`;
    resume.style.display = 'inline-flex';
  }

  enterButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setMode('guided');
      const name = getName();
      const role = getRole();
      const fallbackHash = (window.CSIR_CURRICULUM?.[0]?.runtimeHash) || '#m1';
      const targetHash = progress.lastRuntimeHash || fallbackHash;
      if (!name || !role) {
        window.location.href = 'role.html';
        return;
      }
      const targetModule = window.CSIR_CURRICULUM?.find((m) => m.runtimeHash === targetHash);
      const moduleParam = targetModule ? targetModule.id.replace('module-', 'm') : 'm1';
      window.location.href = `player.html?module=${moduleParam}`;
    });
  });
}

function initStartMode() {
  setMode('curriculum');
}

window.addEventListener('DOMContentLoaded', () => {
  const progress = getProgress();
  initStartMode();
  decorateModules(progress);
  wireTrainingCtas(progress);
});
