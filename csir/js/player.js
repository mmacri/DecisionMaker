import {
  requireIdentity,
  getProgress,
  setCurrent,
  markStepComplete,
  canAccessModule,
  canStartExam,
  moduleSteps,
  totalModulesCompleted,
  getNext,
} from './player-state.js';

const modules = window.CSIR_PLAYER?.modules || [];
const moduleRegistry = new Map(modules.map((m) => [m.id, m]));
const stepRegistry = new Map();
const CURRICULUM = window.CSIR_CURRICULUM || [];

modules.forEach((module) => {
  module.steps.forEach((step) => {
    stepRegistry.set(step.id, { ...step, moduleId: module.id });
  });
});

const LINEAR_SEQUENCE = CURRICULUM.flatMap((module) => module.steps.map((stepId) => ({ moduleId: module.moduleId, stepId })));
const partialCache = {};

function qs(sel) {
  return document.querySelector(sel);
}

function getModuleSequence(moduleId) {
  return CURRICULUM.find((m) => m.moduleId === moduleId)?.steps || [];
}

function getCourseModuleIndex(moduleId) {
  return CURRICULUM.findIndex((m) => m.moduleId === moduleId);
}

function getCourseSteps(moduleId) {
  const module = moduleRegistry.get(moduleId);
  const sequence = getModuleSequence(moduleId);
  if (!module) return sequence.map((id) => ({ id, title: id }));
  const map = new Map(module.steps.map((s) => [s.id, s]));
  return sequence.map((id) => map.get(id)).filter(Boolean);
}

function getCourseStep(moduleId, stepId) {
  return getCourseSteps(moduleId).find((s) => s.id === stepId);
}

function sequenceIndex(moduleId, stepId) {
  return LINEAR_SEQUENCE.findIndex((entry) => entry.moduleId === moduleId && entry.stepId === stepId);
}

function getPrevStep(moduleId, stepId) {
  const idx = sequenceIndex(moduleId, stepId);
  if (idx <= 0) return null;
  return LINEAR_SEQUENCE[idx - 1];
}

function defaultStep() {
  const firstModule = CURRICULUM[0];
  const firstStepId = firstModule?.steps?.[0] || 'm1s1';
  return { moduleId: firstModule?.moduleId || modules[0]?.id || 'm1', stepId: firstStepId };
}

function progressAnchor(progress) {
  return progress.current || defaultStep();
}

function unlockedIndex(progress) {
  const completed = progress.completedSteps || [];
  const completedIdx = completed
    .map((id) => {
      const modId = stepRegistry.get(id)?.moduleId;
      return sequenceIndex(modId, id);
    })
    .filter((i) => i >= 0);
  const maxCompleted = completedIdx.length ? Math.max(...completedIdx) : -1;
  const anchor = progressAnchor(progress);
  const anchorIdx = sequenceIndex(anchor.moduleId, anchor.stepId);
  return Math.max(anchorIdx, maxCompleted);
}

function clampToUnlocked(target, progress) {
  const fallback = progressAnchor(progress);
  const targetIdx = sequenceIndex(target.moduleId, target.stepId);
  if (targetIdx < 0) return fallback;
  return targetIdx <= unlockedIndex(progress) ? target : fallback;
}

function resolveStep(moduleId, stepId) {
  const module = moduleRegistry.get(moduleId);
  const step = getCourseStep(moduleId, stepId);
  const steps = getCourseSteps(moduleId);
  const stepIndex = steps.indexOf(step);
  return {
    courseModule: module,
    courseStep: step,
    registryModule: module,
    registryStep: step,
    stepIndex,
  };
}

function formatBreadcrumb(module, step) {
  return `${module.title} — Step ${step.index + 1} of ${getCourseSteps(module.id).length} · ${step.data.title}`;
}

async function loadOverview(moduleId) {
  const index = moduleId.replace('m', '');
  if (partialCache[moduleId]) return partialCache[moduleId];
  const res = await fetch(`partials/module-${index}-overview.html`);
  const html = await res.text();
  partialCache[moduleId] = html;
  return html;
}

function runtimeSrc(step) {
  if (step.runtimeTarget?.kind === 'page') {
    const hasQuery = step.runtimeTarget.value.includes('?');
    const joiner = hasQuery ? '&' : '?';
    return `${step.runtimeTarget.value}${joiner}embed=1`;
  }
  const hash = step.runtimeTarget?.value || '';
  return `learn.html?embed=1${hash}`;
}

function moduleState(moduleId) {
  const progress = getProgress();
  const completed = progress.completedModules.includes(moduleId);
  const current = progress.current?.moduleId === moduleId;
  const steps = moduleSteps(moduleId);
  const hasProgress = steps.some((s) => progress.completedSteps.includes(s.id));
  return { completed, current, hasProgress };
}

