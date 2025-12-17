(function () {
  const container = document.getElementById('module-shell');
  if (!container) return;

  const moduleId = container.dataset.moduleId || 'cip007';
  const pageId = document.body.dataset.pageId || 'intro';
  const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
  const contentPath = `${basePath}/data/${moduleId}.content.json`;
  const packPath = container.dataset.contentPack;

  const state = loadState(moduleId);

  loadContent(contentPath, packPath)
    .then((content) => {
      renderShell(content, pageId, state);
    })
    .catch((err) => {
      console.error('Unable to load content', err);
      container.innerHTML = '<p>Unable to load module content.</p>';
    });

  function loadState(id) {
    const saved = JSON.parse(localStorage.getItem(`scl_cip007_${id}_state`) || '{}');
    return {
      role: saved.role || null,
      userName: saved.userName || '',
      completed: new Set(saved.completed || []),
      quizPassed: saved.quizPassed || false,
      lastVisited: saved.lastVisited || null,
      gates: saved.gates || {},
      certificateIssued: saved.certificateIssued || false
    };
  }

  function saveState(id, data) {
    localStorage.setItem(
      `scl_cip007_${id}_state`,
      JSON.stringify({
        role: data.role,
        userName: data.userName,
        completed: Array.from(data.completed),
        quizPassed: data.quizPassed,
        lastVisited: data.lastVisited,
        gates: data.gates,
        certificateIssued: data.certificateIssued
      })
    );
    localStorage.setItem('scl_cip007_name', data.userName || '');
    localStorage.setItem(
      'scl_cip007_progress',
      JSON.stringify({ completed: Array.from(data.completed), lastVisited: data.lastVisited })
    );
    localStorage.setItem('scl_cip007_exam', data.quizPassed ? 'passed' : 'not-passed');
    localStorage.setItem('scl_cip007_certificate', data.certificateIssued ? 'issued' : 'pending');
  }

  async function loadContent(contentPath, packPath) {
    if (packPath) {
      try {
        const pack = await loadContentPack(packPath);
        if (pack) return pack;
      } catch (err) {
        console.warn('Falling back to legacy content file after pack load failure', err);
      }
    }
    const response = await fetch(contentPath);
    return response.json();
  }

  async function loadContentPack(packPath) {
    const normalize = (path) => (path.endsWith('/') ? path.slice(0, -1) : path);
    const base = normalize(packPath);
    const loaders = [
      fetchJson(`${base}/metadata.json`),
      fetchJson(`${base}/phases.json`),
      fetchJson(`${base}/roles.json`),
      fetchJson(`${base}/scenarios/mock.json`),
      fetchJson(`${base}/assessments/final.json`),
      fetchJson(`${base}/etiquette/content.json`),
      fetchJson(`${base}/certificate.json`)
    ];

    const [metadata, phases, roles, mock, final, etiquette, certificate] = await Promise.all(loaders);
    if (!metadata || !phases) return null;

    const content = {
      ...metadata,
      ...phases,
      ...etiquette,
      mock: mock?.mock || mock,
      quiz: final?.quiz || final,
      certificateTemplate: certificate || metadata.certificateTemplate || null
    };

    if (roles) {
      content.roleOptions = roles.roleOptions || metadata.roleOptions || [];
      content.roleHighlights = roles.roleHighlights || {};
      content.execution = roles.execution || phases.execution || {};
      content.roleRequirements = roles.roleRequirements || {};
      content.roleCertificates = roles.certificateLabels || {};
    }

    return content;
  }

  function fetchJson(path) {
    return fetch(path)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }

  function getActiveRole(content, state) {
    return state.role || content.roleOptions?.[0] || 'Participant';
  }

  function getRequiredPages(content, role) {
    const roleMap = content.roleRequirements || {};
    if (role && roleMap[role] && roleMap[role].length) return roleMap[role];
    return (content.nav || []).filter((item) => !item.optional).map((item) => item.id);
  }

  function calculateProgress(content, state, role) {
    const required = getRequiredPages(content, role);
    const completedCount = required.filter((id) => state.completed.has(id)).length;
    const percent = required.length ? Math.round((completedCount / required.length) * 100) : 0;
    return { completed: completedCount, total: required.length || 1, percent };
  }

  function evaluateRequirement(key, state) {
    switch (key) {
      case 'orientationAck':
        return !!state.gates?.orientationAck;
      case 'scopeCheck':
        return !!state.gates?.scopeCheck;
      case 'quizPassed':
        return !!state.quizPassed;
      case 'certificateIssued':
        return !!state.certificateIssued;
      default:
        return true;
    }
  }

  function canAdvance(pageId, state, content) {
    const requirement = (content.pageRequirements || {})[pageId];
    if (!requirement) return true;
    return evaluateRequirement(requirement, state);
  }

  function isNavLocked(pageId, state, content, role) {
    const requiresQuiz = getRequiredPages(content, role).includes('final-check');
    if (pageId === 'certificate' && content.mode === 'csir') {
      const quizReady = requiresQuiz ? state.quizPassed : true;
      const requiredBeforeCert = getRequiredPages(content, role).filter((id) => id !== 'certificate');
      const completedBeforeCert = requiredBeforeCert.filter((id) => state.completed.has(id)).length;
      const readyForCert = requiredBeforeCert.length ? completedBeforeCert === requiredBeforeCert.length : true;
      return !quizReady || !readyForCert;
    }
    return false;
  }

  function shouldAutoComplete(pageId, content) {
    const requirements = content.pageRequirements || {};
    if (requirements[pageId]) return false;
    if (pageId === 'final-check' || pageId === 'certificate') return false;
    return true;
  }

  function getQuizQuestions(content, role) {
    const questions = content.quiz?.questions || [];
    if (!role) return questions;
    return questions.filter((q) => !q.roles || q.roles.includes(role));
  }

  function renderShell(content, pageId, state) {
    const role = getActiveRole(content, state);
    state.lastVisited = window.location.pathname;
    markComplete(content, pageId, state, role);
    saveState(moduleId, state);
    document.title = `${content.title} | DecisionMaker`;

    const progress = calculateProgress(content, state, role);
    const stepNumber = content.pageStepMap[pageId] || 1;
    const stepLabel = (content.steps.find((s) => s.number === stepNumber) || {}).label || '';
    const phase = getPhaseForPage(content, pageId);

    container.innerHTML = `
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
      <div class="module-layout">
        ${buildSidebar(content, state, pageId, role)}
        <main class="module-main">
          <div class="top-bar">
            <div class="global-nav">${renderGlobalNav(content)}</div>
            <div class="progress">
              <span>${progress.completed} / ${progress.total} required</span>
              <div class="progress-meter"><span style="width: ${progress.percent}%"></span></div>
            </div>
            <div class="role-select">
              <label for="role-picker">Your role</label>
              <select id="role-picker"></select>
            </div>
          </div>
          <div class="step-banner">
            <div><strong>Step ${stepNumber} of ${content.steps.length}</strong> — ${stepLabel}${
      phase ? ` • ${phase.title}` : ''
    }</div>
            <div class="status-chip">${phase ? phase.badge || content.title : content.title}</div>
          </div>
          <div class="content-card" id="page-content"></div>
          ${buildBottomCta(content, pageId, state)}
        </main>
      </div>
    `;

    const sidebarToggle = document.getElementById('nav-toggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebarToggle && sidebar && backdrop) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('show');
      });
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('show');
      });
    }

    renderRoleModal(content, state);
    populateRoles(content, state);
    renderPage(content, pageId, state);
  }

  function renderGlobalNav(content) {
    const items = content.globalNav || [
      { label: 'Training home', href: '../../../index.html' },
      { label: 'Module landing', href: 'index.html' },
      { label: 'Practice', href: content.nav?.find((n) => n.id === 'mock')?.href || '#' },
      { label: 'Resources', href: content.nav?.find((n) => n.id === 'resources')?.href || '#' }
    ];
    return items
      .map((item) => `<a class="nav-pill" href="${item.href}">${item.label}</a>`)
      .join('');
  }

  function populateRoles(content, state) {
    const select = document.getElementById('role-picker');
    if (!select) return;
    select.innerHTML = content.roleOptions
      .map((r) => `<option value="${r}">${r}</option>`)
      .join('');
    if (state.role) {
      select.value = state.role;
    } else {
      state.role = content.roleOptions[0];
      saveState(moduleId, state);
    }
    select.addEventListener('change', (e) => {
      state.role = e.target.value;
      saveState(moduleId, state);
      renderShell(content, document.body.dataset.pageId, state);
    });
  }

  function renderRoleModal(content, state) {
    if (!content.requireRoleSelection) return;
    if (state.role) return;
    const modal = document.createElement('div');
    modal.className = 'role-modal';
    modal.innerHTML = `
      <div class="role-modal__card">
        <h3>Select your audience role</h3>
        <p>This tailors required vs awareness items, expectations, and audit focus.</p>
        <div class="role-grid">
          ${content.roleOptions
            .map((role) => `<button class="role-chip" data-role="${role}">${role}</button>`)
            .join('')}
        </div>
        <p class="hint">You can change this later from the role dropdown.</p>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      const btn = e.target.closest('.role-chip');
      if (!btn) return;
      state.role = btn.dataset.role;
      saveState(moduleId, state);
      modal.remove();
      populateRoles(content, state);
      renderShell(content, document.body.dataset.pageId, state);
    });
  }

  function buildSidebar(content, state, currentPage, role) {
    const navItems = content.nav
      .map((item) => {
        const locked = isNavLocked(item.id, state, content, role);
        const classes = [
          'nav-link',
          currentPage === item.id ? 'current' : '',
          state.completed.has(item.id) ? 'completed' : '',
          locked ? 'locked' : ''
        ]
          .filter(Boolean)
          .join(' ');
        return `<li class="nav-item"><a class="${classes}" href="${locked ? '#' : item.href}"><span class="label">${item.label}</span></a></li>`;
      })
      .join('');

    return `
      <aside class="sidebar" id="sidebar">
        <header>
          <div>
            <h1>${content.title}</h1>
            <div class="tag-row"><span class="tag">${content.estimatedTime}</span></div>
          </div>
          <button class="nav-toggle" id="nav-toggle">☰</button>
        </header>
        <ul class="nav-list">${navItems}</ul>
      </aside>
    `;
  }

  function buildBottomCta(content, pageId, state) {
    const role = getActiveRole(content, state);
    const idx = content.nav.findIndex((n) => n.id === pageId);
    const prev = content.nav[idx - 1];
    const next = content.nav[idx + 1];
    const gateLocked = !canAdvance(pageId, state, content);
    const nextLocked =
      next &&
      (gateLocked || (next.id === 'certificate' && isNavLocked(next.id, state, content, role)));
    const prevLink = prev
      ? `<a href="${prev.href}" aria-label="Previous">◀ Previous</a>`
      : '<span></span>';
    const nextLink = next
      ? `<a class="${nextLocked ? 'disabled' : 'primary'}" href="${nextLocked ? '#' : next.href}" aria-label="Next">Next ▶</a>`
      : '';
    return `<div class="bottom-cta">${prevLink}${nextLink}</div>`;
  }

  function markComplete(content, pageId, state, role) {
    const requirement = (content.pageRequirements || {})[pageId];
    if (requirement && !evaluateRequirement(requirement, state)) return;
    if (!state.completed.has(pageId)) {
      state.completed.add(pageId);
      saveState(moduleId, state);
    }
  }

  function renderPage(content, pageId, state) {
    const target = document.getElementById('page-content');
    if (!target) return;

    const role = getActiveRole(content, state);
    if (shouldAutoComplete(pageId, content)) {
      markComplete(content, pageId, state, role);
    }

    if (content.mode === 'csir') {
      switch (pageId) {
        case 'dashboard':
          target.innerHTML = renderDashboard(content, state);
          attachDashboardHandlers(content, state);
          break;
        case 'orientation':
          target.innerHTML = renderOrientation(content, role);
          break;
        case 'scope':
          target.innerHTML = renderScope(content, role);
          break;
        case 'plan':
          target.innerHTML = renderPlan(content, role);
          break;
        case 'execution':
          target.innerHTML = renderExecution(content, role);
          break;
        case 'etiquette':
          target.innerHTML = renderEtiquette(content, role);
          break;
        case 'mock':
          target.innerHTML = renderMock(content, role);
          attachMockHandlers();
          break;
        case 'final-check':
          target.innerHTML = renderQuiz(content, state);
          break;
        case 'certificate':
          target.innerHTML = renderCertificate(content, state, role);
          attachCertificateHandler(content, state, role);
          break;
        case 'resources':
          target.innerHTML = renderResources(content, role);
          break;
        default:
          target.innerHTML = '<p>Content coming soon.</p>';
      }
    } else {
      switch (pageId) {
        case 'index':
        case 'setup':
          target.innerHTML = renderLanding(content);
          break;
        case 'intro':
        case 'introduction':
          target.innerHTML = renderIntro(content, role);
          break;
        case 'flow':
        case 'training-flow':
          target.innerHTML = renderFlow(content, role);
          break;
        case 'roles':
        case 'role-guidance':
          target.innerHTML = renderRoles(content, role);
          break;
        case 'overview':
        case 'requirements-overview':
          target.innerHTML = renderOverview(content, role);
          break;
        case 'r1':
        case 'r2':
        case 'r3':
        case 'r4':
        case 'r5':
        case 'r6':
          target.innerHTML = renderRequirement(content, pageId, role);
          break;
        case 'audit-etiquette':
          target.innerHTML = renderAuditEtiquette(content, role);
          break;
        case 'scenarios':
          target.innerHTML = renderScenarios(content, role);
          break;
        case 'quiz':
        case 'knowledge-check':
          target.innerHTML = renderQuiz(content, state);
          break;
        case 'checklist':
          target.innerHTML = renderChecklist(content, state);
          break;
        case 'resources':
          target.innerHTML = renderResources(content, role);
          break;
        case 'complete':
        case 'completion':
          target.innerHTML = renderCompletion(content, role);
          break;
        default:
          target.innerHTML = '<p>Content coming soon.</p>';
      }
    }

    if (pageId === 'orientation') attachOrientationGate(content, state);
    if (pageId === 'scope') attachScopeCheck(content, state);
    if (pageId === 'quiz' || pageId === 'knowledge-check' || pageId === 'final-check') attachQuizHandlers(content, state);
    if (pageId === 'execution') attachRoleChecklist(content, role);
    if (pageId === 'checklist' && state.quizPassed) attachChecklistHandlers(content);
    if (pageId === 'complete') attachCompletionHandler(content);
  }

  function renderRoleCallout(content, pageId, role) {
    const callouts = content.roleHighlights && content.roleHighlights[pageId];
    if (!callouts) return '';
    return `<div class="callout role-callout"><strong>For your role (${role}):</strong> ${callouts[role]}</div>`;
  }

  function getPhaseForPage(content, pageId) {
    if (!content.phases) return null;
    return content.phases.find((p) => p.pages.includes(pageId)) || null;
  }

  function renderLanding(content) {
    return `
      <div class="hero">
        <div>
          <p class="tag">Module landing</p>
          <h2>${content.landing.title}</h2>
          <p>${content.landing.mission}</p>
          <div class="tag-row">${content.audience.map((a) => `<span class="tag">${a}</span>`).join('')}</div>
          <p><strong>Estimated time:</strong> ${content.estimatedTime}</p>
          <a class="bottom-cta-link" href="intro.html"><button class="nav-toggle">${content.cta} →</button></a>
        </div>
        <div class="card">
          <h3>What you will learn</h3>
          <ul>${content.landing.learn.map((item) => `<li>${item}</li>`).join('')}</ul>
        </div>
      </div>
    `;
  }

  function renderIntro(content, role) {
    return `
      <h2 class="section-title">Why CIP-007 matters</h2>
      <ul>${content.intro.why.map((i) => `<li>${i}</li>`).join('')}</ul>
      <h3>Quick hits</h3>
      <div class="overview-grid">${content.intro.highlights
        .map((h) => `<div class="card">${h}</div>`)
        .join('')}</div>
      ${renderRoleCallout(content, 'intro', role)}
    `;
  }

  function renderFlow(content, role) {
    return `
      <h2 class="section-title">How this guided module works</h2>
      <div class="list-grid">${content.flowContent
        .map(
          (step, idx) => `<div class="card"><strong>${idx + 1}. ${step.title}</strong><p>${step.detail}</p></div>`
        )
        .join('')}</div>
      ${renderRoleCallout(content, 'flow', role) || ''}
    `;
  }

  function renderRoles(content, role) {
    return `
      <h2 class="section-title">Role guidance</h2>
      <div class="list-grid">${content.roleGuidance
        .map(
          (r) => `<div class="card"><strong>${r.role}</strong><ul>${r.focus.map((f) => `<li>${f}</li>`).join('')}</ul></div>`
        )
        .join('')}</div>
      ${renderRoleCallout(content, 'roles', role)}
    `;
  }

  function renderOverview(content, role) {
    return `
      <h2 class="section-title">Requirements overview</h2>
      <table class="table">
        <caption>R1–R6 at a glance</caption>
        <thead><tr><th>Requirement</th><th>Plain-English Goal</th><th>Primary Owner</th><th>Why It Matters</th></tr></thead>
        <tbody>
          ${content.overview
            .map(
              (row) =>
                `<tr><td>${row.req}</td><td>${row.goal}</td><td>${row.owner}</td><td>${row.why}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
      ${renderRoleCallout(content, 'overview', role) || ''}
    `;
  }

  function renderRequirement(content, pageId, role) {
    const req = content.requirements.find((r) => r.id === pageId);
    if (!req) return '<p>Requirement not found.</p>';
    return `
      <h2 class="section-title">${req.title}</h2>
      <p><strong>Purpose:</strong> ${req.purpose}</p>
      <div class="list-grid">
        <div class="card"><strong>What can go wrong</strong><ul>${req.risks
          .map((r) => `<li>${r}</li>`)
          .join('')}</ul></div>
        <div class="card"><strong>What good looks like</strong><ul>${req.good
          .map((g) => `<li>${g}</li>`)
          .join('')}</ul></div>
        <div class="card"><strong>Who owns it</strong><p>${req.owner}</p></div>
      </div>
      <details class="collapsible"><summary>Evidence examples</summary><div class="content"><ul>${req.evidence
        .map((e) => `<li>${e}</li>`)
        .join('')}</ul></div></details>
      <details class="collapsible"><summary>Common mistakes</summary><div class="content"><ul>${req.mistakes
        .map((m) => `<li>${m}</li>`)
        .join('')}</ul></div></details>
      <details class="collapsible"><summary>Field quick checks</summary><div class="content"><ul>${req.quickChecks
        .map((q) => `<li>${q}</li>`)
        .join('')}</ul></div></details>
      <div class="callout"><strong>You are done when...</strong><ul>${req.done
        .map((d) => `<li>${d}</li>`)
        .join('')}</ul></div>
      ${renderRoleCallout(content, pageId, role)}
    `;
  }

  function renderScenarios(content, role) {
    return `
      <h2 class="section-title">Real-world scenarios</h2>
      <div class="list-grid">${content.scenarios
        .map(
          (s) =>
            `<div class="card"><strong>Situation</strong><p>${s.situation}</p><strong>What should happen</strong><p>${s.action}</p><strong>Requirement</strong><p>${s.requirement}</p><strong>Why it matters</strong><p>${s.why}</p></div>`
        )
        .join('')}</div>
      ${renderRoleCallout(content, 'scenarios', role)}
    `;
  }

  function renderQuiz(content, state) {
    const role = getActiveRole(content, state);
    const quizPassed = state.quizPassed;
    const questions = getQuizQuestions(content, role)
      .map((q, idx) => {
        const name = `q${idx}`;
        return `
          <div class="quiz-question" data-index="${idx}">
            <p><strong>Scenario ${idx + 1}.</strong> ${q.prompt}</p>
            <p class="meta">Role lens: ${q.lens || 'All roles'}</p>
            <div class="quiz-options">
              ${q.options
                .map(
                  (opt, optIdx) =>
                    `<label><input type="radio" name="${name}" value="${optIdx}"> ${opt}</label>`
                )
                .join('')}
            </div>
            <div class="quiz-feedback" id="feedback-${idx}"></div>
          </div>
        `;
      })
      .join('');

    const banner = quizPassed
      ? '<div class="banner-note">Quiz already passed. You can retake to reinforce learning.</div>'
      : '';

    return `
      ${banner}
      ${questions}
      <button id="submit-quiz" class="nav-toggle">Submit answers</button>
      <div id="quiz-result" class="callout" style="display:none;"></div>
      ${renderRoleCallout(content, 'quiz', role)}
    `;
  }

  function attachQuizHandlers(content, state) {
    const submit = document.getElementById('submit-quiz');
    if (!submit) return;
    submit.onclick = () => {
      const role = getActiveRole(content, state);
      const activePage = document.body.dataset.pageId || 'quiz';
      const quizPageId = activePage === 'knowledge-check' ? 'knowledge-check' : activePage;
      const questions = getQuizQuestions(content, role);
      const answers = questions.map((_, idx) => {
        const checked = document.querySelector(`input[name="q${idx}"]:checked`);
        return checked ? parseInt(checked.value, 10) : null;
      });

      let correct = 0;
      answers.forEach((ans, idx) => {
        const q = questions[idx];
        const feedbackEl = document.getElementById(`feedback-${idx}`);
        if (ans === null) {
          feedbackEl.textContent = 'Pick an answer to see feedback.';
          feedbackEl.style.color = 'var(--warning)';
          return;
        }
        const isCorrect = ans === q.answer;
        if (isCorrect) correct++;
        feedbackEl.textContent = q.feedback[ans];
        feedbackEl.style.color = isCorrect ? 'var(--accent-2)' : 'var(--danger)';
      });

      const score = Math.round((correct / questions.length) * 100);
      const result = document.getElementById('quiz-result');
      if (!result) return;
      result.style.display = 'block';
      if (score >= content.quiz.passScore) {
        result.innerHTML = `<strong>Score: ${score}%</strong> — Passed! Checklist${
          content.mode === 'csir' ? ' and certificate' : ''
        } unlocked.`;
        state.quizPassed = true;
        saveState(moduleId, state);
        unlockChecklistNav(content.mode === 'csir');
        markComplete(content, quizPageId, state, role);
        if (content.mode === 'csir') markComplete(content, 'final-check', state, role);
      } else {
        result.innerHTML = `<strong>Score: ${score}%</strong> — You need ${content.quiz.passScore}% to pass. Review the requirements and try again.`;
      }
    };
  }

  function unlockChecklistNav(includeCertificate) {
    document.querySelectorAll('.nav-link').forEach((link) => {
      if (link.textContent.includes('Operational Checklist')) {
        link.classList.remove('locked');
        link.href = 'checklist.html';
      }
      if (includeCertificate && link.textContent.includes('Certificate')) {
        link.classList.remove('locked');
        link.href = 'certificate.html';
      }
    });
    const nextBtn = document.querySelector('.bottom-cta a.disabled');
    if (nextBtn) {
      nextBtn.classList.remove('disabled');
      nextBtn.classList.add('primary');
      nextBtn.href = includeCertificate ? 'certificate.html' : 'checklist.html';
    }
  }

  function renderChecklist(content, state) {
    if (!state.quizPassed) {
      return `
        <div class="banner-note">🔒 Complete the Knowledge Check with ${content.quiz.passScore}% or higher to unlock the checklist.</div>
        <p>The navigation item will unlock automatically after you pass.</p>
      `;
    }
    const groups = Object.entries(content.checklist)
      .map(([group, items]) => {
        return `
          <div class="checklist-group">
            <h3>${group}</h3>
            ${items
              .map(
                (item, idx) =>
                  `<label class="checklist-item"><input type="checkbox" data-group="${group}" data-index="${idx}"> ${item.item} <small>(${item.frequency})</small></label>`
              )
              .join('')}
          </div>
        `;
      })
      .join('');

    return `
      <div class="print-actions">
        <button class="primary" id="print-checklist">Print checklist</button>
        <button id="download-checklist">Download checklist</button>
      </div>
      ${groups}
      ${renderRoleCallout(content, 'checklist', state.role || content.roleOptions[0])}
    `;
  }

  function attachChecklistHandlers(content) {
    const printBtn = document.getElementById('print-checklist');
    const dlBtn = document.getElementById('download-checklist');
    if (printBtn) printBtn.onclick = () => window.print();
    if (dlBtn)
      dlBtn.onclick = () => {
        const lines = [];
        Object.entries(content.checklist).forEach(([group, items]) => {
          lines.push(`${group.toUpperCase()}`);
          items.forEach((item) => lines.push(`- [ ] ${item.item} (${item.frequency})`));
          lines.push('');
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${content.moduleId}-checklist.txt`;
        a.click();
        URL.revokeObjectURL(url);
      };
  }

  function attachCompletionHandler(content) {
    const btn = document.getElementById('download-cert');
    if (!btn) return;
    btn.onclick = () => {
      const txt = `${content.title} completion on ${new Date().toLocaleString()}`;
      const blob = new Blob([txt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.moduleId}-completion.txt`;
      a.click();
      URL.revokeObjectURL(url);
    };
  }

  function renderResources(content) {
    const resources = content.resources || {};
    if (resources.policies || resources.tools || resources.contacts) {
      return `
        <h2 class="section-title">Resources</h2>
        <div class="list-grid">
          <div class="card"><strong>Policies & Procedures</strong><ul>${(resources.policies || [])
            .map((p) => `<li>${p}</li>`)
            .join('')}</ul></div>
          <div class="card"><strong>Tools in use</strong><ul>${(resources.tools || [])
            .map((p) => `<li>${p}</li>`)
            .join('')}</ul></div>
          <div class="card"><strong>Who to ask</strong><ul>${(resources.contacts || [])
            .map((p) => `<li>${p}</li>`)
            .join('')}</ul></div>
        </div>
      `;
    }

    const links = (resources.links || [])
      .map((link) => `<li><a href="${link.url}" target="_blank" rel="noopener">${link.label}</a></li>`)
      .join('');
    const notes = (resources.notes || []).map((note) => `<li>${note}</li>`).join('');
    return `
      <h2 class="section-title">Resources</h2>
      <div class="list-grid">
        <div class="card"><strong>Reference links</strong><ul>${links}</ul></div>
        <div class="card"><strong>Audit notes</strong><ul>${notes}</ul></div>
      </div>
    `;
  }

  function renderCompletion(content) {
    const nextSteps = content.completion.nextSteps.map((s) => `<li>${s}</li>`).join('');
    return `
      <h2 class="section-title">You completed CIP-007</h2>
      <p>The module is marked complete in your browser. Capture a certificate for your records if needed.</p>
      <div class="callout"><strong>Next steps</strong><ul>${nextSteps}</ul></div>
      <p class="notice">To build the next module (e.g., CIP-005 or CIP-008), duplicate <code>data/cip007.content.json</code>, update IDs and nav, and register it in <code>data/module-registry.json</code>. The shared shell will render it automatically.</p>
      <button class="nav-toggle" id="download-cert">Download completion note</button>
    `;
  }

  function renderDashboard(content, state) {
    const role = getActiveRole(content, state);
    const requiredPages = getRequiredPages(content, role);
    const progress = calculateProgress(content, state, role);
    const requiresQuiz = requiredPages.includes('final-check');
    const auditReady = requiresQuiz ? state.quizPassed : true;
    const phases = (content.phases || []).map((phase) => {
      const relevantPages = phase.pages.filter((p) => requiredPages.includes(p));
      const total = relevantPages.length || phase.pages.length;
      const done = relevantPages.filter((p) => state.completed.has(p)).length;
      const pct = total ? Math.round((done / total) * 100) : 100;
      return `<div class="card phase-card"><div class="phase-head"><div><strong>${phase.title}</strong><p>${phase.description}</p></div><span class="badge">${pct}%</span></div><div class="progress-meter"><span style="width:${pct}%;"></span></div><p class="meta">${done}/${total} role-required steps</p></div>`;
    });
    const resumeId = requiredPages.find((id) => !state.completed.has(id));
    const resume = content.nav.find((n) => n.id === resumeId) || content.nav[content.nav.length - 1];
    const statusKey =
      progress.percent === 0
        ? 'notStarted'
        : progress.percent === 100 && auditReady
        ? 'completed'
        : auditReady
        ? 'ready'
        : 'inProgress';
    const statusLabel = content.statusBadges?.[statusKey] || statusKey;

    return `
      <div class="dashboard">
        <div class="dashboard-head">
          <div>
            <p class="tag">My Training • ${role}</p>
            <h2>${content.trainingName || content.title}</h2>
            <p class="lead">Track progress, resume the next step, and confirm audit-ready status.</p>
            <div class="status-row"><span class="badge">Overall ${progress.percent}%</span><span class="badge">${statusLabel}</span></div>
          </div>
          <div class="card">
            <p class="meta">Completion</p>
            <div class="progress-meter large"><span style="width:${progress.percent}%"></span></div>
            <p class="meta">${progress.completed} of ${progress.total} role-required steps</p>
            <a class="primary" href="${resume.href}" id="resume-btn">Resume where you left off</a>
          </div>
        </div>
        <div class="phase-grid">${phases.join('')}</div>
      </div>
    `;
  }

  function attachDashboardHandlers(content, state) {
    const btn = document.getElementById('resume-btn');
    if (!btn) return;
    const requiredPages = getRequiredPages(content, getActiveRole(content, state));
    const nextId = requiredPages.find((id) => !state.completed.has(id));
    const next = content.nav.find((n) => n.id === nextId);
    if (next) btn.href = next.href;
  }

  function renderOrientation(content, role) {
    const section = content.orientation;
    return `
      <div class="phase-callout"><strong>Why this matters:</strong> ${section.purpose}</div>
      <div class="list-grid">${section.topics.map((t) => `<div class="card"><strong>${t.title}</strong><p>${t.detail}</p></div>`).join('')}</div>
      <label class="checklist-item" style="margin-top:1rem;"><input type="checkbox" id="orientation-ack"> ${section.gate}</label>
      <div class="callout warning">You must acknowledge before moving to Scope & Applicability.</div>
      ${renderRoleCallout(content, 'orientation', role) || ''}
    `;
  }

  function renderScope(content, role) {
    const section = content.scope;
    return `
      <h2 class="section-title">Scope & Applicability</h2>
      <div class="list-grid">${section.points.map((p) => `<div class="card"><strong>${p.title}</strong><p>${p.detail}</p></div>`).join('')}</div>
      <div class="knowledge-check">
        <p><strong>${section.check.question}</strong></p>
        ${section.check.options
          .map(
            (opt, idx) =>
              `<label class="checklist-item"><input type="radio" name="scope-check" value="${idx}"> ${opt}</label>`
          )
          .join('')}
        <button id="scope-check-submit" class="nav-toggle">Submit scope check</button>
        <div id="scope-feedback" class="callout" aria-live="polite"></div>
      </div>
      ${renderRoleCallout(content, 'scope', role) || ''}
    `;
  }

  function renderPlan(content, role) {
    const section = content.plan;
    const items = section.steps
      .map((step, idx) => `<div class="card"><strong>${idx + 1}. ${step.title}</strong><p>${step.detail}</p><p class="meta">${step.audit}</p></div>`)
      .join('');
    return `
      <h2 class="section-title">CSIR Plan Deep Dive</h2>
      <p class="lead">${section.lead}</p>
      <div class="list-grid">${items}</div>
      <div class="callout">${section.note}</div>
      ${renderRoleCallout(content, 'plan', role) || ''}
    `;
  }

  function renderExecution(content, role) {
    const defaultRole = content.roleOptions?.[0];
    const block = content.execution[role] || content.execution[defaultRole] || content.execution['Control Center Operator'];
    const shared = content.execution.shared;
    const checklist = block.checklist
      ? `<div class="card checklist-card"><div class="checklist-head"><strong>${role} checklist</strong><button class="primary download-role-checklist" data-role="${role}">Download checklist</button></div><ol>${block.checklist
          .map((item) => `<li>${item}</li>`)
          .join('')}</ol></div>`
      : '';
    return `
      <h2 class="section-title">Role-Based Execution</h2>
      <div class="grid two-col">
        <div class="card"><strong>Your responsibilities</strong><ul>${block.responsibilities.map((r) => `<li>${r}</li>`).join('')}</ul></div>
        <div class="card"><strong>What auditors expect you to know</strong><ul>${block.expectations.map((r) => `<li>${r}</li>`).join('')}</ul></div>
        <div class="card"><strong>What you should never guess</strong><ul>${block.never.map((r) => `<li>${r}</li>`).join('')}</ul></div>
        <div class="card"><strong>Shared signals</strong><ul>${shared.map((r) => `<li>${r}</li>`).join('')}</ul></div>
        ${checklist}
      </div>
    `;
  }

  function attachRoleChecklist(content, role) {
    const btn = document.querySelector('.download-role-checklist');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const activeRole = btn.dataset.role || role;
      const items = content.execution?.[activeRole]?.checklist || [];
      if (!items.length) return;
      const lines = [`${activeRole} CSIR Checklist`, ''];
      items.forEach((item, idx) => lines.push(`${idx + 1}. ${item}`));
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.moduleId || 'csir'}-${activeRole.replace(/\W+/g, '-').toLowerCase()}-checklist.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function renderEtiquette(content, role) {
    const section = content.etiquette;
    const examples = section.examples
      .map((ex) => `<div class="scenario"><strong>${ex.prompt}</strong><p>❌ ${ex.bad}</p><p>✅ ${ex.good}</p></div>`)
      .join('');
    return `
      <h2 class="section-title">Audit Etiquette & Interview Training</h2>
      <ul>${section.rules.map((r) => `<li>${r}</li>`).join('')}</ul>
      <div class="list-grid">${examples}</div>
      ${renderRoleCallout(content, 'etiquette', role) || ''}
    `;
  }

  function renderAuditEtiquette(content, role) {
    const section = content.auditEtiquette || content.etiquette;
    if (!section) return '<p>Audit etiquette guidance will appear here.</p>';
    const examples = (section.examples || [])
      .map((ex) => `<div class="scenario"><strong>${ex.prompt}</strong><p>❌ ${ex.bad}</p><p>✅ ${ex.good}</p></div>`)
      .join('');
    const rules = (section.rules || [])
      .map((rule) => `<li>${rule}</li>`) 
      .join('');
    return `
      <h2 class="section-title">Audit Etiquette & Interview Training</h2>
      <ul>${rules}</ul>
      ${examples ? `<div class="list-grid">${examples}</div>` : ''}
      ${renderRoleCallout(content, 'audit-etiquette', role) || renderRoleCallout(content, 'etiquette', role) || ''}
    `;
  }

  function renderMock(content, role) {
    const scenarios = content.mock.questions
      .map(
        (q, idx) => `
        <div class="card mock-card" data-correct="${q.answer}">
          <p><strong>Scenario ${idx + 1}:</strong> ${q.prompt}</p>
          ${q.options.map((opt, oIdx) => `<button class="mock-option" data-idx="${oIdx}">${opt}</button>`).join('')}
          <div class="feedback" aria-live="polite"></div>
          <div class="meta">Audit lens: ${q.audit}</div>
        </div>`
      )
      .join('');
    return `
      <h2 class="section-title">Mock Audit Scenario</h2>
      <p class="lead">Pick the response; see why it passes or creates risk.</p>
      <div class="mock-grid">${scenarios}</div>
      ${renderRoleCallout(content, 'mock', role) || ''}
    `;
  }

  function attachMockHandlers() {
    document.querySelectorAll('.mock-card').forEach((card) => {
      const correct = parseInt(card.dataset.correct, 10);
      card.addEventListener('click', (e) => {
        const btn = e.target.closest('.mock-option');
        if (!btn) return;
        const idx = parseInt(btn.dataset.idx, 10);
        const feedback = card.querySelector('.feedback');
        if (feedback) {
          feedback.textContent = idx === correct ? 'Passes audit intent — stays within documented boundaries.' : 'Creates audit risk — revisit the documented CSIR steps first.';
          feedback.className = `feedback ${idx === correct ? 'good' : 'bad'}`;
        }
      });
    });
  }

  function attachOrientationGate(content, state) {
    const checkbox = document.getElementById('orientation-ack');
    if (!checkbox) return;
    checkbox.checked = !!state.gates?.orientationAck;
    checkbox.addEventListener('change', (e) => {
      state.gates.orientationAck = e.target.checked;
      if (!state.gates.orientationAck && state.completed.has('orientation')) {
        state.completed.delete('orientation');
      } else if (state.gates.orientationAck) {
        markComplete(content, 'orientation', state, getActiveRole(content, state));
      }
      saveState(moduleId, state);
      renderShell(content, document.body.dataset.pageId, state);
    });
  }

  function attachScopeCheck(content, state) {
    const submit = document.getElementById('scope-check-submit');
    const feedback = document.getElementById('scope-feedback');
    if (!submit || !feedback) return;
    const role = getActiveRole(content, state);
    submit.addEventListener('click', () => {
      const selected = document.querySelector('input[name="scope-check"]:checked');
      if (!selected) {
        feedback.textContent = 'Select an answer to continue.';
        feedback.className = 'callout warning';
        return;
      }
      const answer = parseInt(selected.value, 10);
      const question = content.scope.check;
      const correct = question.answer === answer;
      feedback.textContent = correct ? question.success : question.rationale;
      feedback.className = `callout ${correct ? 'good' : 'warning'}`;
      if (correct) {
        state.gates.scopeCheck = true;
        markComplete(content, 'scope', state, role);
        saveState(moduleId, state);
        renderShell(content, document.body.dataset.pageId, state);
      }
    });
  }

  function renderCertificate(content, state, role) {
    const progress = calculateProgress(content, state, role);
    const ready = progress.percent === 100 && state.quizPassed;
    const template = content.certificateTemplate || {
      statement: 'Completed role-based CSIR training aligned to NERC CIP-007 audit expectations.',
      trainingName: content.trainingName || content.title,
      issuer: 'DecisionMaker Training Engine'
    };
    const status = ready
      ? `<div class="callout good">All required phases complete. Knowledge check passed. Certificate will include your role (${role}).</div>`
      : `<div class="callout warning">Finish all required phases (${progress.percent}% complete) and pass the Final Knowledge Check to enable download.</div>`;
    const issued = state.certificateIssued
      ? `<p class="meta">A certificate has already been generated. You can regenerate to refresh the timestamp.</p>`
      : '';
    return `
      <h2 class="section-title">Audit-Ready Completion Certificate</h2>
      <p class="lead">Capture your name to generate a downloadable record for audit binders.</p>
      ${status}
      <label class="field"><span>Your name</span><input type="text" id="cert-name" value="${state.userName || ''}" placeholder="Full name"></label>
      <p class="meta">Role: <strong>${role}</strong></p>
      <button id="download-cert" class="primary" ${ready ? '' : 'disabled'}>Download certificate</button>
      ${issued}
      <div class="callout">${template.statement}</div>
    `;
  }

  function attachCertificateHandler(content, state, role) {
    const btn = document.getElementById('download-cert');
    const nameInput = document.getElementById('cert-name');
    if (!btn || !nameInput) return;
    const ready = calculateProgress(content, state, role).percent === 100 && state.quizPassed;
    if (!ready) {
      btn.disabled = true;
      return;
    }
    btn.onclick = () => {
      const name = nameInput.value || 'Participant';
      state.userName = name;
      state.certificateIssued = true;
      const completion = new Date();
      const template = content.certificateTemplate || {};
      const statement = template.statement ||
        'Completed role-based CSIR training aligned to NERC CIP-007 audit expectations.';
      const trainingName = template.trainingName || content.trainingName || content.title;
      const issuer = template.issuer || 'DecisionMaker Training Engine';
      const certificateHtml = `
        <html><head><meta charset="utf-8"><title>${trainingName} Certificate</title>
          <style>body{font-family:Inter,Segoe UI,sans-serif;padding:24px;background:#f8fafc;color:#0f172a;} .cert{border:2px solid #0f172a;padding:24px;border-radius:14px;max-width:800px;margin:0 auto;background:#fff;} h1{margin-top:0;} .meta{color:#334155;} .tag{display:inline-block;padding:4px 8px;border:1px solid #e2e8f0;border-radius:8px;margin-right:8px;}</style>
        </head><body>
          <div class="cert">
            <p class="tag">${issuer}</p>
            <h1>${trainingName}</h1>
            <p>This certifies that <strong>${name}</strong> (${role}) completed the training on <strong>${completion.toLocaleString()}</strong>.</p>
            <p class="meta">Statement: ${statement}</p>
          </div>
        </body></html>`;
      const blob = new Blob([certificateHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.moduleId}-certificate.html`;
      a.click();
      URL.revokeObjectURL(url);
      markComplete(content, 'certificate', state, role);
      saveState(moduleId, state);
      renderShell(content, document.body.dataset.pageId, state);
    };
  }
})();
