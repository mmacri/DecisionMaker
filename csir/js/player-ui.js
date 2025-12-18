import { renderGuidedTraining } from './microstep-engine.js';

export class PlayerUI {
  constructor() {
    this.courseMap = document.getElementById('courseMap');
    this.moduleTitle = document.getElementById('moduleTitle');
    this.stepMeta = document.getElementById('stepMeta');
    this.stepMetaLabel = document.getElementById('stepMetaLabel');
    this.breadcrumb = document.getElementById('breadcrumb');
    this.stepProgressFill = document.getElementById('stepProgressFill');
    this.contentHost = document.getElementById('contentHost');
    this.btnBack = document.getElementById('btnBack');
    this.btnNext = document.getElementById('btnNext');
    this.stepperMeta = document.getElementById('stepperMeta');
    this.trackLabel = document.getElementById('trackLabel');
    this.toast = document.getElementById('toast');
  }

  setTrackLabel(text) {
    this.trackLabel.textContent = text;
  }

  updateHeader(moduleTitle, metaText, breadcrumbText, stepProgress) {
    this.moduleTitle.textContent = moduleTitle;
    this.stepMeta.textContent = metaText;
    this.breadcrumb.textContent = breadcrumbText;
    const pct = Math.max(0, Math.min(100, stepProgress));
    this.stepProgressFill.style.width = `${pct}%`;
    this.stepMetaLabel.textContent = 'Progress';
    this.stepperMeta.textContent = metaText;
  }

  setNavState({ canBack, canNext, lockReason }) {
    this.btnBack.disabled = !canBack;
    this.btnNext.disabled = !canNext;
    this.btnNext.setAttribute('aria-disabled', !canNext);
    if (lockReason) {
      this.btnNext.title = lockReason;
      this.stepperMeta.textContent = lockReason;
    }
  }

  showToast(message) {
    this.toast.textContent = message;
    this.toast.classList.add('visible');
    setTimeout(() => this.toast.classList.remove('visible'), 2600);
  }

  renderCourseMap(track, progress, current, onSelect, lockText) {
    this.courseMap.innerHTML = '';
    track.modules.forEach((module, idx) => {
      const moduleIndex = idx + 1;
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.className = 'map-item';
      const isCompleted = progress.completedModules.includes(moduleIndex);
      const isCurrent = current.m === moduleIndex;
      const unlocked = this.isModuleUnlocked(track, progress, moduleIndex);
      button.disabled = !unlocked;
      button.setAttribute('data-module', moduleIndex);
      button.innerHTML = `
        <span class="map-count">${moduleIndex}</span>
        <span class="map-meta">
          <strong>${module.title}</strong>
          <span class="map-status">${isCompleted ? 'Completed' : unlocked ? 'In progress' : 'Locked'}</span>
        </span>`;
      if (isCurrent) button.classList.add('active');
      if (!unlocked) button.title = lockText || 'Complete earlier modules to unlock';
      button.addEventListener('click', () => onSelect(moduleIndex));
      li.appendChild(button);
      this.courseMap.appendChild(li);
    });
  }

  isModuleUnlocked(track, progress, moduleIndex) {
    if (!track.enforceLinear) return true;
    if (moduleIndex === 1) return true;
    return progress.completedModules.includes(moduleIndex - 1) || progress.completedModules.includes(moduleIndex);
  }

