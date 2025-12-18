import {
  clearIfDifferentCourse,
  loadProgress,
  saveProgress,
  setActiveStep,
  markStepCompleted,
  setQuizScore,
  setInteractionScore,
  setAcknowledgements,
  setFinalExamScore,
  unlockChecklist,
  setCompletedAt,
  resetProgress,
} from './storage.js';
import { requireRoleAndName } from './router.js';
import { renderQuiz, bindQuiz } from './quiz.js';

const EMBEDDED_MODULE_STEPS = {
  m1: ['mission-control', 'csir-basics'],
  m2: ['roles', 'comms'],
  m3: ['definitions', 'severity'],
  m4: ['workflow', 'response'],
  m5: ['reporting', 'evidence'],
  m6: ['scenarios', 'audit-etiquette'],
  m7: ['final-exam', 'checklist', 'completion'],
};

const PLAYER_STEP_IDS = {
  m1: 'm1s2',
  m2: 'm2s2',
  m3: 'm3s2',
  m4: 'm4s2',
  m5: 'm5s2',
  m6: 'm6s2',
  m7: 'm7s2',
};

async function fetchPack(courseId = 'scl-csir') {
  const res = await fetch(`contentpacks/${courseId}/pack.json`);
  return res.json();
}

function byId(id) { return document.getElementById(id); }

