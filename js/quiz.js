import { setQuizScore } from './storage.js';

export function renderQuiz(stepId, quiz, existingScore) {
  const alreadyPassed = existingScore?.passed;
  const questionsHtml = quiz.questions.map((q, idx) => {
    const options = q.options.map((opt, optIdx) => `<label><input type="radio" name="${stepId}-q${idx}" value="${optIdx}" ${alreadyPassed ? 'disabled' : ''}>${opt}</label>`).join('');
    return `<div class="question"><div class="small">${q.prompt}</div>${options}</div>`;
  }).join('');
  const resultText = existingScore ? `<div class="result">Score: ${existingScore.score}/${existingScore.total} (${existingScore.percent}%)${existingScore.passed ? ' • Passed' : ''}</div>` : '';
  return `<div class="quiz" data-step="${stepId}" data-pass="${quiz.passingScore}"><h4>${quiz.title || 'Knowledge Check'}</h4>${questionsHtml}<button class="button" ${alreadyPassed ? 'disabled' : ''}>Submit answers</button>${resultText}</div>`;
}

export function bindQuiz(stepId, quiz, container, onPassed) {
  const quizEl = container.querySelector('.quiz');
  if (!quizEl) return;
  const button = quizEl.querySelector('button');
  if (!button) return;
  if (button.disabled) return;
  button.addEventListener('click', () => {
    let correct = 0;
    let answered = 0;
    quiz.questions.forEach((q, idx) => {
      const selected = container.querySelector(`input[name="${stepId}-q${idx}"]:checked`);
      if (selected) {
        answered += 1;
        if (Number(selected.value) === q.answer) correct += 1;
      }
    });
    if (answered < quiz.questions.length) {
      alert('Please answer every question.');
      return;
    }
    setQuizScore(stepId, correct, quiz.questions.length, quiz.passingScore);
    const percent = Math.round((correct / quiz.questions.length) * 100);
    const result = quizEl.querySelector('.result') || document.createElement('div');
    result.className = 'result';
    result.textContent = `Score: ${correct}/${quiz.questions.length} (${percent}%)${percent >= quiz.passingScore ? ' • Passed' : ' • Try again'}`;
    if (!quizEl.querySelector('.result')) quizEl.appendChild(result);
    if (percent >= quiz.passingScore) {
      button.disabled = true;
      onPassed();
    }
  });
}
