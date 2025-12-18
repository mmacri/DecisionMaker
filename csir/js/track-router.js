import { ProgressStore } from './progress-store.js';
import PlayerUI from './player-ui.js';

function qp(name, fallback = null) {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(name);
  return value === null ? fallback : value;
}

function setQp(updates) {
  const params = new URLSearchParams(window.location.search);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });
  history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

function normalizeTrackForPlayer(track) {
  if (!track || track.id !== 'csir-cert') return track;
  const modules = track.modules.map((module, index) => ({
    ...module,
    id: module.id ?? index + 1,
  }));
  return { ...track, modules };
}

function getActiveTrack(trackId) {
  const raw = window.TRAINING_TRACKS?.[trackId];
  return normalizeTrackForPlayer(raw);
}

const requestedTrack = qp('track', 'csir-cert');
const resumeFlag = qp('resume') === '1';

const track = getActiveTrack(requestedTrack) || getActiveTrack('csir-cert');
const ui = new PlayerUI();

if (!track) {
  ui.contentHost.textContent = 'Training track not found. Please return to the curriculum overview and try again.';
  throw new Error('No training track registered');
}

let progress = ProgressStore.getProgress(track.id);

function getStartLocation() {
  if (resumeFlag && progress.lastLocation && progress.lastLocation.trackId === track.id) {
    return { m: progress.lastLocation.m, s: progress.lastLocation.s, ms: 1 };
  }
  const m = parseInt(qp('m', '1'), 10) || 1;
  const s = parseInt(qp('s', '1'), 10) || 1;
  const ms = parseInt(qp('ms', '1'), 10) || 1;
  return { m, s, ms };
}

let location = enforceBounds(getStartLocation());

function isStepCompleted(prog, m, s) {
  const steps = prog.completedSteps[m] || [];
  return steps.includes(s);
}

function moduleUnlocked(idx) {
  if (!track.enforceLinear) return true;
  if (idx === 1) return true;
  return progress.completedModules.includes(idx - 1) || progress.completedModules.includes(idx);
}

function enforceBounds(loc) {
  const maxModule = track.modules.length;
  let m = Math.min(Math.max(1, loc.m), maxModule);
  if (!moduleUnlocked(m)) {
    m = Math.max(1, Math.min(maxModule, (progress.completedModules.slice(-1)[0] || 0) + 1));
  }
  const steps = track.modules[m - 1].steps.length;
  let s = Math.min(Math.max(1, loc.s), steps);
  const ms = Math.max(1, loc.ms || 1);
  return { m, s, ms };
}

function updateUrl() {
  setQp({
    track: track.id,
    m: location.m,
    s: location.s,
    ms: location.ms,
  });
}

function render() {
  location = enforceBounds(location);
  const module = track.modules[location.m - 1];
  const totalSteps = module.steps.length;
  const step = module.steps[location.s - 1];
  const stepCompleted = isStepCompleted(progress, location.m, location.s);

  ui.setTrackLabel(track.name);
  ui.renderCourseMap(track, progress, location, (target) => {
    if (moduleUnlocked(target)) {
      location = { m: target, s: 1 };
      render();
    } else {
      ui.showToast('Complete earlier modules to unlock this one.');
    }
  }, 'Complete earlier modules to unlock');

  const metaText = `Module ${location.m} — Step ${location.s} of ${totalSteps}`;
  const breadcrumb = `Home / Start › Module ${location.m} › Step ${location.s}`;
  const pct = ((location.s - 1) / totalSteps) * 100;
  ui.updateHeader(module.title, metaText, breadcrumb, pct);

  const context = {
    moduleLabel: `Module ${location.m}`,
    completed: stepCompleted,
    onComplete: (data) => completeStep(step, data),
    trackId: track.id,
    moduleNumber: location.m,
    stepNumber: location.s,
  };

  ui.renderStep(step, context);
  if (track.id === 'csir-cert' && step.type === 'exam') {
    renderCertificateArea();
  }

  setNavState(step, stepCompleted, totalSteps);
  ProgressStore.setLastLocation(track.id, location.m, location.s);
  updateUrl();
}

