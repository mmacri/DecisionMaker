import { ProgressStore } from './progress-store.js';

function microKey(moduleNumber, stepNumber) {
  return `m${moduleNumber}-s${stepNumber}`;
}

function defaultMicroState(total) {
  return {
    activeIndex: 0,
    completed: [],
    attempts: {},
    answers: {},
    confirmations: {},
    total,
  };
}

function saveState(trackId, key, state) {
  return ProgressStore.setMicroState(trackId, key, state);
}

function loadState(trackId, key, total) {
  const stored = ProgressStore.getMicroState(trackId, key, total);
  return { ...defaultMicroState(total), ...stored, total };
}

function buildOption(option, idx, selected) {
  const label = document.createElement('label');
  label.className = `micro-option ${selected ? 'selected' : ''}`;
  label.innerHTML = `<input type="radio" name="microOption" value="${idx}" ${selected ? 'checked' : ''}> <span class="option-label">${option}</span>`;
  label.addEventListener('click', () => {
    const input = label.querySelector('input');
    if (input) input.checked = true;
  });
  return label;
}

function buildFeedback(text, type = 'info') {
  const box = document.createElement('div');
  box.className = `micro-feedback ${type === 'success' ? 'positive' : type === 'warning' ? 'warning' : ''}`;
  box.innerHTML = text;
  return box;
}

