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
const partialCache = {};

function qs(sel) {
  return document.querySelector(sel);
}

function formatBreadcrumb(module, step) {
  return `Home / Start › ${module.title} › Step ${step.index + 1}: ${step.data.title}`;
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

function renderModuleDropdown(currentId) {
  const dropdown = qs('#moduleSelect');
  dropdown.innerHTML = '';
  modules.forEach((module) => {
    const option = document.createElement('option');
    option.value = module.id;
    option.textContent = module.title;
    option.selected = module.id === currentId;
    option.disabled = !canAccessModule(module.id);
    dropdown.appendChild(option);
  });
}

function renderCourseMap(currentId) {
  const list = qs('#courseMap');
  list.innerHTML = '';
  const progress = getProgress();
  modules.forEach((module, idx) => {
    const li = document.createElement('li');
    li.dataset.id = module.id;
    const completed = progress.completedModules.includes(module.id);
    const current = module.id === currentId;
    const unlocked = canAccessModule(module.id);
    li.className = `map-item ${completed ? 'complete' : current ? 'active' : unlocked ? 'open' : 'locked'}`;
    li.innerHTML = `<span class="status"></span><span class="label">${module.title}</span>`;
    li.addEventListener('click', () => {
      if (!unlocked) {
        showToast('Complete earlier modules before opening this one.');
        return;
      }
      loadModule(module.id, 0);
    });
    list.appendChild(li);
    if (idx === modules.length - 1) return;
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
  const moduleStep = qs('#moduleStep');
  const indicator = qs('#stepIndicator');
  const bar = qs('#overallBar');
  const module = modules.find((m) => m.id === moduleId);
  if (!module) return;
  const steps = module.steps || [];
  const completedModules = totalModulesCompleted();
  const total = modules.length;
  const percent = total ? Math.round((completedModules / total) * 100) : 0;
  if (overall) {
    overall.textContent = `Overall progress: ${completedModules} of ${total} modules complete`;
  }
  if (moduleStep) {
    moduleStep.textContent = `Step ${stepIndex + 1} of ${steps.length}`;
  }
  if (indicator) indicator.textContent = `Step ${stepIndex + 1} of ${steps.length}`;
  if (bar) bar.style.width = `${percent}%`;
}

function updateStepperButtons(moduleId, stepIndex) {
  const prev = qs('#prevStep');
  const next = qs('#nextStep');
  const moduleIdx = modules.findIndex((m) => m.id === moduleId);
  const steps = moduleSteps(moduleId);
  const isFirst = moduleIdx === 0 && stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const isLastModule = moduleIdx === modules.length - 1;

  if (prev) prev.disabled = isFirst;
  if (next) {
    next.disabled = false;
    if (isLastModule && isLastStep) {
      next.textContent = 'Finish course';
    } else if (isLastStep) {
      next.textContent = `Continue to ${modules[moduleIdx + 1].title}`;
    } else {
      next.textContent = 'Next';
    }
  }
}

function syncDropdownLabel(moduleId) {
  renderModuleDropdown(moduleId);
  const label = qs('#moduleDropdownLabel');
  if (label) {
    const module = modules.find((m) => m.id === moduleId);
    label.textContent = module ? module.title : 'Module';
  }
}

async function renderStep(moduleId, stepIndex) {
  const module = modules.find((m) => m.id === moduleId);
  if (!module) return;
  const step = module.steps[stepIndex];
  if (!step) return;
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
  content.dataset.stepIndex = stepIndex;
  setCurrent(moduleId, stepIndex);
  updateProgressUi(moduleId, stepIndex);
  updateStepperButtons(moduleId, stepIndex);
  syncDropdownLabel(moduleId);
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

function loadModule(moduleId, stepIndex = 0) {
  if (lockedExamAttempt(moduleId)) return;
  renderStep(moduleId, stepIndex);
}

function nextStep() {
  const content = qs('#stepContent');
  const moduleId = content.dataset.moduleId;
  const stepIndex = Number(content.dataset.stepIndex || 0);
  const moduleIdx = modules.findIndex((m) => m.id === moduleId);
  const steps = moduleSteps(moduleId);
  const step = steps[stepIndex];
  if (!step) return;

  markStepComplete(step.id);

  if (stepIndex < steps.length - 1) {
    renderStep(moduleId, stepIndex + 1);
    return;
  }
  markModuleComplete(moduleId);
  const nextModule = modules[moduleIdx + 1];
  if (nextModule) {
    if (lockedExamAttempt(nextModule.id)) return;
    renderStep(nextModule.id, 0);
  } else {
    showToast('Course complete.');
  }
}

function prevStep() {
  const content = qs('#stepContent');
  const moduleId = content.dataset.moduleId;
  const stepIndex = Number(content.dataset.stepIndex || 0);
  const moduleIdx = modules.findIndex((m) => m.id === moduleId);
  if (stepIndex > 0) {
    renderStep(moduleId, stepIndex - 1);
    return;
  }
  if (moduleIdx > 0) {
    const prevModule = modules[moduleIdx - 1];
    renderStep(prevModule.id, moduleSteps(prevModule.id).length - 1);
  }
}

function toggleDrawer() {
  const drawer = qs('.course-map');
  drawer.classList.toggle('open');
}

function syncRolePill() {
  const pill = qs('#rolePill');
  const role = localStorage.getItem('scl_csir_role');
  if (pill) pill.textContent = role ? `Role: ${role}` : 'Role not set';
}

function bindEvents() {
  qs('#nextStep')?.addEventListener('click', nextStep);
  qs('#prevStep')?.addEventListener('click', prevStep);
  qs('#moduleSelect')?.addEventListener('change', (e) => loadModule(e.target.value, 0));
  qs('#mapToggle')?.addEventListener('click', toggleDrawer);
  qs('#exitTraining')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'CSIR_STEP_COMPLETE' && event.data.stepId) {
      markStepComplete(event.data.stepId);
      renderCourseMap(qs('#stepContent').dataset.moduleId);
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
  const requestedStep = Number(params.get('step') || 0);
  const startModule = (requestedModule && canAccessModule(requestedModule))
    ? requestedModule
    : (progress.current?.moduleId || modules[0]?.id);
  const startStep = Number.isNaN(requestedStep) ? (progress.current?.stepIndex || 0) : requestedStep;
  renderCourseMap(startModule);
  renderStep(startModule, startStep);
});
