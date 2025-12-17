const Progress = (() => {
  const key = 'scl_csir_progress';
  const defaultState = () => ({ completedPages: [], lastPage: 'landing', score: 0, passedAt: null });

  const state = () => Storage.get(key, defaultState());
  const save = (data) => Storage.set(key, { ...defaultState(), ...data });

  const markComplete = (pageId) => {
    const data = state();
    if (!data.completedPages.includes(pageId)) {
      data.completedPages.push(pageId);
    }
    data.lastPage = pageId;
    save(data);
  };

  const setScore = (score, passed) => {
    const data = state();
    data.score = score;
    if (passed) data.passedAt = new Date().toISOString();
    save(data);
  };

  const setLastPage = (pageId) => {
    const data = state();
    data.lastPage = pageId;
    save(data);
  };

  const reset = () => save(defaultState());

  return { state, save, markComplete, setScore, setLastPage, reset };
})();
