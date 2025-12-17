const UI = (() => {
  let contentMap = {};
  let roles = {};
  let scenarios = [];
  let quiz = [];
  let checklist = [];

  const loadData = async () => {
    const [contentRes, roleRes, scenarioRes, quizRes, checklistRes] = await Promise.all([
      fetch('data/csir_training_content.json'),
      fetch('data/csir_roles.json'),
      fetch('data/csir_scenarios.json'),
      fetch('data/csir_quiz.json'),
      fetch('data/csir_checklist.json')
    ]);
    contentMap = await contentRes.json();
    roles = await roleRes.json();
    scenarios = await scenarioRes.json();
    quiz = await quizRes.json();
    checklist = await checklistRes.json();
  };

  const updateNav = (pageId) => {
    document.querySelectorAll('.nav-items a').forEach(a => {
      a.classList.toggle('active', a.dataset.page === pageId);
    });
    const target = document.querySelector(`.nav-items a[data-page="${pageId}"]`);
    if (target) {
      const group = target.closest('.nav-group');
      document.querySelectorAll('.nav-group').forEach(g => {
        if (g === group) {
          g.classList.remove('collapsed');
        } else {
          g.classList.add('collapsed');
        }
      });
    }
    const progress = Progress.state();
    const pages = Router.getPages();
    const percent = Math.round((progress.completedPages.length / pages.length) * 100);
    document.querySelector('#progress-count').textContent = `${progress.completedPages.length} / ${pages.length} complete`;
    document.querySelector('#progress-bar-inner').style.width = `${percent}%`;
    document.querySelector('#role-display').textContent = roleName(Role.state().role);
  };

  const roleName = (id) => {
    const role = roles.roles.find(r => r.id === id);
    return role ? role.name : id;
  };

  const renderPage = (pageId) => {
    const pageData = contentMap[pageId];
    if (!pageData) return;
    const container = document.querySelector('.page-card');
    if (!container) return;
    container.querySelector('.breadcrumb').textContent = `You are here: ${pageData.title}`;
    container.querySelector('h1').textContent = pageData.title;
    container.querySelector('.page-body').innerHTML = pageData.body;

    const doneList = container.querySelector('.done-when');
    doneList.innerHTML = `<h3>You’re done when…</h3><ul class="list-tight">${pageData.done.map(item => `<li>${item}</li>`).join('')}</ul>`;

    if (pageData.roleCallout) renderRoleCallout(pageData.roleCallout);
    renderActions(pageId);
    if (pageId === 'role-select') renderRoleSelector();
    if (pageId === 'knowledge-check') Quiz.render(quiz);
    if (pageId === 'scenarios') renderScenarios();
    if (pageId === 'checklist-download') renderChecklist();
    if (pageId === 'completion-certificate') Certificate.render();
    if (pageId === 'landing') {
      renderCertificateList();
      renderLanding();
    }
  };

  const renderRoleCallout = (key) => {
    const callout = document.querySelector('#role-callout');
    if (!callout) return;
    const profile = Role.state();
    const roleDef = roles.roles.find(r => r.id === profile.role);
    const text = roleDef?.callouts?.[key] || 'Stay aligned with the CSIR plan and follow direction from the Incident Commander.';
    callout.innerHTML = `<strong>For your role:</strong> ${text}`;
  };

  const toggleModal = (id, open = false) => {
    const modal = document.querySelector(`#${id}`);
    if (!modal) return;
    if (open) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    } else {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  const renderLanding = () => {
    const startBtn = document.querySelector('#btn-start');
    const resumeBtn = document.querySelector('#btn-resume');
    const modal = document.querySelector('#start-modal');
    if (!startBtn || !modal) return;

    const roleSelect = modal.querySelector('#start-role');
    roleSelect.innerHTML = roles.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    roleSelect.value = Role.state().role;

    const profile = Role.state();
    modal.querySelector('#start-name').value = profile.name;
    modal.querySelector('#start-email').value = profile.email;

    modal.querySelectorAll('[data-close="start-modal"]').forEach(btn => {
      btn.onclick = () => toggleModal('start-modal', false);
    });

    startBtn.onclick = () => toggleModal('start-modal', true);

    const confirm = modal.querySelector('#start-confirm');
    confirm.onclick = () => {
      const name = modal.querySelector('#start-name').value.trim();
      const email = modal.querySelector('#start-email').value.trim();
      const role = roleSelect.value;
      if (!name || !email) {
        alert('Please enter your name and email to continue.');
        return;
      }
      if (!email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      Role.setProfile({ name, email, role });
      toggleModal('start-modal', false);
      Router.go('role-select');
    };

    if (resumeBtn) {
      const progress = Progress.state();
      const resumeTarget = progress.lastPage && progress.lastPage !== 'landing' ? progress.lastPage : 'role-select';
      resumeBtn.disabled = false;
      resumeBtn.onclick = () => Router.go(resumeTarget);
    }
  };

  const renderActions = (pageId) => {
    const backBtn = document.querySelector('#btn-back');
    const nextBtn = document.querySelector('#btn-next');
    backBtn.onclick = () => Router.prev();
    nextBtn.onclick = () => {
      if (pageId === 'knowledge-check') {
        Quiz.grade();
      }
      const progress = Progress.state();
      if ((pageId === 'knowledge-check' || pageId === 'checklist-download' || pageId === 'completion-certificate') && progress.score < 80) {
        alert('You must score at least 80% on the knowledge check to unlock the checklist and certificate.');
        Router.go('knowledge-check');
        return;
      }
      Progress.markComplete(pageId);
      Router.next();
    };
    if (pageId === 'completion-certificate') nextBtn.disabled = true;
    backBtn.disabled = Router.getPages().indexOf(pageId) === 0;
  };

  const renderRoleSelector = () => {
    const select = document.querySelector('#role-choice');
    if (!select) return;
    select.innerHTML = roles.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    select.value = Role.state().role;
    select.onchange = (e) => {
      Role.setRole(e.target.value);
      document.querySelector('#selected-role').textContent = roleName(e.target.value);
      renderPage('role-select');
    };
    document.querySelector('#selected-role').textContent = roleName(Role.state().role);
  };

  const renderScenarios = () => {
    const container = document.querySelector('#scenario-list');
    if (!container) return;
    const roleId = Role.state().role;
    container.innerHTML = scenarios.map((scenario, idx) => {
      const roleText = scenario.roleVariants[roleId] || scenario.roleVariants['default'];
      return `<div class="card"><div class="muted">Scenario ${idx+1}</div><h3>${scenario.title}</h3><p><strong>Situation:</strong> ${scenario.situation}</p><p><strong>Applies to CSIR step:</strong> ${scenario.step}</p><p><strong>What should happen:</strong> ${scenario.expected}</p><p><strong>Your move:</strong> ${roleText}</p><p><em>Why it matters:</em> ${scenario.why}</p></div>`;
    }).join('');
  };

  const renderChecklist = () => {
    const container = document.querySelector('#checklist-container');
    if (!container) return;
    container.innerHTML = checklist.groups.map(group => `<div class="checklist-group"><div class="muted">Review: ${group.frequency}</div><h4>${group.title}</h4><ul>${group.items.map(item => `<li>${item}</li>`).join('')}</ul></div>`).join('');
    const progress = Progress.state();
    const downloadBtn = document.querySelector('#download-checklist');
    if (progress.score < 80) {
      downloadBtn.disabled = true;
      downloadBtn.textContent = 'Pass knowledge check to download';
    } else {
      downloadBtn.disabled = false;
      downloadBtn.textContent = 'Download checklist';
      downloadBtn.onclick = () => Download.checklist(container.innerHTML);
    }
  };

  const renderCertificateList = () => {
    const list = document.querySelector('#certificate-list');
    if (!list) return;
    const cert = Storage.get('scl_csir_certificate', null);
    if (!cert) {
      list.innerHTML = '<p class="muted">No certificates issued yet.</p>';
      return;
    }
    list.innerHTML = `<p><strong>${cert.name}</strong> — ${UI.roleName(cert.role)}<br><span class="muted">${new Date(cert.completedAt).toLocaleString()} (${cert.tz})</span><br>ID: ${cert.id}</p>`;
  };

  const roleDropdown = () => {
    const select = document.querySelector('#role-switch');
    if (!select) return;
    select.innerHTML = roles.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    select.value = Role.state().role;
    select.onchange = (e) => {
      Role.setRole(e.target.value);
      updateNav(Progress.state().lastPage || 'landing');
      renderPage(Progress.state().lastPage || 'landing');
    };
  };

  const resumeButton = () => {
    const btn = document.querySelector('#btn-resume');
    if (!btn) return;
    const progress = Progress.state();
    if (progress.lastPage && progress.lastPage !== 'landing') {
      btn.disabled = false;
      btn.onclick = () => Router.go(progress.lastPage);
    }
  };

  const init = async () => {
    await loadData();
    roleDropdown();
    resumeButton();
    document.querySelectorAll('.nav-group header').forEach(header => {
      header.addEventListener('click', () => {
        const parentGroup = header.parentElement;
        const willOpen = parentGroup.classList.contains('collapsed');
        document.querySelectorAll('.nav-group').forEach(group => group.classList.add('collapsed'));
        if (willOpen) {
          parentGroup.classList.remove('collapsed');
        }
      });
    });
    Router.init();
  };

  return { init, updateNav, renderPage, roleDropdown, roleName };
})();

window.addEventListener('DOMContentLoaded', UI.init);