function renderContentBlock(block, roleLabel) {
  switch (block.kind) {
    case 'markdown':
      return `<div class="content-block"><p>${block.text}</p></div>`;
    case 'bullets':
      return `<div class="content-block"><ul class="list">${block.items.map((i) => `<li>${i}</li>`).join('')}</ul></div>`;
    case 'callout': {
      const toneClass = block.tone === 'warning' ? 'warning' : block.tone === 'accent' ? 'accent' : 'callout';
      return `<div class="content-block ${toneClass}"><h3>${block.title || ''}</h3><p>${block.text}</p></div>`;
    }
    case 'timeline':
      return `<div class="content-block"><div class="timeline">${block.items.map((p) => `<div class="phase"><div class="title">${p.title}</div><div class="small">${p.text}</div></div>`).join('')}</div></div>`;
    case 'matrix':
      return `<div class="content-block"><table class="matrix"><thead><tr>${block.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${block.rows.map((r) => `<tr><th>${r.label}</th>${r.values.map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    case 'accordion':
      return `<div class="content-block accordion">${block.items.map((item) => `<details data-title="${item.title}"><summary>${item.title}</summary><div class="small"><strong>You are responsible for</strong><ul class="list">${item.responsible.map((i) => `<li>${i}</li>`).join('')}</ul><strong>You are NOT responsible for</strong><ul class="list">${item.notResponsible.map((i) => `<li>${i}</li>`).join('')}</ul><strong>Evidence you typically touch</strong><ul class="list">${item.evidence.map((i) => `<li>${i}</li>`).join('')}</ul></div></details>`).join('')}</div>`;
    default:
      return '';
  }
}

function renderContent(step, progress, roleLabel) {
  const blocks = (step.contentBlocks || []).map((b) => renderContentBlock(b, roleLabel)).join('');
  let quizHtml = '';
  if (step.knowledgeCheck) {
    const existing = progress.quizScores[step.id];
    quizHtml = renderQuiz(step.id, step.knowledgeCheck, existing);
  }
  let interactionHtml = '';
  if (step.interaction) {
    interactionHtml = buildInteraction(step, progress);
  }
  let ctaHtml = '';
  if (step.ctaLabel) {
    ctaHtml = `<button class="button" id="cta-${step.id}">${step.ctaLabel}</button>`;
  }
  return `<div class="panel content-area">${blocks}${interactionHtml}${quizHtml}${ctaHtml}</div>`;
}

function buildInteraction(step, progress) {
  const kind = step.interaction.kind;
  if (kind === 'classification') {
    return `<div class="content-block"><h3>${step.interaction.prompt}</h3>${step.interaction.items.map((item, idx) => {
      const selectName = `${step.id}-class-${idx}`;
      const existing = progress.interactionScores[step.id];
      const disabled = existing?.passed ? 'disabled' : '';
      return `<div class="question"><div class="small">${item.text}</div><select name="${selectName}" ${disabled}>${['', ...step.interaction.options].map((opt) => `<option value="${opt}">${opt || 'Select'}</option>`).join('')}</select><div class="small muted">${item.why}</div></div>`;
    }).join('')}<button class="button" id="interaction-${step.id}" ${progress.interactionScores[step.id]?.passed ? 'disabled' : ''}>Submit classifications</button>${interactionResult(step, progress)}</div>`;
  }
  if (kind === 'matching') {
    return `<div class="content-block"><h3>${step.interaction.prompt}</h3>${step.interaction.items.map((item, idx) => {
      const selectName = `${step.id}-match-${idx}`;
      const disabled = progress.interactionScores[step.id]?.passed ? 'disabled' : '';
      return `<div class="question"><div class="small">${item.text}</div><select name="${selectName}" ${disabled}>${['', ...step.interaction.options].map((opt) => `<option value="${opt}">${opt || 'Select severity'}</option>`).join('')}</select></div>`;
    }).join('')}<button class="button" id="interaction-${step.id}" ${progress.interactionScores[step.id]?.passed ? 'disabled' : ''}>Check matches</button>${interactionResult(step, progress)}</div>`;
  }
  if (kind === 'acknowledgement') {
    const existing = progress.acknowledgements[step.id] || 0;
    const disabled = existing >= (step.interaction.items?.length || 0);
    return `<div class="content-block"><h3>${step.interaction.prompt}</h3><ul class="checklist">${step.interaction.items.map((item, idx) => `<li><label><input type="checkbox" data-ack="${step.id}" value="${idx}" ${disabled ? 'checked disabled' : ''}>${item}</label></li>`).join('')}</ul><div class="small">Check all that apply.</div></div>`;
  }
  if (kind === 'accordion') {
    return `<div class="content-block"><h3>${step.interaction.prompt}</h3>${renderContentBlock({ kind: 'accordion', items: step.interaction.items })}<div id="accordionStatus" class="small"></div></div>`;
  }
  return '';
}

function interactionResult(step, progress) {
  const existing = progress.interactionScores[step.id];
  if (!existing) return '';
  return `<div class="result">Score: ${existing.score}/${existing.total} (${existing.percent}%)${existing.passed ? ' • Passed' : ''}</div>`;
}

function normalizeModuleParam(value) {
  if (!value) return null;
  const candidate = value.toString().trim().toLowerCase();
  if (/^m[1-7]$/.test(candidate)) return candidate;
  if (/^[1-7]$/.test(candidate)) return `m${candidate}`;
  return null;
}

function getModuleStartIndex(moduleId, steps) {
  const lookup = EMBEDDED_MODULE_STEPS[moduleId] || [];
  if (!lookup.length) return -1;
  const firstStep = lookup[0];
  return steps.findIndex((s) => s.id === firstStep);
}

function getSearchParams() {
  const params = new URLSearchParams(window.location.search);
  const moduleParam = normalizeModuleParam(params.get('module'));
  return {
    moduleId: moduleParam || 'm1',
    requestedModule: moduleParam,
    stepId: params.get('step') || 's2',
    role: params.get('role'),
    mode: params.get('mode'),
    exam: params.get('exam') === '1',
    resume: params.get('resume') === '1',
    start: params.get('start') === '1',
  };
}

function setRoleFromParams(roleId) {
  if (!roleId) return;
  const progress = loadProgress();
  if (progress.roleId !== roleId) {
    saveProgress({ ...progress, roleId });
  }
}

function evaluateInteraction(step, container, onPassed) {
  const kind = step.interaction.kind;
  if (kind === 'classification' || kind === 'matching') {
    const button = container.querySelector(`#interaction-${step.id}`);
    if (!button || button.disabled) return;
    button.addEventListener('click', () => {
      let correct = 0;
      const total = step.interaction.items.length;
      step.interaction.items.forEach((item, idx) => {
        const select = container.querySelector(`select[name="${step.id}-${kind === 'classification' ? 'class' : 'match'}-${idx}"]`);
        if (select && select.value === item.answer) correct += 1;
      });
      const percent = Math.round((correct / total) * 100);
      setInteractionScore(step.id, correct, total, step.interaction.passingScore);
      const result = container.querySelector('.result') || document.createElement('div');
      result.className = 'result';
      result.textContent = `Score: ${correct}/${total} (${percent}%)${percent >= step.interaction.passingScore ? ' • Passed' : ' • Try again'}`;
      if (!container.querySelector('.result')) container.querySelector('.content-block').appendChild(result);
      if (percent >= step.interaction.passingScore) {
        button.disabled = true;
        onPassed();
      }
    });
  }
  if (kind === 'acknowledgement') {
    const checkboxes = container.querySelectorAll('input[data-ack]');
    const total = step.interaction.items.length;
    checkboxes.forEach((cb) => cb.addEventListener('change', () => {
      const checked = Array.from(container.querySelectorAll('input[data-ack]:checked')).length;
      setAcknowledgements(step.id, checked);
      if (checked >= total) {
        markStepCompleted(step.id);
        onPassed();
      }
    }));
  }
  if (kind === 'accordion') {
    const details = container.querySelectorAll('details');
    const opened = new Set();
    details.forEach((d) => d.addEventListener('toggle', () => {
      if (d.open) opened.add(d.dataset.title);
      const status = container.querySelector('#accordionStatus');
      if (status) status.textContent = `${opened.size} roles viewed`;
      const progress = loadProgress();
      const roleTitle = document.querySelector('[data-role-label]')?.dataset.roleLabel;
      const hasOwn = roleTitle ? opened.has(roleTitle) : true;
      if (hasOwn && opened.size >= 2) {
        markStepCompleted(step.id);
        onPassed();
      }
    }));
  }
}

function buildStepper(steps, requiredStepIds, progress) {
  const list = byId('stepList');
  list.innerHTML = '';
  steps.forEach((step, idx) => {
    const required = requiredStepIds.includes(step.id);
    const div = document.createElement('div');
    div.className = 'step';
    div.dataset.id = step.id;
    div.innerHTML = `<div class="badge">${String(idx + 1).padStart(2, '0')}</div><div><div>${step.title}</div><div class="meta">${required ? 'Required' : 'Optional'}${step.type === 'exam' ? ' • Final exam' : ''}${step.lockedUntilExam ? ' • Unlocks after exam' : ''}</div></div>`;
    list.appendChild(div);
  });
}

function computeUnlocked(index, steps, progress) {
  if (index <= 0) return true;
  if (index >= steps.length) return true;
  if (index === 0) return true;
  const prev = steps[index - 1];
  if (steps[index].lockedUntilExam) {
    return progress.finalExamScore?.passed;
  }
  return progress.completedSteps.includes(prev.id);
}

function refreshStepperState(steps, progress, activeId) {
  const nodes = Array.from(document.querySelectorAll('#stepList .step'));
  nodes.forEach((node, idx) => {
    const stepId = steps[idx].id;
    const locked = !computeUnlocked(idx, steps, progress);
    node.classList.toggle('active', stepId === activeId);
    node.classList.toggle('completed', progress.completedSteps.includes(stepId));
    node.classList.toggle('locked', locked);
  });
}

function computeProgress(steps, progress) {
  const completed = steps.filter((s) => progress.completedSteps.includes(s.id)).length;
  const total = steps.length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

function moduleTrainingCompleted(progress) {
  const targets = EMBEDDED_MODULE_STEPS[activeModuleId] || [];
  if (!targets.length) return false;
  return targets.every((id) => progress.completedSteps.includes(id));
}

function notifyParentCompletion(progress) {
  if (!embeddedMode) return;
  if (!moduleTrainingCompleted(progress)) return;
  if (notifiedModules.has(activeModuleId)) return;
  const stepId = PLAYER_STEP_IDS[activeModuleId] || 's2';
  const payload = { type: 'CSIR_STEP_COMPLETE', moduleId: activeModuleId, stepId };
  window.parent?.postMessage(payload, window.location.origin);
  window.parent?.postMessage({ type: 'CSIR_MODULE_COMPLETE', moduleId: activeModuleId }, window.location.origin);
  notifiedModules.add(activeModuleId);
}

function updateProgressBar(progressData) {
  byId('progressText').textContent = `${progressData.completed} / ${progressData.total} steps complete (${progressData.percent}%)`;
  document.querySelector('.progress-fill').style.width = `${progressData.percent}%`;
}

function ensureCompletionState(steps, progress, pack) {
  const requiredIds = pack.roles.find((r) => r.id === progress.roleId)?.requiredStepIds || [];
  const allSteps = requiredIds.every((id) => progress.completedSteps.includes(id));
  const examPassed = progress.finalExamScore?.passed && progress.finalExamScore.percent >= pack.finalExam.passingScore;
  if (allSteps && examPassed) {
    unlockChecklist();
    if (!progress.completedAt) setCompletedAt(new Date().toISOString());
    byId('certificateLink').style.display = 'inline-flex';
    byId('completionBanner').style.display = 'block';
  }
}

function renderStep(step, pack, progress, roleLabel) {
  const content = renderContent(step, progress, roleLabel);
  byId('content').innerHTML = content;

  if (step.contentBlocks && step.contentBlocks.length > 0) {
    setActiveStep(step.id);
  }

  if (step.ctaLabel) {
    const btn = byId(`cta-${step.id}`);
    btn?.addEventListener('click', () => {
      markStepCompleted(step.id);
      navigateRelative(1);
    });
  }

  if (step.knowledgeCheck) {
    bindQuiz(step.id, step.knowledgeCheck, byId('content'), () => {
      markStepCompleted(step.id);
      updateAfterCompletion();
    });
  }

  if (step.interaction) {
    evaluateInteraction(step, byId('content'), () => {
      markStepCompleted(step.id);
      updateAfterCompletion();
    });
  }

  if (step.completionCriteria?.includes('viewed')) {
    markStepCompleted(step.id);
    updateAfterCompletion();
  }
}

let stepsCache = [];
let packCache;
let roleLabelCache = '';
let currentIndex = 0;
let embeddedMode = false;
let activeModuleId = 'm1';
const notifiedModules = new Set();

function isStepCompleted(step, progress) {
  if (progress.completedSteps.includes(step.id)) return true;
  const criteria = step.completionCriteria || [];
  if (criteria.includes('examPassed')) return progress.finalExamScore?.passed;
  if (criteria.includes('quizPassed')) return progress.quizScores[step.id]?.passed;
  if (criteria.includes('interactionPassed')) return progress.interactionScores[step.id]?.passed;
  if (criteria.includes('acknowledged')) {
    const needed = step.interaction?.items?.length || 0;
    return (progress.acknowledgements[step.id] || 0) >= needed;
  }
  if (criteria.includes('cta')) return progress.completedSteps.includes(step.id);
  if (criteria.includes('viewed')) return progress.viewedSteps.includes(step.id) || progress.completedSteps.includes(step.id);
  return false;
}

function updateAfterCompletion() {
  const progress = loadProgress();
  const progressData = computeProgress(stepsCache, progress);
  refreshStepperState(stepsCache, progress, stepsCache[currentIndex].id);
  updateProgressBar(progressData);
  ensureCompletionState(stepsCache, progress, packCache);
  bindNavButtons(progress);
  notifyParentCompletion(progress);
}

function bindNavButtons(progress) {
  const backBtn = byId('backBtn');
  const nextBtn = byId('nextBtn');
  backBtn.disabled = currentIndex === 0;
  const lockedNext = !computeUnlocked(currentIndex + 1, stepsCache, progress) || !isStepCompleted(stepsCache[currentIndex], progress);
  const isLast = currentIndex === stepsCache.length - 1;
  nextBtn.disabled = isLast || lockedNext;
  backBtn.onclick = () => currentIndex > 0 && navigateTo(currentIndex - 1);
  nextBtn.onclick = () => {
    if (isLast) return;
    if (lockedNext) {
      byId('lockedModal').showModal();
      return;
    }
    navigateTo(currentIndex + 1);
  };
}

function renderExam(step, pack, progress) {
  const existing = progress.finalExamScore;
  const alreadyPassed = existing?.passed && existing.percent >= pack.finalExam.passingScore;
  const questionHtml = pack.finalExam.questions.map((q, idx) => {
    const options = q.options.map((opt, optIdx) => `<label><input type="radio" name="exam-q${idx}" value="${optIdx}" ${alreadyPassed ? 'disabled' : ''}>${opt}</label>`).join('');
    return `<div class="question"><div class="small">${q.prompt}</div>${options}</div>`;
  }).join('');
  byId('content').innerHTML = `<div class="panel content-area"><div class="status-pill">Final exam</div><p class="small">Pass with ${pack.finalExam.passingScore}% or better to unlock the checklist and certificate.</p><div class="quiz">${questionHtml}<button class="button" id="submitFinal" ${alreadyPassed ? 'disabled' : ''}>Submit final exam</button>${existing ? `<div class="result">Score: ${existing.score}/${existing.total} (${existing.percent}%)${alreadyPassed ? ' • Passed' : ''}</div>` : ''}</div></div>`;
  if (alreadyPassed) return;
  byId('submitFinal').addEventListener('click', () => {
    let correct = 0;
    pack.finalExam.questions.forEach((q, idx) => {
      const selected = document.querySelector(`input[name="exam-q${idx}"]:checked`);
      if (selected && Number(selected.value) === q.answer) correct += 1;
    });
    if (document.querySelectorAll('.quiz input:checked').length < pack.finalExam.questions.length) {
      alert('Please answer every question.');
      return;
    }
    setFinalExamScore(correct, pack.finalExam.questions.length, pack.finalExam.passingScore);
    if (Math.round((correct / pack.finalExam.questions.length) * 100) >= pack.finalExam.passingScore) {
      markStepCompleted(step.id);
      unlockChecklist();
      setCompletedAt(new Date().toISOString());
    }
    updateAfterCompletion();
    renderExam(step, pack, loadProgress());
  });
}

function renderDownload(step, progress) {
  const locked = step.lockedUntilExam && !(progress.finalExamScore?.passed);
  const note = locked ? '<div class="banner">Pass the final exam to unlock downloads.</div>' : '';
  const btnState = locked ? 'disabled' : '';
  const content = renderContent(step, progress, roleLabelCache);
  byId('content').innerHTML = `${content}<div class="footer-actions"><button class="button" id="downloadChecklistPdf" ${btnState}>Download checklist PDF</button><button class="button secondary" id="downloadChecklistPng" ${btnState}>Download checklist PNG</button></div>${note}`;
  if (!locked) {
    const checklistText = ['Prevent: keep backups/images current, maintain monitoring/logging on critical systems, update contact lists monthly.', 'Detect: recognize anomalies, verify maintenance windows, escalate suspicious indicators promptly.', 'Respond: report quickly, preserve evidence, follow leadership direction, document actions.'].join('\n');
    byId('downloadChecklistPdf').addEventListener('click', () => downloadChecklistPdf(checklistText));
    byId('downloadChecklistPng').addEventListener('click', () => downloadChecklistPng());
    markStepCompleted(step.id);
  }
}

async function downloadChecklistPng() {
  const panel = byId('content');
  const canvas = await html2canvas(panel, { scale: 2 });
  const link = document.createElement('a');
  link.download = 'scl-csir-checklist.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function downloadChecklistPdf(text) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Seattle City Light – OT CSIR Operational Checklist', 50, 70);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(text, 50, 100, { maxWidth: 500 });
  doc.save('scl-csir-checklist.pdf');
}

function renderCompletion(step, progress) {
  const panel = document.createElement('div');
  panel.className = 'panel content-area certificate-card';
  panel.innerHTML = `<div class="tag">Next steps</div><h2>Completion confirmed</h2><div class="certificate-meta">${progress.learnerName || 'Learner'} • ${roleLabelCache}</div><p class="small">Download your certificate as PDF or PNG. You can also capture a completion screenshot for records.</p><div class="footer-actions" style="justify-content:center;"> <a class="button" href="certificate.html">Open certificate</a> <button class="button secondary" id="resetFromCompletion">Reset training</button></div>`;
  byId('content').innerHTML = '';
  byId('content').appendChild(panel);
  markStepCompleted(step.id);
  byId('resetFromCompletion').addEventListener('click', () => {
    byId('resetProgress').click();
  });
}

function navigateTo(index) {
  currentIndex = index;
  const progress = loadProgress();
  const step = stepsCache[index];
  setActiveStep(step.id);
  refreshStepperState(stepsCache, progress, step.id);
  updateProgressBar(computeProgress(stepsCache, progress));
  bindNavButtons(progress);
  const role = packCache.roles.find((r) => r.id === progress.roleId);
  roleLabelCache = role?.label || progress.roleId;
  document.querySelector('[data-role-label]')?.setAttribute('data-role-label', roleLabelCache);

  if (step.type === 'exam') {
    renderExam(step, packCache, progress);
  } else if (step.type === 'download') {
    renderDownload(step, progress);
  } else if (step.type === 'complete') {
    renderCompletion(step, progress);
  } else {
    renderStep(step, packCache, progress, roleLabelCache);
  }
}

function navigateRelative(delta) {
  const target = currentIndex + delta;
  if (target >= 0 && target < stepsCache.length) navigateTo(target);
}

function setupDrawer() {
  const toggle = byId('drawerToggle');
  const overlay = byId('drawerOverlay');
  const mobile = byId('drawerMobile');
  const openDrawer = () => { overlay.classList.add('open'); mobile.classList.add('open'); };
  const closeDrawer = () => { overlay.classList.remove('open'); mobile.classList.remove('open'); };
  toggle?.addEventListener('click', openDrawer);
  overlay?.addEventListener('click', closeDrawer);
  mobile?.addEventListener('click', (e) => { if (e.target.classList.contains('step')) closeDrawer(); });
}

function configureEmbeddedLayout(params, roleLabel) {
  embeddedMode = params.mode === 'embedded';
  if (!embeddedMode) return;
  document.body.classList.add('embedded');
  activeModuleId = params.moduleId || 'm1';
  roleLabelCache = roleLabel;
}

function selectModuleSteps(moduleId, steps) {
  const list = EMBEDDED_MODULE_STEPS[moduleId] || [];
  if (!list.length) return steps;
  return steps.filter((s) => list.includes(s.id));
}

function initialStepIndex(moduleId, progress, resume) {
  const subset = EMBEDDED_MODULE_STEPS[moduleId] || [];
  if (!resume) return 0;
  const firstIncomplete = subset.findIndex((id) => !progress.completedSteps.includes(id));
  return firstIncomplete >= 0 ? firstIncomplete : 0;
}

function loadEmbeddedModuleTraining(moduleId, resume = false) {
  activeModuleId = moduleId;
  const subset = selectModuleSteps(moduleId, packCache.steps);
  stepsCache = subset;
  buildStepper(stepsCache, subset.map((s) => s.id), loadProgress());
  const idx = initialStepIndex(moduleId, loadProgress(), resume);
  navigateTo(idx);
  window.parent?.postMessage({ type: 'CSIR_RUNTIME_READY' }, window.location.origin);
}

async function initCourseRunner() {
  if (!requireRoleAndName()) return;
  const params = getSearchParams();
  packCache = await fetchPack('scl-csir');
  let progress = clearIfDifferentCourse(packCache.course.version);
  progress = loadProgress();
  setRoleFromParams(params.role);
  const role = packCache.roles.find((r) => r.id === progress.roleId);
  roleLabelCache = role?.label || 'Role';
  document.querySelector('[data-role-label]')?.setAttribute('data-role-label', roleLabelCache);
  byId('courseTitle').textContent = packCache.course.title;
  byId('courseMeta').textContent = `${packCache.course.version} • Est. ${role?.estMinutes || packCache.course.estMinutes} minutes`;
  byId('learnerInfo').textContent = `${progress.learnerName} • ${roleLabelCache}`;

  configureEmbeddedLayout(params, roleLabelCache);

  stepsCache = embeddedMode ? selectModuleSteps(params.moduleId, packCache.steps) : packCache.steps;
  buildStepper(stepsCache, embeddedMode ? stepsCache.map((s) => s.id) : role.requiredStepIds, progress);
  if (!embeddedMode) setupDrawer();

  if (!embeddedMode) {
    const list = byId('stepList');
    list.addEventListener('click', (e) => {
      const target = e.target.closest('.step');
      if (!target) return;
      const idx = Array.from(list.children).indexOf(target);
      if (!computeUnlocked(idx, stepsCache, loadProgress())) {
        byId('lockedModal').showModal();
        return;
      }
      navigateTo(idx);
    });

    const mobileList = byId('drawerMobile');
    if (mobileList) {
      mobileList.innerHTML = list.innerHTML;
      mobileList.addEventListener('click', (e) => {
        const t = e.target.closest('.step');
        if (!t) return;
        const idx = Array.from(mobileList.children).indexOf(t);
        if (!computeUnlocked(idx, stepsCache, loadProgress())) {
          byId('lockedModal').showModal();
          return;
        }
        navigateTo(idx);
        byId('drawerOverlay').classList.remove('open');
        byId('drawerMobile').classList.remove('open');
      });
    }
  }

  const firstIncomplete = stepsCache.findIndex((s) => !isStepCompleted(s, progress));
  const moduleOverride = params.requestedModule || (params.start ? 'm1' : null);
  const moduleStartIndex = !embeddedMode && moduleOverride ? getModuleStartIndex(moduleOverride, stepsCache) : -1;
  const initialIndex = embeddedMode
    ? initialStepIndex(params.moduleId, progress, params.resume)
    : (moduleStartIndex >= 0 ? moduleStartIndex : (firstIncomplete === -1 ? 0 : firstIncomplete));
  navigateTo(initialIndex >= 0 ? initialIndex : 0);
  ensureCompletionState(stepsCache, progress, packCache);

  if (!embeddedMode) {
    byId('closeModal')?.addEventListener('click', () => byId('lockedModal').close());
    byId('resetProgress')?.addEventListener('click', () => {
      byId('confirmReset').showModal();
    });
    byId('confirmResetYes')?.addEventListener('click', () => {
      resetProgress();
      window.location.href = 'role.html';
    });
    byId('confirmResetNo')?.addEventListener('click', () => byId('confirmReset').close());
  }

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    const msg = event.data || {};
    if (msg.type === 'CSIR_LOAD_STEP' && msg.moduleId) {
      loadEmbeddedModuleTraining(msg.moduleId, msg.resume === true || msg.resume === '1');
    }
  });

  if (embeddedMode) {
    window.parent?.postMessage({ type: 'CSIR_RUNTIME_READY' }, window.location.origin);
  }
}

window.addEventListener('DOMContentLoaded', initCourseRunner);
