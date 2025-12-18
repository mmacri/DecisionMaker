import {
  requireIdentity,
  getProgress,
  setCurrent,
  markStepComplete,
  markModuleComplete,
  canAccessModule,
  canStartExam,
  moduleSteps,
  totalModulesCompleted,
} from './player-state.js';

const modules = window.CSIR_PLAYER?.modules || [];
const moduleRegistry = new Map(modules.map((m) => [m.id, m]));
const stepRegistry = new Map();

modules.forEach((module) => {
  module.steps.forEach((step) => {
    stepRegistry.set(step.id, { ...step, moduleId: module.id });
  });
});

const COURSE = [
  {
    moduleId: 'm1',
    title: 'Module 1 — CSIR Overview',
    steps: [
      { stepId: 1, type: 'overview', key: 'm1s1' },
      { stepId: 2, type: 'runtime', key: 'm1s2' },
    ],
  },
  {
    moduleId: 'm2',
    title: 'Module 2 — Roles, Responsibilities, Communications',
    steps: [
      { stepId: 1, type: 'overview', key: 'm2s1' },
      { stepId: 2, type: 'runtime', key: 'm2s2' },
    ],
  },
  {
    moduleId: 'm3',
    title: 'Module 3 — Terminology, Classification, Severity',
    steps: [
      { stepId: 1, type: 'overview', key: 'm3s1' },
      { stepId: 2, type: 'runtime', key: 'm3s2' },
    ],
  },
  {
    moduleId: 'm4',
    title: 'Module 4 — Workflow by Phase',
    steps: [
      { stepId: 1, type: 'overview', key: 'm4s1' },
      { stepId: 2, type: 'runtime', key: 'm4s2' },
    ],
  },
  {
    moduleId: 'm5',
    title: 'Module 5 — Reporting & Documentation',
    steps: [
      { stepId: 1, type: 'overview', key: 'm5s1' },
      { stepId: 2, type: 'runtime', key: 'm5s2' },
    ],
  },
  {
    moduleId: 'm6',
    title: 'Module 6 — OT Scenarios & Drills',
    steps: [
      { stepId: 1, type: 'overview', key: 'm6s1' },
      { stepId: 2, type: 'runtime', key: 'm6s2' },
    ],
  },
  {
    moduleId: 'm7',
    title: 'Module 7 — Exam + Certification',
    steps: [
      { stepId: 1, type: 'overview', key: 'm7s1' },
      { stepId: 2, type: 'runtime', key: 'm7s2' },
      { stepId: 3, type: 'runtime', key: 'm7s3' },
    ],
  },
];

COURSE.forEach((courseModule) => {
  if (!moduleRegistry.has(courseModule.moduleId)) {
    // eslint-disable-next-line no-console
    console.warn(`Course module ${courseModule.moduleId} missing from registry`);
  }
  courseModule.steps.forEach((step) => {
    if (!stepRegistry.has(step.key)) {
      // eslint-disable-next-line no-console
      console.warn(`Course step ${step.key} missing from registry`);
    }
  });
});
const partialCache = {};

function qs(sel) {
  return document.querySelector(sel);
}

function getCourseModule(moduleId) {
  return COURSE.find((m) => m.moduleId === moduleId);
}

function getCourseModuleIndex(moduleId) {
  return COURSE.findIndex((m) => m.moduleId === moduleId);
}

function getCourseSteps(moduleId) {
  return getCourseModule(moduleId)?.steps || [];
}

function getCourseStep(moduleId, stepId) {
  return getCourseSteps(moduleId).find((s) => s.stepId === stepId);
}

function getCourseStepFromIndex(moduleId, stepIndex) {
  const steps = getCourseSteps(moduleId);
  return steps[stepIndex] || null;
}