function setNavState(step, stepCompleted, totalSteps) {
  const lockReason = !stepCompleted
    ? (step.type === 'overview'
        ? 'Mark the overview complete to continue.'
        : step.type === 'iframe'
          ? 'Confirm the interactive step to continue.'
          : step.type === 'guided'
            ? 'Complete all guided training micro-steps to continue.'
          : 'Complete the knowledge check to continue.')
    : '';
  const atStart = location.m === 1 && location.s === 1;
  const atEnd = location.m === track.modules.length && location.s === totalSteps && stepCompleted;
  ui.setNavState({ canBack: !atStart, canNext: stepCompleted && !atEnd, lockReason });
}

function completeStep(step, data) {
  progress = ProgressStore.setStepComplete(track.id, location.m, location.s);
  if (step.type === 'quiz' || step.type === 'exam') {
    if (data?.score !== undefined) {
      progress = ProgressStore.setScore(track.id, `module-${location.m}-step-${location.s}`, data.score);
      if (track.id === 'csir-cert' && step.type === 'exam' && data.score >= (step.passPercent || 80)) {
        ProgressStore.setCertificateEligible(track.id, true);
      }
    }
  }

  const moduleSteps = track.modules[location.m - 1].steps.length;
  const completedCount = (progress.completedSteps[location.m] || []).length;
  if (completedCount >= moduleSteps && !progress.completedModules.includes(location.m)) {
    progress = ProgressStore.setModuleComplete(track.id, location.m);
  }

  render();
}

function goNext() {
  const module = track.modules[location.m - 1];
  const step = module.steps[location.s - 1];
  if (!isStepCompleted(progress, location.m, location.s)) {
    ui.showToast('Complete this step to continue.');
    return;
  }
  if (location.s < module.steps.length) {
    location = { m: location.m, s: location.s + 1, ms: 1 };
  } else if (location.m < track.modules.length) {
    if (!moduleUnlocked(location.m + 1)) {
      ui.showToast('Finish current module to unlock the next.');
      return;
    }
    location = { m: location.m + 1, s: 1, ms: 1 };
  }
  render();
}

function goBack() {
  if (location.m === 1 && location.s === 1) return;
  if (location.s > 1) {
    location = { m: location.m, s: location.s - 1, ms: 1 };
  } else {
    const prevModuleSteps = track.modules[location.m - 2].steps.length;
    location = { m: location.m - 1, s: prevModuleSteps, ms: 1 };
  }
  render();
}

function renderCertificateArea() {
  let area = document.getElementById('certArea');
  if (!area) {
    area = document.createElement('div');
    area.id = 'certArea';
    area.className = 'certificate-card';
    area.innerHTML = `
      <h3>Download your certificate</h3>
      <p class="muted">Provide your name and role so we can stamp the completion details. The download is enabled after you pass the exam.</p>
      <label class="field">Name <input id="certName" type="text" placeholder="Full name"></label>
      <label class="field">Role <input id="certRole" type="text" placeholder="Your role"></label>
      <button id="certDownload" class="primary" disabled>Download certificate</button>
    `;
    ui.contentHost.appendChild(area);
  }
  const button = area.querySelector('#certDownload');
  const nameInput = area.querySelector('#certName');
  const roleInput = area.querySelector('#certRole');
  const eligible = ProgressStore.getProgress(track.id).certificateEligible;
  button.disabled = !eligible;
  button.addEventListener('click', () => {
    if (!eligible) return;
    const name = nameInput.value.trim() || 'Learner';
    const role = roleInput.value.trim() || 'OT CSIR Trainee';
    generateCertificate(name, role);
  });
}

function generateCertificate(name, role) {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) return;
  const doc = new jsPDF();
  const date = new Date();
  const id = `CSIR-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  doc.setFontSize(16);
  doc.text('Seattle City Light – OT CSIR Training', 20, 30);
  doc.setFontSize(12);
  doc.text(`Awarded to: ${name}`, 20, 50);
  doc.text(`Role: ${role}`, 20, 60);
  doc.text(`Completion: ${date.toLocaleString()}`, 20, 70);
  doc.text(`Certificate ID: ${id}`, 20, 80);
  doc.text('Completed certification mode with passing exam score (≥80%) and required modules.', 20, 95, { maxWidth: 170 });
  doc.save(`SCL_CSIR_Certificate_${name.split(' ').slice(-1)[0] || 'Learner'}_${date.toISOString().slice(0,10)}.pdf`);
}

ui.btnNext.addEventListener('click', goNext);
ui.btnBack.addEventListener('click', goBack);

render();
