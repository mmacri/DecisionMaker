const Quiz = (() => {
  let data = [];
  const render = (quizData) => {
    data = quizData;
    const container = document.querySelector('#quiz-container');
    if (!container) return;
    container.innerHTML = data.map((q, idx) => `<div class="quiz-question" data-idx="${idx}"><h3>Q${idx+1}. ${q.question}</h3><ul class="quiz-options">${q.options.map((opt, oidx) => `<li><label><input type="radio" name="q-${idx}" value="${oidx}"> ${opt}</label></li>`).join('')}</ul><div class="feedback"></div></div>`).join('');
    document.querySelector('#submit-quiz').onclick = grade;
  };

  const grade = () => {
    let score = 0;
    data.forEach((q, idx) => {
      const selected = document.querySelector(`input[name="q-${idx}"]:checked`);
      const feedback = document.querySelector(`.quiz-question[data-idx="${idx}"] .feedback`);
      if (!selected) {
        feedback.innerHTML = '<span class="locked">Please choose an answer.</span>';
        return;
      }
      const correct = Number(selected.value) === q.answer;
      if (correct) {
        score++;
        feedback.innerHTML = '<span class="status-pill">Correct</span> ' + q.explanation;
      } else {
        feedback.innerHTML = '<span class="locked">Incorrect.</span> ' + q.explanation;
      }
    });
    const percent = Math.round((score / data.length) * 100);
    Progress.setScore(percent, percent >= 80);
    const result = document.querySelector('#quiz-result');
    if (percent >= 80) {
      result.innerHTML = `<div class="status-pill">Passed</div> You scored ${percent}%. Checklist and certificate are now unlocked.`;
    } else {
      result.innerHTML = `<div class="locked">Score ${percent}%. You need 80% to proceed. Review the steps and retry.</div>`;
    }
  };

  return { render, grade };
})();
