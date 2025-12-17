const Router = (() => {
  const pages = [
    'landing','overview','flow','role-select','event-vs-incident','severity-triage','step-prepare','step-identify','step-investigate','step-respond','step-recover','step-followup','comms','reporting-awareness','evidence','audit-etiquette','scenarios','knowledge-check','checklist-download','completion-certificate'
  ];

  const routes = {
    'landing': 'pages/landing.html',
    'overview': 'pages/overview.html',
    'flow': 'pages/flow.html',
    'role-select': 'pages/role-select.html',
    'event-vs-incident': 'pages/event-vs-incident.html',
    'severity-triage': 'pages/severity-triage.html',
    'step-prepare': 'pages/step-prepare.html',
    'step-identify': 'pages/step-identify.html',
    'step-investigate': 'pages/step-investigate.html',
    'step-respond': 'pages/step-respond.html',
    'step-recover': 'pages/step-recover.html',
    'step-followup': 'pages/step-followup.html',
    'comms': 'pages/comms.html',
    'reporting-awareness': 'pages/reporting-awareness.html',
    'evidence': 'pages/evidence.html',
    'audit-etiquette': 'pages/audit-etiquette.html',
    'scenarios': 'pages/scenarios.html',
    'knowledge-check': 'pages/knowledge-check.html',
    'checklist-download': 'pages/checklist-download.html',
    'completion-certificate': 'pages/completion-certificate.html'
  };

  let current = 'landing';

  const go = (id) => {
    if (!routes[id]) id = 'landing';
    current = id;
    window.location.hash = `#/${id}`;
  };

  const load = async (id) => {
    const container = document.querySelector('#page-container');
    const res = await fetch(routes[id]);
    const html = await res.text();
    container.innerHTML = html;
  };

  const init = async () => {
    const hash = window.location.hash.replace('#/','');
    const progress = Progress.state();
    let target = routes[hash] ? hash : 'landing';
    if ((target === 'checklist-download' || target === 'completion-certificate') && progress.score < 80) {
      target = 'knowledge-check';
      window.location.hash = '#/knowledge-check';
    }
    const previousLastPage = progress.lastPage;

    await load(target);
    current = target;

    const shouldPreserveLast = target === 'landing' && previousLastPage && previousLastPage !== 'landing';
    Progress.setLastPage(shouldPreserveLast ? previousLastPage : target);
    UI.updateNav(target);
    UI.renderPage(target);
  };

  window.addEventListener('hashchange', async () => {
    const page = window.location.hash.replace('#/','');
    const progress = Progress.state();
    let target = routes[page] ? page : 'landing';
    if ((target === 'checklist-download' || target === 'completion-certificate') && progress.score < 80) {
      target = 'knowledge-check';
      window.location.hash = '#/knowledge-check';
    }
    const previousLastPage = progress.lastPage;

    await load(target);
    current = target;

    const shouldPreserveLast = target === 'landing' && previousLastPage && previousLastPage !== 'landing';
    Progress.setLastPage(shouldPreserveLast ? previousLastPage : target);
    UI.updateNav(target);
    UI.renderPage(target);
  });

  const next = () => {
    const idx = pages.indexOf(current);
    if (idx < pages.length -1) go(pages[idx+1]);
  };

  const prev = () => {
    const idx = pages.indexOf(current);
    if (idx > 0) go(pages[idx-1]);
  };

  const getPages = () => pages;

  return { init, go, next, prev, getPages };
})();
