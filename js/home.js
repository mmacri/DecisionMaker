import { loadProgress, setRole, clearIfDifferentCourse } from './storage.js';

const moduleStepMap = {
  'Home / Start': ['mission-control'],
  'Module 1 – CSIR Overview': ['mission-control', 'csir-basics'],
  'Module 2 – Roles & Communications': ['roles', 'comms'],
  'Module 3 – Terminology & Severity': ['definitions', 'severity'],
  'Module 4 – Workflow by Phase': ['workflow', 'response'],
  'Module 5 – Reporting & Documentation': ['reporting', 'evidence'],
  'Module 6 – OT Scenarios & Drills': ['scenarios'],
  'Module 7 – Certification Exam': ['final-exam', 'checklist', 'completion'],
};

const roleSummary = {
  'all-staff': 'Recognize suspicious activity, report promptly, and complete annual training.',
  'csir-team': 'Support investigation tasks, capture incident log entries, and coordinate with Technical Lead.',
  'technical-lead': 'Lead technical investigation, refine severity, recommend containment and recovery actions.',
  'incident-commander': 'Set objectives, oversee ICS use, and ensure reporting in required timeframes.',
  'nerc-compliance': 'Advise on CIP obligations, maintain compliance evidence, and organize reviews/tests.',
  ecs: 'Maintain the CSIR plan, support classification/reportability, and steward incident evidence.',
};

const roleModal = document.getElementById('roleModal');
const roleOptions = document.getElementById('roleOptions');
const roleSave = document.getElementById('roleSave');
const roleClose = document.getElementById('roleClose');
const roleBadge = document.getElementById('roleBadge');
const roleSummaryEl = document.getElementById('roleSummary');
const moduleProgress = document.getElementById('moduleProgress');
const switchRole = document.getElementById('switchRole');
const remindSwitch = document.getElementById('remindSwitch');
const assumptionCards = document.querySelectorAll('.assumption-card');
const assumptionDetail = document.getElementById('assumptionDetail');

let selectedRole = null;

function loadPack() {
  return fetch('./contentpacks/scl-csir/pack.json').then((r) => {
    if (!r.ok) throw new Error('Unable to load CSIR pack');
    return r.json();
  });
}

function renderModules(progress) {
  const completed = progress.completedSteps || [];
  const fragments = [];
  const entries = Object.entries(moduleStepMap);

  entries.forEach(([label, steps]) => {
    const done = steps.every((id) => completed.includes(id));
    const started = steps.some((id) => completed.includes(id));
    const item = document.createElement('div');
    item.className = 'module-chip' + (done ? ' complete' : started ? ' in-progress' : '');
    item.innerHTML = `<div class="module-title">${label}</div><div class="module-status">${done ? 'Complete' : started ? 'In progress' : 'Not started'}</div>`;
    fragments.push(item);
  });

  moduleProgress.innerHTML = '';
  fragments.forEach((f) => moduleProgress.appendChild(f));
}

function updateRoleUI(roleId, pack) {
  const roleObj = pack.roles.find((r) => r.id === roleId);
  if (roleObj) {
    roleBadge.textContent = `Role: ${roleObj.label}`;
    roleSummaryEl.textContent = roleSummary[roleId] || roleObj.whoItsFor;
  } else {
    roleBadge.textContent = 'Select a role to personalize content';
    roleSummaryEl.textContent = 'No role selected yet.';
  }
}

function initRoleModal(pack) {
  roleOptions.innerHTML = '';
  const saved = loadProgress().roleId;

  pack.roles.forEach((role) => {
    const card = document.createElement('div');
    card.className = 'role-card';
    card.innerHTML = `<h3>${role.label}</h3><p class="small">${role.whoItsFor}</p><div class="role-meta">Est. ${role.estMinutes} minutes</div>`;
    if (saved === role.id) {
      card.classList.add('selected');
      selectedRole = role.id;
      roleSave.disabled = false;
    }
    card.addEventListener('click', () => {
      document.querySelectorAll('#roleOptions .role-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedRole = role.id;
      roleSave.disabled = false;
    });
    roleOptions.appendChild(card);
  });
}

function openRoleModal() {
  if (typeof roleModal.showModal === 'function') {
    roleModal.showModal();
  } else {
    roleModal.setAttribute('open', 'open');
  }
}

function closeRoleModal() {
  if (roleModal.open) roleModal.close();
}

function wireAssumptions() {
  assumptionCards.forEach((card) => {
    card.addEventListener('click', () => {
      assumptionDetail.style.display = 'block';
      assumptionDetail.textContent = card.dataset.details || '';
    });
  });
}

loadPack()
  .then((pack) => {
    const progress = clearIfDifferentCourse(pack.course.version);
    renderModules(progress);
    updateRoleUI(progress.roleId, pack);
    initRoleModal(pack);

    if (!progress.roleId) {
      openRoleModal();
    }

    roleSave.addEventListener('click', () => {
      if (!selectedRole) return;
      setRole(selectedRole);
      updateRoleUI(selectedRole, pack);
      closeRoleModal();
    });

    [switchRole, remindSwitch].forEach((btn) => {
      if (btn) btn.addEventListener('click', openRoleModal);
    });

    if (roleClose) roleClose.addEventListener('click', closeRoleModal);
  })
  .catch((err) => {
    console.error(err);
    moduleProgress.innerHTML = '<p class="alert">Unable to load CSIR data.</p>';
  });

wireAssumptions();