  renderStep(step, context) {
    this.contentHost.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'step-card';

    const header = document.createElement('div');
    header.className = 'step-header';
    header.innerHTML = `<div><p class="eyebrow">${context.moduleLabel}</p><h2>${step.title}</h2></div>`;
    wrapper.appendChild(header);

    if (step.type === 'overview') {
      const body = document.createElement('div');
      body.className = 'text-stack';
      (step.sections || []).forEach(section => {
        const block = document.createElement('div');
        block.className = 'text-block';
        if (section.heading) block.innerHTML += `<h3>${section.heading}</h3>`;
        if (section.body) block.innerHTML += `<p>${section.body}</p>`;
        if (section.list) {
          const ul = document.createElement('ul');
          section.list.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            ul.appendChild(li);
          });
          block.appendChild(ul);
        }
        body.appendChild(block);
      });
      const action = document.createElement('div');
      action.className = 'action-row';
      const btn = document.createElement('button');
      btn.className = 'primary';
      btn.textContent = context.completed ? 'Marked complete' : 'Mark as read';
      btn.disabled = context.completed;
      btn.addEventListener('click', () => {
        if (!context.completed) context.onComplete();
        btn.textContent = 'Marked complete';
        btn.disabled = true;
      });
      action.appendChild(btn);
      body.appendChild(action);
      wrapper.appendChild(body);
    }

    if (step.type === 'quiz' || step.type === 'exam') {
      wrapper.appendChild(this.renderQuiz(step, context));
    }

    if (step.type === 'guided') {
      const guided = document.createElement('div');
      wrapper.appendChild(guided);
      renderGuidedTraining(step, guided, {
        ...context,
        trackId: context.trackId,
        moduleNumber: context.moduleNumber,
        stepNumber: context.stepNumber,
      });
    }

    if (step.type === 'iframe') {
      const note = document.createElement('p');
      note.className = 'muted';
      note.textContent = 'The interactive runtime opens below. Complete the activities, then confirm to unlock the next step.';
      wrapper.appendChild(note);
      const frame = document.createElement('iframe');
      frame.src = step.src;
      frame.title = 'Interactive training';
      frame.className = 'runtime-frame';
      wrapper.appendChild(frame);
      const confirm = document.createElement('div');
      confirm.className = 'action-row';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'manualConfirm';
      const label = document.createElement('label');
      label.setAttribute('for', 'manualConfirm');
      label.textContent = 'I completed the interactive step and captured my takeaways.';
      const btn = document.createElement('button');
      btn.className = 'primary';
      btn.textContent = context.completed ? 'Marked complete' : 'Mark step complete';
      btn.disabled = context.completed;
      btn.addEventListener('click', () => {
        if (checkbox.checked) {
          if (!context.completed) context.onComplete();
          btn.textContent = 'Marked complete';
          btn.disabled = true;
        } else {
          this.showToast('Check the confirmation box to continue.');
        }
      });
      confirm.appendChild(checkbox);
      confirm.appendChild(label);
      confirm.appendChild(btn);
      wrapper.appendChild(confirm);
    }

    this.contentHost.appendChild(wrapper);
  }

  renderQuiz(step, context) {
    const quizWrap = document.createElement('div');
    quizWrap.className = 'quiz-wrap';
    const intro = document.createElement('p');
    intro.textContent = step.intro || 'Answer all questions to continue.';
    quizWrap.appendChild(intro);

    const form = document.createElement('form');
    form.className = 'quiz-form';
    step.questions.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'question-card';
      card.innerHTML = `<div class="question">${idx + 1}. ${q.prompt}</div>`;
      const list = document.createElement('div');
      list.className = 'choices';
      q.options.forEach((opt, oIdx) => {
        const choice = document.createElement('label');
        choice.className = 'choice';
        choice.innerHTML = `<input type="radio" name="q${idx}" value="${oIdx}"> <span>${opt}</span>`;
        list.appendChild(choice);
      });
      if (q.tip) {
        const tip = document.createElement('p');
        tip.className = 'muted';
        tip.textContent = q.tip;
        card.appendChild(tip);
      }
      card.appendChild(list);
      form.appendChild(card);
    });

    const result = document.createElement('div');
    result.className = 'quiz-result';

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'primary';
    submit.textContent = 'Submit answers';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let correct = 0;
      const messages = [];
      step.questions.forEach((q, idx) => {
        const selected = form.querySelector(`input[name="q${idx}"]:checked`);
        const isCorrect = selected && Number(selected.value) === q.answer;
        if (isCorrect) correct += 1;
        messages.push(isCorrect ? '✔ Correct' : `✖ Correct answer: ${q.options[q.answer]}`);
      });
      const score = Math.round((correct / step.questions.length) * 100);
      result.innerHTML = `<strong>Score: ${score}%</strong> • Pass required: ${step.passPercent || 70}%<br>${messages.join('<br>')}`;
      if (score >= (step.passPercent || 70)) {
        submit.disabled = true;
        if (!context.completed) context.onComplete({ score });
        result.classList.add('pass');
      } else {
        result.classList.remove('pass');
        this.showToast('Score at least the pass threshold to unlock Next.');
      }
    });

    quizWrap.appendChild(form);
    quizWrap.appendChild(submit);
    quizWrap.appendChild(result);
    if (context.completed) {
      submit.disabled = true;
      result.textContent = 'Already completed. You may review the questions.';
      result.classList.add('pass');
    }
    return quizWrap;
  }
}

export default PlayerUI;