function resolveStep(moduleId, stepId) {
  const courseModule = getCourseModule(moduleId);
  const courseStep = getCourseStep(moduleId, stepId);
  const steps = getCourseSteps(moduleId);
  const stepIndex = steps.indexOf(courseStep);
  const registryModule = moduleRegistry.get(moduleId);
  const registryStep = courseStep ? stepRegistry.get(courseStep.key) : null;
  return {
    courseModule,
    courseStep,
    registryModule,
    registryStep,
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
  COURSE.forEach((courseModule, idx) => {
    const module = moduleRegistry.get(courseModule.moduleId) || courseModule;
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
      loadModule(courseModule.moduleId, 1);
    });
    list.appendChild(li);
    if (idx === COURSE.length - 1) return;
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
  const module = moduleRegistry.get(moduleId) || getCourseModule(moduleId);
  if (!module) return;
  const steps = getCourseSteps(moduleId);
  const completedModules = totalModulesCompleted();
  const total = COURSE.length;
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
  const isLastModule = moduleIdx === COURSE.length - 1;

  if (prev) prev.disabled = isFirst;
  if (next) {
    if (isLastModule && isLastStep) {
      next.textContent = 'Finish course';
    } else if (isLastStep) {
      const nextModule = moduleRegistry.get(COURSE[moduleIdx + 1].moduleId) || COURSE[moduleIdx + 1];
      next.textContent = `Continue to ${nextModule.title}`;
    } else {
      next.textContent = 'Next';
    }
  }
}

function getNextStep(moduleId, stepId) {
  const moduleIdx = getCourseModuleIndex(moduleId);
  if (moduleIdx < 0) return null;
  const steps = getCourseSteps(moduleId);
  const stepIdx = steps.findIndex((s) => s.stepId === stepId);
  if (stepIdx < 0) return null;
  if (stepIdx + 1 < steps.length) {
    return { moduleId, stepId: steps[stepIdx + 1].stepId };
  }
  const nextModule = COURSE[moduleIdx + 1];
  if (!nextModule) return null;
  return { moduleId: nextModule.moduleId, stepId: nextModule.steps[0].stepId };
}

function getPrevStep(moduleId, stepId) {
  const moduleIdx = getCourseModuleIndex(moduleId);
  if (moduleIdx < 0) return null;
  const steps = getCourseSteps(moduleId);
  const stepIdx = steps.findIndex((s) => s.stepId === stepId);
  if (stepIdx > 0) {
    return { moduleId, stepId: steps[stepIdx - 1].stepId };
  }
  const prevModule = COURSE[moduleIdx - 1];
  if (!prevModule) return null;
  const prevSteps = getCourseSteps(prevModule.moduleId);
  if (!prevSteps.length) return null;
  return { moduleId: prevModule.moduleId, stepId: prevSteps[prevSteps.length - 1].stepId };
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
    if (step.id === 'm7s3' && !progress.exam?.passed) {
      runtimeContainer.style.display = 'block';
      runtimeContainer.innerHTML = '<div class="alert">Pass the final exam before downloading the certificate.</div>';
    } else {
      runtimeContainer.innerHTML = '<p class="small">Training content runs inside the player. If loading takes more than a few seconds, refresh or reopen this module.</p><iframe id="runtimeFrame" title="CSIR runtime"></iframe>';
      const frame = qs('#runtimeFrame');
      if (frame) frame.src = runtimeSrc(step);
    }
  }

  content.dataset.moduleId = moduleId;
  content.dataset.stepId = String(stepId);
  content.dataset.stepIndex = stepIndex;
  setCurrent(moduleId, stepIndex);
  updateProgressUi(moduleId, stepIndex);
  updateStepperButtons(moduleId, stepIndex);
  setNextEnabled(step);
  renderCourseMap(moduleId);
}

function lockedExamAttempt(targetModuleId) {
  if (targetModuleId !== 'm7') return false;
  if (!canStartExam()) {
    showToast('Finish Modules 1–6 before taking the exam.');
    return true;
  }
  return false;
}

function loadModule(moduleId, stepId = 1) {
  if (lockedExamAttempt(moduleId)) return;
  renderStep(moduleId, stepId);
  const drawer = qs('.course-map');
  if (drawer?.classList.contains('open')) {
    toggleDrawer();
  }
}

function nextStep() {
  const content = qs('#stepContent');
  const moduleId = content.dataset.moduleId;
  const stepId = Number(content.dataset.stepId || 1);
  const { registryStep: step } = resolveStep(moduleId, stepId);
  if (!step) return;
  if (qs('#nextStep')?.disabled) return;

  markStepComplete(step.id);

  const steps = getCourseSteps(moduleId);
  const stepIdx = steps.findIndex((s) => s.stepId === stepId);
  const isLastStep = stepIdx === steps.length - 1;
  if (isLastStep) {
    markModuleComplete(moduleId);
  }

  const next = getNextStep(moduleId, stepId);
  if (next) {
    if (lockedExamAttempt(next.moduleId)) return;
    renderStep(next.moduleId, next.stepId);
    return;
  }
  showToast('Course complete.');
}

function prevStep() {
  const content = qs('#stepContent');
  const moduleId = content.dataset.moduleId;
  const stepId = Number(content.dataset.stepId || 1);
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

function bindEvents() {
  qs('#nextStep')?.addEventListener('click', nextStep);
  qs('#prevStep')?.addEventListener('click', prevStep);
  qs('#mapToggle')?.addEventListener('click', toggleDrawer);
  qs('#drawerScrim')?.addEventListener('click', toggleDrawer);
  qs('#exitTraining')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'CSIR_STEP_COMPLETE') {
      const currentModuleId = qs('#stepContent').dataset.moduleId;
      const eventModuleId = event.data.moduleId || currentModuleId;
      const eventStepId = Number(event.data.stepId);
      const courseStep = (!Number.isNaN(eventStepId) && eventModuleId) ? getCourseStep(eventModuleId, eventStepId) : null;
      const registryStepId = courseStep?.key || (typeof event.data.stepId === 'string' ? event.data.stepId : null);
      if (registryStepId) {
        markStepComplete(registryStepId);
        renderCourseMap(currentModuleId);
        const activeStepId = Number(qs('#stepContent').dataset.stepId || 1);
        const resolved = resolveStep(currentModuleId, activeStepId);
        if (resolved?.registryStep) setNextEnabled(resolved.registryStep, true);
        updateProgressUi(currentModuleId, Number(qs('#stepContent').dataset.stepIndex || 0));
      }
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  if (!requireIdentity()) return;
  bindEvents();
  syncRolePill();
  const progress = getProgress();
  const params = new URLSearchParams(window.location.search);
  const requestedModule = params.get('module');
  const requestedStepIndex = Number(params.get('step'));
  const firstModuleId = COURSE[0]?.moduleId || modules[0]?.id;
  const startModule = (requestedModule && canAccessModule(requestedModule))
    ? requestedModule
    : (progress.current?.moduleId || firstModuleId);
  const fallbackStepIndex = progress.current?.stepIndex || 0;
  const startStepIndex = Number.isNaN(requestedStepIndex) ? fallbackStepIndex : requestedStepIndex;
  const startCourseStep = getCourseStepFromIndex(startModule, startStepIndex) || getCourseStepFromIndex(startModule, 0);
  const startStepId = startCourseStep?.stepId || 1;
  renderCourseMap(startModule);
  renderStep(startModule, startStepId);
});