function renderCourseMap(currentId) {
  const list = qs('#courseMap');
  list.innerHTML = '';
  const progress = getProgress();
  CURRICULUM.forEach((courseModule, idx) => {
    const module = moduleRegistry.get(courseModule.moduleId) || { ...courseModule, title: courseModule.moduleId };
    const li = document.createElement('li');
    li.dataset.id = courseModule.moduleId;
    const { completed, current, hasProgress } = moduleState(courseModule.moduleId);
    const unlocked = canAccessModule(courseModule.moduleId);
    li.className = `map-item ${completed ? 'complete' : current ? 'active' : unlocked ? 'open' : 'locked'}`;
    const stateText = completed ? 'Complete' : current ? 'In progress' : hasProgress ? 'In progress' : 'Not started';
    const icon = completed ? '✓' : current || hasProgress ? '◐' : '○';
    li.innerHTML = `<span class="status-icon" aria-hidden="true">${icon}</span><span class="label"><span class="title">${module.title}</span><span class="state">${stateText}</span></span>`;
    li.addEventListener('click', () => {
      if (!unlocked) {
        showToast('Complete earlier modules before opening this one.');
        return;
      }
      loadModule(courseModule.moduleId);
    });
    list.appendChild(li);
    if (idx === CURRICULUM.length - 1) return;
  });
}

function showToast(message) {
  const bar = qs('#toast');
  if (!bar) return;
  bar.textContent = message;
  bar.classList.add('show');
  setTimeout(() => bar.classList.remove('show'), 2400);
}

function updateProgressUi(moduleId, stepIndex) {
  const overall = qs('#overallProgress');
  const indicator = qs('#stepIndicator');
  const bar = qs('#overallBar');
  const moduleStep = qs('#moduleStep');
  const stepBar = qs('#stepBar');
  const stepperBar = qs('#stepperBar');
  const moduleTitle = qs('#moduleTitle');
  const moduleBreadcrumb = qs('#moduleBreadcrumb');
  const stepCountPill = qs('#stepCountPill');
  const module = moduleRegistry.get(moduleId) || { id: moduleId, title: moduleId };
  const steps = getCourseSteps(moduleId);
  const completedModules = totalModulesCompleted();
  const total = CURRICULUM.length;
  const percent = total ? Math.round((completedModules / total) * 100) : 0;
  if (overall) {
    overall.textContent = `Overall progress: ${completedModules} of ${total} modules complete`;
  }
  const stepLabel = `Step ${stepIndex + 1} of ${steps.length}`;
  if (moduleStep) moduleStep.textContent = stepLabel;
  if (indicator) indicator.textContent = stepLabel;
  if (stepCountPill) stepCountPill.textContent = stepLabel;
  if (moduleTitle) moduleTitle.textContent = module.title;
  if (moduleBreadcrumb) moduleBreadcrumb.textContent = `Module ${getCourseModuleIndex(moduleId) + 1} — ${stepLabel}`;
  if (bar) bar.style.width = `${percent}%`;
  const modulePercent = steps.length ? Math.round(((stepIndex + 1) / steps.length) * 100) : 0;
  if (stepBar) stepBar.style.width = `${modulePercent}%`;
  if (stepperBar) stepperBar.style.width = `${modulePercent}%`;
}

function updateStepperButtons(moduleId, stepIndex) {
  const prev = qs('#prevStep');
  const next = qs('#nextStep');
  const moduleIdx = getCourseModuleIndex(moduleId);
  const steps = getCourseSteps(moduleId);
  const isFirst = moduleIdx === 0 && stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const isLastModule = moduleIdx === CURRICULUM.length - 1;

  if (prev) prev.disabled = isFirst;
  if (next) {
    if (isLastModule && isLastStep) {
      next.textContent = 'Finish course';
    } else if (isLastStep) {
      const nextModule = moduleRegistry.get(CURRICULUM[moduleIdx + 1].moduleId) || CURRICULUM[moduleIdx + 1];
      next.textContent = `Continue to ${nextModule.title}`;
    } else {
      next.textContent = 'Next';
    }
  }
}

function setNextEnabled(step, force = null) {
  const next = qs('#nextStep');
  if (!next || !step) return;
  const isComplete = getProgress().completedSteps.includes(step.id);
  const autoAdvance = step.type === 'overview';
  const enabled = force !== null ? force : (autoAdvance || isComplete);
  next.disabled = !enabled;
}