export function renderGuidedTraining(stepDefinition, hostEl, context) {
  const { trackId, moduleNumber, stepNumber } = context;
  const steps = stepDefinition.microSteps || [];
  if (!steps.length) {
    hostEl.textContent = 'Guided training content is unavailable.';
    return;
  }
  hostEl.className = 'guided-wrap';
  const key = microKey(moduleNumber, stepNumber);
  let state = loadState(trackId, key, steps.length);

  function persist() {
    state = saveState(trackId, key, state);
  }

  function markComplete(id, status) {
    if (!state.completed.includes(id)) state.completed.push(id);
    state.confirmations[id] = status;
    persist();
    if (state.completed.length >= steps.length && !context.completed) {
      context.onComplete?.({ microCompleted: true });
    }
  }

  function setActive(idx) {
    state.activeIndex = Math.min(Math.max(0, idx), steps.length - 1);
    persist();
    renderCurrent();
  }

  function handleSubmit(microStep, formEl, feedbackHost, confirmBtn) {
    const selected = formEl.querySelector('input[name="microOption"]:checked');
    if (!selected) {
      feedbackHost.innerHTML = '';
      feedbackHost.appendChild(buildFeedback('Select an answer before submitting.', 'warning'));
      return;
    }
    const choice = Number(selected.value);
    const attempts = (state.attempts[microStep.id] || 0) + 1;
    state.attempts[microStep.id] = attempts;
    state.answers[microStep.id] = { choice, correct: choice === microStep.question.correctIndex };
    persist();

    const isCorrect = choice === microStep.question.correctIndex;
    if (isCorrect) {
      feedbackHost.innerHTML = '';
      feedbackHost.appendChild(buildFeedback(`<strong>Correct.</strong> ${microStep.question.explanation}`, 'success'));
      confirmBtn.style.display = 'none';
      markComplete(microStep.id, 'correct');
      renderCurrent();
      return;
    }

    feedbackHost.innerHTML = '';
    feedbackHost.appendChild(buildFeedback(`<strong>Try again.</strong> ${microStep.question.explanation}`, attempts >= 2 ? 'warning' : 'info'));
    if (attempts >= 2) {
      confirmBtn.style.display = 'inline-flex';
      confirmBtn.disabled = false;
      confirmBtn.focus();
    }
  }

  function renderCurrent() {
    const microStep = steps[state.activeIndex];
    hostEl.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'micro-progress';
    header.innerHTML = `<div><p class="eyebrow">Guided training</p><h3 class="micro-title">${microStep.title}</h3></div><div class="micro-pill">Micro-step ${state.activeIndex + 1} of ${steps.length}</div>`;
    hostEl.appendChild(header);

    const lesson = document.createElement('div');
    lesson.className = 'micro-lesson';
    lesson.innerHTML = microStep.lessonHtml;
    hostEl.appendChild(lesson);

    const questionCard = document.createElement('div');
    questionCard.className = 'micro-question';
    const questionId = `micro-q-${microStep.id}`;
    questionCard.innerHTML = `<h4 id="${questionId}">${microStep.question.prompt}</h4>`;

    const form = document.createElement('form');
    form.className = 'micro-options';
    const saved = state.answers[microStep.id];
    microStep.question.options.forEach((opt, idx) => {
      const option = buildOption(opt, idx, saved?.choice === idx);
      form.appendChild(option);
    });

    const feedback = document.createElement('div');
    const isComplete = context.completed || state.completed.includes(microStep.id);
    const trainingComplete = context.completed || state.completed.length >= steps.length;

    const submitRow = document.createElement('div');
    submitRow.className = 'micro-submit';
    const submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.className = 'primary';
    submitBtn.textContent = 'Submit answer';
    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'secondary';
    confirmBtn.textContent = 'I understand — continue';
    confirmBtn.style.display = 'none';
    confirmBtn.disabled = true;

    submitBtn.addEventListener('click', () => handleSubmit(microStep, form, feedback, confirmBtn));
    confirmBtn.addEventListener('click', () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Acknowledged';
      markComplete(microStep.id, 'acknowledged');
      renderCurrent();
    });

    submitRow.appendChild(submitBtn);
    submitRow.appendChild(confirmBtn);

    questionCard.appendChild(form);
    questionCard.appendChild(submitRow);
    questionCard.appendChild(feedback);
    hostEl.appendChild(questionCard);

    if (isComplete) {
      submitBtn.disabled = true;
      confirmBtn.disabled = true;
      confirmBtn.style.display = 'none';
      const answer = state.answers[microStep.id];
      if (answer) {
        feedback.innerHTML = '';
        const type = answer.correct ? 'success' : 'info';
        feedback.appendChild(buildFeedback(`<strong>${answer.correct ? 'Completed.' : 'Completed after acknowledgment.'}</strong> ${microStep.question.explanation}`, type));
      }
    } else if (state.attempts[microStep.id] >= 2 && !state.confirmations[microStep.id]) {
      confirmBtn.style.display = 'inline-flex';
      confirmBtn.disabled = false;
    }

    if (state.confirmations[microStep.id]) {
      feedback.innerHTML = '';
      feedback.appendChild(buildFeedback(`<strong>Completed after acknowledgment.</strong> ${microStep.question.explanation}`, 'info'));
      submitBtn.disabled = true;
    }

    const nav = document.createElement('div');
    nav.className = 'micro-nav';
    const prev = document.createElement('button');
    prev.className = 'secondary';
    prev.textContent = 'Previous';
    prev.disabled = state.activeIndex === 0;
    prev.addEventListener('click', () => setActive(state.activeIndex - 1));

    const next = document.createElement('button');
    next.className = 'primary';
    next.textContent = state.activeIndex === steps.length - 1 ? 'Finish guided training' : 'Next micro-step';
    const currentDone = isComplete || state.completed.includes(microStep.id);
    next.disabled = !currentDone;
    next.addEventListener('click', () => {
      if (!currentDone) return;
      if (state.activeIndex < steps.length - 1) {
        setActive(state.activeIndex + 1);
      } else {
        markComplete(microStep.id, state.confirmations[microStep.id] ? 'acknowledged' : 'complete');
      }
    });

    const navMeta = document.createElement('div');
    const metaText = trainingComplete
      ? 'Guided training complete. Use Next to continue the module.'
      : currentDone
        ? 'Unlocked'
        : 'Complete this micro-step to continue';
    navMeta.innerHTML = `<span class="micro-lock">${metaText}</span>`;

    nav.appendChild(prev);
    nav.appendChild(navMeta);
    nav.appendChild(next);
    hostEl.appendChild(nav);
  }

  renderCurrent();
}

export default renderGuidedTraining;
