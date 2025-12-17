import { loadProgress, saveProgress, markStepCompleted, setQuizScore, setFinalExamScore, setCompletedAt, resetProgress } from './storage.js';

async function fetchPack(courseId = 'scl-csir') {
  const res = await fetch(`contentpacks/${courseId}/pack.json`);
  return res.json();
}

function ensureProfile(progress) {
  if (!progress.roleId) {
    window.location.href = 'role.html';
  }
  if (!progress.learnerName) {
    window.location.href = 'profile.html';
  }
}

function renderContentBlocks(blocks) {
  return blocks.map((block) => {
    if (block.type === 'text') {
      return `<div class="content-block"><h3>${block.heading}</h3><p>${block.body}</p></div>`;
    }
    if (block.type === 'list') {
      const items = block.items.map((item) => `<li>${item}</li>`).join('');
      return `<div class="content-block"><h3>${block.heading}</h3><ul class="list">${items}</ul></div>`;
    }
    if (block.type === 'callout') {
      return `<div class="content-block callout"><h3>${block.heading}</h3><p>${block.body}</p></div>`;
    }
    if (block.type === 'table') {
      const head = block.columns.map((col) => `<th>${col}</th>`).join('');
      const rows = block.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('');
      return `<div class="content-block"><h3>${block.heading}</h3><table class="table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    return '';
  }).join('');
}

function buildQuizHtml(step, existingScore) {
  if (!step.knowledgeCheck || step.knowledgeCheck.type !== 'quiz') return '';
  const { questions } = step.knowledgeCheck;
  const alreadyPassed = existingScore && existingScore.passed;
  const questionHtml = questions.map((q, idx) => {
    const options = q.options.map((opt, optIdx) => {
      const id = `${step.id}-q${idx}-o${optIdx}`;
      return `<label><input type="radio" name="${step.id}-q${idx}" value="${optIdx}" ${alreadyPassed ? 'disabled' : ''}>${opt}</label>`;
    }).join('');
    return `<div class="question"><div class="small">${q.prompt}</div>${options}</div>`;
  }).join('');
  const resultText = existingScore ? `<div class="result">Score: ${existingScore.score}/${existingScore.total} (${existingScore.percent}%)</div>` : '';
  return `<div class="quiz" data-step="${step.id}"><h4>Knowledge Check</h4>${questionHtml}<button class="button" ${alreadyPassed ? 'disabled' : ''}>Submit answers</button>${resultText}</div>`;
}

function updateProgressUi(progressFill, progressText, completedCount, total) {
  const percent = Math.round((completedCount / total) * 100);
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${completedCount} / ${total} steps complete (${percent}%)`;
}

function computeProgressCounts(progress, steps, finalExam) {
  const finalComplete = progress.finalExamScore && Math.round((progress.finalExamScore.score / progress.finalExamScore.total) * 100) >= finalExam.passingScore;
  return {
    completed: progress.completedSteps.length + (finalComplete ? 1 : 0),
    total: steps.length
  };
}

function showLockedModal() {
  const modal = document.getElementById('lockedModal');
  modal.showModal();
}

function renderStep(step, container, progress) {
  const existingScore = progress.quizScores[step.id];
  const body = renderContentBlocks(step.contentBlocks);
  const quiz = buildQuizHtml(step, existingScore);
  container.innerHTML = `
    <div class="panel content-area">
      <div class="status-pill">${step.title}</div>
      ${body}
      ${quiz}
    </div>
  `;
}

function handleQuiz(container, step, progress, onPassed) {
  const quizEl = container.querySelector('.quiz');
  if (!quizEl) return;
  const button = quizEl.querySelector('button');
  button.addEventListener('click', () => {
    const { questions, passingScore } = step.knowledgeCheck;
    let correct = 0;
    let answered = 0;
    questions.forEach((q, idx) => {
      const selected = container.querySelector(`input[name="${step.id}-q${idx}"]:checked`);
      if (selected) {
        answered += 1;
        if (Number(selected.value) === q.answer) correct += 1;
      }
    });
    if (answered < questions.length) {
      alert('Please answer every question.');
      return;
    }
    const percent = Math.round((correct / questions.length) * 100);
    const passed = percent >= passingScore;
    setQuizScore(step.id, correct, questions.length, passingScore);
    const result = quizEl.querySelector('.result') || document.createElement('div');
    result.className = 'result';
    result.textContent = `Score: ${correct}/${questions.length} (${percent}%) ${passed ? '✓ Passed' : '– Try again'}`;
    if (!quizEl.querySelector('.result')) {
      quizEl.appendChild(result);
    }
    if (passed) {
      button.disabled = true;
      onPassed();
    }
  });
}

function buildStepper(steps, progress) {
  const list = document.getElementById('stepList');
  list.innerHTML = '';
  steps.forEach((step, idx) => {
    const li = document.createElement('div');
    li.className = 'step';
    li.dataset.id = step.id;
    li.innerHTML = `<span class="badge">${idx + 1}</span><div><div>${step.title}</div><div class="small">${step.subtitle || ''}</div></div>`;
    list.appendChild(li);
  });
}

function computeUnlocked(stepIndex, steps, progress) {
  if (stepIndex === 0) return true;
  const prevStep = steps[stepIndex - 1];
  return progress.completedSteps.includes(prevStep.id);
}

function refreshStepperState(steps, progress, activeId) {
  const entries = document.querySelectorAll('#stepList .step');
  entries.forEach((el, idx) => {
    const stepId = steps[idx].id;
    el.classList.toggle('active', stepId === activeId);
    el.classList.toggle('completed', progress.completedSteps.includes(stepId));
    const locked = !computeUnlocked(idx, steps, progress);
    el.classList.toggle('locked', locked);
  });
}

function showCompletionBanner(passed) {
  const banner = document.getElementById('completionBanner');
  if (!banner) return;
  banner.style.display = passed ? 'block' : 'none';
}

function setupDrawerToggle() {
  const toggle = document.getElementById('drawerToggle');
  const drawer = document.getElementById('drawer');
  toggle?.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });
}

function handleNavigationButtons(currentIndex, steps, progress, onNavigate) {
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  backBtn.disabled = currentIndex === 0;
  const lastIndex = steps.length - 1;
  const locked = !computeUnlocked(currentIndex + 1, steps, progress) && currentIndex !== lastIndex;
  nextBtn.disabled = currentIndex === lastIndex || locked;
  backBtn.onclick = () => currentIndex > 0 && onNavigate(currentIndex - 1);
  nextBtn.onclick = () => {
    if (currentIndex < lastIndex) {
      if (!computeUnlocked(currentIndex + 1, steps, progress)) {
        showLockedModal();
        return;
      }
      onNavigate(currentIndex + 1);
    }
  };
}

function attemptCourseComplete(progress, steps, finalExam) {
  const requiredIds = steps.map((s) => s.id);
  const allStepsDone = requiredIds.every((id) => progress.completedSteps.includes(id));
  const finalScore = progress.finalExamScore;
  if (allStepsDone && finalScore && Math.round((finalScore.score / finalScore.total) * 100) >= finalExam.passingScore) {
    if (!progress.completedAt) setCompletedAt(new Date().toISOString());
    document.getElementById('certificateLink').style.display = 'inline-flex';
    showCompletionBanner(true);
  }
}

async function initCourseRunner() {
  const progress = loadProgress();
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('course') || 'scl-csir';
  progress.courseId = courseId;
  saveProgress(progress);
  ensureProfile(progress);
  const pack = await fetchPack(courseId);
  document.getElementById('courseTitle').textContent = pack.meta.title;
  document.getElementById('courseMeta').textContent = `${pack.meta.version} • Est. ${pack.meta.estMinutes} minutes`;
  document.getElementById('learnerInfo').textContent = `${progress.learnerName} • ${pack.roles.find((r) => r.id === progress.roleId)?.label || progress.roleId}`;

  const stepsForRole = pack.steps.filter((step) => !step.requiredForRoles || step.requiredForRoles.length === 0 || step.requiredForRoles.includes(progress.roleId));
  const steps = [...stepsForRole, { id: 'final-exam', title: 'Final Exam', subtitle: 'Pass to unlock your certificate', isFinal: true }];
  buildStepper(steps, progress);
  setupDrawerToggle();

  const contentContainer = document.getElementById('content');
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.getElementById('progressText');
  const modalClose = document.getElementById('closeModal');
  modalClose?.addEventListener('click', () => document.getElementById('lockedModal').close());

  let current = 0;

  const navigate = (index) => {
    current = index;
    const step = steps[index];
    const progressState = loadProgress();
    refreshStepperState(steps, progressState, step.id);
    const counts = computeProgressCounts(progressState, steps, pack.finalExam);
    updateProgressUi(progressFill, progressText, counts.completed, counts.total);
    handleNavigationButtons(current, steps, progressState, navigate);

    if (step.isFinal) {
      renderFinalExam(pack.finalExam, contentContainer, progressState, () => {
        attemptCourseComplete(loadProgress(), stepsForRole, pack.finalExam);
        const countsAfterExam = computeProgressCounts(loadProgress(), steps, pack.finalExam);
        updateProgressUi(progressFill, progressText, countsAfterExam.completed, countsAfterExam.total);
      });
    } else {
      renderStep(step, contentContainer, progressState);
      handleQuiz(contentContainer, step, progressState, () => {
        markStepCompleted(step.id);
        attemptCourseComplete(loadProgress(), stepsForRole, pack.finalExam);
        const latestProgress = loadProgress();
        refreshStepperState(steps, latestProgress, step.id);
        const countsLatest = computeProgressCounts(latestProgress, steps, pack.finalExam);
        updateProgressUi(progressFill, progressText, countsLatest.completed, countsLatest.total);
      });
    }
  };

  document.getElementById('stepList').addEventListener('click', (e) => {
    const target = e.target.closest('.step');
    if (!target) return;
    const idx = Array.from(document.getElementById('stepList').children).indexOf(target);
    if (!computeUnlocked(idx, steps, loadProgress())) {
      showLockedModal();
      return;
    }
    navigate(idx);
  });

  const progressState = loadProgress();
  refreshStepperState(steps, progressState, steps[0].id);
  const countsInitial = computeProgressCounts(progressState, steps, pack.finalExam);
  updateProgressUi(progressFill, progressText, countsInitial.completed, countsInitial.total);
  navigate(0);
  attemptCourseComplete(progressState, stepsForRole, pack.finalExam);
}

function renderFinalExam(finalExam, container, progress, onPassed) {
  const existing = progress.finalExamScore;
  const alreadyPassed = existing && existing.percent >= finalExam.passingScore;
  const questionHtml = finalExam.questions.map((q, idx) => {
    const options = q.options.map((opt, optIdx) => `<label><input type="radio" name="final-q${idx}" value="${optIdx}" ${alreadyPassed ? 'disabled' : ''}>${opt}</label>`).join('');
    return `<div class="question"><div class="small">${q.prompt}</div>${options}</div>`;
  }).join('');
  const scoreText = existing ? `<div class="result">Score: ${existing.score}/${existing.total} (${Math.round((existing.score / existing.total) * 100)}%)${alreadyPassed ? ' ✓ Passed' : ''}</div>` : '';
  container.innerHTML = `
    <div class="panel content-area">
      <div class="status-pill">${finalExam.title || 'Final Exam'}</div>
      <p class="small">Pass the final to generate your certificate.</p>
      <div class="quiz" data-step="final">${questionHtml}<button class="button" ${alreadyPassed ? 'disabled' : ''}>Submit final exam</button>${scoreText}</div>
    </div>
  `;

  const button = container.querySelector('button');
  if (alreadyPassed) return;
  button.addEventListener('click', () => {
    let correct = 0;
    let answered = 0;
    finalExam.questions.forEach((q, idx) => {
      const selected = container.querySelector(`input[name="final-q${idx}"]:checked`);
      if (selected) {
        answered += 1;
        if (Number(selected.value) === q.answer) correct += 1;
      }
    });
    if (answered < finalExam.questions.length) {
      alert('Please answer every question.');
      return;
    }
    setFinalExamScore(correct, finalExam.questions.length);
    const percent = Math.round((correct / finalExam.questions.length) * 100);
    const result = container.querySelector('.result') || document.createElement('div');
    result.className = 'result';
    result.textContent = `Score: ${correct}/${finalExam.questions.length} (${percent}%) ${percent >= finalExam.passingScore ? '✓ Passed' : '– Try again'}`;
    if (!container.querySelector('.result')) container.querySelector('.quiz').appendChild(result);
    if (percent >= finalExam.passingScore) {
      button.disabled = true;
      onPassed();
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('courseTitle')) {
    initCourseRunner();
  }
  const resetBtn = document.getElementById('resetProgress');
  resetBtn?.addEventListener('click', () => {
    resetProgress();
    window.location.href = 'role.html';
  });
});