async function renderStep(moduleId, stepId) {
  const { registryModule: module, registryStep: step, stepIndex } = resolveStep(moduleId, stepId);
  if (!module || !step || stepIndex < 0) return;
  const content = qs('#stepContent');
  const breadcrumb = qs('#breadcrumb');
  const runtimeContainer = qs('#runtimeContainer');
  const overviewContainer = qs('#overviewContainer');
  const title = qs('#stepTitle');
  const progress = getProgress();

  if (breadcrumb) breadcrumb.textContent = formatBreadcrumb(module, { index: stepIndex, data: step });
  if (title) title.textContent = step.title;

  overviewContainer.style.display = step.type === 'overview' ? 'block' : 'none';
  runtimeContainer.style.display = step.type === 'runtime' ? 'flex' : 'none';

  if (step.type === 'overview') {
    overviewContainer.innerHTML = '<div class="loading">Loading overview…</div>';
    const html = await loadOverview(moduleId);
    overviewContainer.innerHTML = html;
    const assumptionCards = overviewContainer.querySelectorAll('.assumption-card');
    const detail = overviewContainer.querySelector('#assumptionDetail');
    assumptionCards.forEach((card) => card.addEventListener('click', () => {
      if (detail) {
        detail.style.display = 'block';
        detail.textContent = card.dataset.details || '';
      }
    }));
  }

  if (step.type === 'runtime') {
    runtimeContainer.innerHTML = '<p class="small">Training content runs inside the player. If loading takes more than a few seconds, refresh or reopen this module.</p><iframe id="runtimeFrame" title="CSIR runtime"></iframe>';
    const frame = qs('#runtimeFrame');
    if (frame) frame.src = runtimeSrc(step);
  }

  content.dataset.moduleId = moduleId;
  content.dataset.stepId = stepId;
  content.dataset.stepIndex = stepIndex;
  updateProgressUi(moduleId, stepIndex);
  updateStepperButtons(moduleId, stepIndex);
  setNextEnabled(step);
  renderCourseMap(moduleId);
  window.location.hash = `#${stepId}`;
}

function lockedExamAttempt(targetModuleId) {
  if (targetModuleId !== 'm7') return false;
  if (!canStartExam()) {
    showToast('Finish Modules 1–6 before taking the exam.');
    return true;
  }
  return false;
}

function loadModule(moduleId, stepId = null) {
  if (lockedExamAttempt(moduleId)) return;
  const sequence = getModuleSequence(moduleId);
  const targetStep = stepId || sequence[0];
  if (!targetStep) return;
  const progress = getProgress();
  const allowed = clampToUnlocked({ moduleId, stepId: targetStep }, progress);
  renderStep(allowed.moduleId, allowed.stepId);
  const drawer = qs('.course-map');
  if (drawer?.classList.contains('open')) {
    toggleDrawer();
  }
}

function navigateNext(moduleId, stepId) {
  const next = getNext(moduleId, stepId);
  if (next) {
    if (lockedExamAttempt(next.moduleId)) return;
    renderStep(next.moduleId, next.stepId);
    return;
  }
  window.location.href = 'certificate.html';
}

function nextStep() {
  const content = qs('#stepContent');
  const moduleId = content.dataset.moduleId;
  const stepId = content.dataset.stepId;
  const { registryStep: step } = resolveStep(moduleId, stepId);
  if (!step) return;
  if (qs('#nextStep')?.disabled) return;

  markStepComplete(moduleId, step.id);
  navigateNext(moduleId, step.id);
}

function prevStep() {
  const content = qs('#stepContent');
  const moduleId = content.dataset.moduleId;
  const stepId = content.dataset.stepId;
  const prev = getPrevStep(moduleId, stepId);
  if (prev) renderStep(prev.moduleId, prev.stepId);
}

function toggleDrawer() {
  const drawer = qs('.course-map');
  const scrim = qs('#drawerScrim');
  const isOpen = drawer.classList.toggle('open');
  document.body.classList.toggle('drawer-open', isOpen);
  if (scrim) scrim.style.display = isOpen ? 'block' : 'none';
}

function syncRolePill() {
  const pill = qs('#rolePill');
  const role = localStorage.getItem('scl_csir_role');
  if (pill) pill.textContent = role ? `Role: ${role}` : 'Role not set';
}

function startFromHash(progress) {
  const hashStepId = window.location.hash ? window.location.hash.slice(1) : '';
  if (!hashStepId) return null;
  const moduleId = stepRegistry.get(hashStepId)?.moduleId;
  if (!moduleId) return null;
  return clampToUnlocked({ moduleId, stepId: hashStepId }, progress);
}

function bindEvents() {
  qs('#nextStep')?.addEventListener('click', nextStep);
  qs('#prevStep')?.addEventListener('click', prevStep);
  qs('#mapToggle')?.addEventListener('click', toggleDrawer);
  qs('#drawerScrim')?.addEventListener('click', toggleDrawer);
  qs('#exitTraining')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    const msg = event.data || {};
    if (msg.type === 'CSIR_STEP_COMPLETE') {
      const currentModuleId = msg.moduleId || qs('#stepContent')?.dataset.moduleId;
      const currentStepId = msg.stepId || qs('#stepContent')?.dataset.stepId;
      if (currentModuleId && currentStepId) {
        markStepComplete(currentModuleId, currentStepId);
        navigateNext(currentModuleId, currentStepId);
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  if (!requireIdentity()) return;
  bindEvents();
  syncRolePill();
  const progress = getProgress();
  if (!progress.current) {
    const fallbackCurrent = defaultStep();
    setCurrent(fallbackCurrent.moduleId, fallbackCurrent.stepId);
  }
  const requestedStart = startFromHash(progress);
  const fallback = progressAnchor(progress);
  const start = requestedStart || fallback;
  renderCourseMap(start.moduleId);
  renderStep(start.moduleId, start.stepId);
});
