(function () {
  const container = document.getElementById('module-shell');
  if (!container) return;

  const moduleId = container.dataset.moduleId || 'cip007';
  const pageId = document.body.dataset.pageId || 'intro';
  const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
  const contentPath = `${basePath}/data/${moduleId}.content.json`;

  const state = loadState(moduleId);

  fetch(contentPath)
    .then((r) => r.json())
    .then((content) => {
      renderShell(content, pageId, state);
    })
    .catch((err) => {
      console.error('Unable to load content', err);
      container.innerHTML = '<p>Unable to load module content.</p>';
    });

  function loadState(id) {
    const saved = JSON.parse(localStorage.getItem(`decisionmaker_${id}_state`) || '{}');
    return {
      role: saved.role || null,
      userName: saved.userName || '',
      completed: new Set(saved.completed || []),
      quizPassed: saved.quizPassed || false,
      lastVisited: saved.lastVisited || null
    };
  }

  function saveState(id, data) {
    localStorage.setItem(
      `decisionmaker_${id}_state`,
      JSON.stringify({
        role: data.role,
        userName: data.userName,
        completed: Array.from(data.completed),
        quizPassed: data.quizPassed,
        lastVisited: data.lastVisited
      })
    );
  }

  function renderShell(content, pageId, state) {
    state.lastVisited = window.location.pathname;
    markComplete(content, pageId, state);
    saveState(moduleId, state);
    document.title = `${content.title} | DecisionMaker`;

    const stepNumber = content.pageStepMap[pageId] || 1;
    const stepLabel = (content.steps.find((s) => s.number === stepNumber) || {}).label || '';
    const phase = getPhaseForPage(content, pageId);

    container.innerHTML = `
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
      <div class="module-layout">
        ${buildSidebar(content, state, pageId)}
        <main class="module-main">
          <div class="top-bar">
            <div class="global-nav">${renderGlobalNav(content)}</div>
            <div class="progress">
              <span>${state.completed.size} / ${content.nav.length} complete</span>
              <div class="progress-meter"><span style="width: ${(state.completed.size / content.nav.length) * 100}%"></span></div>
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
      { label: 'Home', href: '../../index.html' },
      { label: 'My Training', href: content.nav?.find((n) => n.id === 'dashboard')?.href || '#' },
      { label: 'Practice', href: content.nav?.find((n) => n.id === 'mock')?.href || '#' },
      { label: 'Resources', href: content.nav?.find((n) => n.id === 'resources')?.href || '#' },
      { label: 'About', href: '../../index.html#about' }
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
      renderPage(content, document.body.dataset.pageId, state);
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
      renderPage(content, document.body.dataset.pageId, state);
    });
  }

  function buildSidebar(content, state, currentPage) {
    const navItems = content.nav
      .map((item) => {
        const locked =
          (item.id === 'checklist' && !state.quizPassed) ||
          (item.id === 'certificate' && content.mode === 'csir' && !state.quizPassed);
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
    const idx = content.nav.findIndex((n) => n.id === pageId);
    const prev = content.nav[idx - 1];
    const next = content.nav[idx + 1];
    const nextLocked =
      next &&
      ((next.id === 'checklist' && !state.quizPassed) || (next.id === 'certificate' && !state.quizPassed && content.mode === 'csir'));
    const prevLink = prev
      ? `<a href="${prev.href}" aria-label="Previous">◀ Previous</a>`
      : '<span></span>';
    const nextLink = next
      ? `<a class="${nextLocked ? 'disabled' : 'primary'}" href="${nextLocked ? '#' : next.href}" aria-label="Next">Next ▶</a>`
      : '';
    return `<div class="bottom-cta">${prevLink}${nextLink}</div>`;
  }

  function markComplete(content, pageId, state) {
    if ((pageId === 'checklist' || pageId === 'certificate') && !state.quizPassed) return;
    if (!state.completed.has(pageId)) {
      state.completed.add(pageId);
      saveState(moduleId, state);
    }
  }

  function renderPage(content, pageId, state) {
    const target = document.getElementById('page-content');
    if (!target) return;

    const role = state.role || content.roleOptions[0];

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
          attachCertificateHandler(content, state);
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
          target.innerHTML = renderLanding(content);
          break;
        case 'intro':
          target.innerHTML = renderIntro(content, role);
          break;
        case 'flow':
          target.innerHTML = renderFlow(content, role);
          break;
        case 'roles':
          target.innerHTML = renderRoles(content, role);
          break;
        case 'overview':
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
        case 'scenarios':
          target.innerHTML = renderScenarios(content, role);
          break;
        case 'quiz':
          target.innerHTML = renderQuiz(content, state);
          break;
        case 'checklist':
          target.innerHTML = renderChecklist(content, state);
          break;
        case 'resources':
          target.innerHTML = renderResources(content, role);
          break;
        case 'complete':
          target.innerHTML = renderCompletion(content, role);
          break;
        default:
          target.innerHTML = '<p>Content coming soon.</p>';
      }
    }

    if (pageId === 'quiz' || pageId === 'final-check') attachQuizHandlers(content, state);
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
    const quizPassed = state.quizPassed;
    const questions = content.quiz.questions
      .map((q, idx) => {
        const name = `q${idx}`;
        return `
          <div class="quiz-question" data-index="${idx}">
            <p><strong>Q${idx + 1}. ${q.prompt}</strong></p>
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
      ${renderRoleCallout(content, 'quiz', state.role || content.roleOptions[0])}
    `;
  }

  function attachQuizHandlers(content, state) {
    const submit = document.getElementById('submit-quiz');
    if (!submit) return;
    submit.onclick = () => {
      const answers = content.quiz.questions.map((_, idx) => {
        const checked = document.querySelector(`input[name="q${idx}"]:checked`);
        return checked ? parseInt(checked.value, 10) : null;
      });

      let correct = 0;
      answers.forEach((ans, idx) => {
        const q = content.quiz.questions[idx];
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

      const score = Math.round((correct / content.quiz.questions.length) * 100);
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
    const nextBtn = document.querySelector('.bottom-cta a.primary.disabled');
    if (nextBtn) {
      nextBtn.classList.remove('disabled');
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
    return `
      <h2 class="section-title">Resources</h2>
      <div class="list-grid">
        <div class="card"><strong>Policies & Procedures</strong><ul>${content.resources.policies
          .map((p) => `<li>${p}</li>`)
          .join('')}</ul></div>
        <div class="card"><strong>Tools in use</strong><ul>${content.resources.tools
          .map((p) => `<li>${p}</li>`)
          .join('')}</ul></div>
        <div class="card"><strong>Who to ask</strong><ul>${content.resources.contacts
          .map((p) => `<li>${p}</li>`)
          .join('')}</ul></div>
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
    const percent = Math.round((state.completed.size / content.nav.length) * 100);
    const phases = (content.phases || []).map((phase) => {
      const done = phase.pages.filter((p) => state.completed.has(p)).length;
      const pct = Math.round((done / phase.pages.length) * 100);
      return `<div class="card phase-card"><div class="phase-head"><div><strong>${phase.title}</strong><p>${phase.description}</p></div><span class="badge">${pct}%</span></div><div class="progress-meter"><span style="width:${pct}%;"></span></div><p class="meta">${done}/${phase.pages.length} steps complete</p></div>`;
    });
    const resume = content.nav.find((n) => !state.completed.has(n.id)) || content.nav[content.nav.length - 1];
    return `
      <div class="dashboard">
        <div class="dashboard-head">
          <div>
            <p class="tag">My Training</p>
            <h2>${content.trainingName || content.title}</h2>
            <p class="lead">Track progress, resume the next step, and confirm audit-ready status.</p>
            <div class="status-row"><span class="badge">Overall ${percent}%</span><span class="badge">${
              content.statusBadges?.[
                percent === 0 ? 'notStarted' : percent === 100 ? 'completed' : state.quizPassed ? 'ready' : 'inProgress'
              ] || 'In Progress'
            }</span></div>
          </div>
          <div class="card">
            <p class="meta">Completion</p>
            <div class="progress-meter large"><span style="width:${percent}%"></span></div>
            <p class="meta">${state.completed.size} of ${content.nav.length} steps</p>
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
    const next = content.nav.find((n) => !state.completed.has(n.id));
    if (next) btn.href = next.href;
  }

  function renderOrientation(content, role) {
    const section = content.orientation;
    return `
      <div class="phase-callout"><strong>Why this matters:</strong> ${section.purpose}</div>
      <div class="list-grid">${section.topics.map((t) => `<div class="card"><strong>${t.title}</strong><p>${t.detail}</p></div>`).join('')}</div>
      <div class="callout">✔ Gate: ${section.gate}</div>
      ${renderRoleCallout(content, 'orientation', role) || ''}
    `;
  }

  function renderScope(content, role) {
    const section = content.scope;
    return `
      <h2 class="section-title">Scope & Applicability</h2>
      <div class="list-grid">${section.points.map((p) => `<div class="card"><strong>${p.title}</strong><p>${p.detail}</p></div>`).join('')}</div>
      <div class="knowledge-check">${section.check}</div>
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
    const block = content.execution[role] || content.execution['Control Center Operator'];
    const shared = content.execution.shared;
    return `
      <h2 class="section-title">Role-Based Execution</h2>
      <div class="grid two-col">
        <div class="card"><strong>Your responsibilities</strong><ul>${block.responsibilities.map((r) => `<li>${r}</li>`).join('')}</ul></div>
        <div class="card"><strong>What auditors expect you to know</strong><ul>${block.expectations.map((r) => `<li>${r}</li>`).join('')}</ul></div>
        <div class="card"><strong>What you should never guess</strong><ul>${block.never.map((r) => `<li>${r}</li>`).join('')}</ul></div>
        <div class="card"><strong>Shared signals</strong><ul>${shared.map((r) => `<li>${r}</li>`).join('')}</ul></div>
      </div>
    `;
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

  function renderCertificate(content, state) {
    return `
      <h2 class="section-title">Audit-Ready Completion Certificate</h2>
      <p class="lead">Capture your name to generate a downloadable record for audit binders.</p>
      <label class="field"><span>Your name</span><input type="text" id="cert-name" value="${state.userName || ''}" placeholder="Full name"></label>
      <button id="download-cert" class="primary">Download certificate</button>
      <div class="callout">This certifies that the individual has completed role-based CSIR training aligned to NERC CIP-007 audit expectations.</div>
    `;
  }

  function attachCertificateHandler(content, state) {
    const btn = document.getElementById('download-cert');
    const nameInput = document.getElementById('cert-name');
    if (!btn || !nameInput) return;
    btn.onclick = () => {
      const name = nameInput.value || 'Participant';
      state.userName = name;
      saveState(moduleId, state);
      const details = `Training Name: ${content.trainingName || content.title}\nParticipant: ${name}\nCompletion: ${new Date().toLocaleString()}\nStatement: This certifies that the individual has completed role-based CSIR training aligned to NERC CIP-007 audit expectations.`;
      const blob = new Blob([details], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.moduleId}-certificate.txt`;
      a.click();
      URL.revokeObjectURL(url);
    };
  }
})();
